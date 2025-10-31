from rest_framework import serializers
from django.utils import timezone
from .models import (
    Event, EventCategory, EventRSVP, EventVolunteer, 
    EventFeedback, EventUpdate, EventImage
)
from accounts.models import User


class EventCategorySerializer(serializers.ModelSerializer):
    events_count = serializers.SerializerMethodField()
    
    class Meta:
        model = EventCategory
        fields = [
            'id', 'name', 'slug', 'description', 'icon', 
            'color', 'is_active', 'events_count', 'created_at'
        ]
    
    def get_events_count(self, obj):
        return obj.events.filter(start_date__gte=timezone.now()).count()


class EventImageSerializer(serializers.ModelSerializer):
    uploaded_by_name = serializers.CharField(source='uploaded_by.full_name', read_only=True)
    
    class Meta:
        model = EventImage
        fields = [
            'id', 'image', 'caption', 'is_featured', 
            'uploaded_by_name', 'created_at'
        ]


class EventRSVPSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar', read_only=True)
    approved_by_name = serializers.CharField(source='approved_by.full_name', read_only=True)
    
    class Meta:
        model = EventRSVP
        fields = [
            'id', 'status', 'guests', 'dietary_restrictions', 
            'special_needs', 'notes', 'is_approved', 'approved_by_name',
            'approved_at', 'created_at', 'updated_at', 'user_name',
            'user_avatar', 'total_attendees'
        ]
        read_only_fields = ['approved_by', 'approved_at']


class EventVolunteerSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar', read_only=True)
    confirmed_by_name = serializers.CharField(source='confirmed_by.full_name', read_only=True)
    
    class Meta:
        model = EventVolunteer
        fields = [
            'id', 'role', 'description', 'hours_committed', 
            'skills_needed', 'is_confirmed', 'confirmed_by_name',
            'checked_in', 'check_in_time', 'check_out_time',
            'created_at', 'updated_at', 'user_name', 'user_avatar',
            'hours_worked'
        ]
        read_only_fields = ['confirmed_by', 'hours_worked']


class EventFeedbackSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    user_avatar = serializers.CharField(source='user.avatar', read_only=True)
    
    class Meta:
        model = EventFeedback
        fields = [
            'id', 'overall_rating', 'organization_rating', 
            'content_rating', 'venue_rating', 'comments',
            'suggestions', 'would_recommend', 'would_attend_again',
            'is_anonymous', 'created_at', 'user_name', 'user_avatar'
        ]


class EventUpdateSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    
    class Meta:
        model = EventUpdate
        fields = [
            'id', 'title', 'content', 'update_type', 
            'author_name', 'notify_attendees', 'notify_volunteers',
            'is_urgent', 'created_at'
        ]


