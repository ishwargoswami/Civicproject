from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from decimal import Decimal
from datetime import datetime, timedelta
import random

from transparency.models import (
    Department, BudgetCategory, PublicSpending, PublicProject, 
    ProjectMilestone, PerformanceMetric, PublicDocument
)

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate the database with sample transparency data'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting transparency data population...'))
        
        # Create sample users if they don't exist
        self.create_sample_users()
        
        # Create departments
        self.create_departments()
        
        # Create budget categories
        self.create_budget_categories()
        
        # Create public spending records
        self.create_public_spending()
        
        # Create public projects
        self.create_public_projects()
        
        # Create performance metrics
        self.create_performance_metrics()
        
        # Create public documents
        self.create_public_documents()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated transparency data!'))

    def create_sample_users(self):
        """Create sample official users"""
        officials = [
            ('john.mayor@city.gov', 'John', 'Smith', 'Mayor'),
            ('sarah.finance@city.gov', 'Sarah', 'Johnson', 'Finance Director'),
            ('mike.public@city.gov', 'Mike', 'Brown', 'Public Works Director'),
            ('lisa.parks@city.gov', 'Lisa', 'Davis', 'Parks & Recreation Director'),
        ]
        
        for email, first_name, last_name, title in officials:
            if not User.objects.filter(email=email).exists():
                username = email.split('@')[0]  # Use email prefix as username
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    role='official',
                    is_verified=True
                )
                self.stdout.write(f'Created user: {email}')

    def create_departments(self):
        """Create government departments"""
        departments_data = [
            {
                'name': 'Public Works',
                'slug': 'public-works',
                'description': 'Responsible for infrastructure, roads, and utilities',
                'budget_allocated': Decimal('5000000.00'),
                'contact_email': 'publicworks@city.gov',
                'contact_phone': '555-0101'
            },
            {
                'name': 'Parks & Recreation',
                'slug': 'parks-recreation',
                'description': 'Manages parks, recreational facilities, and community programs',
                'budget_allocated': Decimal('2500000.00'),
                'contact_email': 'parks@city.gov',
                'contact_phone': '555-0102'
            },
            {
                'name': 'Finance',
                'slug': 'finance',
                'description': 'Financial management and budget oversight',
                'budget_allocated': Decimal('1500000.00'),
                'contact_email': 'finance@city.gov',
                'contact_phone': '555-0103'
            },
            {
                'name': 'Health Services',
                'slug': 'health-services',
                'description': 'Public health programs and services',
                'budget_allocated': Decimal('3000000.00'),
                'contact_email': 'health@city.gov',
                'contact_phone': '555-0104'
            },
            {
                'name': 'Transportation',
                'slug': 'transportation',
                'description': 'Public transportation and traffic management',
                'budget_allocated': Decimal('4000000.00'),
                'contact_email': 'transport@city.gov',
                'contact_phone': '555-0105'
            }
        ]
        
        for dept_data in departments_data:
            department, created = Department.objects.get_or_create(
                slug=dept_data['slug'],
                defaults=dept_data
            )
            if created:
                self.stdout.write(f'Created department: {department.name}')

    def create_budget_categories(self):
        """Create budget categories"""
        categories_data = [
            {'name': 'Infrastructure', 'slug': 'infrastructure', 'color': '#3B82F6', 'description': 'Roads, bridges, and utilities'},
            {'name': 'Personnel', 'slug': 'personnel', 'color': '#10B981', 'description': 'Salaries and benefits'},
            {'name': 'Equipment', 'slug': 'equipment', 'color': '#F59E0B', 'description': 'Vehicles, tools, and machinery'},
            {'name': 'Maintenance', 'slug': 'maintenance', 'color': '#EF4444', 'description': 'Ongoing maintenance and repairs'},
            {'name': 'Programs', 'slug': 'programs', 'color': '#8B5CF6', 'description': 'Community programs and services'},
            {'name': 'Technology', 'slug': 'technology', 'color': '#06B6D4', 'description': 'IT systems and software'},
            {'name': 'Utilities', 'slug': 'utilities', 'color': '#84CC16', 'description': 'Power, water, and communications'},
            {'name': 'Emergency Services', 'slug': 'emergency-services', 'color': '#F97316', 'description': 'Emergency response and safety'}
        ]
        
        for cat_data in categories_data:
            category, created = BudgetCategory.objects.get_or_create(
                slug=cat_data['slug'],
                defaults=cat_data
            )
            if created:
                self.stdout.write(f'Created budget category: {category.name}')

    def create_public_spending(self):
        """Create public spending records"""
        departments = list(Department.objects.all())
        categories = list(BudgetCategory.objects.all())
        officials = list(User.objects.filter(role='official'))
        
        current_year = timezone.now().year
        
        spending_records = [
            {
                'title': 'Road Resurfacing Project - Main Street',
                'description': 'Complete resurfacing of Main Street from 1st Ave to 10th Ave',
                'amount': Decimal('250000.00'),
                'vendor_name': 'ABC Construction Co.',
                'contract_number': 'PW-2024-001'
            },
            {
                'title': 'Park Equipment Installation',
                'description': 'New playground equipment for Central Park',
                'amount': Decimal('75000.00'),
                'vendor_name': 'PlaySafe Equipment Inc.',
                'contract_number': 'PR-2024-005'
            },
            {
                'title': 'IT System Upgrade',
                'description': 'Upgrade city hall computer systems and software',
                'amount': Decimal('120000.00'),
                'vendor_name': 'TechSolutions LLC',
                'contract_number': 'IT-2024-003'
            },
            {
                'title': 'Emergency Vehicle Purchase',
                'description': 'New ambulance for emergency medical services',
                'amount': Decimal('180000.00'),
                'vendor_name': 'MedVehicles Corp',
                'contract_number': 'EM-2024-002'
            },
            {
                'title': 'Street Lighting Upgrade',
                'description': 'LED streetlight installation citywide',
                'amount': Decimal('300000.00'),
                'vendor_name': 'Bright City Solutions',
                'contract_number': 'PW-2024-007'
            }
        ]
        
        for i, record_data in enumerate(spending_records):
            # Create spending record with random department and category
            spending = PublicSpending.objects.create(
                title=record_data['title'],
                description=record_data['description'],
                department=random.choice(departments),
                category=random.choice(categories),
                amount=record_data['amount'],
                vendor_name=record_data['vendor_name'],
                contract_number=record_data['contract_number'],
                contract_date=timezone.now().date() - timedelta(days=random.randint(30, 365)),
                fiscal_year=current_year,
                transaction_date=timezone.now().date() - timedelta(days=random.randint(1, 180)),
                is_approved=True,
                approved_by=random.choice(officials)
            )
            self.stdout.write(f'Created spending record: {spending.title}')

    def create_public_projects(self):
        """Create public projects"""
        departments = list(Department.objects.all())
        categories = list(BudgetCategory.objects.all())
        officials = list(User.objects.filter(role='official'))
        
        projects_data = [
            {
                'name': 'Downtown Revitalization Initiative',
                'description': 'Comprehensive downtown improvement project including streetscaping, facade improvements, and public art installations',
                'budget_allocated': Decimal('2500000.00'),
                'budget_spent': Decimal('1200000.00'),
                'status': 'in_progress',
                'progress_percentage': 48
            },
            {
                'name': 'Community Center Construction',
                'description': 'New 15,000 sq ft community center with gym, meeting rooms, and senior services',
                'budget_allocated': Decimal('3200000.00'),
                'budget_spent': Decimal('800000.00'),
                'status': 'in_progress',
                'progress_percentage': 25
            },
            {
                'name': 'Bike Path Network Expansion',
                'description': 'Expand citywide bike path network by 20 miles with safety improvements',
                'budget_allocated': Decimal('850000.00'),
                'budget_spent': Decimal('850000.00'),
                'status': 'completed',
                'progress_percentage': 100
            },
            {
                'name': 'Water Treatment Plant Upgrade',
                'description': 'Modernize water treatment facility to improve capacity and efficiency',
                'budget_allocated': Decimal('4500000.00'),
                'budget_spent': Decimal('2800000.00'),
                'status': 'in_progress',
                'progress_percentage': 62
            },
            {
                'name': 'Smart Traffic Management System',
                'description': 'Implementation of AI-powered traffic management system at major intersections',
                'budget_allocated': Decimal('750000.00'),
                'budget_spent': Decimal('150000.00'),
                'status': 'approved',
                'progress_percentage': 15
            }
        ]
        
        for project_data in projects_data:
            start_date = timezone.now().date() - timedelta(days=random.randint(30, 730))
            expected_end_date = start_date + timedelta(days=random.randint(180, 1095))
            
            project = PublicProject.objects.create(
                name=project_data['name'],
                description=project_data['description'],
                department=random.choice(departments),
                category=random.choice(categories),
                manager=random.choice(officials),
                budget_allocated=project_data['budget_allocated'],
                budget_spent=project_data['budget_spent'],
                start_date=start_date,
                expected_end_date=expected_end_date,
                actual_end_date=expected_end_date if project_data['status'] == 'completed' else None,
                status=project_data['status'],
                progress_percentage=project_data['progress_percentage'],
                is_public=True
            )
            
            # Create milestones for each project
            self.create_project_milestones(project)
            
            self.stdout.write(f'Created project: {project.name}')

    def create_project_milestones(self, project):
        """Create milestones for a project"""
        milestone_templates = [
            ('Project Planning Complete', 'Initial planning and design phase completed'),
            ('Permits Obtained', 'All necessary permits and approvals secured'),
            ('Construction Started', 'Ground breaking and construction commencement'),
            ('50% Completion', 'Project reaches halfway milestone'),
            ('Final Inspections', 'All final inspections and quality checks'),
            ('Project Completion', 'Project officially completed and operational')
        ]
        
        project_duration = (project.expected_end_date - project.start_date).days
        milestone_interval = project_duration // len(milestone_templates)
        
        for i, (title, description) in enumerate(milestone_templates):
            target_date = project.start_date + timedelta(days=milestone_interval * (i + 1))
            is_completed = project.progress_percentage > (i + 1) * (100 // len(milestone_templates))
            
            ProjectMilestone.objects.create(
                project=project,
                title=title,
                description=description,
                target_date=target_date,
                completion_date=target_date if is_completed else None,
                is_completed=is_completed
            )

    def create_performance_metrics(self):
        """Create performance metrics"""
        departments = list(Department.objects.all())
        projects = list(PublicProject.objects.all())
        
        metrics_data = [
            {
                'name': 'Response Time to Service Requests',
                'metric_type': 'response_time',
                'description': 'Average time to respond to citizen service requests',
                'current_value': Decimal('2.5'),
                'target_value': Decimal('2.0'),
                'unit': 'days'
            },
            {
                'name': 'Citizen Satisfaction Score',
                'metric_type': 'satisfaction',
                'description': 'Overall citizen satisfaction rating from surveys',
                'current_value': Decimal('4.2'),
                'target_value': Decimal('4.5'),
                'unit': 'out of 5'
            },
            {
                'name': 'Budget Utilization Rate',
                'metric_type': 'budget_utilization',
                'description': 'Percentage of allocated budget utilized effectively',
                'current_value': Decimal('87.5'),
                'target_value': Decimal('90.0'),
                'unit': '%'
            },
            {
                'name': 'Project Completion Rate',
                'metric_type': 'completion_rate',
                'description': 'Percentage of projects completed on time',
                'current_value': Decimal('78.0'),
                'target_value': Decimal('85.0'),
                'unit': '%'
            }
        ]
        
        for metric_data in metrics_data:
            period_start = timezone.now().date() - timedelta(days=90)
            period_end = timezone.now().date()
            
            # Create department-level metric
            PerformanceMetric.objects.create(
                name=metric_data['name'],
                metric_type=metric_data['metric_type'],
                description=metric_data['description'],
                department=random.choice(departments),
                current_value=metric_data['current_value'],
                target_value=metric_data['target_value'],
                unit=metric_data['unit'],
                period_start=period_start,
                period_end=period_end,
                is_public=True
            )
            
            self.stdout.write(f'Created performance metric: {metric_data["name"]}')

    def create_public_documents(self):
        """Create public document records (without actual files)"""
        departments = list(Department.objects.all())
        officials = list(User.objects.filter(role='official'))
        
        documents_data = [
            {
                'title': 'City Council Meeting Minutes - March 2024',
                'description': 'Minutes from the regular city council meeting held on March 15, 2024',
                'document_type': 'meeting_minutes',
                'file_type': 'PDF',
                'file_size': 1024000,
                'tags': ['city council', 'meeting', 'minutes', 'march 2024']
            },
            {
                'title': 'Annual Budget Report 2024',
                'description': 'Comprehensive budget report for fiscal year 2024',
                'document_type': 'budget_report',
                'file_type': 'PDF',
                'file_size': 2048000,
                'tags': ['budget', 'annual report', '2024', 'finance']
            },
            {
                'title': 'Parks and Recreation Strategic Plan',
                'description': '5-year strategic plan for parks and recreation development',
                'document_type': 'policy_document',
                'file_type': 'PDF',
                'file_size': 3072000,
                'tags': ['parks', 'recreation', 'strategic plan', 'development']
            },
            {
                'title': 'Public Works Contract - Road Maintenance',
                'description': 'Contract for citywide road maintenance services',
                'document_type': 'contract',
                'file_type': 'PDF',
                'file_size': 512000,
                'tags': ['contract', 'road maintenance', 'public works']
            }
        ]
        
        for doc_data in documents_data:
            # Note: In a real implementation, you would have actual file uploads
            # For this demo, we're just creating the database records
            document = PublicDocument.objects.create(
                title=doc_data['title'],
                description=doc_data['description'],
                document_type=doc_data['document_type'],
                department=random.choice(departments),
                file='documents/sample.pdf',  # Placeholder path
                file_size=doc_data['file_size'],
                file_type=doc_data['file_type'],
                tags=doc_data['tags'],
                date_created=timezone.now().date() - timedelta(days=random.randint(1, 365)),
                is_public=True,
                requires_request=False,
                uploaded_by=random.choice(officials)
            )
            
            self.stdout.write(f'Created document: {document.title}')
