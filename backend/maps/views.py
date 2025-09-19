from django.db.models import Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from .models import MapLayer, PublicFacility, District
from .serializers import (
    MapLayerSerializer, PublicFacilitySerializer, DistrictSerializer,
    IssueMapSerializer, EventMapSerializer, MapDataSerializer, MapFilterSerializer
)
from issues.models import Issue, IssueCategory
from events.models import Event, EventCategory
import math


class MapLayerViewSet(viewsets.ModelViewSet):
    """ViewSet for map layers"""
    
    queryset = MapLayer.objects.filter(is_active=True)
    serializer_class = MapLayerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated or self.request.user.role not in ['official', 'admin']:
            queryset = queryset.filter(is_public=True)
        return queryset


class PublicFacilityViewSet(viewsets.ModelViewSet):
    """ViewSet for public facilities"""
    
    queryset = PublicFacility.objects.filter(is_active=True)
    serializer_class = PublicFacilitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        if not self.request.user.is_authenticated or self.request.user.role not in ['official', 'admin']:
            queryset = queryset.filter(is_public=True)
        
        # Filter by facility type
        facility_types = self.request.query_params.getlist('facility_type')
        if facility_types:
            queryset = queryset.filter(facility_type__in=facility_types)
        
        # Filter by accessibility
        accessible_only = self.request.query_params.get('accessible_only')
        if accessible_only and accessible_only.lower() == 'true':
            queryset = queryset.filter(is_accessible=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get available facility types"""
        types = [{'value': choice[0], 'label': choice[1]} 
                for choice in PublicFacility.FACILITY_TYPES]
        return Response(types)


class DistrictViewSet(viewsets.ModelViewSet):
    """ViewSet for districts"""
    
    queryset = District.objects.filter(is_active=True)
    serializer_class = DistrictSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by district type
        district_types = self.request.query_params.getlist('district_type')
        if district_types:
            queryset = queryset.filter(district_type__in=district_types)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get available district types"""
        types = [{'value': choice[0], 'label': choice[1]} 
                for choice in District._meta.get_field('district_type').choices]
        return Response(types)


class MapDataViewSet(viewsets.ViewSet):
    """ViewSet for combined map data"""
    
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    @action(detail=False, methods=['get', 'post'])
    def data(self, request):
        """Get filtered map data"""
        
        # Parse filters
        if request.method == 'POST':
            filter_serializer = MapFilterSerializer(data=request.data)
        else:
            filter_serializer = MapFilterSerializer(data=request.query_params)
        
        if not filter_serializer.is_valid():
            return Response(filter_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        filters = filter_serializer.validated_data
        
        # Get requested layers (default to all)
        requested_layers = filters.get('layers', ['issues', 'events', 'facilities', 'districts'])
        
        data = {}
        
        # Get issues
        if 'issues' in requested_layers:
            issues_qs = self._filter_issues(filters)
            data['issues'] = IssueMapSerializer(issues_qs, many=True).data
        
        # Get events
        if 'events' in requested_layers:
            events_qs = self._filter_events(filters)
            data['events'] = EventMapSerializer(events_qs, many=True).data
        
        # Get facilities
        if 'facilities' in requested_layers:
            facilities_qs = self._filter_facilities(filters)
            data['facilities'] = PublicFacilitySerializer(facilities_qs, many=True).data
        
        # Get districts
        if 'districts' in requested_layers:
            districts_qs = self._filter_districts(filters)
            data['districts'] = DistrictSerializer(districts_qs, many=True).data
        
        # Get map layers
        layers_qs = MapLayer.objects.filter(is_active=True)
        if not request.user.is_authenticated or request.user.role not in ['official', 'admin']:
            layers_qs = layers_qs.filter(is_public=True)
        data['layers'] = MapLayerSerializer(layers_qs, many=True).data
        
        return Response(data)
    
    def _filter_issues(self, filters):
        """Filter issues based on provided filters"""
        queryset = Issue.objects.select_related('category', 'reported_by').all()
        
        # Geographic bounds
        if all(k in filters for k in ['north', 'south', 'east', 'west']):
            queryset = queryset.filter(
                latitude__gte=filters['south'],
                latitude__lte=filters['north'],
                longitude__gte=filters['west'],
                longitude__lte=filters['east']
            )
        
        # Status filter
        if 'issue_status' in filters:
            queryset = queryset.filter(status__in=filters['issue_status'])
        
        # Priority filter
        if 'issue_priority' in filters:
            queryset = queryset.filter(priority__in=filters['issue_priority'])
        
        # Category filter
        if 'issue_categories' in filters:
            queryset = queryset.filter(category_id__in=filters['issue_categories'])
        
        # Date range
        if 'date_from' in filters:
            queryset = queryset.filter(created_at__gte=filters['date_from'])
        if 'date_to' in filters:
            queryset = queryset.filter(created_at__lte=filters['date_to'])
        
        # Search
        if 'search' in filters:
            search_term = filters['search']
            queryset = queryset.filter(
                Q(title__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(address__icontains=search_term)
            )
        
        # Only return issues with coordinates
        queryset = queryset.filter(latitude__isnull=False, longitude__isnull=False)
        
        return queryset
    
    def _filter_events(self, filters):
        """Filter events based on provided filters"""
        queryset = Event.objects.select_related('category', 'organizer').all()
        
        # Geographic bounds
        if all(k in filters for k in ['north', 'south', 'east', 'west']):
            queryset = queryset.filter(
                latitude__gte=filters['south'],
                latitude__lte=filters['north'],
                longitude__gte=filters['west'],
                longitude__lte=filters['east']
            )
        
        # Event status filter
        event_status = filters.get('event_status', 'all')
        now = timezone.now()
        if event_status == 'upcoming':
            queryset = queryset.filter(start_date__gt=now)
        elif event_status == 'ongoing':
            queryset = queryset.filter(start_date__lte=now, end_date__gte=now)
        elif event_status == 'past':
            queryset = queryset.filter(end_date__lt=now)
        
        # Category filter
        if 'event_categories' in filters:
            queryset = queryset.filter(category_id__in=filters['event_categories'])
        
        # Date range
        if 'date_from' in filters:
            queryset = queryset.filter(start_date__gte=filters['date_from'])
        if 'date_to' in filters:
            queryset = queryset.filter(end_date__lte=filters['date_to'])
        
        # Search
        if 'search' in filters:
            search_term = filters['search']
            queryset = queryset.filter(
                Q(title__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(location_name__icontains=search_term) |
                Q(address__icontains=search_term)
            )
        
        # Only public events unless user is organizer/official
        if not self.request.user.is_authenticated or self.request.user.role not in ['official', 'admin']:
            queryset = queryset.filter(is_public=True)
        
        # Only return events with coordinates (exclude online-only events unless specified)
        queryset = queryset.filter(latitude__isnull=False, longitude__isnull=False)
        
        return queryset
    
    def _filter_facilities(self, filters):
        """Filter facilities based on provided filters"""
        queryset = PublicFacility.objects.filter(is_active=True)
        
        # Geographic bounds
        if all(k in filters for k in ['north', 'south', 'east', 'west']):
            queryset = queryset.filter(
                latitude__gte=filters['south'],
                latitude__lte=filters['north'],
                longitude__gte=filters['west'],
                longitude__lte=filters['east']
            )
        
        # Facility type filter
        if 'facility_types' in filters:
            queryset = queryset.filter(facility_type__in=filters['facility_types'])
        
        # Search
        if 'search' in filters:
            search_term = filters['search']
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(address__icontains=search_term)
            )
        
        # Only public facilities unless user is official
        if not self.request.user.is_authenticated or self.request.user.role not in ['official', 'admin']:
            queryset = queryset.filter(is_public=True)
        
        return queryset
    
    def _filter_districts(self, filters):
        """Filter districts based on provided filters"""
        queryset = District.objects.filter(is_active=True)
        
        # Search
        if 'search' in filters:
            search_term = filters['search']
            queryset = queryset.filter(
                Q(name__icontains=search_term) |
                Q(description__icontains=search_term) |
                Q(representative__icontains=search_term)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get map statistics"""
        
        stats = {
            'total_issues': Issue.objects.filter(latitude__isnull=False, longitude__isnull=False).count(),
            'open_issues': Issue.objects.filter(status='open', latitude__isnull=False, longitude__isnull=False).count(),
            'total_events': Event.objects.filter(latitude__isnull=False, longitude__isnull=False).count(),
            'upcoming_events': Event.objects.filter(
                start_date__gt=timezone.now(),
                latitude__isnull=False, 
                longitude__isnull=False
            ).count(),
            'total_facilities': PublicFacility.objects.filter(is_active=True).count(),
            'accessible_facilities': PublicFacility.objects.filter(is_active=True, is_accessible=True).count(),
            'total_districts': District.objects.filter(is_active=True).count(),
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def bounds(self, request):
        """Get geographic bounds of all data"""
        
        # Get bounds from issues
        issues_bounds = self._get_model_bounds(Issue, 'latitude', 'longitude')
        
        # Get bounds from events
        events_bounds = self._get_model_bounds(Event, 'latitude', 'longitude')
        
        # Get bounds from facilities
        facilities_bounds = self._get_model_bounds(PublicFacility, 'latitude', 'longitude')
        
        # Combine all bounds
        all_bounds = [b for b in [issues_bounds, events_bounds, facilities_bounds] if b]
        
        if not all_bounds:
            # Default bounds (India)
            return Response({
                'north': 35.5044,
                'south': 8.4380,
                'east': 97.3956,
                'west': 68.1766
            })
        
        combined_bounds = {
            'north': max(b['north'] for b in all_bounds),
            'south': min(b['south'] for b in all_bounds),
            'east': max(b['east'] for b in all_bounds),
            'west': min(b['west'] for b in all_bounds)
        }
        
        return Response(combined_bounds)
    
    def _get_model_bounds(self, model, lat_field, lng_field):
        """Get geographic bounds for a model"""
        from django.db.models import Min, Max
        
        bounds = model.objects.filter(
            **{f'{lat_field}__isnull': False, f'{lng_field}__isnull': False}
        ).aggregate(
            north=Max(lat_field),
            south=Min(lat_field),
            east=Max(lng_field),
            west=Min(lng_field)
        )
        
        if bounds['north'] is not None:
            return bounds
        return None


def calculate_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points using Haversine formula"""
    R = 6371  # Earth's radius in kilometers
    
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c
