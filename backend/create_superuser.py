#!/usr/bin/env python
"""
Create a superuser for the Django admin
"""
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civic_platform.settings')
django.setup()

from accounts.models import User

def create_superuser():
    """Create a superuser if one doesn't exist"""
    
    email = 'admin@example.com'
    first_name = 'Admin'
    last_name = 'User'
    
    if User.objects.filter(email=email).exists():
        print(f"✅ Superuser with email {email} already exists")
        return
    
    # Create superuser
    user = User.objects.create_user(
        username='admin',
        email=email,
        first_name=first_name,
        last_name=last_name,
        password='admin123',  # Change this in production!
        role='admin',
        is_staff=True,
        is_superuser=True,
        is_verified=True
    )
    
    print(f"✅ Created superuser:")
    print(f"   Email: {email}")
    print(f"   Password: admin123")
    print(f"   Role: {user.role}")
    print("\n🔐 Please change the password in production!")

if __name__ == '__main__':
    create_superuser()
