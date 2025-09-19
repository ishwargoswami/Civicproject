from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, URLValidator
from accounts.models import User
import uuid


class EventCategory(models.Model):
    """Categories for events"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#10B981')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_categories'
        verbose_name = 'Event Category'
        verbose_name_plural = 'Event Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Event(models.Model):
    """Community events and meetings"""
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(EventCategory, on_delete=models.CASCADE, related_name='events')
    
    # Organizer Information
    organizer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organized_events')
    organization = models.CharField(max_length=200, blank=True)
    
    # Location Information
    location_name = models.CharField(max_length=200)
    address = models.CharField(max_length=500)
    # Location (simplified for SQLite compatibility)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_online = models.BooleanField(default=False)
    meeting_link = models.URLField(blank=True, validators=[URLValidator()])
    
    # Date and Time
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    registration_deadline = models.DateTimeField(null=True, blank=True)
    
    # Capacity and Registration
    capacity = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    current_attendees = models.PositiveIntegerField(default=0)
    volunteers_needed = models.PositiveIntegerField(default=0)
    current_volunteers = models.PositiveIntegerField(default=0)
    
    # Requirements
    requirements = models.JSONField(default=list, blank=True)
    age_restriction = models.PositiveIntegerField(null=True, blank=True)
    
    # Settings
    requires_approval = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    is_public = models.BooleanField(default=True)
    allow_waitlist = models.BooleanField(default=True)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    external_url = models.URLField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
        verbose_name = 'Event'
        verbose_name_plural = 'Events'
        ordering = ['start_date']
        indexes = [
            models.Index(fields=['start_date', 'end_date']),
            models.Index(fields=['category', 'start_date']),
            models.Index(fields=['organizer', 'start_date']),
        ]
    
    def __str__(self):
        return self.title
    
    @property
    def is_full(self):
        return self.current_attendees >= self.capacity
    
    @property
    def available_spots(self):
        return max(0, self.capacity - self.current_attendees)
    
    @property
    def volunteers_still_needed(self):
        return max(0, self.volunteers_needed - self.current_volunteers)
    
    @property
    def is_past(self):
        from django.utils import timezone
        return self.end_date < timezone.now()
    
    @property
    def is_upcoming(self):
        from django.utils import timezone
        return self.start_date > timezone.now()
    
    @property
    def is_ongoing(self):
        from django.utils import timezone
        now = timezone.now()
        return self.start_date <= now <= self.end_date
    
    @property
    def coordinates(self):
        if self.latitude and self.longitude:
            return {
                'latitude': float(self.latitude),
                'longitude': float(self.longitude)
            }
        return None


class EventImage(models.Model):
    """Images for events"""
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='events/%Y/%m/%d/')
    caption = models.CharField(max_length=200, blank=True)
    is_featured = models.BooleanField(default=False)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_images'
        verbose_name = 'Event Image'
        verbose_name_plural = 'Event Images'
        ordering = ['-is_featured', 'created_at']
    
    def __str__(self):
        return f"Image for {self.event.title}"


class EventRSVP(models.Model):
    """RSVP responses for events"""
    
    STATUS_CHOICES = [
        ('attending', 'Attending'),
        ('maybe', 'Maybe'),
        ('not_attending', 'Not Attending'),
        ('waitlist', 'Waitlist'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='rsvps')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    guests = models.PositiveIntegerField(default=0)
    dietary_restrictions = models.TextField(blank=True)
    special_needs = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Approval (if required)
    is_approved = models.BooleanField(default=True)
    approved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='approved_rsvps'
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_rsvps'
        verbose_name = 'Event RSVP'
        verbose_name_plural = 'Event RSVPs'
        unique_together = ['event', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.full_name} - {self.status} for {self.event.title}"
    
    @property
    def total_attendees(self):
        return 1 + self.guests if self.status == 'attending' else 0


class EventVolunteer(models.Model):
    """Volunteer assignments for events"""
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='volunteers')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=100, blank=True)
    description = models.TextField(blank=True)
    hours_committed = models.PositiveIntegerField(default=0)
    skills_needed = models.JSONField(default=list, blank=True)
    
    # Status
    is_confirmed = models.BooleanField(default=False)
    confirmed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='confirmed_volunteers'
    )
    
    # Check-in
    checked_in = models.BooleanField(default=False)
    check_in_time = models.DateTimeField(null=True, blank=True)
    check_out_time = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'event_volunteers'
        verbose_name = 'Event Volunteer'
        verbose_name_plural = 'Event Volunteers'
        unique_together = ['event', 'user']
    
    def __str__(self):
        role_str = f" as {self.role}" if self.role else ""
        return f"{self.user.full_name} volunteering for {self.event.title}{role_str}"
    
    @property
    def hours_worked(self):
        if self.check_in_time and self.check_out_time:
            delta = self.check_out_time - self.check_in_time
            return round(delta.total_seconds() / 3600, 2)
        return 0


class EventFeedback(models.Model):
    """Feedback and ratings for events"""
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Ratings (1-5 scale)
    overall_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    organization_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    content_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    venue_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    
    # Comments
    comments = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)
    
    # Recommendations
    would_recommend = models.BooleanField(null=True, blank=True)
    would_attend_again = models.BooleanField(null=True, blank=True)
    
    # Metadata
    is_anonymous = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_feedback'
        verbose_name = 'Event Feedback'
        verbose_name_plural = 'Event Feedback'
        unique_together = ['event', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback for {self.event.title} by {self.user.full_name}"


class EventUpdate(models.Model):
    """Updates and announcements for events"""
    
    UPDATE_TYPES = [
        ('general', 'General Update'),
        ('schedule_change', 'Schedule Change'),
        ('location_change', 'Location Change'),
        ('cancellation', 'Cancellation'),
        ('reminder', 'Reminder'),
        ('important', 'Important Notice'),
    ]
    
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='updates')
    title = models.CharField(max_length=200)
    content = models.TextField()
    update_type = models.CharField(max_length=20, choices=UPDATE_TYPES, default='general')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Notification settings
    notify_attendees = models.BooleanField(default=True)
    notify_volunteers = models.BooleanField(default=True)
    is_urgent = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_updates'
        verbose_name = 'Event Update'
        verbose_name_plural = 'Event Updates'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Update for {self.event.title}: {self.title}"
