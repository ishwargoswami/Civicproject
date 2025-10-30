"""
Create superuser for Django Admin
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civic_platform.settings')
django.setup()

from accounts.models import User

# Create superuser
admin, created = User.objects.get_or_create(
    email='admin@localhost',
    defaults={
        'username': 'admin',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'admin',
        'is_staff': True,
        'is_superuser': True,
        'is_active': True,
        'is_verified': True
    }
)

if created:
    admin.set_password('admin123')
    admin.save()
    print("Superuser created successfully!")
else:
    # Update existing user to be superuser
    admin.is_staff = True
    admin.is_superuser = True
    admin.set_password('admin123')
    admin.save()
    print("Superuser already exists, password updated!")

print("\nDjango Admin Credentials:")
print("="*50)
print(f"URL: http://localhost:8000/admin/")
print(f"Email: {admin.email}")
print(f"Password: admin123")
print("="*50)

