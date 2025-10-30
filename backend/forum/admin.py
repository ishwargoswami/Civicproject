from django.contrib import admin
from .models import (
    ForumCategory, ForumPost, ForumPostVote, Poll, PollOption, 
    PollVote, Petition, PetitionSignature, ForumComment, ForumCommentVote
)


@admin.register(ForumCategory)
class ForumCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'color', 'order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'slug', 'description']
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ['order', 'is_active']


@admin.register(ForumPost)
class ForumPostAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'post_type', 'author', 'upvotes', 'downvotes', 'views', 'is_pinned', 'is_locked', 'is_approved', 'created_at']
    list_filter = ['category', 'post_type', 'is_pinned', 'is_locked', 'is_featured', 'is_approved', 'created_at']
    search_fields = ['title', 'content', 'tags']
    list_editable = ['is_pinned', 'is_locked', 'is_approved']
    date_hierarchy = 'created_at'
    raw_id_fields = ['author', 'category']


@admin.register(ForumPostVote)
class ForumPostVoteAdmin(admin.ModelAdmin):
    list_display = ['post', 'user', 'vote_type', 'created_at']
    list_filter = ['vote_type', 'created_at']
    raw_id_fields = ['post', 'user']


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['question', 'post', 'allow_multiple', 'is_anonymous', 'ends_at', 'created_at']
    list_filter = ['allow_multiple', 'is_anonymous', 'ends_at', 'created_at']
    search_fields = ['question']
    raw_id_fields = ['post']


@admin.register(PollOption)
class PollOptionAdmin(admin.ModelAdmin):
    list_display = ['text', 'poll', 'votes', 'order']
    list_filter = ['poll']
    search_fields = ['text']
    list_editable = ['order']
    raw_id_fields = ['poll']


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ['poll', 'option', 'user', 'created_at']
    list_filter = ['created_at']
    raw_id_fields = ['poll', 'option', 'user']


@admin.register(Petition)
class PetitionAdmin(admin.ModelAdmin):
    list_display = ['post', 'target', 'goal', 'signatures', 'progress_percentage', 'deadline', 'is_successful']
    list_filter = ['deadline', 'created_at']
    search_fields = ['target']
    raw_id_fields = ['post']
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage}%"
    progress_percentage.short_description = 'Progress'
    
    def is_successful(self, obj):
        return obj.is_successful
    is_successful.boolean = True


@admin.register(PetitionSignature)
class PetitionSignatureAdmin(admin.ModelAdmin):
    list_display = ['petition', 'user', 'is_anonymous', 'created_at']
    list_filter = ['is_anonymous', 'created_at']
    search_fields = ['comment']
    raw_id_fields = ['petition', 'user']


@admin.register(ForumComment)
class ForumCommentAdmin(admin.ModelAdmin):
    list_display = ['post', 'user', 'content_preview', 'upvotes', 'downvotes', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'is_flagged', 'created_at']
    search_fields = ['content']
    list_editable = ['is_approved']
    raw_id_fields = ['post', 'user', 'parent']
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'


@admin.register(ForumCommentVote)
class ForumCommentVoteAdmin(admin.ModelAdmin):
    list_display = ['comment', 'user', 'vote_type', 'created_at']
    list_filter = ['vote_type', 'created_at']
    raw_id_fields = ['comment', 'user']

