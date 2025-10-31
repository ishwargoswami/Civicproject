"""
Admin interface for chatbot
"""
from django.contrib import admin
from .models import ChatSession, ChatMessage, ChatFeedback, CommonQuestion, ChatAnalytics


@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ['session_id', 'user', 'started_at', 'last_message_at', 'is_active', 'message_count']
    list_filter = ['is_active', 'started_at']
    search_fields = ['session_id', 'user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['session_id', 'started_at', 'last_message_at']
    
    def message_count(self, obj):
        return obj.messages.count()
    message_count.short_description = 'Messages'


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'session', 'sender', 'message_preview', 'intent', 'confidence', 'created_at']
    list_filter = ['sender', 'intent', 'created_at']
    search_fields = ['message', 'intent']
    readonly_fields = ['created_at']
    
    def message_preview(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_preview.short_description = 'Message'


@admin.register(ChatFeedback)
class ChatFeedbackAdmin(admin.ModelAdmin):
    list_display = ['id', 'message', 'user', 'rating', 'helpful', 'created_at']
    list_filter = ['rating', 'helpful', 'created_at']
    search_fields = ['comment']
    readonly_fields = ['created_at']


@admin.register(CommonQuestion)
class CommonQuestionAdmin(admin.ModelAdmin):
    list_display = ['question_preview', 'category', 'times_asked', 'helpful_count', 'is_active', 'priority']
    list_filter = ['category', 'is_active']
    search_fields = ['question', 'answer', 'keywords']
    list_editable = ['is_active', 'priority']
    
    def question_preview(self, obj):
        return obj.question[:50] + '...' if len(obj.question) > 50 else obj.question
    question_preview.short_description = 'Question'


@admin.register(ChatAnalytics)
class ChatAnalyticsAdmin(admin.ModelAdmin):
    list_display = ['date', 'total_sessions', 'total_messages', 'unique_users', 'avg_response_time_ms']
    list_filter = ['date']
    readonly_fields = ['date', 'created_at', 'updated_at']