class EventListSerializer(serializers.ModelSerializer):
    """Serializer for event list view with minimal data"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_color = serializers.CharField(source='category.color', read_only=True)
    organizer_name = serializers.CharField(source='organizer.full_name', read_only=True)
    featured_image = serializers.SerializerMethodField()
    attendees_count = serializers.SerializerMethodField()
    coordinates = serializers.ReadOnlyField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category_name', 'category_color',
            'organizer_name', 'location_name', 'address', 'coordinates',
            'is_online', 'start_date', 'end_date', 'capacity', 
            'current_attendees', 'attendees_count', 'is_featured',
            'is_public', 'tags', 'featured_image', 'is_full',
            'available_spots', 'is_past', 'is_upcoming', 'is_ongoing',
            'created_at'
        ]
    
    def get_featured_image(self, obj):
        featured_image = obj.images.filter(is_featured=True).first()
        if featured_image:
            return EventImageSerializer(featured_image).data
        return None
    
    def get_attendees_count(self, obj):
        return obj.rsvps.filter(status='attending', is_approved=True).count()


class EventDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed event view"""
    category = EventCategorySerializer(read_only=True)
    organizer_name = serializers.CharField(source='organizer.full_name', read_only=True)
    organizer_avatar = serializers.CharField(source='organizer.avatar', read_only=True)
    images = EventImageSerializer(many=True, read_only=True)
    rsvps = EventRSVPSerializer(many=True, read_only=True)
    volunteers = EventVolunteerSerializer(many=True, read_only=True)
    feedback = EventFeedbackSerializer(many=True, read_only=True)
    updates = EventUpdateSerializer(many=True, read_only=True)
    coordinates = serializers.ReadOnlyField()
    
    # Computed fields
    attendees_count = serializers.SerializerMethodField()
    maybe_count = serializers.SerializerMethodField()
    volunteers_count = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    user_rsvp = serializers.SerializerMethodField()
    user_volunteer = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id', 'title', 'description', 'category', 'organizer_name',
            'organizer_avatar', 'organization', 'location_name', 'address',
            'coordinates', 'is_online', 'meeting_link', 'start_date',
            'end_date', 'registration_deadline', 'capacity', 'current_attendees',
            'volunteers_needed', 'current_volunteers', 'requirements',
            'age_restriction', 'requires_approval', 'is_featured',
            'is_public', 'allow_waitlist', 'tags', 'external_url',
            'created_at', 'updated_at', 'images', 'rsvps', 'volunteers',
            'feedback', 'updates', 'is_full', 'available_spots',
            'volunteers_still_needed', 'is_past', 'is_upcoming',
            'is_ongoing', 'attendees_count', 'maybe_count',
            'volunteers_count', 'average_rating', 'user_rsvp',
            'user_volunteer', 'can_edit'
        ]
    
    def get_attendees_count(self, obj):
        return obj.rsvps.filter(status='attending', is_approved=True).count()
    
    def get_maybe_count(self, obj):
        return obj.rsvps.filter(status='maybe', is_approved=True).count()
    
    def get_volunteers_count(self, obj):
        return obj.volunteers.filter(is_confirmed=True).count()
    
    def get_average_rating(self, obj):
        feedback = obj.feedback.all()
        if feedback:
            total = sum(f.overall_rating for f in feedback)
            return round(total / len(feedback), 1)
        return None
    
    def get_user_rsvp(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rsvp = obj.rsvps.filter(user=request.user).first()
            if rsvp:
                return EventRSVPSerializer(rsvp).data
        return None
    
    def get_user_volunteer(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            volunteer = obj.volunteers.filter(user=request.user).first()
            if volunteer:
                return EventVolunteerSerializer(volunteer).data
        return None
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return (request.user == obj.organizer or 
                   request.user.is_staff or 
                   request.user.is_superuser)
        return False


class EventCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating events"""
    
    class Meta:
        model = Event
        fields = [
            'title', 'description', 'category', 'organization',
            'location_name', 'address', 'latitude', 'longitude',
            'is_online', 'meeting_link', 'start_date', 'end_date',
            'registration_deadline', 'capacity', 'volunteers_needed',
            'requirements', 'age_restriction', 'requires_approval',
            'is_featured', 'is_public', 'allow_waitlist', 'tags',
            'external_url'
        ]
    
    def validate(self, data):
        errors = {}
        
        # Validate dates
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] >= data['end_date']:
                errors['end_date'] = "End date must be after start date."
            
            # Allow events starting within the next hour (more lenient)
            from datetime import timedelta
            min_start = timezone.now() - timedelta(minutes=5)  # 5 minute grace period
            if data['start_date'] < min_start:
                errors['start_date'] = "Start date cannot be in the past."
        
        # Validate registration deadline
        if data.get('registration_deadline') and data.get('start_date'):
            if data['registration_deadline'] >= data['start_date']:
                errors['registration_deadline'] = "Registration deadline must be before start date."
        
        # Validate online event requirements
        if data.get('is_online') and not data.get('meeting_link'):
            errors['meeting_link'] = "Meeting link is required for online events."
        
        # Validate location requirements
        if not data.get('is_online', False):
            if not data.get('address'):
                errors['address'] = "Address is required for in-person events."
            if not data.get('location_name'):
                errors['location_name'] = "Location name is required for in-person events."
        
        if errors:
            raise serializers.ValidationError(errors)
        
        return data
    
    def create(self, validated_data):
        # Set organizer to current user
        validated_data['organizer'] = self.context['request'].user
        return super().create(validated_data)


class RSVPCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating RSVPs"""
    
    class Meta:
        model = EventRSVP
        fields = [
            'status', 'guests', 'dietary_restrictions', 
            'special_needs', 'notes'
        ]
    
    def validate(self, data):
        event = self.context['event']
        user = self.context['request'].user
        
        # Check if event is full (only for new RSVPs)
        if not self.instance and data['status'] == 'attending':
            total_spots_needed = 1 + data.get('guests', 0)
            if event.available_spots < total_spots_needed:
                if event.allow_waitlist:
                    data['status'] = 'waitlist'
                else:
                    raise serializers.ValidationError(
                        "Event is full and waitlist is not allowed."
                    )
        
        return data


class VolunteerCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for volunteer applications"""
    
    class Meta:
        model = EventVolunteer
        fields = [
            'role', 'description', 'hours_committed', 'skills_needed'
        ]
