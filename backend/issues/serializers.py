from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Issue, IssueCategory, IssueComment, IssueVote, 
    IssueImage, IssueTimeline, IssueSubscription
)

User = get_user_model()


class IssueCategorySerializer(serializers.ModelSerializer):
    """Serializer for issue categories"""
    
    class Meta:
        model = IssueCategory
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'is_active']


class IssueImageSerializer(serializers.ModelSerializer):
    """Serializer for issue images"""
    
    class Meta:
        model = IssueImage
        fields = ['id', 'image', 'caption', 'created_at']


class IssueCommentSerializer(serializers.ModelSerializer):
    """Serializer for issue comments"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = IssueComment
        fields = [
            'id', 'content', 'user', 'user_name', 'user_avatar',
            'parent', 'replies', 'is_approved', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'is_approved']
    
    def get_user_avatar(self, obj):
        """Get user avatar URL, return None if no avatar exists"""
        if obj.user.avatar and hasattr(obj.user.avatar, 'url'):
            try:
                return obj.user.avatar.url
            except ValueError:
                return None
        return None
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return IssueCommentSerializer(obj.replies.all(), many=True).data
        return []


class IssueTimelineSerializer(serializers.ModelSerializer):
    """Serializer for issue timeline"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = IssueTimeline
        fields = ['id', 'event_type', 'description', 'user', 'user_name', 'metadata', 'created_at']


class IssueSerializer(serializers.ModelSerializer):
    """Serializer for issues"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    images = IssueImageSerializer(many=True, read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    coordinates = serializers.ReadOnlyField()
    is_voted = serializers.SerializerMethodField()
    is_subscribed = serializers.SerializerMethodField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category', 'category_name', 'category_color',
            'priority', 'status', 'latitude', 'longitude', 'coordinates', 'address',
            'reported_by', 'reported_by_name', 'assigned_to', 'assigned_to_name',
            'votes', 'views', 'tags', 'images', 'comments_count',
            'is_voted', 'is_subscribed', 'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['reported_by', 'votes', 'views', 'resolved_at']
    
    def get_is_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return IssueVote.objects.filter(issue=obj, user=request.user).exists()
        return False
    
    def get_is_subscribed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return IssueSubscription.objects.filter(issue=obj, user=request.user).exists()
        return False


class IssueCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating issues"""
    
    images = serializers.ListField(
        child=serializers.ImageField(),
        write_only=True,
        required=False,
        allow_empty=True
    )
    
    class Meta:
        model = Issue
        fields = [
            'title', 'description', 'category', 'priority', 
            'latitude', 'longitude', 'address', 'tags', 'images'
        ]
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        validated_data['reported_by'] = self.context['request'].user
        issue = Issue.objects.create(**validated_data)
        
        # Create images if provided
        for image_data in images_data:
            IssueImage.objects.create(
                issue=issue,
                image=image_data,
                uploaded_by=issue.reported_by
            )
        
        # Create timeline entry
        IssueTimeline.objects.create(
            issue=issue,
            event_type='created',
            description=f'Issue "{issue.title}" was created',
            user=issue.reported_by
        )
        
        # Subscribe reporter to issue updates
        IssueSubscription.objects.create(
            issue=issue,
            user=issue.reported_by
        )
        
        return issue


class IssueVoteSerializer(serializers.ModelSerializer):
    """Serializer for issue votes"""
    
    class Meta:
        model = IssueVote
        fields = ['id', 'user', 'created_at']
        read_only_fields = ['user']


class IssueSubscriptionSerializer(serializers.ModelSerializer):
    """Serializer for issue subscriptions"""
    
    class Meta:
        model = IssueSubscription
        fields = ['id', 'notify_comments', 'notify_status_changes', 'created_at']
