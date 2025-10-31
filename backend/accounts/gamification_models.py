"""
Gamification models for real-world civic engagement rewards
Users earn tangible benefits, not just virtual points
"""
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .models import User


class CivicLevel(models.Model):
    """
    Civic engagement levels with real benefits
    Each level unlocks tangible perks
    """
    LEVEL_CHOICES = [
        (1, 'New Citizen'),
        (2, 'Active Neighbor'),
        (3, 'Community Helper'),
        (4, 'Civic Champion'),
        (5, 'Local Leader'),
        (6, 'City Ambassador'),
        (7, 'Urban Hero'),
    ]
    
    level = models.IntegerField(choices=LEVEL_CHOICES, unique=True)
    name = models.CharField(max_length=100)
    min_points = models.IntegerField(help_text="Minimum points required")
    icon = models.CharField(max_length=50, default='⭐')
    color = models.CharField(max_length=7, default='#3B82F6')
    
    # Real benefits unlocked at this level
    priority_response = models.BooleanField(default=False, help_text="Issues get priority attention")
    direct_messaging = models.BooleanField(default=False, help_text="Can message officials directly")
    event_priority = models.BooleanField(default=False, help_text="Priority event registration")
    consultation_access = models.BooleanField(default=False, help_text="Participate in urban planning")
    community_credits = models.IntegerField(default=0, help_text="Monthly credits for city services")
    
    class Meta:
        db_table = 'civic_levels'
        ordering = ['level']
        
    def __str__(self):
        return f"Level {self.level}: {self.name}"


class UserCivicProfile(models.Model):
    """
    User's civic engagement profile with real rewards
    """
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='civic_profile')
    
    # Points and Level
    total_points = models.IntegerField(default=0)
    current_level = models.ForeignKey(CivicLevel, on_delete=models.SET_NULL, null=True)
    
    # Engagement metrics
    issues_reported = models.IntegerField(default=0)
    issues_resolved = models.IntegerField(default=0)
    events_attended = models.IntegerField(default=0)
    forum_contributions = models.IntegerField(default=0)
    volunteer_hours = models.DecimalField(max_digits=6, decimal_places=2, default=0)
    
    # Real-world benefits
    community_credits = models.IntegerField(default=0, help_text="Credits for city services")
    priority_status = models.BooleanField(default=False)
    verified_contributor = models.BooleanField(default=False)
    
    # Streaks and engagement
    current_streak_days = models.IntegerField(default=0, help_text="Consecutive days active")
    longest_streak_days = models.IntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Achievements unlocked
    achievements_unlocked = models.JSONField(default=list)
    
    # Statistics
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_civic_profiles'
        
    def __str__(self):
        return f"{self.user.get_full_name()} - Level {self.current_level.level if self.current_level else 0}"
    
    def add_points(self, points, activity_type, description):
        """Add points and check for level up"""
        self.total_points += points
        self.check_level_up()
        
        # Create activity record
        CivicActivity.objects.create(
            user=self.user,
            activity_type=activity_type,
            points_earned=points,
            description=description
        )
        
        self.save()
    
    def check_level_up(self):
        """Check if user has leveled up"""
        new_level = CivicLevel.objects.filter(
            min_points__lte=self.total_points
        ).order_by('-level').first()
        
        if new_level and (not self.current_level or new_level.level > self.current_level.level):
            old_level = self.current_level.level if self.current_level else 0
            self.current_level = new_level
            
            # Award community credits for leveling up
            self.community_credits += new_level.community_credits
            self.priority_status = new_level.priority_response
            
            # Create notification for level up
            from notifications.models import Notification
            Notification.objects.create(
                user=self.user,
                notification_type='level_up',
                title=f'🎉 Level Up! Welcome to {new_level.name}',
                message=f'You\'ve reached Level {new_level.level}! You earned {new_level.community_credits} community credits.',
                data={
                    'old_level': old_level,
                    'new_level': new_level.level,
                    'credits_earned': new_level.community_credits
                }
            )
    
    def update_streak(self):
        """Update activity streak"""
        today = timezone.now().date()
        
        if self.last_activity_date:
            days_diff = (today - self.last_activity_date).days
            
            if days_diff == 1:
                # Consecutive day
                self.current_streak_days += 1
                if self.current_streak_days > self.longest_streak_days:
                    self.longest_streak_days = self.current_streak_days
            elif days_diff > 1:
                # Streak broken
                self.current_streak_days = 1
            # If same day, don't change streak
        else:
            self.current_streak_days = 1
        
        self.last_activity_date = today
        self.save()


