"""
Management command to set up gamification system
Creates civic levels and initial achievements
"""
from django.core.management.base import BaseCommand
from accounts.gamification_models import CivicLevel, Achievement


class Command(BaseCommand):
    help = 'Set up gamification system with levels and achievements'

    def handle(self, *args, **kwargs):
        self.stdout.write('Setting up civic levels...')
        self.create_civic_levels()
        
        self.stdout.write('Setting up achievements...')
        self.create_achievements()
        
        self.stdout.write(self.style.SUCCESS('[SUCCESS] Gamification system set up successfully!'))

    def create_civic_levels(self):
        """Create all civic levels"""
        levels_data = [
            {
                'level': 1,
                'name': 'New Citizen',
                'min_points': 0,
                'icon': '🌱',
                'color': '#10B981',
                'priority_response': False,
                'direct_messaging': False,
                'event_priority': False,
                'consultation_access': False,
                'community_credits': 10,
            },
            {
                'level': 2,
                'name': 'Active Neighbor',
                'min_points': 100,
                'icon': '🏘️',
                'color': '#3B82F6',
                'priority_response': False,
                'direct_messaging': False,
                'event_priority': True,
                'consultation_access': False,
                'community_credits': 25,
            },
            {
                'level': 3,
                'name': 'Community Helper',
                'min_points': 300,
                'icon': '🤝',
                'color': '#6366F1',
                'priority_response': True,
                'direct_messaging': False,
                'event_priority': True,
                'consultation_access': False,
                'community_credits': 50,
            },
            {
                'level': 4,
                'name': 'Civic Champion',
                'min_points': 750,
                'icon': '🏆',
                'color': '#8B5CF6',
                'priority_response': True,
                'direct_messaging': True,
                'event_priority': True,
                'consultation_access': False,
                'community_credits': 100,
            },
            {
                'level': 5,
                'name': 'Local Leader',
                'min_points': 1500,
                'icon': '⭐',
                'color': '#EC4899',
                'priority_response': True,
                'direct_messaging': True,
                'event_priority': True,
                'consultation_access': True,
                'community_credits': 200,
            },
            {
                'level': 6,
                'name': 'City Ambassador',
                'min_points': 3000,
                'icon': '👑',
                'color': '#F59E0B',
                'priority_response': True,
                'direct_messaging': True,
                'event_priority': True,
                'consultation_access': True,
                'community_credits': 500,
            },
            {
                'level': 7,
                'name': 'Urban Hero',
                'min_points': 5000,
                'icon': '🦸',
                'color': '#EF4444',
                'priority_response': True,
                'direct_messaging': True,
                'event_priority': True,
                'consultation_access': True,
                'community_credits': 1000,
            },
        ]
        
        for level_data in levels_data:
            level, created = CivicLevel.objects.get_or_create(
                level=level_data['level'],
                defaults=level_data
            )
            if created:
                self.stdout.write(f'  [+] Created {level.name}')
            else:
                # Update existing
                for key, value in level_data.items():
                    setattr(level, key, value)
                level.save()
                self.stdout.write(f'  [~] Updated {level.name}')

    def create_achievements(self):
        """Create initial achievements"""
        achievements_data = [
            # Issue-related
            {
                'name': 'First Report',
                'description': 'Report your first community issue',
                'icon': '📝',
                'criteria_type': 'issues',
                'criteria_value': 1,
                'points_reward': 20,
                'credits_reward': 5,
                'rarity': 'common',
            },
            {
                'name': 'Problem Solver',
                'description': 'Report 10 community issues',
                'icon': '🔧',
                'criteria_type': 'issues',
                'criteria_value': 10,
                'points_reward': 100,
                'credits_reward': 25,
                'rarity': 'rare',
            },
            {
                'name': 'Change Maker',
                'description': 'Have 5 of your reported issues resolved',
                'icon': '✨',
                'criteria_type': 'resolved',
                'criteria_value': 5,
                'points_reward': 250,
                'credits_reward': 100,
                'rarity': 'epic',
            },
            {
                'name': 'City Transformer',
                'description': 'Have 25 of your reported issues resolved',
                'icon': '🌟',
                'criteria_type': 'resolved',
                'criteria_value': 25,
                'points_reward': 1000,
                'credits_reward': 500,
                'rarity': 'legendary',
            },
            
            # Event-related
            {
                'name': 'Community Participant',
                'description': 'Attend your first community event',
                'icon': '🎉',
                'criteria_type': 'events',
                'criteria_value': 1,
                'points_reward': 30,
                'credits_reward': 10,
                'rarity': 'common',
            },
            {
                'name': 'Event Enthusiast',
                'description': 'Attend 10 community events',
                'icon': '🎊',
                'criteria_type': 'events',
                'criteria_value': 10,
                'points_reward': 200,
                'credits_reward': 50,
                'rarity': 'rare',
            },
            {
                'name': 'Super Volunteer',
                'description': 'Attend 50 community events',
                'icon': '🦸‍♀️',
                'criteria_type': 'events',
                'criteria_value': 50,
                'points_reward': 1500,
                'credits_reward': 300,
                'rarity': 'legendary',
            },
            
            # Forum-related
            {
                'name': 'Voice Heard',
                'description': 'Make your first forum contribution',
                'icon': '💬',
                'criteria_type': 'forum',
                'criteria_value': 1,
                'points_reward': 15,
                'credits_reward': 5,
                'rarity': 'common',
            },
            {
                'name': 'Discussion Leader',
                'description': 'Make 50 forum contributions',
                'icon': '🗣️',
                'criteria_type': 'forum',
                'criteria_value': 50,
                'points_reward': 300,
                'credits_reward': 75,
                'rarity': 'epic',
            },
            
            # Streak-related
            {
                'name': 'Dedicated Week',
                'description': 'Stay active for 7 consecutive days',
                'icon': '🔥',
                'criteria_type': 'streak',
                'criteria_value': 7,
                'points_reward': 100,
                'credits_reward': 25,
                'rarity': 'rare',
            },
            {
                'name': 'Monthly Champion',
                'description': 'Stay active for 30 consecutive days',
                'icon': '🏅',
                'criteria_type': 'streak',
                'criteria_value': 30,
                'points_reward': 500,
                'credits_reward': 150,
                'rarity': 'epic',
            },
            {
                'name': 'Year-Round Hero',
                'description': 'Stay active for 365 consecutive days',
                'icon': '🎖️',
                'criteria_type': 'streak',
                'criteria_value': 365,
                'points_reward': 5000,
                'credits_reward': 2000,
                'rarity': 'legendary',
                'special_recognition': True,
            },
        ]
        
        for achievement_data in achievements_data:
            achievement, created = Achievement.objects.get_or_create(
                name=achievement_data['name'],
                defaults=achievement_data
            )
            if created:
                self.stdout.write(f'  [+] Created "{achievement.name}" ({achievement.rarity})')
            else:
                # Update existing
                for key, value in achievement_data.items():
                    setattr(achievement, key, value)
                achievement.save()
                self.stdout.write(f'  [~] Updated "{achievement.name}"')
        
        self.stdout.write(f'\nTotal achievements: {Achievement.objects.count()}')

