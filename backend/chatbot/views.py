"""
Views for AI Chatbot API
"""
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from django.db import models
from django.db.models import Count, Avg, Q
import uuid

from .models import ChatSession, ChatMessage, ChatFeedback, CommonQuestion, ChatAnalytics
from .ai_engine import get_chatbot_ai
from accounts.gamification_views import award_points


@api_view(['POST'])
@permission_classes([AllowAny])
def start_chat_session(request):
    """
    Start a new chat session
    Works for both authenticated and anonymous users
    """
    user = request.user if request.user.is_authenticated else None
    session_id = str(uuid.uuid4())
    
    # Get user metadata for context
    user_metadata = {}
    if user:
        try:
            civic_profile = user.civic_profile
            user_metadata = {
                'name': user.get_full_name(),
                'email': user.email,
                'role': user.role,
                'level': civic_profile.current_level.level if civic_profile.current_level else 1,
                'level_name': civic_profile.current_level.name if civic_profile.current_level else 'New Citizen',
                'points': civic_profile.total_points,
                'credits': civic_profile.community_credits,
            }
        except Exception:
            user_metadata = {
                'name': user.get_full_name(),
                'role': user.role,
            }
    
    # Create session
    session = ChatSession.objects.create(
        user=user,
        session_id=session_id,
        user_metadata=user_metadata
    )
    
    # Send welcome message
    ai = get_chatbot_ai()
    welcome_message = f"""👋 Hi{' ' + user.get_full_name() if user else ''}! I'm your Civic Assistant.

I can help you with:
🔧 Reporting community issues
🎉 Finding events and volunteering  
💬 Forum discussions and polls
📊 Government transparency data
🏆 Civic rewards and levels
⚙️ Account settings

What can I help you with today?"""
    
    welcome_msg = ChatMessage.objects.create(
        session=session,
        sender='bot',
        message=welcome_message,
        quick_replies=ai.get_quick_replies('general')
    )
    
    return Response({
        'session_id': session_id,
        'message': 'Chat session started',
        'welcome_message': {
            'id': welcome_msg.id,
            'message': welcome_msg.message,
            'sender': welcome_msg.sender,
            'quick_replies': welcome_msg.quick_replies,
            'created_at': welcome_msg.created_at.isoformat()
        }
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def send_message(request):
    """
    Send a message and get AI response
    """
    session_id = request.data.get('session_id')
    user_message = request.data.get('message', '').strip()
    
    if not session_id:
        return Response(
            {'error': 'session_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not user_message:
        return Response(
            {'error': 'message cannot be empty'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get session
    try:
        session = ChatSession.objects.get(session_id=session_id, is_active=True)
    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Invalid or expired session'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update last message time
    session.last_message_at = timezone.now()
    session.save()
    
    # Save user message
    user_msg = ChatMessage.objects.create(
        session=session,
        sender='user',
        message=user_message
    )
    
    # Get conversation history
    conversation_history = list(
        session.messages.values('sender', 'message').order_by('created_at')
    )
    
    # Generate AI response
    ai = get_chatbot_ai()
    response_text, intent, confidence, response_time_ms = ai.generate_response(
        user_message,
        conversation_history,
        session.user_metadata
    )
    
    # Get quick replies
    quick_replies = ai.get_quick_replies(intent)
    
    # Save bot response
    bot_msg = ChatMessage.objects.create(
        session=session,
        sender='bot',
        message=response_text,
        intent=intent,
        confidence=confidence,
        response_time_ms=response_time_ms,
        quick_replies=quick_replies
    )
    
    # Award points for using chatbot (first time in session)
    if session.user and session.messages.filter(sender='user').count() == 1:
        try:
            award_points(
                session.user,
                'helpful_vote',  # Small reward for engagement
                'Used civic assistant chatbot'
            )
        except Exception:
            pass
    
    return Response({
        'user_message': {
            'id': user_msg.id,
            'message': user_msg.message,
            'sender': 'user',
            'created_at': user_msg.created_at.isoformat()
        },
        'bot_response': {
            'id': bot_msg.id,
            'message': bot_msg.message,
            'sender': 'bot',
            'intent': bot_msg.intent,
            'confidence': bot_msg.confidence,
            'response_time_ms': bot_msg.response_time_ms,
            'quick_replies': bot_msg.quick_replies,
            'created_at': bot_msg.created_at.isoformat()
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_chat_history(request, session_id):
    """
    Get chat history for a session
    """
    try:
        session = ChatSession.objects.get(session_id=session_id)
    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Get messages
    messages = session.messages.all().values(
        'id', 'sender', 'message', 'intent', 'confidence',
        'quick_replies', 'created_at'
    )
    
    return Response({
        'session_id': session_id,
        'started_at': session.started_at.isoformat(),
        'messages': list(messages)
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def rate_message(request):
    """
    Rate a chatbot response
    """
    message_id = request.data.get('message_id')
    rating = request.data.get('rating')  # 1-5
    helpful = request.data.get('helpful', True)
    comment = request.data.get('comment', '')
    
    if not message_id or not rating:
        return Response(
            {'error': 'message_id and rating are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        message = ChatMessage.objects.get(id=message_id, sender='bot')
    except ChatMessage.DoesNotExist:
        return Response(
            {'error': 'Message not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Create feedback
    feedback = ChatFeedback.objects.create(
        message=message,
        user=request.user if request.user.is_authenticated else None,
        rating=rating,
        helpful=helpful,
        comment=comment
    )
    
    return Response({
        'message': 'Feedback recorded. Thank you!',
        'feedback_id': feedback.id
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def end_chat_session(request):
    """
    End a chat session
    """
    session_id = request.data.get('session_id')
    
    if not session_id:
        return Response(
            {'error': 'session_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        session = ChatSession.objects.get(session_id=session_id, is_active=True)
        session.end_session()
        
        return Response({'message': 'Chat session ended'})
    except ChatSession.DoesNotExist:
        return Response(
            {'error': 'Session not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def get_common_questions(request):
    """
    Get frequently asked questions
    """
    category = request.query_params.get('category', 'all')
    
    questions = CommonQuestion.objects.filter(is_active=True)
    
    if category != 'all':
        questions = questions.filter(category=category)
    
    questions = questions.values(
        'id', 'category', 'question', 'answer', 
        'times_asked', 'helpful_count'
    )[:20]
    
    # Group by category
    grouped = {}
    for q in questions:
        cat = q['category']
        if cat not in grouped:
            grouped[cat] = []
        grouped[cat].append(q)
    
    return Response({
        'categories': CommonQuestion.CATEGORY_CHOICES,
        'questions': grouped
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def ask_common_question(request):
    """
    Get answer to a common question by ID
    """
    question_id = request.data.get('question_id')
    
    if not question_id:
        return Response(
            {'error': 'question_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        question = CommonQuestion.objects.get(id=question_id, is_active=True)
        question.record_asked()
        
        return Response({
            'question': question.question,
            'answer': question.answer,
            'category': question.get_category_display()
        })
    except CommonQuestion.DoesNotExist:
        return Response(
            {'error': 'Question not found'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_chat_sessions(request):
    """
    Get user's chat sessions
    """
    sessions = ChatSession.objects.filter(user=request.user).annotate(
        message_count=Count('messages')
    ).values(
        'session_id', 'started_at', 'last_message_at',
        'is_active', 'message_count'
    ).order_by('-started_at')[:10]
    
    return Response({
        'sessions': list(sessions)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_chat_analytics(request):
    """
    Get chatbot analytics (admin only)
    """
    if not request.user.role == 'admin':
        return Response(
            {'error': 'Admin access required'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Overall stats
    total_sessions = ChatSession.objects.count()
    active_sessions = ChatSession.objects.filter(is_active=True).count()
    total_messages = ChatMessage.objects.count()
    
    # Average metrics
    avg_response_time = ChatMessage.objects.filter(
        sender='bot',
        response_time_ms__isnull=False
    ).aggregate(avg=Avg('response_time_ms'))['avg'] or 0
    
    # Feedback stats
    feedback_stats = ChatFeedback.objects.aggregate(
        total=Count('id'),
        avg_rating=Avg('rating'),
        helpful=Count('id', filter=models.Q(helpful=True))
    )
    
    # Top intents
    top_intents = ChatMessage.objects.filter(
        sender='bot',
        intent__isnull=False
    ).values('intent').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    return Response({
        'total_sessions': total_sessions,
        'active_sessions': active_sessions,
        'total_messages': total_messages,
        'avg_response_time_ms': round(avg_response_time, 2),
        'feedback': feedback_stats,
        'top_intents': list(top_intents)
    })

