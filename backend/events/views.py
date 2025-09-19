from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Count, Avg
from django.shortcuts import get_object_or_404

from .models import (
    Event, EventCategory, EventRSVP, EventVolunteer, 
    EventFeedback, EventUpdate, EventImage
)
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer,
    EventCategorySerializer, RSVPCreateUpdateSerializer, VolunteerCreateUpdateSerializer,
    EventFeedbackSerializer, EventUpdateSerializer, EventImageSerializer
)


class EventCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for event categories"""
    queryset = EventCategory.objects.filter(is_active=True)
    serializer_class = EventCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EventViewSet(viewsets.ModelViewSet):
    """ViewSet for events with full CRUD and additional actions"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'location_name', 'address', 'tags']
    ordering_fields = ['start_date', 'created_at', 'title', 'current_attendees']
    ordering = ['start_date']
    filterset_fields = {
        'category': ['exact'],
        'is_featured': ['exact'],
        'is_online': ['exact'],
        'start_date': ['gte', 'lte'],
        'end_date': ['gte', 'lte'],
    }
    
    def get_queryset(self):
        queryset = Event.objects.filter(is_public=True).select_related(
            'category', 'organizer'
        ).prefetch_related(
            'images', 'rsvps', 'volunteers'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter == 'upcoming':
            queryset = queryset.filter(start_date__gt=timezone.now())
        elif status_filter == 'ongoing':
            now = timezone.now()
            queryset = queryset.filter(start_date__lte=now, end_date__gte=now)
        elif status_filter == 'past':
            queryset = queryset.filter(end_date__lt=timezone.now())
        elif status_filter == 'featured':
            queryset = queryset.filter(is_featured=True)
        
        # Filter by location bounds (for map)
        bounds = self.request.query_params.get('bounds')
        if bounds:
            try:
                north, south, east, west = map(float, bounds.split(','))
                queryset = queryset.filter(
                    latitude__range=(south, north),
                    longitude__range=(west, east)
                )
            except (ValueError, TypeError):
                pass
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return EventCreateUpdateSerializer
        return EventDetailSerializer
    
    def perform_create(self, serializer):
        serializer.save(organizer=self.request.user)
    
    def perform_update(self, serializer):
        # Only allow organizer or staff to update
        event = self.get_object()
        if (event.organizer != self.request.user and 
            not self.request.user.is_staff):
            raise permissions.PermissionDenied(
                "Only the event organizer can update this event."
            )
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only allow organizer or staff to delete
        if (instance.organizer != self.request.user and 
            not self.request.user.is_staff):
            raise permissions.PermissionDenied(
                "Only the event organizer can delete this event."
            )
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def my_events(self, request):
        """Get events organized by the current user"""
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        events = self.get_queryset().filter(organizer=request.user)
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = EventListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_rsvps(self, request):
        """Get events the user has RSVP'd to"""
        if not request.user.is_authenticated:
            return Response(
                {"detail": "Authentication required"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        event_ids = EventRSVP.objects.filter(
            user=request.user
        ).values_list('event_id', flat=True)
        
        events = self.get_queryset().filter(id__in=event_ids)
        page = self.paginate_queryset(events)
        if page is not None:
            serializer = EventListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = EventListSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post', 'put', 'delete'])
    def rsvp(self, request, pk=None):
        """RSVP to an event"""
        event = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {"detail": "Authentication required"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if request.method == 'DELETE':
            # Cancel RSVP
            rsvp = get_object_or_404(EventRSVP, event=event, user=user)
            rsvp.delete()
            
            # Update attendee count
            if rsvp.status == 'attending':
                event.current_attendees = max(0, event.current_attendees - (1 + rsvp.guests))
                event.save()
            
            return Response({"detail": "RSVP cancelled successfully"})
        
        # Get or create RSVP
        rsvp, created = EventRSVP.objects.get_or_create(
            event=event, 
            user=user,
            defaults={'status': 'attending'}
        )
        
        # Update RSVP
        serializer = RSVPCreateUpdateSerializer(
            rsvp, 
            data=request.data, 
            context={'request': request, 'event': event}
        )
        
        if serializer.is_valid():
            old_status = rsvp.status if not created else None
            old_guests = rsvp.guests if not created else 0
            
            serializer.save()
            
            # Update attendee count
            if old_status == 'attending':
                event.current_attendees -= (1 + old_guests)
            
            if rsvp.status == 'attending' and rsvp.is_approved:
                event.current_attendees += (1 + rsvp.guests)
            
            event.save()
            
            return Response(
                EventDetailSerializer(event, context={'request': request}).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post', 'put', 'delete'])
    def volunteer(self, request, pk=None):
        """Volunteer for an event"""
        event = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {"detail": "Authentication required"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if request.method == 'DELETE':
            # Cancel volunteer application
            volunteer = get_object_or_404(EventVolunteer, event=event, user=user)
            volunteer.delete()
            
            # Update volunteer count
            if volunteer.is_confirmed:
                event.current_volunteers = max(0, event.current_volunteers - 1)
                event.save()
            
            return Response({"detail": "Volunteer application cancelled"})
        
        # Get or create volunteer
        volunteer, created = EventVolunteer.objects.get_or_create(
            event=event, 
            user=user
        )
        
        # Update volunteer application
        serializer = VolunteerCreateUpdateSerializer(
            volunteer, 
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            
            return Response(
                EventDetailSerializer(event, context={'request': request}).data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def feedback(self, request, pk=None):
        """Submit feedback for an event"""
        event = self.get_object()
        user = request.user
        
        if not user.is_authenticated:
            return Response(
                {"detail": "Authentication required"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Check if user attended the event
        if not event.rsvps.filter(user=user, status='attending').exists():
            return Response(
                {"detail": "Only attendees can submit feedback"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if event is past
        if not event.is_past:
            return Response(
                {"detail": "Feedback can only be submitted after the event"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create feedback
        feedback, created = EventFeedback.objects.get_or_create(
            event=event, 
            user=user
        )
        
        serializer = EventFeedbackSerializer(
            feedback, 
            data=request.data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            serializer.save()
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def attendees(self, request, pk=None):
        """Get event attendees"""
        event = self.get_object()
        
        # Only organizer and staff can see full attendee list
        if (event.organizer != request.user and 
            not request.user.is_staff):
            return Response(
                {"detail": "Permission denied"}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        rsvps = event.rsvps.filter(status='attending', is_approved=True)
        serializer = EventRSVPSerializer(rsvps, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def volunteers(self, request, pk=None):
        """Get event volunteers"""
        event = self.get_object()
        volunteers = event.volunteers.filter(is_confirmed=True)
        serializer = EventVolunteerSerializer(volunteers, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get event statistics"""
        now = timezone.now()
        
        stats = {
            'total_events': Event.objects.filter(is_public=True).count(),
            'upcoming_events': Event.objects.filter(
                is_public=True, 
                start_date__gt=now
            ).count(),
            'ongoing_events': Event.objects.filter(
                is_public=True,
                start_date__lte=now, 
                end_date__gte=now
            ).count(),
            'past_events': Event.objects.filter(
                is_public=True,
                end_date__lt=now
            ).count(),
            'total_attendees': EventRSVP.objects.filter(
                status='attending', 
                is_approved=True
            ).count(),
            'total_volunteers': EventVolunteer.objects.filter(
                is_confirmed=True
            ).count(),
        }
        
        # Category breakdown
        category_stats = Event.objects.filter(is_public=True).values(
            'category__name', 'category__color'
        ).annotate(count=Count('id')).order_by('-count')
        
        stats['categories'] = [
            {
                'name': item['category__name'],
                'color': item['category__color'],
                'count': item['count']
            }
            for item in category_stats
        ]
        
        return Response(stats)


class EventImageViewSet(viewsets.ModelViewSet):
    """ViewSet for event images"""
    serializer_class = EventImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs.get('event_pk')
        return EventImage.objects.filter(event_id=event_id)
    
    def perform_create(self, serializer):
        event_id = self.kwargs.get('event_pk')
        event = get_object_or_404(Event, id=event_id)
        
        # Check permission
        if (event.organizer != self.request.user and 
            not self.request.user.is_staff):
            raise permissions.PermissionDenied(
                "Only the event organizer can add images."
            )
        
        serializer.save(event=event, uploaded_by=self.request.user)


class EventUpdateViewSet(viewsets.ModelViewSet):
    """ViewSet for event updates"""
    serializer_class = EventUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        event_id = self.kwargs.get('event_pk')
        return EventUpdate.objects.filter(event_id=event_id)
    
    def perform_create(self, serializer):
        event_id = self.kwargs.get('event_pk')
        event = get_object_or_404(Event, id=event_id)
        
        # Check permission
        if (event.organizer != self.request.user and 
            not self.request.user.is_staff):
            raise permissions.PermissionDenied(
                "Only the event organizer can add updates."
            )
        
        serializer.save(event=event, author=self.request.user)
