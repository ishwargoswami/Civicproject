"""
Models for AI Chatbot system
Store conversation history and user interactions
"""
from django.db import models
from accounts.models import User
from django.utils import timezone


class ChatSession(models.Model):
    """
    Chat session for tracking conversations
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='chat_sessions', null=True, blank=True)
    session_id = models.CharField(max_length=100, unique=True)
    
    # Session metadata
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    last_message_at = models.DateTimeField(auto_now=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # Session context
    context_data = models.JSONField(default=dict, blank=True, help_text="Conversation context")
    user_metadata = models.JSONField(default=dict, blank=True, help_text="User info for context")
    
    class Meta:
        db_table = 'chat_sessions'
        ordering = ['-started_at']
        indexes = [
            models.Index(fields=['user', '-started_at']),
            models.Index(fields=['session_id']),
        ]
    
    def __str__(self):
        user_str = self.user.get_full_name() if self.user else f"Guest-{self.session_id[:8]}"
        return f"Chat Session: {user_str} - {self.started_at.strftime('%Y-%m-%d %H:%M')}"
    
    def end_session(self):
        """Mark session as ended"""
        self.is_active = False
        self.ended_at = timezone.now()
        self.save()


class ChatMessage(models.Model):
    """
    Individual chat messages
    """
    SENDER_CHOICES = [
        ('user', 'User'),
        ('bot', 'AI Bot'),
        ('system', 'System'),
    ]
    
    session = models.ForeignKey(ChatSession, on_delete=models.CASCADE, related_name='messages')
    sender = models.CharField(max_length=10, choices=SENDER_CHOICES)
    message = models.TextField()
    
    # Message metadata
    message_type = models.CharField(
        max_length=20,
        choices=[
            ('text', 'Text'),
            ('quick_reply', 'Quick Reply'),
            ('action', 'Action Button'),
            ('link', 'Link'),
        ],
        default='text'
    )
    
    # AI-specific fields
    intent = models.CharField(max_length=100, blank=True, help_text="Detected user intent")
    confidence = models.FloatField(null=True, blank=True, help_text="AI confidence score")
    response_time_ms = models.IntegerField(null=True, blank=True, help_text="Response time in milliseconds")
    
    # Quick replies or action buttons (JSON array)
    quick_replies = models.JSONField(default=list, blank=True)
    
    # Metadata
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_messages'
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['session', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_sender_display()}: {self.message[:50]}"


class ChatFeedback(models.Model):
    """
    User feedback on chatbot responses
    """
    RATING_CHOICES = [
        (1, 'Very Poor'),
        (2, 'Poor'),
        (3, 'Average'),
        (4, 'Good'),
        (5, 'Excellent'),
    ]
    
    message = models.ForeignKey(ChatMessage, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    
    rating = models.IntegerField(choices=RATING_CHOICES)
    helpful = models.BooleanField(default=True)
    comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'chat_feedback'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback: {self.get_rating_display()}"


class CommonQuestion(models.Model):
    """
    Frequently asked questions for quick responses
    """
    CATEGORY_CHOICES = [
        ('general', 'General'),
        ('issues', 'Issue Reporting'),
        ('events', 'Events'),
        ('forum', 'Forum & Discussion'),
        ('transparency', 'Transparency'),
        ('account', 'Account & Profile'),
        ('gamification', 'Rewards & Levels'),
    ]
    
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    question = models.CharField(max_length=500)
    answer = models.TextField()
    
    # Keywords for matching
    keywords = models.JSONField(default=list, help_text="Keywords to match this question")
    
    # Analytics
    times_asked = models.IntegerField(default=0)
    helpful_count = models.IntegerField(default=0)
    unhelpful_count = models.IntegerField(default=0)
    
    is_active = models.BooleanField(default=True)
    priority = models.IntegerField(default=0, help_text="Higher priority = shown first")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'common_questions'
        ordering = ['-priority', '-times_asked']
    
    def __str__(self):
        return f"[{self.get_category_display()}] {self.question[:50]}"
    
    def record_asked(self):
        """Increment times asked counter"""
        self.times_asked += 1
        self.save(update_fields=['times_asked'])
    
    def record_feedback(self, helpful=True):
        """Record user feedback"""
        if helpful:
            self.helpful_count += 1
        else:
            self.unhelpful_count += 1
        self.save(update_fields=['helpful_count', 'unhelpful_count'])


class ChatAnalytics(models.Model):
    """
    Daily analytics for chatbot usage
    """
    date = models.DateField(unique=True)
    
    # Usage metrics
    total_sessions = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    unique_users = models.IntegerField(default=0)
    anonymous_sessions = models.IntegerField(default=0)
    
    # Performance metrics
    avg_response_time_ms = models.FloatField(default=0)
    avg_session_length = models.FloatField(default=0, help_text="Average messages per session")
    
    # Quality metrics
    total_feedback = models.IntegerField(default=0)
    positive_feedback = models.IntegerField(default=0)
    negative_feedback = models.IntegerField(default=0)
    
    # Top categories
    top_categories = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'chat_analytics'
        ordering = ['-date']
    
    def __str__(self):
        return f"Chat Analytics: {self.date}"

