from rest_framework import status, permissions, filters
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, F
from django.shortcuts import get_object_or_404
from .models import (
    Issue, IssueCategory, IssueComment, IssueVote, 
    IssueImage, IssueTimeline, IssueSubscription
)
from .serializers import (
    IssueSerializer, IssueCreateSerializer, IssueCategorySerializer,
    IssueCommentSerializer, IssueTimelineSerializer, IssueVoteSerializer,
    IssueImageSerializer, IssueSubscriptionSerializer
)


class IssueCategoryViewSet(ModelViewSet):
    """ViewSet for issue categories"""
    
    queryset = IssueCategory.objects.filter(is_active=True)
    serializer_class = IssueCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_permissions(self):
        """Only admins can create/update/delete categories"""
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), permissions.IsAdminUser()]
        return super().get_permissions()


class IssueViewSet(ModelViewSet):
    """ViewSet for issues"""
    
    queryset = Issue.objects.select_related('category', 'reported_by', 'assigned_to').prefetch_related('images')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'priority', 'assigned_to']
    search_fields = ['title', 'description', 'address']
    ordering_fields = ['created_at', 'updated_at', 'votes', 'priority']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return IssueCreateSerializer
        return IssueSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by location (if lat/lng provided)
        lat = self.request.query_params.get('lat')
        lng = self.request.query_params.get('lng')
        radius = self.request.query_params.get('radius', '10')  # Default 10km radius
        
        if lat and lng:
            # Simple distance filter (you can implement more sophisticated geo queries)
            try:
                lat = float(lat)
                lng = float(lng)
                radius = float(radius)
                # This is a simplified distance filter - in production, use PostGIS
                lat_range = radius / 111.0  # Rough km to degree conversion
                lng_range = radius / (111.0 * abs(lat))
                
                queryset = queryset.filter(
                    latitude__range=[lat - lat_range, lat + lat_range],
                    longitude__range=[lng - lng_range, lng + lng_range]
                )
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views
        Issue.objects.filter(id=instance.id).update(views=F('views') + 1)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def vote(self, request, pk=None):
        """Vote for an issue"""
        issue = self.get_object()
        user = request.user
        
        # Check if user already voted
        vote, created = IssueVote.objects.get_or_create(issue=issue, user=user)
        
        if created:
            # Increment vote count
            Issue.objects.filter(id=issue.id).update(votes=F('votes') + 1)
            
            # Create timeline entry
            IssueTimeline.objects.create(
                issue=issue,
                event_type='comment_added',
                description=f'{user.get_full_name()} voted for this issue',
                user=user
            )
            
            return Response({'message': 'Vote added', 'votes': issue.votes + 1})
        else:
            # Remove vote
            vote.delete()
            Issue.objects.filter(id=issue.id).update(votes=F('votes') - 1)
            return Response({'message': 'Vote removed', 'votes': max(0, issue.votes - 1)})
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def subscribe(self, request, pk=None):
        """Subscribe to issue updates"""
        issue = self.get_object()
        user = request.user
        
        subscription, created = IssueSubscription.objects.get_or_create(
            issue=issue, 
            user=user,
            defaults={
                'notify_comments': True,
                'notify_status_changes': True
            }
        )
        
        if created:
            return Response({'message': 'Subscribed to issue updates'})
        else:
            subscription.delete()
            return Response({'message': 'Unsubscribed from issue updates'})
    
    @action(detail=True, methods=['get'])
    def comments(self, request, pk=None):
        """Get comments for an issue"""
        issue = self.get_object()
        comments = IssueComment.objects.filter(issue=issue, parent=None, is_approved=True).order_by('created_at')
        serializer = IssueCommentSerializer(comments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def add_comment(self, request, pk=None):
        """Add a comment to an issue"""
        issue = self.get_object()
        serializer = IssueCommentSerializer(data=request.data)
        
        if serializer.is_valid():
            comment = serializer.save(issue=issue, user=request.user)
            
            # Create timeline entry
            IssueTimeline.objects.create(
                issue=issue,
                event_type='comment_added',
                description=f'{request.user.get_full_name()} added a comment',
                user=request.user
            )
            
            return Response(IssueCommentSerializer(comment).data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def timeline(self, request, pk=None):
        """Get timeline for an issue"""
        issue = self.get_object()
        timeline = IssueTimeline.objects.filter(issue=issue).order_by('created_at')
        serializer = IssueTimelineSerializer(timeline, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update issue status (officials/admins only)"""
        issue = self.get_object()
        user = request.user
        
        # Check permissions
        if not (user.role in ['official', 'admin'] or user == issue.assigned_to):
            return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        new_status = request.data.get('status')
        if new_status not in dict(Issue.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = issue.status
        issue.status = new_status
        
        if new_status in ['resolved', 'closed']:
            from django.utils import timezone
            issue.resolved_at = timezone.now()
        
        issue.save()
        
        # Create timeline entry
        IssueTimeline.objects.create(
            issue=issue,
            event_type='status_changed',
            description=f'Status changed from {old_status} to {new_status}',
            user=user,
            metadata={'old_status': old_status, 'new_status': new_status}
        )
        
        return Response({'message': 'Status updated successfully', 'status': new_status})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def issue_stats(request):
    """Get issue statistics"""
    from django.db.models import Count
    
    stats = {
        'total_issues': Issue.objects.count(),
        'open_issues': Issue.objects.filter(status='open').count(),
        'in_progress_issues': Issue.objects.filter(status='in_progress').count(),
        'resolved_issues': Issue.objects.filter(status__in=['resolved', 'closed']).count(),
        'issues_by_category': list(
            Issue.objects.values('category__name', 'category__color')
            .annotate(count=Count('id'))
            .order_by('-count')
        ),
        'issues_by_priority': list(
            Issue.objects.values('priority')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
    }
    
    return Response(stats)
