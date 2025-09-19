from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from decimal import Decimal
from maps.models import MapLayer, PublicFacility, District
from issues.models import Issue, IssueCategory
from events.models import Event, EventCategory

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate sample map data for testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting to populate map data...'))
        
        # Create map layers
        self.create_map_layers()
        
        # Create public facilities
        self.create_public_facilities()
        
        # Create districts
        self.create_districts()
        
        # Update existing issues and events with coordinates
        self.update_issues_coordinates()
        self.update_events_coordinates()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated map data!'))
    
    def create_map_layers(self):
        """Create default map layers"""
        layers = [
            {
                'name': 'Community Issues',
                'layer_type': 'issues',
                'description': 'Reported community issues and problems',
                'default_color': '#EF4444',
                'icon': 'alert-triangle',
                'default_visible': True
            },
            {
                'name': 'Community Events',
                'layer_type': 'events',
                'description': 'Upcoming community events and meetings',
                'default_color': '#10B981',
                'icon': 'calendar',
                'default_visible': True
            },
            {
                'name': 'Public Facilities',
                'layer_type': 'facilities',
                'description': 'Public facilities and services',
                'default_color': '#3B82F6',
                'icon': 'building',
                'default_visible': True
            },
            {
                'name': 'Administrative Districts',
                'layer_type': 'districts',
                'description': 'Administrative boundaries and districts',
                'default_color': '#8B5CF6',
                'icon': 'map',
                'default_visible': False
            }
        ]
        
        for layer_data in layers:
            layer, created = MapLayer.objects.get_or_create(
                name=layer_data['name'],
                defaults=layer_data
            )
            if created:
                self.stdout.write(f'Created map layer: {layer.name}')
    
    def create_public_facilities(self):
        """Create sample public facilities"""
        facilities = [
            {
                'name': 'Delhi City Hall',
                'facility_type': 'government_office',
                'description': 'Main government building with various city services',
                'latitude': Decimal('28.6139'),
                'longitude': Decimal('77.2090'),
                'address': 'Civic Centre, New Delhi, Delhi 110001',
                'phone': '(415) 701-2311',
                'website': 'https://sf.gov',
                'is_accessible': True,
                'accessibility_features': ['wheelchair_access', 'elevator', 'accessible_parking'],
                'hours': {
                    'monday': '8:00-17:00',
                    'tuesday': '8:00-17:00',
                    'wednesday': '8:00-17:00',
                    'thursday': '8:00-17:00',
                    'friday': '8:00-17:00',
                    'saturday': 'closed',
                    'sunday': 'closed'
                }
            },
            {
                'name': 'Delhi Public Library',
                'facility_type': 'library',
                'description': 'Main public library with extensive collection and community programs',
                'latitude': Decimal('28.6304'),
                'longitude': Decimal('77.2177'),
                'address': 'SP Mukherjee Marg, New Delhi, Delhi 110001',
                'phone': '(415) 557-4400',
                'website': 'https://sfpl.org',
                'is_accessible': True,
                'accessibility_features': ['wheelchair_access', 'elevator', 'accessible_restrooms'],
                'hours': {
                    'monday': '10:00-20:00',
                    'tuesday': '10:00-20:00',
                    'wednesday': '10:00-20:00',
                    'thursday': '10:00-20:00',
                    'friday': '12:00-18:00',
                    'saturday': '10:00-18:00',
                    'sunday': '12:00-17:00'
                }
            },
            {
                'name': 'India Gate Park',
                'facility_type': 'park',
                'description': 'Large urban park with recreational facilities and attractions',
                'latitude': Decimal('28.6129'),
                'longitude': Decimal('77.2295'),
                'address': 'Rajpath, India Gate, New Delhi, Delhi 110001',
                'phone': '(415) 831-2700',
                'website': 'https://sfrecpark.org',
                'is_accessible': True,
                'accessibility_features': ['paved_paths', 'accessible_restrooms', 'accessible_parking'],
                'hours': {
                    'monday': '5:00-24:00',
                    'tuesday': '5:00-24:00',
                    'wednesday': '5:00-24:00',
                    'thursday': '5:00-24:00',
                    'friday': '5:00-24:00',
                    'saturday': '5:00-24:00',
                    'sunday': '5:00-24:00'
                }
            },
            {
                'name': 'AIIMS Delhi',
                'facility_type': 'hospital',
                'description': 'Major medical center with emergency services',
                'latitude': Decimal('28.5672'),
                'longitude': Decimal('77.2100'),
                'address': 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029',
                'phone': '(415) 476-1000',
                'website': 'https://ucsfhealth.org',
                'is_accessible': True,
                'accessibility_features': ['wheelchair_access', 'elevator', 'accessible_parking', 'accessible_restrooms'],
                'hours': {
                    'monday': '24/7',
                    'tuesday': '24/7',
                    'wednesday': '24/7',
                    'thursday': '24/7',
                    'friday': '24/7',
                    'saturday': '24/7',
                    'sunday': '24/7'
                }
            },
            {
                'name': 'Mission Police Station',
                'facility_type': 'police_station',
                'description': 'Local police station serving the Mission district',
                'latitude': Decimal('37.7626'),
                'longitude': Decimal('-122.4226'),
                'address': '630 Valencia St, San Francisco, CA 94110',
                'phone': '(415) 558-5400',
                'is_accessible': True,
                'accessibility_features': ['wheelchair_access', 'accessible_parking'],
                'hours': {
                    'monday': '24/7',
                    'tuesday': '24/7',
                    'wednesday': '24/7',
                    'thursday': '24/7',
                    'friday': '24/7',
                    'saturday': '24/7',
                    'sunday': '24/7'
                }
            },
            {
                'name': 'Community Center',
                'facility_type': 'community_center',
                'description': 'Local community center with meeting rooms and programs',
                'latitude': Decimal('37.7849'),
                'longitude': Decimal('-122.4094'),
                'address': '123 Community St, San Francisco, CA 94102',
                'phone': '(415) 555-0123',
                'is_accessible': True,
                'accessibility_features': ['wheelchair_access', 'accessible_restrooms'],
                'hours': {
                    'monday': '9:00-21:00',
                    'tuesday': '9:00-21:00',
                    'wednesday': '9:00-21:00',
                    'thursday': '9:00-21:00',
                    'friday': '9:00-18:00',
                    'saturday': '10:00-16:00',
                    'sunday': 'closed'
                }
            }
        ]
        
        for facility_data in facilities:
            facility, created = PublicFacility.objects.get_or_create(
                name=facility_data['name'],
                defaults=facility_data
            )
            if created:
                self.stdout.write(f'Created facility: {facility.name}')
    
    def create_districts(self):
        """Create sample districts"""
        districts = [
            {
                'name': 'Downtown',
                'code': 'DT',
                'district_type': 'district',
                'boundary_coordinates': [
                    [37.7849, -122.4094],
                    [37.7949, -122.4094],
                    [37.7949, -122.3994],
                    [37.7849, -122.3994],
                    [37.7849, -122.4094]
                ],
                'population': 15000,
                'area_sq_km': 2.5,
                'representative': 'John Smith',
                'representative_contact': 'john.smith@city.gov, (415) 555-0100',
                'description': 'Central business district with government offices and commercial areas'
            },
            {
                'name': 'Mission District',
                'code': 'MD',
                'district_type': 'district',
                'boundary_coordinates': [
                    [37.7549, -122.4394],
                    [37.7749, -122.4394],
                    [37.7749, -122.4094],
                    [37.7549, -122.4094],
                    [37.7549, -122.4394]
                ],
                'population': 45000,
                'area_sq_km': 4.2,
                'representative': 'Maria Rodriguez',
                'representative_contact': 'maria.rodriguez@city.gov, (415) 555-0200',
                'description': 'Vibrant neighborhood known for its cultural diversity and community activism'
            },
            {
                'name': 'Richmond District',
                'code': 'RD',
                'district_type': 'district',
                'boundary_coordinates': [
                    [37.7649, -122.4894],
                    [37.7849, -122.4894],
                    [37.7849, -122.4594],
                    [37.7649, -122.4594],
                    [37.7649, -122.4894]
                ],
                'population': 38000,
                'area_sq_km': 3.8,
                'representative': 'David Chen',
                'representative_contact': 'david.chen@city.gov, (415) 555-0300',
                'description': 'Residential area with parks and family-friendly amenities'
            }
        ]
        
        for district_data in districts:
            district, created = District.objects.get_or_create(
                code=district_data['code'],
                defaults=district_data
            )
            if created:
                self.stdout.write(f'Created district: {district.name}')
    
    def update_issues_coordinates(self):
        """Add coordinates to existing issues"""
        sample_coordinates = [
            (Decimal('28.6139'), Decimal('77.2090')),  # New Delhi
            (Decimal('19.0760'), Decimal('72.8777')),  # Mumbai
            (Decimal('12.9716'), Decimal('77.5946')),  # Bangalore
            (Decimal('22.5726'), Decimal('88.3639')),  # Kolkata
            (Decimal('13.0827'), Decimal('80.2707')),  # Chennai
        ]
        
        issues = Issue.objects.filter(latitude__isnull=True, longitude__isnull=True)[:10]
        for i, issue in enumerate(issues):
            coord_index = i % len(sample_coordinates)
            issue.latitude = sample_coordinates[coord_index][0]
            issue.longitude = sample_coordinates[coord_index][1]
            issue.save()
            self.stdout.write(f'Updated issue coordinates: {issue.title}')
    
    def update_events_coordinates(self):
        """Add coordinates to existing events"""
        sample_coordinates = [
            (Decimal('28.6304'), Decimal('77.2177')),  # Library
            (Decimal('28.6139'), Decimal('77.2090')),  # Community Center
            (Decimal('28.6129'), Decimal('77.2295')),  # Park
            (Decimal('28.6139'), Decimal('77.2090')),  # City Hall
        ]
        
        events = Event.objects.filter(latitude__isnull=True, longitude__isnull=True)[:10]
        for i, event in enumerate(events):
            coord_index = i % len(sample_coordinates)
            event.latitude = sample_coordinates[coord_index][0]
            event.longitude = sample_coordinates[coord_index][1]
            event.save()
            self.stdout.write(f'Updated event coordinates: {event.title}')
