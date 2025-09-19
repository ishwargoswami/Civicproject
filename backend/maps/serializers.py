from rest_framework import serializers
from .models import MapLayer, PublicFacility, District
from issues.models import Issue, IssueCategory
from events.models import Event, EventCategory
from accounts.models import User


class MapLayerSerializer(serializers.ModelSerializer):
    """Serializer for map layers"""
    
    class Meta:
        model = MapLayer
        fields = [
            'id', 'name', 'layer_type', 'description', 'default_color', 
            'icon', 'is_active', 'is_public', 'default_visible',
            'min_zoom', 'max_zoom', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class PublicFacilitySerializer(serializers.ModelSerializer):
    """Serializer for public facilities"""
    
    coordinates = serializers.ReadOnlyField()
    
    class Meta:
        model = PublicFacility
        fields = [
            'id', 'name', 'facility_type', 'description', 'latitude', 'longitude',
            'address', 'phone', 'email', 'website', 'hours', 'is_accessible',
            'accessibility_features', 'is_active', 'is_public', 'coordinates',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'coordinates', 'created_at', 'updated_at']


class DistrictSerializer(serializers.ModelSerializer):
    """Serializer for districts"""
    
    population_density = serializers.ReadOnlyField()
    
    class Meta:
        model = District
        fields = [
            'id', 'name', 'code', 'district_type', 'boundary_coordinates',
            'population', 'area_sq_km', 'representative', 'representative_contact',
            'description', 'is_active', 'population_density', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'population_density', 'created_at', 'updated_at']


class IssueMapSerializer(serializers.ModelSerializer):
    """Simplified serializer for issues on maps"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    reporter_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    coordinates = serializers.ReadOnlyField()
    
    class Meta:
        model = Issue
        fields = [
            'id', 'title', 'description', 'category_name', 'category_color', 
            'category_icon', 'priority', 'status', 'latitude', 'longitude',
            'address', 'reporter_name', 'votes', 'views', 'coordinates',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'coordinates', 'created_at', 'updated_at']


class EventMapSerializer(serializers.ModelSerializer):
    """Simplified serializer for events on maps"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    category_icon = serializers.CharField(source='category.icon', read_only=True)
    organizer_name = serializers.CharField(source='organizer.get_full_name', read_only=True)
    coordinates = serializers.ReadOnlyField()
    available_spots = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_upcoming = serializers.ReadOnlyField()
    is_ongoing = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category_name', 'category_color',
            'category_icon', 'location_name', 'address', 'latitude', 'longitude',
            'is_online', 'meeting_link', 'start_date', 'end_date', 'capacity',
            'current_attendees', 'organizer_name', 'organization', 'coordinates',
            'available_spots', 'is_full', 'is_past', 'is_upcoming', 'is_ongoing',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'coordinates', 'available_spots', 'is_full', 'is_past', 
            'is_upcoming', 'is_ongoing', 'created_at', 'updated_at'
        ]


class MapDataSerializer(serializers.Serializer):
    """Combined serializer for all map data"""
    
    issues = IssueMapSerializer(many=True, read_only=True)
    events = EventMapSerializer(many=True, read_only=True)
    facilities = PublicFacilitySerializer(many=True, read_only=True)
    districts = DistrictSerializer(many=True, read_only=True)
    layers = MapLayerSerializer(many=True, read_only=True)


class MapFilterSerializer(serializers.Serializer):
    """Serializer for map filtering parameters"""
    
    # Geographic bounds
    north = serializers.FloatField(required=False)
    south = serializers.FloatField(required=False)
    east = serializers.FloatField(required=False)
    west = serializers.FloatField(required=False)
    
    # Layer filters
    layers = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="List of layer types to include: issues, events, facilities, districts"
    )
    
    # Issue filters
    issue_status = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Issue status filters: open, in_progress, resolved, closed"
    )
    issue_priority = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="Issue priority filters: low, medium, high, critical"
    )
    issue_categories = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of issue category IDs"
    )
    
    # Event filters
    event_status = serializers.CharField(
        required=False,
        help_text="Event status: upcoming, ongoing, past, all"
    )
    event_categories = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="List of event category IDs"
    )
    
    # Facility filters
    facility_types = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        help_text="List of facility types"
    )
    
    # Date range
    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
    
    # Search
    search = serializers.CharField(required=False, max_length=200)
    
    # Clustering
    enable_clustering = serializers.BooleanField(default=True)
    cluster_distance = serializers.IntegerField(default=50, min_value=10, max_value=200)
