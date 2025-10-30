from django.contrib import admin
from .models import (
    IssueCategory, Issue, IssueImage, IssueVote, 
    IssueComment, IssueTimeline, IssueSubscription
)


@admin.register(IssueCategory)
class IssueCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Issue)
class IssueAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'priority', 'status', 'reported_by', 'assigned_to', 'votes', 'created_at']
    list_filter = ['category', 'priority', 'status', 'created_at']
    search_fields = ['title', 'description', 'address']
    list_editable = ['status', 'priority']
    date_hierarchy = 'created_at'
    raw_id_fields = ['reported_by', 'assigned_to']


@admin.register(IssueImage)
class IssueImageAdmin(admin.ModelAdmin):
    list_display = ['issue', 'uploaded_by', 'created_at']
    list_filter = ['created_at']
    raw_id_fields = ['issue', 'uploaded_by']


@admin.register(IssueVote)
class IssueVoteAdmin(admin.ModelAdmin):
    list_display = ['issue', 'user', 'created_at']
    list_filter = ['created_at']
    raw_id_fields = ['issue', 'user']


@admin.register(IssueComment)
class IssueCommentAdmin(admin.ModelAdmin):
    list_display = ['issue', 'user', 'content_preview', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'is_flagged', 'created_at']
    search_fields = ['content']
    list_editable = ['is_approved']
    raw_id_fields = ['issue', 'user', 'parent']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(IssueTimeline)
class IssueTimelineAdmin(admin.ModelAdmin):
    list_display = ['issue', 'event_type', 'description', 'user', 'created_at']
    list_filter = ['event_type', 'created_at']
    search_fields = ['description']
    raw_id_fields = ['issue', 'user']


@admin.register(IssueSubscription)
class IssueSubscriptionAdmin(admin.ModelAdmin):
    list_display = ['issue', 'user', 'notify_comments', 'notify_status_changes', 'created_at']
    list_filter = ['notify_comments', 'notify_status_changes', 'created_at']
    raw_id_fields = ['issue', 'user']

