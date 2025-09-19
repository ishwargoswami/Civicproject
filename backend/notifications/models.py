from django.db import models
from accounts.models import User
import uuid


class Notification(models.Model):
    """User notifications system"""
    
    NOTIFICATION_TYPES = [
        ('issue_update', 'Issue Update'),
        ('issue_comment', 'Issue Comment'),
        ('issue_assigned', 'Issue Assigned'),
        ('forum_reply', 'Forum Reply'),
        ('forum_mention', 'Forum Mention'),
        ('event_reminder', 'Event Reminder'),
        ('event_update', 'Event Update'),
        ('event_rsvp_approved', 'Event RSVP Approved'),
        ('volunteer_confirmed', 'Volunteer Confirmed'),
        ('system_announcement', 'System Announcement'),
        ('account_verified', 'Account Verified'),
        ('achievement_unlocked', 'Achievement Unlocked'),
    ]
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    notification_type = models.CharField(max_length=50, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Priority and Status
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    is_read = models.BooleanField(default=False)
    is_sent = models.BooleanField(default=False)
    
    # Related Objects
    content_type = models.CharField(max_length=50, blank=True)  # 'issue', 'forum_post', 'event'
    object_id = models.CharField(max_length=100, blank=True)
    
    # Action URL
    action_url = models.URLField(blank=True)
    
    # Metadata
    data = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['notification_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"Notification for {self.recipient.full_name}: {self.title}"
    
    def mark_as_read(self):
        if not self.is_read:
            from django.utils import timezone
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class NotificationSettings(models.Model):
    """User notification preferences"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='notification_settings')
    
    # Email Notifications
    email_notifications = models.BooleanField(default=True)
    email_issue_updates = models.BooleanField(default=True)
    email_forum_replies = models.BooleanField(default=True)
    email_event_reminders = models.BooleanField(default=True)
    email_system_announcements = models.BooleanField(default=True)
    
    # Push Notifications
    push_notifications = models.BooleanField(default=True)
    push_issue_updates = models.BooleanField(default=True)
    push_forum_replies = models.BooleanField(default=True)
    push_event_reminders = models.BooleanField(default=True)
    push_system_announcements = models.BooleanField(default=False)
    
    # SMS Notifications
    sms_notifications = models.BooleanField(default=False)
    sms_urgent_only = models.BooleanField(default=True)
    sms_event_reminders = models.BooleanField(default=False)
    
    # Frequency Settings
    digest_frequency = models.CharField(
        max_length=20,
        choices=[
            ('never', 'Never'),
            ('daily', 'Daily'),
            ('weekly', 'Weekly'),
            ('monthly', 'Monthly'),
        ],
        default='weekly'
    )
    
    # Quiet Hours
    quiet_hours_enabled = models.BooleanField(default=False)
    quiet_hours_start = models.TimeField(null=True, blank=True)
    quiet_hours_end = models.TimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'notification_settings'
        verbose_name = 'Notification Settings'
        verbose_name_plural = 'Notification Settings'
    
    def __str__(self):
        return f"Notification settings for {self.user.full_name}"


class EmailTemplate(models.Model):
    """Email templates for notifications"""
    
    name = models.CharField(max_length=100, unique=True)
    subject = models.CharField(max_length=200)
    html_content = models.TextField()
    text_content = models.TextField(blank=True)
    
    # Template variables documentation
    variables = models.JSONField(default=dict, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        verbose_name = 'Email Template'
        verbose_name_plural = 'Email Templates'
    
    def __str__(self):
        return self.name
