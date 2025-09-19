from rest_framework import status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F, Count
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import (
    ForumCategory, ForumPost, ForumPostVote, ForumComment, ForumCommentVote,
    Poll, PollOption, PollVote, Petition, PetitionSignature
)
from .serializers import (
    ForumCategorySerializer, ForumPostSerializer, ForumPostCreateSerializer,
    ForumCommentSerializer, PollSerializer, PetitionSerializer,
    PetitionSignatureSerializer
)


class ForumCategoryViewSet(ModelViewSet):
    """ViewSet for forum categories"""
    
    queryset = ForumCategory.objects.filter(is_active=True).annotate(
        posts_count=Count('posts')
    ).order_by('order', 'name')
    serializer_class = ForumCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        """Only admins can create/update/delete categories"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return super().get_permissions()


class ForumPostViewSet(ModelViewSet):
    """ViewSet for forum posts"""
    
    queryset = ForumPost.objects.select_related(
        'category', 'author', 'poll', 'petition'
    ).prefetch_related(
        'poll__options', 'user_votes', 'comments'
    ).filter(is_approved=True)
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'post_type', 'author', 'is_pinned', 'is_featured']
    search_fields = ['title', 'content', 'tags']
    ordering_fields = ['created_at', 'updated_at', 'views', 'upvotes', 'score']
    ordering = ['-is_pinned', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ForumPostCreateSerializer
        return ForumPostSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by category if specified
        category = self.request.query_params.get('category')
        if category and category != 'all':
            queryset = queryset.filter(category__slug=category)
        
        # Filter by post type if specified
        post_type = self.request.query_params.get('post_type')
        if post_type and post_type != 'all':
            queryset = queryset.filter(post_type=post_type)
        
        # Filter by tags
        tags = self.request.query_params.get('tags')
        if tags:
            tag_list = tags.split(',')
            for tag in tag_list:
                queryset = queryset.filter(tags__icontains=tag.strip())
        
        return queryset
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views
        ForumPost.objects.filter(id=instance.id).update(views=F('views') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """Vote on a forum post"""
        post = self.get_object()
        user = request.user
        vote_type = request.data.get('vote_type')
        
        if vote_type not in ['up', 'down']:
            return Response({'error': 'Invalid vote type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already voted
        try:
            existing_vote = ForumPostVote.objects.get(post=post, user=user)
            
            if existing_vote.vote_type == vote_type:
                # Remove vote if same type
                existing_vote.delete()
                if vote_type == 'up':
                    ForumPost.objects.filter(id=post.id).update(upvotes=F('upvotes') - 1)
                else:
                    ForumPost.objects.filter(id=post.id).update(downvotes=F('downvotes') - 1)
                message = 'Vote removed'
            else:
                # Change vote type
                existing_vote.vote_type = vote_type
                existing_vote.save()
                
                if vote_type == 'up':
                    ForumPost.objects.filter(id=post.id).update(
                        upvotes=F('upvotes') + 1,
                        downvotes=F('downvotes') - 1
                    )
                else:
                    ForumPost.objects.filter(id=post.id).update(
                        upvotes=F('upvotes') - 1,
                        downvotes=F('downvotes') + 1
                    )
                message = 'Vote updated'
        
        except ForumPostVote.DoesNotExist:
            # Create new vote
            ForumPostVote.objects.create(post=post, user=user, vote_type=vote_type)
            
            if vote_type == 'up':
                ForumPost.objects.filter(id=post.id).update(upvotes=F('upvotes') + 1)
            else:
                ForumPost.objects.filter(id=post.id).update(downvotes=F('downvotes') + 1)
            message = 'Vote added'
        
        # Get updated post data
        post.refresh_from_db()
        return Response({
            'message': message,
            'upvotes': post.upvotes,
            'downvotes': post.downvotes,
            'score': post.score,
            'user_vote': vote_type if ForumPostVote.objects.filter(post=post, user=user).exists() else None
        })
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get comments for a forum post"""
        post = self.get_object()
        comments = ForumComment.objects.filter(
            post=post, 
            parent=None, 
            is_approved=True
        ).select_related('user').prefetch_related('replies').order_by('created_at')
        
        serializer = ForumCommentSerializer(comments, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, pk=None):
        """Add a comment to a forum post"""
        post = self.get_object()
        
        if post.is_locked:
            return Response({'error': 'Post is locked'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = ForumCommentSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            comment = serializer.save(post=post, user=request.user)
            return Response(ForumCommentSerializer(comment, context={'request': request}).data, 
                          status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote_on_poll(self, request, pk=None):
        """Vote on a poll"""
        post = self.get_object()
        
        if post.post_type != 'poll' or not hasattr(post, 'poll'):
            return Response({'error': 'Post is not a poll'}, status=status.HTTP_400_BAD_REQUEST)
        
        poll = post.poll
        if not poll.is_active:
            return Response({'error': 'Poll has ended'}, status=status.HTTP_400_BAD_REQUEST)
        
        option_ids = request.data.get('option_ids', [])
        if not option_ids:
            return Response({'error': 'No options selected'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate options belong to this poll
        options = PollOption.objects.filter(id__in=option_ids, poll=poll)
        if len(options) != len(option_ids):
            return Response({'error': 'Invalid option IDs'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if multiple selection is allowed
        if len(option_ids) > 1 and not poll.allow_multiple:
            return Response({'error': 'Multiple selection not allowed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Remove existing votes
        PollVote.objects.filter(poll=poll, user=request.user).delete()
        
        # Add new votes
        for option in options:
            PollVote.objects.create(poll=poll, option=option, user=request.user)
            PollOption.objects.filter(id=option.id).update(votes=F('votes') + 1)
        
        # Return updated poll data
        poll.refresh_from_db()
        serializer = PollSerializer(poll, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def sign_petition(self, request, pk=None):
        """Sign a petition"""
        post = self.get_object()
        
        if post.post_type != 'petition' or not hasattr(post, 'petition'):
            return Response({'error': 'Post is not a petition'}, status=status.HTTP_400_BAD_REQUEST)
        
        petition = post.petition
        if not petition.is_active:
            return Response({'error': 'Petition has ended'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already signed
        if PetitionSignature.objects.filter(petition=petition, user=request.user).exists():
            return Response({'error': 'Already signed'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create signature
        comment = request.data.get('comment', '')
        is_anonymous = request.data.get('is_anonymous', False)
        
        PetitionSignature.objects.create(
            petition=petition,
            user=request.user,
            comment=comment,
            is_anonymous=is_anonymous
        )
        
        # Update signature count
        Petition.objects.filter(id=petition.id).update(signatures=F('signatures') + 1)
        
        # Return updated petition data
        petition.refresh_from_db()
        serializer = PetitionSerializer(petition, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def petition_signatures(self, request, pk=None):
        """Get petition signatures"""
        post = self.get_object()
        
        if post.post_type != 'petition' or not hasattr(post, 'petition'):
            return Response({'error': 'Post is not a petition'}, status=status.HTTP_400_BAD_REQUEST)
        
        signatures = PetitionSignature.objects.filter(
            petition=post.petition
        ).select_related('user').order_by('-created_at')
        
        serializer = PetitionSignatureSerializer(signatures, many=True)
        return Response(serializer.data)


class ForumCommentViewSet(ModelViewSet):
    """ViewSet for forum comments"""
    
    queryset = ForumComment.objects.select_related('user', 'post').filter(is_approved=True)
    serializer_class = ForumCommentSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        """Users can only edit their own comments, admins can moderate all"""
        if self.action in ['update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return super().get_permissions()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        comment = self.get_object()
        if comment.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only edit your own comments")
        serializer.save()
    
    def perform_destroy(self, instance):
        if instance.user != self.request.user and not self.request.user.is_staff:
            raise permissions.PermissionDenied("You can only delete your own comments")
        instance.delete()
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """Vote on a forum comment"""
        comment = self.get_object()
        user = request.user
        vote_type = request.data.get('vote_type')
        
        if vote_type not in ['up', 'down']:
            return Response({'error': 'Invalid vote type'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already voted
        try:
            existing_vote = ForumCommentVote.objects.get(comment=comment, user=user)
            
            if existing_vote.vote_type == vote_type:
                # Remove vote if same type
                existing_vote.delete()
                if vote_type == 'up':
                    ForumComment.objects.filter(id=comment.id).update(upvotes=F('upvotes') - 1)
                else:
                    ForumComment.objects.filter(id=comment.id).update(downvotes=F('downvotes') - 1)
                message = 'Vote removed'
            else:
                # Change vote type
                existing_vote.vote_type = vote_type
                existing_vote.save()
                
                if vote_type == 'up':
                    ForumComment.objects.filter(id=comment.id).update(
                        upvotes=F('upvotes') + 1,
                        downvotes=F('downvotes') - 1
                    )
                else:
                    ForumComment.objects.filter(id=comment.id).update(
                        upvotes=F('upvotes') - 1,
                        downvotes=F('downvotes') + 1
                    )
                message = 'Vote updated'
        
        except ForumCommentVote.DoesNotExist:
            # Create new vote
            ForumCommentVote.objects.create(comment=comment, user=user, vote_type=vote_type)
            
            if vote_type == 'up':
                ForumComment.objects.filter(id=comment.id).update(upvotes=F('upvotes') + 1)
            else:
                ForumComment.objects.filter(id=comment.id).update(downvotes=F('downvotes') + 1)
            message = 'Vote added'
        
        # Get updated comment data
        comment.refresh_from_db()
        return Response({
            'message': message,
            'upvotes': comment.upvotes,
            'downvotes': comment.downvotes,
            'score': comment.score,
            'user_vote': vote_type if ForumCommentVote.objects.filter(comment=comment, user=user).exists() else None
        })
