from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
from PIL import Image
import os
import random
import string
from datetime import timedelta
from django.utils import timezone


class User(AbstractUser):
    """Custom user model with additional fields for civic platform"""
    
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('official', 'Government Official'),
        ('admin', 'Administrator'),
    ]
    
    # Basic Information
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    
    # Use email as the username field
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    # Profile Information
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone_number = models.CharField(
        max_length=17,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
        null=True,
        blank=True,
        help_text="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    address = models.TextField(blank=True)
    bio = models.TextField(max_length=500, blank=True)
    
    # Verification and Status
    is_verified = models.BooleanField(default=False)
    verification_document = models.FileField(upload_to='verification/', null=True, blank=True)
    department_name = models.CharField(max_length=100, blank=True, help_text="For government officials")
    position = models.CharField(max_length=100, blank=True, help_text="For government officials")
    
    # Settings
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_active = models.DateTimeField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def is_citizen(self):
        return self.role == 'citizen'
    
    @property
    def is_official(self):
        return self.role == 'official'
    
    @property
    def is_platform_admin(self):
        return self.role == 'admin'
    
    def save(self, *args, **kwargs):
        # Auto-verify citizens, require manual verification for officials
        if self.role == 'citizen' and not self.is_verified:
            self.is_verified = True
        
        super().save(*args, **kwargs)
        
        # Resize avatar if it exists
        if self.avatar:
            self.resize_avatar()
    
    def resize_avatar(self):
        """Resize avatar to 300x300 pixels"""
        if self.avatar and os.path.exists(self.avatar.path):
            with Image.open(self.avatar.path) as img:
                if img.height > 300 or img.width > 300:
                    img.thumbnail((300, 300), Image.Resampling.LANCZOS)
                    img.save(self.avatar.path)


class UserProfile(models.Model):
    """Extended profile information for users"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    
    # Social Links
    website = models.URLField(blank=True)
    twitter = models.CharField(max_length=100, blank=True)
    linkedin = models.CharField(max_length=100, blank=True)
    github = models.CharField(max_length=100, blank=True)
    
    # Preferences
    timezone = models.CharField(max_length=50, default='UTC')
    language = models.CharField(max_length=10, default='en')
    theme = models.CharField(max_length=20, default='dark')
    
    # Statistics
    issues_reported = models.PositiveIntegerField(default=0)
    issues_resolved = models.PositiveIntegerField(default=0)
    forum_posts = models.PositiveIntegerField(default=0)
    events_attended = models.PositiveIntegerField(default=0)
    community_score = models.PositiveIntegerField(default=0)
    
    # Privacy Settings
    show_email = models.BooleanField(default=False)
    show_phone = models.BooleanField(default=False)
    show_address = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_profiles'
        verbose_name = 'User Profile'
        verbose_name_plural = 'User Profiles'
    
    def __str__(self):
        return f"Profile of {self.user.full_name}"


class UserActivity(models.Model):
    """Track user activity for analytics and engagement"""
    
    ACTIVITY_TYPES = [
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('issue_created', 'Issue Created'),
        ('issue_updated', 'Issue Updated'),
        ('issue_voted', 'Issue Voted'),
        ('forum_post_created', 'Forum Post Created'),
        ('forum_comment', 'Forum Comment'),
        ('event_rsvp', 'Event RSVP'),
        ('event_attended', 'Event Attended'),
        ('profile_updated', 'Profile Updated'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    description = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'user_activities'
        verbose_name = 'User Activity'
        verbose_name_plural = 'User Activities'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.activity_type} at {self.created_at}"


class OTPVerification(models.Model):
    """Model to handle OTP verification for user registration and login"""
    
    PURPOSE_CHOICES = [
        ('registration', 'Registration'),
        ('login', 'Login'),
        ('password_reset', 'Password Reset'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='otp_verifications', null=True, blank=True)
    email = models.EmailField()
    otp_code = models.CharField(max_length=6)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    
    class Meta:
        db_table = 'otp_verifications'
        verbose_name = 'OTP Verification'
        verbose_name_plural = 'OTP Verifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email', 'otp_code', 'purpose']),
            models.Index(fields=['expires_at']),
        ]
    
    def save(self, *args, **kwargs):
        if not self.otp_code:
            self.otp_code = self.generate_otp()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(minutes=10)  # OTP expires in 10 minutes
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_otp():
        """Generate a 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    def is_expired(self):
        """Check if OTP has expired"""
        return timezone.now() > self.expires_at
    
    def verify(self):
        """Mark OTP as verified"""
        if not self.is_expired():
            self.is_verified = True
            self.verified_at = timezone.now()
            self.save()
            return True
        return False
    
    def __str__(self):
        return f"OTP for {self.email} ({self.purpose}) - {self.otp_code}"
