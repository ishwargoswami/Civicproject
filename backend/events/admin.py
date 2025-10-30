from django.contrib import admin
from .models import (
    EventCategory, Event, EventImage, EventRSVP, 
    EventVolunteer, EventFeedback, EventUpdate
)


@admin.register(EventCategory)
class EventCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'organizer', 'start_date', 'end_date', 'capacity', 'current_attendees', 'is_online', 'is_featured', 'created_at']
    list_filter = ['category', 'is_online', 'is_featured', 'is_public', 'start_date', 'created_at']
    search_fields = ['title', 'description', 'location_name', 'address']
    date_hierarchy = 'start_date'
    raw_id_fields = ['organizer', 'category']
    list_editable = ['is_featured']


@admin.register(EventImage)
class EventImageAdmin(admin.ModelAdmin):
    list_display = ['event', 'caption', 'is_featured', 'uploaded_by', 'created_at']
    list_filter = ['is_featured', 'created_at']
    raw_id_fields = ['event', 'uploaded_by']
    list_editable = ['is_featured']


@admin.register(EventRSVP)
class EventRSVPAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'status', 'guests', 'is_approved', 'created_at']
    list_filter = ['status', 'is_approved', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    raw_id_fields = ['event', 'user', 'approved_by']
    list_editable = ['is_approved']


@admin.register(EventVolunteer)
class EventVolunteerAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'role', 'hours_committed', 'is_confirmed', 'checked_in', 'created_at']
    list_filter = ['is_confirmed', 'checked_in', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'role']
    raw_id_fields = ['event', 'user', 'confirmed_by']
    list_editable = ['is_confirmed']


@admin.register(EventFeedback)
class EventFeedbackAdmin(admin.ModelAdmin):
    list_display = ['event', 'user', 'overall_rating', 'would_recommend', 'is_anonymous', 'created_at']
    list_filter = ['overall_rating', 'would_recommend', 'is_anonymous', 'created_at']
    search_fields = ['comments', 'suggestions']
    raw_id_fields = ['event', 'user']


@admin.register(EventUpdate)
class EventUpdateAdmin(admin.ModelAdmin):
    list_display = ['event', 'title', 'update_type', 'author', 'is_urgent', 'notify_attendees', 'created_at']
    list_filter = ['update_type', 'is_urgent', 'notify_attendees', 'notify_volunteers', 'created_at']
    search_fields = ['title', 'content']
    raw_id_fields = ['event', 'author']
    date_hierarchy = 'created_at'

