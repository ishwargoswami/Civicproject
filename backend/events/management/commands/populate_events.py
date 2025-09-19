from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from decimal import Decimal
import random

from events.models import Event, EventCategory, EventRSVP, EventVolunteer
from accounts.models import User


class Command(BaseCommand):
    help = 'Populate sample events data'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample events data...')
        
        # Create event categories
        categories_data = [
            {
                'name': 'Community Cleanup',
                'slug': 'community-cleanup',
                'description': 'Environmental cleanup and beautification events',
                'icon': '🧹',
                'color': '#10B981'
            },
            {
                'name': 'Town Hall Meeting',
                'slug': 'town-hall-meeting',
                'description': 'Public meetings and civic discussions',
                'icon': '🏛️',
                'color': '#3B82F6'
            },
            {
                'name': 'Health & Wellness',
                'slug': 'health-wellness',
                'description': 'Health screenings and wellness programs',
                'icon': '🏥',
                'color': '#EF4444'
            },
            {
                'name': 'Education & Training',
                'slug': 'education-training',
                'description': 'Educational workshops and skill training',
                'icon': '📚',
                'color': '#8B5CF6'
            },
            {
                'name': 'Cultural Event',
                'slug': 'cultural-event',
                'description': 'Cultural celebrations and festivals',
                'icon': '🎭',
                'color': '#F59E0B'
            },
            {
                'name': 'Sports & Recreation',
                'slug': 'sports-recreation',
                'description': 'Sports events and recreational activities',
                'icon': '⚽',
                'color': '#06B6D4'
            }
        ]
        
        categories = []
        for cat_data in categories_data:
            category, created = EventCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            categories.append(category)
            if created:
                self.stdout.write(f'Created category: {category.name}')
        
        # Get or create a default organizer
        organizer, created = User.objects.get_or_create(
            email='organizer@example.com',
            defaults={
                'first_name': 'Event',
                'last_name': 'Organizer',
                'is_active': True,
                'role': 'citizen'
            }
        )
        if created:
            organizer.set_password('password123')
            organizer.save()
            self.stdout.write('Created default organizer')
        
        # Sample Indian locations
        indian_locations = [
            {
                'name': 'India Gate',
                'address': 'India Gate, Rajpath, New Delhi, Delhi 110001',
                'latitude': Decimal('28.6129'),
                'longitude': Decimal('77.2295')
            },
            {
                'name': 'Gateway of India',
                'address': 'Apollo Bandar, Colaba, Mumbai, Maharashtra 400001',
                'latitude': Decimal('18.9220'),
                'longitude': Decimal('72.8347')
            },
            {
                'name': 'Cubbon Park',
                'address': 'Kasturba Road, Sampangi Rama Nagar, Bengaluru, Karnataka 560001',
                'latitude': Decimal('12.9762'),
                'longitude': Decimal('77.5993')
            },
            {
                'name': 'Marina Beach',
                'address': 'Marina Beach, Chennai, Tamil Nadu 600004',
                'latitude': Decimal('13.0475'),
                'longitude': Decimal('80.2824')
            },
            {
                'name': 'Hussain Sagar Lake',
                'address': 'Tank Bund Road, Hyderabad, Telangana 500080',
                'latitude': Decimal('17.4239'),
                'longitude': Decimal('78.4738')
            },
            {
                'name': 'Sabarmati Riverfront',
                'address': 'Sabarmati Riverfront, Ahmedabad, Gujarat 380009',
                'latitude': Decimal('23.0395'),
                'longitude': Decimal('72.5660')
            },
            {
                'name': 'Victoria Memorial',
                'address': '1, Queens Way, Maidan, Kolkata, West Bengal 700071',
                'latitude': Decimal('22.5448'),
                'longitude': Decimal('88.3426')
            },
            {
                'name': 'Charminar',
                'address': 'Char Kaman, Ghansi Bazaar, Hyderabad, Telangana 500002',
                'latitude': Decimal('17.3616'),
                'longitude': Decimal('78.4747')
            }
        ]
        
        # Create sample events
        now = timezone.now()
        events_data = [
            {
                'title': 'Community Park Cleanup Drive',
                'description': 'Join us for a community cleanup drive at the local park. We will be cleaning up litter, planting new trees, and beautifying the area. Volunteers will be provided with gloves, trash bags, and refreshments.',
                'category': categories[0],  # Community Cleanup
                'start_date': now + timedelta(days=7),
                'end_date': now + timedelta(days=7, hours=4),
                'capacity': 50,
                'volunteers_needed': 10,
                'requirements': ['Comfortable clothes', 'Water bottle'],
                'tags': ['environment', 'cleanup', 'community'],
                'is_featured': True
            },
            {
                'title': 'Monthly Town Hall Meeting',
                'description': 'Monthly town hall meeting to discuss local issues, budget allocations, and upcoming projects. All residents are welcome to attend and voice their concerns.',
                'category': categories[1],  # Town Hall Meeting
                'start_date': now + timedelta(days=14),
                'end_date': now + timedelta(days=14, hours=2),
                'capacity': 200,
                'volunteers_needed': 5,
                'requirements': [],
                'tags': ['governance', 'public', 'meeting'],
                'is_featured': True
            },
            {
                'title': 'Free Health Checkup Camp',
                'description': 'Free health checkup camp with basic health screenings including blood pressure, diabetes, and BMI checks. Qualified medical professionals will be available.',
                'category': categories[2],  # Health & Wellness
                'start_date': now + timedelta(days=21),
                'end_date': now + timedelta(days=21, hours=6),
                'capacity': 100,
                'volunteers_needed': 15,
                'requirements': ['Valid ID proof'],
                'tags': ['health', 'medical', 'free'],
                'age_restriction': None
            },
            {
                'title': 'Digital Literacy Workshop',
                'description': 'Learn basic computer skills, internet usage, and digital payment methods. This workshop is designed for seniors and those new to technology.',
                'category': categories[3],  # Education & Training
                'start_date': now + timedelta(days=28),
                'end_date': now + timedelta(days=28, hours=3),
                'capacity': 30,
                'volunteers_needed': 8,
                'requirements': ['Basic reading ability'],
                'tags': ['education', 'technology', 'seniors'],
                'age_restriction': 50
            },
            {
                'title': 'Cultural Festival Celebration',
                'description': 'Annual cultural festival celebrating local traditions with music, dance, food stalls, and art exhibitions. Family-friendly event with activities for all ages.',
                'category': categories[4],  # Cultural Event
                'start_date': now + timedelta(days=35),
                'end_date': now + timedelta(days=35, hours=8),
                'capacity': 500,
                'volunteers_needed': 25,
                'requirements': [],
                'tags': ['culture', 'festival', 'family'],
                'is_featured': True
            },
            {
                'title': 'Community Sports Tournament',
                'description': 'Annual sports tournament featuring cricket, football, and badminton competitions. Open to all age groups with separate categories.',
                'category': categories[5],  # Sports & Recreation
                'start_date': now + timedelta(days=42),
                'end_date': now + timedelta(days=44),
                'capacity': 150,
                'volunteers_needed': 20,
                'requirements': ['Sports attire', 'Own equipment preferred'],
                'tags': ['sports', 'competition', 'tournament']
            },
            {
                'title': 'Road Safety Awareness Campaign',
                'description': 'Educational campaign about road safety, traffic rules, and safe driving practices. Interactive sessions with traffic police and demonstrations.',
                'category': categories[3],  # Education & Training
                'start_date': now + timedelta(days=49),
                'end_date': now + timedelta(days=49, hours=4),
                'capacity': 80,
                'volunteers_needed': 12,
                'requirements': [],
                'tags': ['safety', 'education', 'traffic']
            },
            {
                'title': 'Tree Plantation Drive',
                'description': 'Massive tree plantation drive to increase green cover in the city. Saplings will be provided along with planting tools and guidance.',
                'category': categories[0],  # Community Cleanup
                'start_date': now + timedelta(days=56),
                'end_date': now + timedelta(days=56, hours=5),
                'capacity': 200,
                'volunteers_needed': 30,
                'requirements': ['Comfortable clothes', 'Digging tools if available'],
                'tags': ['environment', 'trees', 'plantation'],
                'is_featured': True
            }
        ]
        
        events = []
        for i, event_data in enumerate(events_data):
            location = indian_locations[i % len(indian_locations)]
            
            event_data.update({
                'organizer': organizer,
                'location_name': location['name'],
                'address': location['address'],
                'latitude': location['latitude'],
                'longitude': location['longitude'],
                'registration_deadline': event_data['start_date'] - timedelta(days=1),
                'is_public': True,
                'allow_waitlist': True
            })
            
            event, created = Event.objects.get_or_create(
                title=event_data['title'],
                defaults=event_data
            )
            events.append(event)
            if created:
                self.stdout.write(f'Created event: {event.title}')
        
        # Create some sample RSVPs and volunteers
        users = User.objects.filter(is_active=True)[:10]  # Get up to 10 users
        
        for event in events[:5]:  # Add RSVPs to first 5 events
            # Random number of RSVPs (30-80% of capacity)
            min_rsvps = max(1, min(int(event.capacity * 0.3), len(users)))
            max_rsvps = max(min_rsvps, min(len(users), int(event.capacity * 0.8)))
            num_rsvps = random.randint(min_rsvps, max_rsvps)
            
            selected_users = random.sample(list(users), min(num_rsvps, len(users)))
            
            for user in selected_users:
                status = random.choice(['attending', 'maybe', 'attending', 'attending'])  # Bias towards attending
                guests = random.randint(0, 2) if status == 'attending' else 0
                
                rsvp, created = EventRSVP.objects.get_or_create(
                    event=event,
                    user=user,
                    defaults={
                        'status': status,
                        'guests': guests,
                        'is_approved': True
                    }
                )
                
                if created and status == 'attending':
                    event.current_attendees += (1 + guests)
            
            # Add some volunteers
            max_volunteers = min(event.volunteers_needed, len(users) // 2, len(users))
            if max_volunteers > 0:
                num_volunteers = random.randint(1, max_volunteers)
                volunteer_users = random.sample(list(users), min(num_volunteers, len(users)))
            else:
                volunteer_users = []
            
            volunteer_roles = [
                'Setup Coordinator', 'Registration Helper', 'Crowd Management',
                'Technical Support', 'Refreshment Coordinator', 'Cleanup Crew',
                'First Aid Assistant', 'Photography', 'Social Media'
            ]
            
            for user in volunteer_users:
                role = random.choice(volunteer_roles)
                hours = random.randint(2, 8)
                
                volunteer, created = EventVolunteer.objects.get_or_create(
                    event=event,
                    user=user,
                    defaults={
                        'role': role,
                        'hours_committed': hours,
                        'is_confirmed': True,
                        'description': f'Volunteer for {role.lower()} duties'
                    }
                )
                
                if created:
                    event.current_volunteers += 1
            
            event.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(categories)} categories and {len(events)} events'
            )
        )
