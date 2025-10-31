"""
URLs for gamification system
"""
from django.urls import path
from . import gamification_views as views

app_name = 'gamification'

urlpatterns = [
    # Profile and levels
    path('profile/me/', views.get_my_civic_profile, name='my-profile'),
    path('levels/', views.get_all_levels, name='all-levels'),
    
    # Activities
    path('activities/', views.get_my_activities, name='my-activities'),
    
    # Credits
    path('credits/available/', views.get_available_redemptions, name='available-redemptions'),
    path('credits/history/', views.get_redemption_history, name='redemption-history'),
    path('credits/redeem/', views.redeem_credit, name='redeem-credit'),
    
    # Achievements
    path('achievements/', views.get_achievements, name='all-achievements'),
    path('achievements/mine/', views.get_my_achievements, name='my-achievements'),
    
    # Leaderboard and stats
    path('leaderboard/', views.get_leaderboard, name='leaderboard'),
    path('stats/', views.get_community_stats, name='community-stats'),
]

