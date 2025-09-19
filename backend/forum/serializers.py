from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    ForumCategory, ForumPost, ForumPostVote, ForumComment, ForumCommentVote,
    Poll, PollOption, PollVote, Petition, PetitionSignature
)

User = get_user_model()


class ForumCategorySerializer(serializers.ModelSerializer):
    """Serializer for forum categories"""
    
    posts_count = serializers.IntegerField(source='posts.count', read_only=True)
    
    class Meta:
        model = ForumCategory
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 'color', 
            'is_active', 'order', 'posts_count', 'created_at'
        ]


class PollOptionSerializer(serializers.ModelSerializer):
    """Serializer for poll options"""
    
    class Meta:
        model = PollOption
        fields = ['id', 'text', 'votes', 'order', 'percentage']


class PollSerializer(serializers.ModelSerializer):
    """Serializer for polls"""
    
    options = PollOptionSerializer(many=True, read_only=True)
    user_votes = serializers.SerializerMethodField()
    
    class Meta:
        model = Poll
        fields = [
            'id', 'question', 'allow_multiple', 'ends_at', 'is_anonymous',
            'options', 'total_votes', 'is_active', 'user_votes', 'created_at'
        ]
    
    def get_user_votes(self, obj):
        """Get user's votes on this poll"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            votes = PollVote.objects.filter(poll=obj, user=request.user)
            return [vote.option.id for vote in votes]
        return []


class PetitionSerializer(serializers.ModelSerializer):
    """Serializer for petitions"""
    
    user_signed = serializers.SerializerMethodField()
    
    class Meta:
        model = Petition
        fields = [
            'id', 'target', 'goal', 'signatures', 'deadline',
            'progress_percentage', 'is_successful', 'is_active',
            'user_signed', 'created_at'
        ]
    
    def get_user_signed(self, obj):
        """Check if current user signed this petition"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PetitionSignature.objects.filter(petition=obj, user=request.user).exists()
        return False


class ForumCommentSerializer(serializers.ModelSerializer):
    """Serializer for forum comments"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    user_role = serializers.CharField(source='user.role', read_only=True)
    replies = serializers.SerializerMethodField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = ForumComment
        fields = [
            'id', 'content', 'user', 'user_name', 'user_avatar', 'user_role',
            'parent', 'replies', 'upvotes', 'downvotes', 'score', 'user_vote',
            'is_approved', 'is_flagged', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'upvotes', 'downvotes', 'is_approved', 'is_flagged']
    
    def get_user_avatar(self, obj):
        """Get user avatar URL, return None if no avatar exists"""
        if obj.user.avatar and hasattr(obj.user.avatar, 'url'):
            try:
                return obj.user.avatar.url
            except ValueError:
                return None
        return None
    
    def get_user_vote(self, obj):
        """Get current user's vote on this comment"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = ForumCommentVote.objects.get(comment=obj, user=request.user)
                return vote.vote_type
            except ForumCommentVote.DoesNotExist:
                return None
        return None
    
    def get_replies(self, obj):
        """Get comment replies"""
        if obj.replies.exists():
            return ForumCommentSerializer(
                obj.replies.filter(is_approved=True).order_by('created_at'), 
                many=True, 
                context=self.context
            ).data
        return []


class ForumPostSerializer(serializers.ModelSerializer):
    """Serializer for forum posts"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    author_name = serializers.CharField(source='author.get_full_name', read_only=True)
    author_avatar = serializers.SerializerMethodField()
    author_role = serializers.CharField(source='author.role', read_only=True)
    comments_count = serializers.IntegerField(source='comments.count', read_only=True)
    user_vote = serializers.SerializerMethodField()
    poll = PollSerializer(read_only=True)
    petition = PetitionSerializer(read_only=True)
    
    class Meta:
        model = ForumPost
        fields = [
            'id', 'title', 'content', 'category', 'category_name', 'category_color',
            'post_type', 'author', 'author_name', 'author_avatar', 'author_role',
            'views', 'upvotes', 'downvotes', 'score', 'user_vote', 'comments_count',
            'is_pinned', 'is_locked', 'is_featured', 'is_approved', 'is_flagged',
            'tags', 'poll', 'petition', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'author', 'views', 'upvotes', 'downvotes', 'is_approved', 'is_flagged'
        ]
    
    def get_author_avatar(self, obj):
        """Get author avatar URL, return None if no avatar exists"""
        if obj.author.avatar and hasattr(obj.author.avatar, 'url'):
            try:
                return obj.author.avatar.url
            except ValueError:
                return None
        return None
    
    def get_user_vote(self, obj):
        """Get current user's vote on this post"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                vote = ForumPostVote.objects.get(post=obj, user=request.user)
                return vote.vote_type
            except ForumPostVote.DoesNotExist:
                return None
        return None


class ForumPostCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating forum posts"""
    
    poll_data = serializers.JSONField(write_only=True, required=False)
    petition_data = serializers.JSONField(write_only=True, required=False)
    
    class Meta:
        model = ForumPost
        fields = [
            'title', 'content', 'category', 'post_type', 'tags',
            'poll_data', 'petition_data'
        ]
    
    def create(self, validated_data):
        poll_data = validated_data.pop('poll_data', None)
        petition_data = validated_data.pop('petition_data', None)
        
        # Set author from request
        validated_data['author'] = self.context['request'].user
        
        # Create post
        post = ForumPost.objects.create(**validated_data)
        
        # Create poll if provided
        if poll_data and post.post_type == 'poll':
            poll = Poll.objects.create(
                post=post,
                question=poll_data['question'],
                allow_multiple=poll_data.get('allow_multiple', False),
                ends_at=poll_data.get('ends_at'),
                is_anonymous=poll_data.get('is_anonymous', False)
            )
            
            # Create poll options
            for i, option_text in enumerate(poll_data['options']):
                PollOption.objects.create(
                    poll=poll,
                    text=option_text,
                    order=i
                )
        
        # Create petition if provided
        if petition_data and post.post_type == 'petition':
            Petition.objects.create(
                post=post,
                target=petition_data['target'],
                goal=petition_data['goal'],
                deadline=petition_data.get('deadline')
            )
        
        return post


class PetitionSignatureSerializer(serializers.ModelSerializer):
    """Serializer for petition signatures"""
    
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = PetitionSignature
        fields = [
            'id', 'user', 'user_name', 'comment', 'is_anonymous', 'created_at'
        ]
        read_only_fields = ['user']
