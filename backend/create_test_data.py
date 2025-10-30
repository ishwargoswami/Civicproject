"""
Script to create test data for the Officials Module
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civic_platform.settings')
django.setup()

from transparency.models import Department, PublicProject, BudgetCategory, PerformanceMetric, PublicSpending
from accounts.models import User
from issues.models import Issue, IssueCategory
from events.models import Event, EventCategory
from forum.models import ForumCategory, ForumPost
from django.utils import timezone
from datetime import date, timedelta

print("Creating test data for Officials Module...\n")

# Create Department
print("Creating Departments...")
dept, created = Department.objects.get_or_create(
    name='Public Works Department',
    defaults={
        'slug': 'public-works',
        'description': 'Handles infrastructure and public facilities',
        'budget_allocated': 2500000,
        'contact_email': 'publicworks@city.gov',
        'contact_phone': '+1234567890',
        'is_active': True
    }
)
print(f"  {'Created' if created else 'Exists'}: {dept.name}")

dept2, created = Department.objects.get_or_create(
    name='Transportation Department',
    defaults={
        'slug': 'transportation',
        'description': 'Manages city transportation and traffic',
        'budget_allocated': 1800000,
        'contact_email': 'transport@city.gov',
        'contact_phone': '+1234567891',
        'is_active': True
    }
)
print(f"  {'Created' if created else 'Exists'}: {dept2.name}")

# Create Citizen User
print("\nCreating Users...")
citizen, created = User.objects.get_or_create(
    email='citizen@test.com',
    defaults={
        'username': 'citizen',
        'first_name': 'Jane',
        'last_name': 'Citizen',
        'role': 'citizen',
        'is_verified': True,
        'is_active': True
    }
)
if created:
    citizen.set_password('citizen123')
    citizen.save()
print(f"  {'Created' if created else 'Exists'}: {citizen.email} (Citizen)")

# Create Official User
official, created = User.objects.get_or_create(
    email='official@city.gov',
    defaults={
        'username': 'official',
        'first_name': 'John',
        'last_name': 'Official',
        'role': 'official',
        'department_name': 'Public Works Department',
        'position': 'Department Manager',
        'is_verified': True,
        'is_active': True
    }
)
if created:
    official.set_password('official123')
    official.save()
print(f"  {'Created' if created else 'Exists'}: {official.email} (Official)")

# Update department head
if not dept.head:
    dept.head = official
    dept.save()
    print(f"  Set {official.full_name} as head of {dept.name}")

# Create Admin User
admin, created = User.objects.get_or_create(
    email='admin@city.gov',
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_verified': True,
        'is_active': True,
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin.set_password('admin123')
    admin.save()
print(f"  {'Created' if created else 'Exists'}: {admin.email} (Admin)")

# Create Issue Categories
print("\nCreating Issue Categories...")
categories_data = [
    ('Infrastructure', 'infrastructure', 'Roads, bridges, and public facilities', '#3B82F6'),
    ('Transportation', 'transportation', 'Traffic and public transport issues', '#10B981'),
    ('Environment', 'environment', 'Environmental concerns and sanitation', '#22C55E'),
    ('Safety', 'safety', 'Public safety and security issues', '#EF4444'),
    ('Utilities', 'utilities', 'Water, electricity, and other utilities', '#F59E0B'),
]

issue_categories = {}
for name, slug, desc, color in categories_data:
    cat, created = IssueCategory.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'description': desc,
            'color': color,
            'is_active': True
        }
    )
    issue_categories[slug] = cat
    print(f"  {'Created' if created else 'Exists'}: {cat.name}")

# Create Issues
print("\nCreating Issues...")
issues_data = [
    {
        'title': 'Broken streetlight on Main Street',
        'description': 'The streetlight at Main Street and 1st Avenue has been out for 3 days, creating safety concerns for pedestrians.',
        'category': issue_categories['infrastructure'],
        'priority': 'high',
        'status': 'open',
        'address': 'Main Street & 1st Avenue',
        'latitude': 40.7128,
        'longitude': -74.0060,
        'reported_by': citizen,
        'assigned_to': official
    },
    {
        'title': 'Large pothole on Cedar Avenue',
        'description': 'Deep pothole causing damage to vehicles. Multiple residents have reported tire damage.',
        'category': issue_categories['transportation'],
        'priority': 'high',
        'status': 'in_progress',
        'address': 'Cedar Avenue, Block 200',
        'latitude': 40.7589,
        'longitude': -73.9851,
        'reported_by': citizen,
        'assigned_to': official
    },
    {
        'title': 'Traffic light malfunction at downtown intersection',
        'description': 'Traffic light is stuck on red, causing major delays during rush hour.',
        'category': issue_categories['transportation'],
        'priority': 'critical',
        'status': 'open',
        'address': 'Downtown Intersection - 5th & Market',
        'latitude': 40.7580,
        'longitude': -73.9855,
        'reported_by': citizen,
        'assigned_to': official
    },
    {
        'title': 'Broken water pipe flooding street',
        'description': 'Water main break on Oak Street causing flooding and water service disruption.',
        'category': issue_categories['utilities'],
        'priority': 'critical',
        'status': 'in_progress',
        'address': 'Oak Street, near Park Ave',
        'latitude': 40.7612,
        'longitude': -73.9644,
        'reported_by': citizen,
        'assigned_to': official
    },
    {
        'title': 'Graffiti on public building',
        'description': 'Extensive graffiti on city hall building needs cleanup.',
        'category': issue_categories['environment'],
        'priority': 'medium',
        'status': 'open',
        'address': 'City Hall, Main Entrance',
        'latitude': 40.7589,
        'longitude': -73.9820,
        'reported_by': citizen,
        'assigned_to': official
    },
    {
        'title': 'Sidewalk cracks creating trip hazard',
        'description': 'Multiple large cracks in sidewalk near elementary school.',
        'category': issue_categories['infrastructure'],
        'priority': 'medium',
        'status': 'open',
        'address': 'Lincoln Street near Elementary School',
        'latitude': 40.7655,
        'longitude': -73.9743,
        'reported_by': citizen,
        'assigned_to': None  # Unassigned
    },
]

for issue_data in issues_data:
    title = issue_data['title']
    issue, created = Issue.objects.get_or_create(
        title=title,
        defaults=issue_data
    )
    print(f"  {'Created' if created else 'Exists'}: {issue.title} ({issue.priority} priority)")

# Create Budget Categories
print("\nCreating Budget Categories...")
budget_categories_data = [
    ('Infrastructure Development', 'infrastructure-dev', '#10b981'),
    ('Transportation Projects', 'transportation-projects', '#3B82F6'),
    ('Public Services', 'public-services', '#F59E0B'),
    ('Environmental Programs', 'environmental-programs', '#22C55E'),
]

budget_cats = {}
for name, slug, color in budget_categories_data:
    cat, created = BudgetCategory.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'color': color,
            'is_active': True
        }
    )
    budget_cats[slug] = cat
    print(f"  {'Created' if created else 'Exists'}: {cat.name}")

# Create Public Spending Records
print("\nCreating Public Spending Records...")
spending_data = [
    {
        'title': 'Road Maintenance Supplies',
        'description': 'Purchase of asphalt and road maintenance materials',
        'department': dept,
        'category': budget_cats['infrastructure-dev'],
        'amount': 45000,
        'vendor_name': 'City Supply Co.',
        'fiscal_year': 2024,
        'transaction_date': date.today() - timedelta(days=30),
        'is_approved': True
    },
    {
        'title': 'Traffic Signal Equipment',
        'description': 'Replacement traffic signal controllers and LED lights',
        'department': dept2,
        'category': budget_cats['transportation-projects'],
        'amount': 125000,
        'vendor_name': 'Tech Traffic Systems',
        'fiscal_year': 2024,
        'transaction_date': date.today() - timedelta(days=45),
        'is_approved': True
    },
]

for spending in spending_data:
    title = spending['title']
    record, created = PublicSpending.objects.get_or_create(
        title=title,
        department=spending['department'],
        defaults=spending
    )
    print(f"  {'Created' if created else 'Exists'}: {record.title} (${record.amount:,.2f})")

# Create Public Projects
print("\nCreating Public Projects...")
projects_data = [
    {
        'name': 'Downtown Sidewalk Renovation',
        'description': 'Complete renovation of downtown sidewalks including ADA compliance upgrades',
        'department': dept,
        'category': budget_cats['infrastructure-dev'],
        'manager': official,
        'budget_allocated': 250000,
        'budget_spent': 187500,
        'start_date': date.today() - timedelta(days=90),
        'expected_end_date': date.today() + timedelta(days=30),
        'status': 'in_progress',
        'progress_percentage': 75,
        'is_public': True
    },
    {
        'name': 'Traffic Signal Modernization Phase 2',
        'description': 'Upgrade traffic signals in downtown area with smart technology',
        'department': dept2,
        'category': budget_cats['transportation-projects'],
        'manager': official,
        'budget_allocated': 180000,
        'budget_spent': 90000,
        'start_date': date.today() - timedelta(days=60),
        'expected_end_date': date.today() + timedelta(days=60),
        'status': 'in_progress',
        'progress_percentage': 50,
        'is_public': True
    },
    {
        'name': 'Park Playground Equipment Installation',
        'description': 'Install new playground equipment at Central Park',
        'department': dept,
        'category': budget_cats['public-services'],
        'manager': official,
        'budget_allocated': 85000,
        'budget_spent': 42500,
        'start_date': date.today() - timedelta(days=30),
        'expected_end_date': date.today() + timedelta(days=45),
        'status': 'in_progress',
        'progress_percentage': 45,
        'is_public': True
    },
    {
        'name': 'Street Lighting Upgrade Phase 3',
        'description': 'LED street light installation in residential areas',
        'department': dept,
        'category': budget_cats['infrastructure-dev'],
        'manager': official,
        'budget_allocated': 150000,
        'budget_spent': 135000,
        'start_date': date.today() - timedelta(days=120),
        'expected_end_date': date.today() + timedelta(days=10),
        'status': 'in_progress',
        'progress_percentage': 90,
        'is_public': True
    },
]

for project_data in projects_data:
    name = project_data['name']
    project, created = PublicProject.objects.get_or_create(
        name=name,
        defaults=project_data
    )
    print(f"  {'Created' if created else 'Exists'}: {project.name} ({project.progress_percentage}% complete)")

# Create Performance Metrics
print("\nCreating Performance Metrics...")
metrics_data = [
    {
        'name': 'Issue Resolution Time',
        'metric_type': 'response_time',
        'description': 'Average time to resolve issues',
        'department': dept,
        'current_value': 2.3,
        'target_value': 2.0,
        'unit': 'days',
        'period_start': date.today() - timedelta(days=30),
        'period_end': date.today(),
        'is_public': True
    },
    {
        'name': 'Citizen Satisfaction Score',
        'metric_type': 'satisfaction',
        'description': 'Overall citizen satisfaction rating',
        'department': dept,
        'current_value': 4.2,
        'target_value': 4.5,
        'unit': 'rating',
        'period_start': date.today() - timedelta(days=30),
        'period_end': date.today(),
        'is_public': True
    },
    {
        'name': 'Project Completion Rate',
        'metric_type': 'completion_rate',
        'description': 'Percentage of projects completed on time',
        'department': dept,
        'current_value': 87,
        'target_value': 90,
        'unit': 'percent',
        'period_start': date.today() - timedelta(days=90),
        'period_end': date.today(),
        'is_public': True
    },
]

for metric_data in metrics_data:
    name = metric_data['name']
    metric, created = PerformanceMetric.objects.get_or_create(
        name=name,
        department=metric_data['department'],
        period_start=metric_data['period_start'],
        defaults=metric_data
    )
    print(f"  {'Created' if created else 'Exists'}: {metric.name} ({metric.current_value} {metric.unit})")

# Create Forum Categories
print("\nCreating Forum Categories...")
forum_cats_data = [
    ('General Discussion', 'general', 'General community discussions', '#6B7280'),
    ('Announcements', 'announcements', 'Official announcements', '#3B82F6'),
    ('Policy', 'policy', 'Policy discussions and feedback', '#10B981'),
]

for name, slug, desc, color in forum_cats_data:
    cat, created = ForumCategory.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'description': desc,
            'color': color,
            'is_active': True
        }
    )
    print(f"  {'Created' if created else 'Exists'}: {cat.name}")

# Create Event Categories
print("\nCreating Event Categories...")
event_cats_data = [
    ('Community Meeting', 'community-meeting', '#3B82F6'),
    ('Volunteer Event', 'volunteer-event', '#10B981'),
    ('Public Hearing', 'public-hearing', '#F59E0B'),
]

for name, slug, color in event_cats_data:
    cat, created = EventCategory.objects.get_or_create(
        slug=slug,
        defaults={
            'name': name,
            'color': color,
            'is_active': True
        }
    )
    print(f"  {'Created' if created else 'Exists'}: {cat.name}")

print("\n" + "="*60)
print("Test data created successfully!")
print("="*60)
print("\nLogin Credentials:")
print("-" * 60)
print("CITIZEN:")
print("  Email: citizen@test.com")
print("  Password: citizen123")
print()
print("OFFICIAL:")
print("  Email: official@city.gov")
print("  Password: official123")
print()
print("ADMIN:")
print("  Email: admin@city.gov")
print("  Password: admin123")
print("-" * 60)
print("\nYou can now:")
print("  1. Refresh pgAdmin to see the data")
print("  2. Login to the frontend with any of the above credentials")
print("  3. Visit /dashboard/official to see the Officials Dashboard")
print()