class CivicActivity(models.Model):
    """
    Record of civic activities that earn points
    """
    ACTIVITY_TYPES = [
        ('issue_reported', 'Issue Reported'),
        ('issue_resolved', 'Issue Resolved'),
        ('issue_voted', 'Voted on Issue'),
        ('event_attended', 'Event Attended'),
        ('event_organized', 'Event Organized'),
        ('forum_post', 'Forum Post Created'),
        ('forum_comment', 'Forum Comment'),
        ('poll_voted', 'Poll Voted'),
        ('petition_signed', 'Petition Signed'),
        ('volunteer_hours', 'Volunteer Hours'),
        ('project_feedback', 'Project Feedback'),
        ('helpful_vote', 'Helpful Vote Received'),
        ('streak_milestone', 'Streak Milestone'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='civic_activities')
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_TYPES)
    points_earned = models.IntegerField()
    description = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'civic_activities'
        ordering = ['-created_at']
        verbose_name_plural = 'Civic Activities'
        
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_activity_type_display()} (+{self.points_earned})"


class CommunityCredit(models.Model):
    """
    Community credits that can be redeemed for real services
    """
    CREDIT_TYPES = [
        ('parking', 'Parking Fee Waiver'),
        ('permit', 'Permit Processing Priority'),
        ('recreation', 'Recreation Center Pass'),
        ('transit', 'Public Transit Credit'),
        ('event', 'Event Ticket'),
        ('consultation', 'Paid Urban Planning Consultation'),
        ('recognition', 'Community Recognition Certificate'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='credit_transactions')
    credit_type = models.CharField(max_length=50, choices=CREDIT_TYPES)
    credits_spent = models.IntegerField()
    
    # Redemption details
    redeemed_at = models.DateTimeField(auto_now_add=True)
    redeemed_for = models.TextField(help_text="What the credit was redeemed for")
    redemption_code = models.CharField(max_length=20, unique=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    used_at = models.DateTimeField(null=True, blank=True)
    
    # Proof of redemption
    proof_image = models.ImageField(upload_to='credit_proofs/', null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        db_table = 'community_credits'
        ordering = ['-redeemed_at']
        
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.get_credit_type_display()}"
    
    def save(self, *args, **kwargs):
        if not self.redemption_code:
            import uuid
            self.redemption_code = str(uuid.uuid4())[:8].upper()
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(days=90)  # 90 days to use
        super().save(*args, **kwargs)


class Achievement(models.Model):
    """
    Achievements that unlock special recognition and benefits
    """
    name = models.CharField(max_length=100)
    description = models.TextField()
    icon = models.CharField(max_length=50)
    badge_image = models.ImageField(upload_to='achievement_badges/', null=True, blank=True)
    
    # Unlock criteria
    criteria_type = models.CharField(max_length=50)  # 'issues', 'events', 'streak', etc.
    criteria_value = models.IntegerField(help_text="Number required to unlock")
    
    # Benefits
    points_reward = models.IntegerField(default=0)
    credits_reward = models.IntegerField(default=0)
    special_recognition = models.BooleanField(default=False)
    
    # Rarity
    rarity = models.CharField(
        max_length=20,
        choices=[
            ('common', 'Common'),
            ('rare', 'Rare'),
            ('epic', 'Epic'),
            ('legendary', 'Legendary'),
        ],
        default='common'
    )
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'achievements'
        ordering = ['rarity', 'name']
        
    def __str__(self):
        return f"{self.name} ({self.rarity})"


class UserAchievement(models.Model):
    """
    Achievements earned by users
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(auto_now_add=True)
    
    # If achievement has a certificate/proof
    certificate_url = models.URLField(blank=True)
    
    class Meta:
        db_table = 'user_achievements'
        unique_together = ['user', 'achievement']
        ordering = ['-unlocked_at']
        
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.achievement.name}"


# Points system configuration
POINTS_CONFIG = {
    'issue_reported': 10,
    'issue_resolved': 50,  # When YOUR reported issue is resolved
    'issue_voted': 2,
    'event_attended': 20,
    'event_organized': 100,
    'forum_post': 15,
    'forum_comment': 5,
    'poll_voted': 5,
    'petition_signed': 10,
    'volunteer_hour': 10,  # Per hour
    'project_feedback': 15,
    'helpful_vote': 3,  # When others find your content helpful
    'streak_7_days': 50,
    'streak_30_days': 200,
    'streak_365_days': 1000,
}

# Community credits redemption values
CREDIT_VALUES = {
    'parking': 50,  # 1 day parking waiver
    'permit': 100,  # Priority processing
    'recreation': 150,  # 1 month pass
    'transit': 75,  # Transit credit
    'event': 25,  # Event ticket
    'consultation': 500,  # Paid consultation opportunity
    'recognition': 200,  # Official certificate
}

