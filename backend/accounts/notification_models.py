from django.db import models
from .models import User


class NotificationPreference(models.Model):
    """User notification preferences for various channels"""
    
    NOTIFICATION_TYPES = [
        ('issue_update', 'Issue Updates'),
        ('issue_comment', 'Issue Comments'),
        ('event_reminder', 'Event Reminders'),
        ('forum_reply', 'Forum Replies'),
        ('system_update', 'System Updates'),
        ('weekly_digest', 'Weekly Digest'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_preferences')
    
    # Email Notifications
    email_enabled = models.BooleanField(default=True)
    email_issue_updates = models.BooleanField(default=True)
    email_event_reminders = models.BooleanField(default=True)
    email_forum_replies = models.BooleanField(default=True)
    email_system_updates = models.BooleanField(default=True)
    email_weekly_digest = models.BooleanField(default=False)
    
    # WhatsApp Notifications
    whatsapp_enabled = models.BooleanField(default=False)
    whatsapp_verified = models.BooleanField(default=False)
    whatsapp_issue_updates = models.BooleanField(default=True)
    whatsapp_event_reminders = models.BooleanField(default=True)
    whatsapp_system_alerts = models.BooleanField(default=True)
    
    # Push Notifications (Browser/Mobile)
    push_enabled = models.BooleanField(default=True)
    push_issue_updates = models.BooleanField(default=True)
    push_event_reminders = models.BooleanField(default=True)
    push_forum_replies = models.BooleanField(default=True)
    
    # SMS Notifications
    sms_enabled = models.BooleanField(default=False)
    sms_critical_only = models.BooleanField(default=True)
    
    # Frequency Settings
    digest_frequency = models.CharField(
        max_length=20,
        choices=[
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
        ],
        default='weekly'
    )
    
    # Quiet Hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True, help_text="e.g., 22:00")
    quiet_hours_end = models.TimeField(null=True, blank=True, help_text="e.g., 08:00")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_preferences'
        verbose_name = 'Notification Preference'
        verbose_name_plural = 'Notification Preferences'
    
    def __str__(self):
        return f"Notification Preferences for {self.user.full_name}"

