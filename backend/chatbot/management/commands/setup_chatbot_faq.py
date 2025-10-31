"""
Management command to set up common chatbot questions
"""
from django.core.management.base import BaseCommand
from chatbot.models import CommonQuestion


class Command(BaseCommand):
    help = 'Set up common chatbot questions (FAQ)'

    def handle(self, *args, **kwargs):
        self.stdout.write('Setting up chatbot FAQ...')
        self.create_common_questions()
        self.stdout.write(self.style.SUCCESS('[SUCCESS] Chatbot FAQ set up successfully!'))

    def create_common_questions(self):
        """Create common questions"""
        questions_data = [
            # General
            {
                'category': 'general',
                'question': 'What is this platform about?',
                'answer': 'This is a Civic Engagement Platform connecting citizens, government officials, and community leaders. You can report issues, participate in forums, attend events, view government transparency data, and earn rewards for civic participation.',
                'keywords': ['about', 'platform', 'what is', 'purpose'],
                'priority': 100,
            },
            {
                'category': 'general',
                'question': 'How do I get started?',
                'answer': 'Welcome! Start by creating an account, then explore: 1) Report community issues, 2) Join forum discussions, 3) RSVP to events, 4) View transparency data, 5) Earn points and level up!',
                'keywords': ['start', 'begin', 'getting started', 'new'],
                'priority': 90,
            },
            
            # Issue Reporting
            {
                'category': 'issues',
                'question': 'How do I report a community issue?',
                'answer': 'Go to Dashboard → Issues → Create New Issue. Fill in title, description, category, and location. Upload photos if available. You earn 10 points for each report!',
                'keywords': ['report', 'issue', 'problem', 'submit'],
                'priority': 100,
            },
            {
                'category': 'issues',
                'question': 'What types of issues can I report?',
                'answer': 'You can report: Infrastructure (potholes, broken lights), Safety concerns, Environmental issues, Transportation problems, Utilities issues, and more.',
                'keywords': ['types', 'categories', 'what can', 'kinds'],
                'priority': 80,
            },
            {
                'category': 'issues',
                'question': 'How long until my issue is resolved?',
                'answer': 'Officials review issues within 48 hours. Resolution time varies by issue type and priority. You can track progress in real-time on your issue page.',
                'keywords': ['how long', 'time', 'duration', 'when'],
                'priority': 70,
            },
            
            # Events
            {
                'category': 'events',
                'question': 'How do I find community events?',
                'answer': 'Go to Dashboard → Events. Browse upcoming events, use filters, and click RSVP to register. You earn 20 points for attending!',
                'keywords': ['events', 'find', 'attend', 'rsvp'],
                'priority': 90,
            },
            {
                'category': 'events',
                'question': 'Can I create my own event?',
                'answer': 'Officials and Admins can create events. If you\'re a regular citizen, reach out to your local officials to propose community events.',
                'keywords': ['create', 'organize', 'host event'],
                'priority': 60,
            },
            
            # Forum
            {
                'category': 'forum',
                'question': 'How do I participate in forums?',
                'answer': 'Go to Dashboard → Forum. You can create posts, comment on discussions, vote in polls, and sign petitions. Earn 15 points per post!',
                'keywords': ['forum', 'discussion', 'participate'],
                'priority': 80,
            },
            {
                'category': 'forum',
                'question': 'How do I create a poll or petition?',
                'answer': 'In the Forum, click "Create Post" and select type: Discussion, Poll, or Petition. Fill in details and submit!',
                'keywords': ['poll', 'petition', 'create'],
                'priority': 70,
            },
            
            # Transparency
            {
                'category': 'transparency',
                'question': 'How can I view government spending?',
                'answer': 'Go to Dashboard → Transparency. View public spending by department, active projects, budgets, and performance metrics. All data is verified and updated monthly.',
                'keywords': ['spending', 'budget', 'transparency', 'money'],
                'priority': 85,
            },
            {
                'category': 'transparency',
                'question': 'How often is transparency data updated?',
                'answer': 'Transparency data is updated monthly. Project status updates happen weekly. All information is verified before publication.',
                'keywords': ['update', 'frequency', 'how often'],
                'priority': 50,
            },
            
            # Gamification
            {
                'category': 'gamification',
                'question': 'How do I earn points and credits?',
                'answer': 'Earn points by: Reporting issues (10), Attending events (20), Forum posts (15), Voting (5), Having issues resolved (50). Points unlock levels with real benefits!',
                'keywords': ['points', 'earn', 'credits', 'rewards'],
                'priority': 95,
            },
            {
                'category': 'gamification',
                'question': 'What are community credits?',
                'answer': 'Community credits are redeemable for real services: parking waivers (50), recreation passes (150), transit credits (75), event tickets (25), and more!',
                'keywords': ['credits', 'redeem', 'use', 'benefits'],
                'priority': 90,
            },
            {
                'category': 'gamification',
                'question': 'What are the civic levels?',
                'answer': 'Levels 1-7: New Citizen → Active Neighbor → Community Helper → Civic Champion → Local Leader → City Ambassador → Urban Hero. Each level unlocks better benefits!',
                'keywords': ['levels', 'ranks', 'progression'],
                'priority': 85,
            },
            {
                'category': 'gamification',
                'question': 'How do I redeem my community credits?',
                'answer': 'Go to Dashboard → Profile → Community Credits. Choose what to redeem (parking, recreation, transit, etc.). You\'ll get a redemption code valid for 90 days.',
                'keywords': ['redeem', 'use credits', 'how to use'],
                'priority': 80,
            },
            
            # Account
            {
                'category': 'account',
                'question': 'How do I update my profile?',
                'answer': 'Go to Dashboard → Settings. Update your personal info, change password, set notification preferences, and manage privacy settings.',
                'keywords': ['profile', 'update', 'edit', 'settings'],
                'priority': 75,
            },
            {
                'category': 'account',
                'question': 'How do I change my password?',
                'answer': 'Go to Dashboard → Settings → Security. Click "Change Password" and follow the instructions.',
                'keywords': ['password', 'security', 'change'],
                'priority': 70,
            },
            {
                'category': 'account',
                'question': 'Can I delete my account?',
                'answer': 'Yes. Go to Settings → Privacy → Delete Account. Note: This action is permanent and cannot be undone.',
                'keywords': ['delete', 'remove', 'close account'],
                'priority': 40,
            },
        ]
        
        for q_data in questions_data:
            question, created = CommonQuestion.objects.get_or_create(
                question=q_data['question'],
                defaults=q_data
            )
            if created:
                self.stdout.write(f'  [+] Created "{question.question[:50]}"')
            else:
                # Update existing
                for key, value in q_data.items():
                    setattr(question, key, value)
                question.save()
                self.stdout.write(f'  [~] Updated "{question.question[:50]}"')
        
        self.stdout.write(f'\nTotal FAQ: {CommonQuestion.objects.count()}')

