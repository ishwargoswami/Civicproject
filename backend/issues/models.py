from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from accounts.models import User
import uuid


class IssueCategory(models.Model):
    """Categories for organizing issues"""
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)
    color = models.CharField(max_length=7, default='#3B82F6')  # Hex color
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'issue_categories'
        verbose_name = 'Issue Category'
        verbose_name_plural = 'Issue Categories'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Issue(models.Model):
    """Main issue model for community problems"""
    
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    # Basic Information
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField()
    category = models.ForeignKey(IssueCategory, on_delete=models.CASCADE, related_name='issues')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    
    # Location Information (simplified for SQLite compatibility)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    address = models.CharField(max_length=500)
    
    # User Information
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_issues')
    assigned_to = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='assigned_issues',
        limit_choices_to={'role__in': ['official', 'admin']}
    )
    
    # Engagement
    votes = models.PositiveIntegerField(default=0)
    views = models.PositiveIntegerField(default=0)
    
    # Metadata
    tags = models.JSONField(default=list, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'issues'
        verbose_name = 'Issue'
        verbose_name_plural = 'Issues'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', 'priority']),
            models.Index(fields=['category', 'status']),
            models.Index(fields=['reported_by', 'status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return f"{self.title} - {self.status}"
    
    @property
    def is_open(self):
        return self.status == 'open'
    
    @property
    def is_resolved(self):
        return self.status in ['resolved', 'closed']
    
    @property
    def coordinates(self):
        # Check for valid coordinates (not null and not zero)
        if (self.latitude is not None and self.longitude is not None and 
            float(self.latitude) != 0.0 and float(self.longitude) != 0.0):
            return {
                'latitude': float(self.latitude),
                'longitude': float(self.longitude)
            }
        return None


class IssueImage(models.Model):
    """Images attached to issues"""
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='issues/%Y/%m/%d/')
    caption = models.CharField(max_length=200, blank=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'issue_images'
        verbose_name = 'Issue Image'
        verbose_name_plural = 'Issue Images'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Image for {self.issue.title}"


class IssueVote(models.Model):
    """User votes on issues"""
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='user_votes')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'issue_votes'
        verbose_name = 'Issue Vote'
        verbose_name_plural = 'Issue Votes'
        unique_together = ['issue', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.get_full_name()} voted for {self.issue.title}"


class IssueComment(models.Model):
    """Comments on issues"""
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    parent = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True, 
        related_name='replies'
    )
    
    # Moderation
    is_approved = models.BooleanField(default=True)
    is_flagged = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'issue_comments'
        verbose_name = 'Issue Comment'
        verbose_name_plural = 'Issue Comments'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Comment by {self.user.get_full_name()} on {self.issue.title}"


class IssueTimeline(models.Model):
    """Timeline of events for an issue"""
    
    EVENT_TYPES = [
        ('created', 'Issue Created'),
        ('status_changed', 'Status Changed'),
        ('assigned', 'Assigned to Official'),
        ('unassigned', 'Unassigned'),
        ('priority_changed', 'Priority Changed'),
        ('comment_added', 'Comment Added'),
        ('image_added', 'Image Added'),
        ('resolved', 'Issue Resolved'),
        ('reopened', 'Issue Reopened'),
        ('closed', 'Issue Closed'),
    ]
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='timeline')
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    description = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'issue_timeline'
        verbose_name = 'Issue Timeline Event'
        verbose_name_plural = 'Issue Timeline Events'
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.issue.title} - {self.event_type}"


class IssueSubscription(models.Model):
    """User subscriptions to issue updates"""
    
    issue = models.ForeignKey(Issue, on_delete=models.CASCADE, related_name='subscriptions')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    notify_comments = models.BooleanField(default=True)
    notify_status_changes = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'issue_subscriptions'
        verbose_name = 'Issue Subscription'
        verbose_name_plural = 'Issue Subscriptions'
        unique_together = ['issue', 'user']
    
    def __str__(self):
        return f"{self.user.get_full_name()} subscribed to {self.issue.title}"
