"""
URLs for AI Chatbot
"""
from django.urls import path
from . import views

app_name = 'chatbot'

urlpatterns = [
    # Chat session management
    path('session/start/', views.start_chat_session, name='start-session'),
    path('session/end/', views.end_chat_session, name='end-session'),
    path('session/<str:session_id>/history/', views.get_chat_history, name='chat-history'),
    path('sessions/mine/', views.get_my_chat_sessions, name='my-sessions'),
    
    # Messaging
    path('message/send/', views.send_message, name='send-message'),
    path('message/rate/', views.rate_message, name='rate-message'),
    
    # Common questions / FAQ
    path('questions/', views.get_common_questions, name='common-questions'),
    path('questions/ask/', views.ask_common_question, name='ask-question'),
    
    # Analytics (admin)
    path('analytics/', views.get_chat_analytics, name='analytics'),
]

