"""
Serializers for gamification system
"""
from rest_framework import serializers
from .gamification_models import (
    CivicLevel, UserCivicProfile, CivicActivity, 
    CommunityCredit, Achievement, UserAchievement
)


class CivicLevelSerializer(serializers.ModelSerializer):
    """Serializer for civic levels"""
    
    points_required = serializers.IntegerField(source='min_points', read_only=True)
    monthly_credits = serializers.IntegerField(source='community_credits', read_only=True)
    benefits = serializers.SerializerMethodField()
    
    class Meta:
        model = CivicLevel
        fields = [
            'id', 'level', 'name', 'points_required', 'icon', 'color',
            'benefits', 'monthly_credits'
        ]
    
    def get_benefits(self, obj):
        """List of benefits in readable format"""
        benefits = []
        if obj.priority_response:
            benefits.append('⚡ Priority Response on Issues')
        if obj.direct_messaging:
            benefits.append('💬 Direct Message Officials')
        if obj.event_priority:
            benefits.append('🎟️ Priority Event Registration')
        if obj.consultation_access:
            benefits.append('🏛️ Urban Planning Consultation Access')
        if obj.community_credits > 0:
            benefits.append(f'💰 {obj.community_credits} Community Credits/Month')
        return benefits


class UserCivicProfileSerializer(serializers.ModelSerializer):
    """Serializer for user civic profile"""
    
    user = serializers.SerializerMethodField()
    current_level = CivicLevelSerializer(read_only=True)
    next_level = serializers.SerializerMethodField()
    points_to_next_level = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    lifetime_credits_earned = serializers.IntegerField(default=0)
    total_activities = serializers.SerializerMethodField()
    rank = serializers.SerializerMethodField()
    achievements = serializers.SerializerMethodField()
    recent_activities = serializers.SerializerMethodField()
    
    class Meta:
        model = UserCivicProfile
        fields = [
            'id', 'user', 'current_level', 'next_level', 'total_points',
            'points_to_next_level', 'progress_percentage', 'community_credits',
            'lifetime_credits_earned', 'achievements_unlocked', 'total_activities',
            'rank', 'achievements', 'recent_activities'
        ]
    
    def get_user(self, obj):
        """Get user information"""
        return {
            'id': obj.user.id,
            'email': obj.user.email,
            'first_name': obj.user.first_name,
            'last_name': obj.user.last_name,
            'full_name': obj.user.get_full_name(),
        }
    
    def get_next_level(self, obj):
        """Get next level information"""
        if obj.current_level:
            next_level = CivicLevel.objects.filter(
                level__gt=obj.current_level.level
            ).order_by('level').first()
            
            if next_level:
                return CivicLevelSerializer(next_level).data
        else:
            # User is at level 0, get level 1
            first_level = CivicLevel.objects.filter(level=1).first()
            if first_level:
                return CivicLevelSerializer(first_level).data
        return None
    
    def get_points_to_next_level(self, obj):
        """Calculate points needed to reach next level"""
        if obj.current_level:
            next_level = CivicLevel.objects.filter(
                level__gt=obj.current_level.level
            ).order_by('level').first()
            
            if next_level:
                return max(0, next_level.min_points - obj.total_points)
        return 0
    
    def get_progress_percentage(self, obj):
        """Calculate progress percentage to next level"""
        if obj.current_level:
            next_level = CivicLevel.objects.filter(
                level__gt=obj.current_level.level
            ).order_by('level').first()
            
            if next_level:
                current_min = obj.current_level.min_points
                next_min = next_level.min_points
                user_points = obj.total_points
                
                if next_min > current_min:
                    progress = ((user_points - current_min) / (next_min - current_min)) * 100
                    return min(100, max(0, progress))
        return 0
    
    def get_total_activities(self, obj):
        """Get total number of activities"""
        return CivicActivity.objects.filter(user=obj.user).count()
    
    def get_rank(self, obj):
        """Get user's rank on leaderboard"""
        rank = UserCivicProfile.objects.filter(
            total_points__gt=obj.total_points
        ).count() + 1
        return rank
    
    def get_achievements(self, obj):
        """Get user's achievements"""
        user_achievements = UserAchievement.objects.filter(
            user=obj.user
        ).select_related('achievement')[:10]
        
        return [{
            'id': ua.id,
            'achievement': AchievementSerializer(ua.achievement).data,
            'earned_at': ua.unlocked_at.isoformat() if ua.unlocked_at else None,
            'progress': 100,
            'is_completed': True,
        } for ua in user_achievements]
    
    def get_recent_activities(self, obj):
        """Get recent activities"""
        activities = CivicActivity.objects.filter(
            user=obj.user
        ).order_by('-created_at')[:10]
        
        return [{
            'id': activity.id,
            'activity_type': activity.activity_type,
            'activity_type_display': activity.get_activity_type_display(),
            'points_earned': activity.points_earned,
            'description': activity.description,
            'created_at': activity.created_at.isoformat(),
        } for activity in activities]


