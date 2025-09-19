#!/usr/bin/env python3
"""
Setup script for Civic Platform backend
"""

import os
import sys
import subprocess
import secrets
import string

def generate_secret_key():
    """Generate a secure secret key for Django"""
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(alphabet) for i in range(50))

def create_env_file():
    """Create .env file from template"""
    template_path = 'env_template.txt'
    env_path = '.env'
    
    if os.path.exists(env_path):
        response = input(f"{env_path} already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            print("Skipping .env file creation.")
            return
    
    if os.path.exists(template_path):
        with open(template_path, 'r') as f:
            content = f.read()
        
        # Replace placeholder values
        content = content.replace('django-insecure-your-secret-key-change-this-in-production', generate_secret_key())
        content = content.replace('your_password_here', 'password')  # Default for development
        
        with open(env_path, 'w') as f:
            f.write(content)
        
        print(f"✅ Created {env_path}")
        print("📝 Please update the database password and other settings in .env file")
    else:
        print(f"❌ {template_path} not found")

def run_command(command, description):
    """Run a shell command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def setup_database():
    """Set up the database"""
    print("\n📊 Setting up database...")
    
    commands = [
        ("python manage.py makemigrations accounts", "Creating accounts migrations"),
        ("python manage.py makemigrations issues", "Creating issues migrations"),
        ("python manage.py makemigrations forum", "Creating forum migrations"),
        ("python manage.py makemigrations events", "Creating events migrations"),
        ("python manage.py makemigrations notifications", "Creating notifications migrations"),
        ("python manage.py makemigrations transparency", "Creating transparency migrations"),
        ("python manage.py makemigrations maps", "Creating maps migrations"),
        ("python manage.py migrate", "Running database migrations"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            return False
    
    return True

def create_superuser():
    """Create a superuser account"""
    print("\n👤 Creating superuser account...")
    
    try:
        subprocess.run([
            'python', 'manage.py', 'createsuperuser',
            '--email', 'admin@civicplatform.local',
            '--username', 'admin'
        ], check=True)
        print("✅ Superuser created")
    except subprocess.CalledProcessError:
        print("❌ Failed to create superuser")
        print("You can create one later with: python manage.py createsuperuser")

def load_sample_data():
    """Load sample data"""
    print("\n📝 Loading sample data...")
    
    # Create sample data command
    sample_data_script = """
from django.core.management.base import BaseCommand
from accounts.models import User
from issues.models import IssueCategory
from forum.models import ForumCategory
from events.models import EventCategory
from transparency.models import Department, BudgetCategory

class Command(BaseCommand):
    help = 'Load sample data'
    
    def handle(self, *args, **options):
        # Create issue categories
        issue_categories = [
            ('Infrastructure', 'infrastructure', 'Roads, bridges, utilities'),
            ('Environment', 'environment', 'Parks, pollution, waste management'),
            ('Safety', 'safety', 'Crime, emergency services'),
            ('Transportation', 'transportation', 'Public transit, traffic'),
            ('Utilities', 'utilities', 'Water, electricity, internet'),
            ('Other', 'other', 'Other community issues'),
        ]
        
        for name, slug, desc in issue_categories:
            IssueCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc}
            )
        
        # Create forum categories
        forum_categories = [
            ('General', 'general', 'General community discussions'),
            ('Policy', 'policy', 'Policy discussions and proposals'),
            ('Events', 'events', 'Community events and meetings'),
            ('Announcements', 'announcements', 'Official announcements'),
            ('Feedback', 'feedback', 'Feedback and suggestions'),
        ]
        
        for name, slug, desc in forum_categories:
            ForumCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc}
            )
        
        # Create event categories
        event_categories = [
            ('Community', 'community', 'Community gatherings'),
            ('Volunteer', 'volunteer', 'Volunteer opportunities'),
            ('Meeting', 'meeting', 'Official meetings'),
            ('Workshop', 'workshop', 'Educational workshops'),
            ('Cleanup', 'cleanup', 'Community cleanup events'),
            ('Fundraiser', 'fundraiser', 'Fundraising events'),
        ]
        
        for name, slug, desc in event_categories:
            EventCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc}
            )
        
        # Create departments
        departments = [
            ('Public Works', 'public-works', 'Infrastructure and utilities'),
            ('Parks & Recreation', 'parks-recreation', 'Parks and community programs'),
            ('Transportation', 'transportation', 'Public transportation and traffic'),
            ('Environmental Services', 'environmental', 'Environmental protection and waste'),
            ('Public Safety', 'public-safety', 'Police and emergency services'),
            ('City Planning', 'city-planning', 'Urban planning and development'),
        ]
        
        for name, slug, desc in departments:
            Department.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc}
            )
        
        # Create budget categories
        budget_categories = [
            ('Infrastructure', 'infrastructure', 'Roads, bridges, buildings'),
            ('Public Safety', 'public-safety', 'Police, fire, emergency services'),
            ('Education', 'education', 'Schools and educational programs'),
            ('Healthcare', 'healthcare', 'Public health services'),
            ('Environment', 'environment', 'Environmental programs'),
            ('Administration', 'administration', 'Government operations'),
        ]
        
        for name, slug, desc in budget_categories:
            BudgetCategory.objects.get_or_create(
                slug=slug,
                defaults={'name': name, 'description': desc}
            )
        
        self.stdout.write(
            self.style.SUCCESS('Successfully loaded sample data')
        )
"""
    
    # Create management command directory
    os.makedirs('accounts/management/commands', exist_ok=True)
    
    # Create __init__.py files
    open('accounts/management/__init__.py', 'a').close()
    open('accounts/management/commands/__init__.py', 'a').close()
    
    # Write the sample data command
    with open('accounts/management/commands/load_sample_data.py', 'w') as f:
        f.write(sample_data_script)
    
    # Run the command
    return run_command("python manage.py load_sample_data", "Loading sample data")

def main():
    """Main setup function"""
    print("🚀 Setting up Civic Platform Backend")
    print("=" * 50)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ manage.py not found. Please run this script from the backend directory.")
        sys.exit(1)
    
    # Create .env file
    create_env_file()
    
    # Set up database
    if not setup_database():
        print("❌ Database setup failed. Please check your database configuration.")
        sys.exit(1)
    
    # Load sample data
    if not load_sample_data():
        print("⚠️  Sample data loading failed, but you can continue without it.")
    
    # Create superuser
    create_superuser()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Update .env file with your database password and email settings")
    print("2. Make sure PostgreSQL and Redis are running")
    print("3. Start the development server: python manage.py runserver")
    print("4. Visit http://localhost:8000/admin to access the admin panel")
    print("5. Visit http://localhost:8000/api to explore the API")
    print("6. Update your frontend VITE_API_BASE_URL to http://localhost:8000/api")
    print("\n📚 Need help? Check SETUP_INSTRUCTIONS.md for detailed setup guide")

if __name__ == '__main__':
    main()
