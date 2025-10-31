"""
Views for gamification system
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, F, Count
from django.utils import timezone
from .gamification_models import (
    CivicLevel, UserCivicProfile, CivicActivity,
    CommunityCredit, Achievement, UserAchievement,
    CREDIT_VALUES
)
from .gamification_serializers import (
    CivicLevelSerializer, UserCivicProfileSerializer,
    CivicActivitySerializer, CommunityCreditSerializer,
    CommunityCreditRedemptionSerializer, AchievementSerializer,
    UserAchievementSerializer, LeaderboardSerializer
)
from .models import User


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_civic_profile(request):
    """Get current user's civic profile"""
    user = request.user
    
    # Create profile if doesn't exist
    profile, created = UserCivicProfile.objects.get_or_create(user=user)
    
    # Assign default level if none exists
    if not profile.current_level:
        first_level = CivicLevel.objects.filter(level=1).first()
        if first_level:
            profile.current_level = first_level
            profile.save()
    
    # Update streak
    profile.update_streak()
    
    serializer = UserCivicProfileSerializer(profile)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_all_levels(request):
    """Get all civic levels"""
    levels = CivicLevel.objects.all().order_by('level')
    serializer = CivicLevelSerializer(levels, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_activities(request):
    """Get current user's civic activities"""
    activities = CivicActivity.objects.filter(user=request.user)[:50]
    serializer = CivicActivitySerializer(activities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_credits(request):
    """Get current user's community credits"""
    credits = CommunityCredit.objects.filter(
        user=request.user,
        is_used=False
    ).order_by('-redeemed_at')
    
    serializer = CommunityCreditSerializer(credits, many=True)
    
    # Get credit balance
    try:
        profile = request.user.civic_profile
        balance = profile.community_credits
    except UserCivicProfile.DoesNotExist:
        balance = 0
    
    return Response({
        'balance': balance,
        'credits': serializer.data,
        'redemption_options': [
            {
                'type': key,
                'label': dict(CommunityCredit.CREDIT_TYPES)[key],
                'cost': value,
                'can_afford': balance >= value
            }
            for key, value in CREDIT_VALUES.items()
        ]
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_available_redemptions(request):
    """Get available redemption options"""
    try:
        profile = request.user.civic_profile
        balance = profile.community_credits
    except UserCivicProfile.DoesNotExist:
        balance = 0
    
    # Icon mapping for different benefit types
    icon_map = {
        'parking_waiver': '🅿️',
        'permit_priority': '📋',
        'recreation_pass': '🏊',
        'transit_credit': '🚌',
        'event_ticket': '🎟️',
        'consultation': '🏛️',
    }
    
    # Description mapping
    description_map = {
        'parking_waiver': 'Waive parking fees for one month',
        'permit_priority': 'Priority processing for permits and applications',
        'recreation_pass': '1-month pass to city recreation centers',
        'transit_credit': 'Credit for public transportation',
        'event_ticket': 'Free ticket to community events',
        'consultation': 'Direct consultation with urban planning officials',
    }
    
    redemption_options = [
        {
            'type': key,
            'name': dict(CommunityCredit.CREDIT_TYPES)[key],
            'description': description_map.get(key, f'Redeem for {dict(CommunityCredit.CREDIT_TYPES)[key]}'),
            'credits_cost': value,
            'category': 'public_services',
            'icon': icon_map.get(key, '🎁'),
        }
        for key, value in CREDIT_VALUES.items()
    ]
    
    return Response(redemption_options)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_redemption_history(request):
    """Get user's redemption history"""
    redemptions = CommunityCredit.objects.filter(
        user=request.user
    ).order_by('-redeemed_at')
    
    serializer = CommunityCreditSerializer(redemptions, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def redeem_credit(request):
    """Redeem community credits for real benefits"""
    benefit_type = request.data.get('benefit_type')
    
    if not benefit_type:
        return Response(
            {'error': 'benefit_type is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate benefit type
    if benefit_type not in dict(CommunityCredit.CREDIT_TYPES):
        return Response(
            {'error': 'Invalid benefit type'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = request.user
    
    try:
        profile = user.civic_profile
    except UserCivicProfile.DoesNotExist:
        return Response(
            {'error': 'User civic profile not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    cost = CREDIT_VALUES.get(benefit_type, 0)
    
    # Check if user has enough credits
    if profile.community_credits < cost:
        return Response(
            {'error': f'Insufficient credits. You have {profile.community_credits}, need {cost}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    credit_type = benefit_type
    redeemed_for = dict(CommunityCredit.CREDIT_TYPES)[benefit_type]
    
    # Deduct credits
    profile.community_credits -= cost
    profile.save()
    
    # Create credit record
    credit = CommunityCredit.objects.create(
        user=user,
        credit_type=credit_type,
        credits_spent=cost,
        redeemed_for=redeemed_for
    )
    
    # Create notification
    from notifications.models import Notification
    Notification.objects.create(
        user=user,
        notification_type='credit_redeemed',
        title='🎁 Credit Redeemed!',
        message=f'You redeemed {cost} credits for {dict(CommunityCredit.CREDIT_TYPES)[credit_type]}',
        data={
            'credit_type': credit_type,
            'cost': cost,
            'redemption_code': credit.redemption_code
        }
    )
    
    return Response({
        'message': 'Credit redeemed successfully',
        'credit': CommunityCreditSerializer(credit).data,
        'new_balance': profile.community_credits
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_achievements(request):
    """Get all achievements with user progress"""
    achievements = Achievement.objects.filter(is_active=True)
    serializer = AchievementSerializer(
        achievements,
        many=True,
        context={'request': request}
    )
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_achievements(request):
    """Get current user's unlocked achievements"""
    user_achievements = UserAchievement.objects.filter(
        user=request.user
    ).select_related('achievement')
    
    serializer = UserAchievementSerializer(user_achievements, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_leaderboard(request):
    """Get civic engagement leaderboard"""
    # Query parameters
    time_period = request.query_params.get('period', 'all')  # all, week, month
    limit = int(request.query_params.get('limit', 100))
    
    # Base query
    profiles = UserCivicProfile.objects.select_related('user', 'current_level')
    
    # Apply time filter if needed
    if time_period == 'week':
        from datetime import timedelta
        week_ago = timezone.now() - timedelta(days=7)
        # Get activities from last week
        weekly_leaders = CivicActivity.objects.filter(
            created_at__gte=week_ago
        ).values('user').annotate(
            week_points=Count('id')
        ).order_by('-week_points')[:limit]
        
        user_ids = [item['user'] for item in weekly_leaders]
        profiles = profiles.filter(user_id__in=user_ids)
    elif time_period == 'month':
        from datetime import timedelta
        month_ago = timezone.now() - timedelta(days=30)
        monthly_leaders = CivicActivity.objects.filter(
            created_at__gte=month_ago
        ).values('user').annotate(
            month_points=Count('id')
        ).order_by('-month_points')[:limit]
        
        user_ids = [item['user'] for item in monthly_leaders]
        profiles = profiles.filter(user_id__in=user_ids)
    
    # Order by total points
    profiles = profiles.order_by('-total_points')[:limit]
    
    # Build leaderboard data
    leaderboard_data = []
    for rank, profile in enumerate(profiles, 1):
        leaderboard_data.append({
            'rank': rank,
            'user_id': profile.user.id,
            'user_name': profile.user.get_full_name(),
            'avatar': profile.user.avatar.url if profile.user.avatar else None,
            'total_points': profile.total_points,
            'level': profile.current_level.level if profile.current_level else 0,
            'level_name': profile.current_level.name if profile.current_level else 'New Citizen',
            'issues_resolved': profile.issues_resolved,
            'events_attended': profile.events_attended,
            'is_current_user': profile.user.id == request.user.id if request.user.is_authenticated else False
        })
    
    serializer = LeaderboardSerializer(leaderboard_data, many=True)
    return Response({
        'period': time_period,
        'leaderboard': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_community_stats(request):
    """Get overall community engagement statistics"""
    from django.db.models import Sum, Avg, Count
    
    total_users = UserCivicProfile.objects.count()
    total_points = UserCivicProfile.objects.aggregate(Sum('total_points'))['total_points__sum'] or 0
    total_activities = CivicActivity.objects.count()
    total_credits_redeemed = CommunityCredit.objects.filter(is_used=True).count()
    
    # Average engagement
    avg_points = UserCivicProfile.objects.aggregate(Avg('total_points'))['total_points__avg'] or 0
    avg_level = UserCivicProfile.objects.filter(current_level__isnull=False).aggregate(
        Avg('current_level__level')
    )['current_level__level__avg'] or 0
    
    # Most active this week
    from datetime import timedelta
    week_ago = timezone.now() - timedelta(days=7)
    weekly_active = CivicActivity.objects.filter(
        created_at__gte=week_ago
    ).values('user').distinct().count()
    
    # Top achievers
    top_achievers = UserCivicProfile.objects.order_by('-total_points')[:5].values(
        'user__first_name', 'user__last_name', 'total_points', 'current_level__name'
    )
    
    return Response({
        'total_users': total_users,
        'total_points_earned': total_points,
        'total_activities': total_activities,
        'total_credits_redeemed': total_credits_redeemed,
        'average_points': round(avg_points, 2),
        'average_level': round(avg_level, 2),
        'weekly_active_users': weekly_active,
        'top_achievers': list(top_achievers)
    })


# Helper function to award points (used by other modules)
def award_points(user, activity_type, description, metadata=None):
    """
    Award points to a user for an activity
    This function is called from other parts of the app (issues, events, forum, etc.)
    """
    from .gamification_models import POINTS_CONFIG
    
    points = POINTS_CONFIG.get(activity_type, 0)
    
    if points == 0:
        return None
    
    # Get or create profile
    profile, created = UserCivicProfile.objects.get_or_create(user=user)
    
    # Add points and create activity
    profile.add_points(points, activity_type, description)
    
    # Update engagement metrics
    if activity_type == 'issue_reported':
        profile.issues_reported += 1
    elif activity_type == 'issue_resolved':
        profile.issues_resolved += 1
    elif activity_type == 'event_attended':
        profile.events_attended += 1
    elif activity_type in ['forum_post', 'forum_comment', 'poll_voted']:
        profile.forum_contributions += 1
    
    profile.save()
    
    # Check for achievements
    check_and_award_achievements(user, profile)
    
    return points


def check_and_award_achievements(user, profile):
    """Check if user has unlocked any new achievements"""
    achievements = Achievement.objects.filter(is_active=True)
    
    for achievement in achievements:
        # Check if already unlocked
        if UserAchievement.objects.filter(user=user, achievement=achievement).exists():
            continue
        
        # Check criteria
        criteria_map = {
            'issues': profile.issues_reported,
            'resolved': profile.issues_resolved,
            'events': profile.events_attended,
            'forum': profile.forum_contributions,
            'streak': profile.current_streak_days,
        }
        
        current_value = criteria_map.get(achievement.criteria_type, 0)
        
        if current_value >= achievement.criteria_value:
            # Unlock achievement!
            UserAchievement.objects.create(
                user=user,
                achievement=achievement
            )
            
            # Award bonus points and credits
            profile.total_points += achievement.points_reward
            profile.community_credits += achievement.credits_reward
            profile.save()
            
            # Create notification
            from notifications.models import Notification
            Notification.objects.create(
                user=user,
                notification_type='achievement_unlocked',
                title=f'🏆 Achievement Unlocked: {achievement.name}',
                message=f'You earned {achievement.points_reward} points and {achievement.credits_reward} credits!',
                data={
                    'achievement_id': achievement.id,
                    'achievement_name': achievement.name,
                    'rarity': achievement.rarity
                }
            )

