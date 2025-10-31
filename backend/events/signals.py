"""
Signals for event-related notifications
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Event, EventUpdate
from accounts.models import User
from accounts.notification_models import NotificationPreference
from notifications.models import Notification
from notifications.whatsapp_service import whatsapp_service
import logging

logger = logging.getLogger(__name__)


@receiver(post_save, sender=Event)
def notify_citizens_on_event_creation(sender, instance, created, **kwargs):
    """
    Send notifications to citizens when an official creates a new event
    """
    if not created:
        return
    
    # Only notify for new events created by officials
    if instance.organizer.role not in ['official', 'admin']:
        return
    
    logger.info(f"New event created: {instance.title} by {instance.organizer.full_name}")
    
    # Get all citizens with WhatsApp notifications enabled
    citizens = User.objects.filter(role='citizen', is_active=True)
    
    # Format event date
    event_date = instance.start_date.strftime('%B %d, %Y at %I:%M %p')
    
    for citizen in citizens:
        try:
            # Check if citizen has notification preferences
            try:
                prefs = citizen.notification_preferences
            except NotificationPreference.DoesNotExist:
                # Create default preferences if they don't exist
                prefs = NotificationPreference.objects.create(user=citizen)
            
            # Create in-app notification for all citizens
            Notification.objects.create(
                recipient=citizen,
                notification_type='event_reminder',
                title=f'New Event: {instance.title}',
                message=f'{instance.organizer.full_name} has created a new event. Check it out!',
                content_type='event',
                object_id=str(instance.id),
                priority='medium',
                data={
                    'event_id': str(instance.id),
                    'event_title': instance.title,
                    'organizer': instance.organizer.full_name,
                    'start_date': instance.start_date.isoformat()
                }
            )
            
            # Send WhatsApp notification if enabled and phone verified
            if (prefs.whatsapp_enabled and 
                prefs.whatsapp_verified and 
                prefs.whatsapp_event_reminders and 
                citizen.phone_number):
                
                # Check quiet hours
                if prefs.quiet_hours_enabled:
                    current_time = timezone.now().time()
                    if prefs.quiet_hours_start and prefs.quiet_hours_end:
                        if prefs.quiet_hours_start < prefs.quiet_hours_end:
                            # Normal case: e.g., 22:00 to 08:00
                            if prefs.quiet_hours_start <= current_time <= prefs.quiet_hours_end:
                                logger.info(f"Skipping WhatsApp for {citizen.email} - quiet hours")
                                continue
                        else:
                            # Overnight case: e.g., 22:00 to 08:00 next day
                            if current_time >= prefs.quiet_hours_start or current_time <= prefs.quiet_hours_end:
                                logger.info(f"Skipping WhatsApp for {citizen.email} - quiet hours")
                                continue
                
                # Send WhatsApp notification
                result = whatsapp_service.send_event_notification(
                    to_number=citizen.phone_number,
                    event_title=instance.title,
                    event_date=event_date,
                    event_location=instance.location_name if not instance.is_online else 'Online Event',
                    organizer_name=instance.organizer.full_name
                )
                
                if result['success']:
                    logger.info(f"WhatsApp sent to {citizen.phone_number} for event {instance.title}")
                else:
                    logger.error(f"Failed to send WhatsApp to {citizen.phone_number}: {result.get('error')}")
        
        except Exception as e:
            logger.error(f"Error notifying citizen {citizen.email}: {str(e)}")
            continue


@receiver(post_save, sender=EventUpdate)
def notify_attendees_on_event_update(sender, instance, created, **kwargs):
    """
    Send notifications to event attendees when there's an update
    """
    if not created:
        return
    
    event = instance.event
    
    # Get attendees and volunteers based on notification settings
    from events.models import EventRSVP, EventVolunteer
    
    recipients = set()
    
    if instance.notify_attendees:
        # Get confirmed attendees
        rsvps = EventRSVP.objects.filter(
            event=event,
            status='attending',
            is_approved=True
        ).select_related('user')
        recipients.update([rsvp.user for rsvp in rsvps])
    
    if instance.notify_volunteers:
        # Get confirmed volunteers
        volunteers = EventVolunteer.objects.filter(
            event=event,
            is_confirmed=True
        ).select_related('user')
        recipients.update([vol.user for vol in volunteers])
    
    logger.info(f"Event update for {event.title}: notifying {len(recipients)} users")
    
    for user in recipients:
        try:
            # Check notification preferences
            try:
                prefs = user.notification_preferences
            except NotificationPreference.DoesNotExist:
                prefs = NotificationPreference.objects.create(user=user)
            
            # Create in-app notification
            Notification.objects.create(
                recipient=user,
                notification_type='event_update',
                title=f'Event Update: {event.title}',
                message=instance.content,
                content_type='event',
                object_id=str(event.id),
                priority='high' if instance.is_urgent else 'medium',
                data={
                    'event_id': str(event.id),
                    'update_type': instance.update_type,
                    'is_urgent': instance.is_urgent
                }
            )
            
            # Send WhatsApp notification if enabled
            if (prefs.whatsapp_enabled and 
                prefs.whatsapp_verified and 
                prefs.whatsapp_event_reminders and 
                user.phone_number):
                
                result = whatsapp_service.send_event_update(
                    to_number=user.phone_number,
                    event_title=event.title,
                    update_type=instance.update_type,
                    update_message=instance.content
                )
                
                if result['success']:
                    logger.info(f"WhatsApp event update sent to {user.phone_number}")
                else:
                    logger.error(f"Failed to send WhatsApp update to {user.phone_number}: {result.get('error')}")
        
        except Exception as e:
            logger.error(f"Error notifying user {user.email}: {str(e)}")
            continue

