from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, UserProfile, UserActivity


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin interface for User model"""
    
    list_display = [
        'email', 'full_name', 'role', 'is_verified', 'is_active', 
        'date_joined', 'last_active', 'avatar_preview'
    ]
    list_filter = ['role', 'is_verified', 'is_active', 'date_joined']
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {
            'fields': ('first_name', 'last_name', 'avatar', 'phone_number', 'address', 'bio')
        }),
        ('Role & Verification', {
            'fields': ('role', 'is_verified', 'verification_document', 'department', 'position')
        }),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
            'classes': ('collapse',)
        }),
        ('Settings', {
            'fields': ('email_notifications', 'sms_notifications')
        }),
        ('Important dates', {
            'fields': ('last_login', 'date_joined', 'last_active')
        }),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'first_name', 'last_name', 'role', 'password1', 'password2'),
        }),
    )
    
    readonly_fields = ['date_joined', 'last_login', 'last_active']
    
    def avatar_preview(self, obj):
        if obj.avatar:
            return format_html(
                '<img src="{}" width="30" height="30" style="border-radius: 50%;" />',
                obj.avatar.url
            )
        return "No Avatar"
    avatar_preview.short_description = "Avatar"
    
    def full_name(self, obj):
        return obj.full_name
    full_name.short_description = "Full Name"
    
    actions = ['verify_users', 'unverify_users']
    
    def verify_users(self, request, queryset):
        count = queryset.update(is_verified=True)
        self.message_user(request, f'{count} users were verified.')
    verify_users.short_description = "Verify selected users"
    
    def unverify_users(self, request, queryset):
        count = queryset.update(is_verified=False)
        self.message_user(request, f'{count} users were unverified.')
    unverify_users.short_description = "Unverify selected users"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    """Admin interface for UserProfile model"""
    
    list_display = [
        'user', 'community_score', 'issues_reported', 'issues_resolved',
        'forum_posts', 'events_attended', 'created_at'
    ]
    list_filter = ['theme', 'language', 'timezone', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    ordering = ['-community_score', '-created_at']
    
    fieldsets = (
        ('User', {'fields': ('user',)}),
        ('Social Links', {
            'fields': ('website', 'twitter', 'linkedin', 'github'),
            'classes': ('collapse',)
        }),
        ('Preferences', {
            'fields': ('timezone', 'language', 'theme')
        }),
        ('Statistics', {
            'fields': (
                'issues_reported', 'issues_resolved', 'forum_posts',
                'events_attended', 'community_score'
            ),
            'classes': ('collapse',)
        }),
        ('Privacy Settings', {
            'fields': ('show_email', 'show_phone', 'show_address'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    """Admin interface for UserActivity model"""
    
    list_display = ['user', 'activity_type', 'description', 'ip_address', 'created_at']
    list_filter = ['activity_type', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'description']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Activity Info', {
            'fields': ('user', 'activity_type', 'description', 'metadata')
        }),
        ('Technical Info', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    readonly_fields = ['created_at']
    
    def has_add_permission(self, request):
        return False  # Don't allow manual creation of activities
    
    def has_change_permission(self, request, obj=None):
        return False  # Don't allow editing activities