class CivicActivitySerializer(serializers.ModelSerializer):
    """Serializer for civic activities"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    activity_label = serializers.CharField(source='get_activity_type_display', read_only=True)
    time_ago = serializers.SerializerMethodField()
    
    class Meta:
        model = CivicActivity
        fields = [
            'id', 'user_name', 'activity_type', 'activity_label',
            'points_earned', 'description', 'created_at', 'time_ago'
        ]
    
    def get_time_ago(self, obj):
        """Human-readable time ago"""
        from django.utils.timesince import timesince
        return timesince(obj.created_at) + ' ago'


class CommunityCreditSerializer(serializers.ModelSerializer):
    """Serializer for community credits"""
    
    benefit_type = serializers.CharField(source='credit_type', read_only=True)
    benefit_type_display = serializers.CharField(source='get_credit_type_display', read_only=True)
    credits_cost = serializers.IntegerField(source='credits_spent', read_only=True)
    description = serializers.CharField(source='redeemed_for', read_only=True)
    is_active = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    days_until_expiry = serializers.SerializerMethodField()
    
    class Meta:
        model = CommunityCredit
        fields = [
            'id', 'benefit_type', 'benefit_type_display', 'credits_cost',
            'description', 'redemption_code', 'redeemed_at', 'expires_at',
            'is_active', 'status', 'status_display', 'is_expired', 'days_until_expiry'
        ]
    
    def get_is_active(self, obj):
        """Check if credit is still active"""
        from django.utils import timezone
        return not obj.is_used and timezone.now() <= obj.expires_at
    
    def get_status(self, obj):
        """Get status code"""
        from django.utils import timezone
        if obj.is_used:
            return 'redeemed'
        elif timezone.now() > obj.expires_at:
            return 'expired'
        else:
            return 'active'
    
    def get_status_display(self, obj):
        """Get human-readable status"""
        from django.utils import timezone
        if obj.is_used:
            return 'Redeemed'
        elif timezone.now() > obj.expires_at:
            return 'Expired'
        else:
            return 'Active'
    
    def get_is_expired(self, obj):
        """Check if credit has expired"""
        from django.utils import timezone
        return timezone.now() > obj.expires_at and not obj.is_used
    
    def get_days_until_expiry(self, obj):
        """Days until credit expires"""
        from django.utils import timezone
        if obj.is_used:
            return None
        days = (obj.expires_at - timezone.now()).days
        return max(0, days)


class CommunityCreditRedemptionSerializer(serializers.Serializer):
    """Serializer for redeeming community credits"""
    
    credit_type = serializers.ChoiceField(choices=CommunityCredit.CREDIT_TYPES)
    redeemed_for = serializers.CharField(max_length=500)
    
    def validate(self, data):
        """Validate user has enough credits"""
        from .gamification_models import CREDIT_VALUES
        
        user = self.context['request'].user
        credit_type = data['credit_type']
        cost = CREDIT_VALUES.get(credit_type, 0)
        
        try:
            profile = user.civic_profile
        except UserCivicProfile.DoesNotExist:
            raise serializers.ValidationError("User civic profile not found")
        
        if profile.community_credits < cost:
            raise serializers.ValidationError(
                f"Insufficient credits. You have {profile.community_credits}, need {cost}"
            )
        
        data['cost'] = cost
        return data


class AchievementSerializer(serializers.ModelSerializer):
    """Serializer for achievements"""
    
    progress = serializers.SerializerMethodField()
    is_unlocked = serializers.SerializerMethodField()
    
    class Meta:
        model = Achievement
        fields = [
            'id', 'name', 'description', 'icon', 'badge_image',
            'criteria_type', 'criteria_value', 'points_reward',
            'credits_reward', 'rarity', 'progress', 'is_unlocked'
        ]
    
    def get_progress(self, obj):
        """Calculate user's progress towards this achievement"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        try:
            profile = request.user.civic_profile
        except UserCivicProfile.DoesNotExist:
            return 0
        
        # Map criteria type to profile field
        criteria_map = {
            'issues': profile.issues_reported,
            'resolved': profile.issues_resolved,
            'events': profile.events_attended,
            'forum': profile.forum_contributions,
            'streak': profile.current_streak_days,
        }
        
        current = criteria_map.get(obj.criteria_type, 0)
        required = obj.criteria_value
        
        progress_pct = min(100, (current / required) * 100) if required > 0 else 0
        
        return {
            'current': current,
            'required': required,
            'percentage': round(progress_pct, 1)
        }
    
    def get_is_unlocked(self, obj):
        """Check if user has unlocked this achievement"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        return UserAchievement.objects.filter(
            user=request.user,
            achievement=obj
        ).exists()


class UserAchievementSerializer(serializers.ModelSerializer):
    """Serializer for user achievements"""
    
    achievement_details = AchievementSerializer(source='achievement', read_only=True)
    
    class Meta:
        model = UserAchievement
        fields = ['id', 'achievement_details', 'unlocked_at', 'certificate_url']


class LeaderboardSerializer(serializers.Serializer):
    """Serializer for leaderboard entries"""
    
    rank = serializers.IntegerField()
    user_id = serializers.IntegerField()
    user_name = serializers.CharField()
    avatar = serializers.CharField(allow_null=True)
    total_points = serializers.IntegerField()
    level = serializers.IntegerField()
    level_name = serializers.CharField()
    issues_resolved = serializers.IntegerField()
    events_attended = serializers.IntegerField()
    is_current_user = serializers.BooleanField(default=False)

