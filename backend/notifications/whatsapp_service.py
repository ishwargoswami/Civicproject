"""
WhatsApp Notification Service using Twilio
Handles sending WhatsApp messages to users
"""
from django.conf import settings
from decouple import config
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
import logging

logger = logging.getLogger(__name__)


class WhatsAppService:
    """Service for sending WhatsApp notifications"""
    
    def __init__(self):
        # Twilio credentials from environment variables
        self.account_sid = config('TWILIO_ACCOUNT_SID', default='')
        self.auth_token = config('TWILIO_AUTH_TOKEN', default='')
        self.whatsapp_number = config('TWILIO_WHATSAPP_NUMBER', default='')
        
        # Check if credentials are configured
        self.is_configured = bool(self.account_sid and self.auth_token and self.whatsapp_number)
        
        if self.is_configured:
            try:
                self.client = Client(self.account_sid, self.auth_token)
            except Exception as e:
                logger.error(f"Failed to initialize Twilio client: {e}")
                self.is_configured = False
        else:
            logger.warning("WhatsApp service not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_WHATSAPP_NUMBER in environment.")
    
    def send_message(self, to_number, message, template_name=None):
        """
        Send a WhatsApp message
        
        Args:
            to_number (str): Recipient's phone number (with country code, e.g., +1234567890)
            message (str): Message content
            template_name (str, optional): Twilio WhatsApp template name
            
        Returns:
            dict: Result with 'success', 'message_sid', and 'error' keys
        """
        if not self.is_configured:
            logger.warning("WhatsApp service not configured. Message not sent.")
            return {
                'success': False,
                'error': 'WhatsApp service not configured'
            }
        
        # Ensure phone number is in proper format
        if not to_number.startswith('+'):
            to_number = f'+{to_number}'
        
        # Format WhatsApp number (Twilio requires 'whatsapp:' prefix)
        from_whatsapp = f'whatsapp:{self.whatsapp_number}'
        to_whatsapp = f'whatsapp:{to_number}'
        
        try:
            # Send message
            message_obj = self.client.messages.create(
                body=message,
                from_=from_whatsapp,
                to=to_whatsapp
            )
            
            logger.info(f"WhatsApp message sent to {to_number}. SID: {message_obj.sid}")
            
            return {
                'success': True,
                'message_sid': message_obj.sid,
                'status': message_obj.status
            }
            
        except TwilioRestException as e:
            logger.error(f"Twilio error sending WhatsApp to {to_number}: {e.msg}")
            return {
                'success': False,
                'error': e.msg,
                'error_code': e.code
            }
        except Exception as e:
            logger.error(f"Error sending WhatsApp to {to_number}: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def send_verification_code(self, to_number, code):
        """
        Send WhatsApp verification code
        
        Args:
            to_number (str): Recipient's phone number
            code (str): Verification code
            
        Returns:
            dict: Result of the send operation
        """
        message = (
            f"🔐 *Civic Platform Verification*\n\n"
            f"Your verification code is: *{code}*\n\n"
            f"This code expires in 10 minutes.\n"
            f"If you didn't request this, please ignore this message."
        )
        
        return self.send_message(to_number, message)
    
    def send_event_notification(self, to_number, event_title, event_date, event_location, organizer_name):
        """
        Send event notification via WhatsApp
        
        Args:
            to_number (str): Recipient's phone number
            event_title (str): Event title
            event_date (str): Event date/time
            event_location (str): Event location
            organizer_name (str): Organizer name
            
        Returns:
            dict: Result of the send operation
        """
        message = (
            f"📅 *New Event Announced!*\n\n"
            f"*{event_title}*\n\n"
            f"📍 *Location:* {event_location}\n"
            f"🕒 *Date:* {event_date}\n"
            f"👤 *Organizer:* {organizer_name}\n\n"
            f"Check your Civic Platform dashboard for more details and to RSVP!"
        )
        
        return self.send_message(to_number, message)
    
    def send_event_update(self, to_number, event_title, update_type, update_message):
        """
        Send event update notification
        
        Args:
            to_number (str): Recipient's phone number
            event_title (str): Event title
            update_type (str): Type of update
            update_message (str): Update message
            
        Returns:
            dict: Result of the send operation
        """
        emoji_map = {
            'schedule_change': '⏰',
            'location_change': '📍',
            'cancellation': '❌',
            'reminder': '🔔',
            'important': '⚠️',
            'general': 'ℹ️'
        }
        
        emoji = emoji_map.get(update_type, 'ℹ️')
        
        message = (
            f"{emoji} *Event Update*\n\n"
            f"*{event_title}*\n\n"
            f"{update_message}\n\n"
            f"Visit your Civic Platform for full details."
        )
        
        return self.send_message(to_number, message)
    
    def send_issue_update(self, to_number, issue_title, status, message_content):
        """
        Send issue status update
        
        Args:
            to_number (str): Recipient's phone number
            issue_title (str): Issue title
            status (str): New status
            message_content (str): Update message
            
        Returns:
            dict: Result of the send operation
        """
        status_emoji = {
            'open': '🆕',
            'in_progress': '🔄',
            'resolved': '✅',
            'closed': '🔒'
        }
        
        emoji = status_emoji.get(status, 'ℹ️')
        
        message = (
            f"{emoji} *Issue Update*\n\n"
            f"*{issue_title}*\n\n"
            f"Status: *{status.replace('_', ' ').title()}*\n\n"
            f"{message_content}\n\n"
            f"View full details in your Civic Platform dashboard."
        )
        
        return self.send_message(to_number, message)
    
    def send_system_alert(self, to_number, title, message_content):
        """
        Send system alert
        
        Args:
            to_number (str): Recipient's phone number
            title (str): Alert title
            message_content (str): Alert message
            
        Returns:
            dict: Result of the send operation
        """
        message = (
            f"🔔 *Civic Platform Alert*\n\n"
            f"*{title}*\n\n"
            f"{message_content}\n\n"
            f"Visit your dashboard for more information."
        )
        
        return self.send_message(to_number, message)


# Create a singleton instance
whatsapp_service = WhatsAppService()

