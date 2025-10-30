"""
Assign existing official users to departments
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civic_platform.settings')
django.setup()

from accounts.models import User
from transparency.models import Department

# Get all departments
departments = list(Department.objects.all())

# Department mapping suggestions based on email
mappings = {
    'iishw.tech@gmail.com': ('Public Works', 'Chief Engineer'),
    'john.mayor@city.gov': ('Public Works', 'Department Head'),
    'sarah.finance@city.gov': ('Finance', 'Finance Director'),
    'mike.public@city.gov': ('Public Works', 'Public Works Manager'),
    'lisa.parks@city.gov': ('Parks & Recreation', 'Parks Director'),
}

print("Assigning officials to departments...\n")

for email, (dept_name, position) in mappings.items():
    try:
        user = User.objects.get(email=email)
        user.department_name = dept_name
        user.position = position
        user.save()
        print(f"Assigned: {email}")
        print(f"  Department: {dept_name}")
        print(f"  Position: {position}\n")
    except User.DoesNotExist:
        print(f"User not found: {email}\n")

print("="*60)
print("Assignment complete!")
print("="*60)
print("\nNow assign some issues to officials:")

from issues.models import Issue

# Get all open issues
open_issues = Issue.objects.filter(assigned_to__isnull=True)[:5]

if open_issues.exists():
    # Get first official
    first_official = User.objects.filter(role='official', department_name='Public Works').first()
    
    if first_official:
        print(f"\nAssigning {open_issues.count()} issues to {first_official.email}...")
        for issue in open_issues:
            issue.assigned_to = first_official
            issue.status = 'in_progress' if issue.status == 'open' else issue.status
            issue.save()
            print(f"  - Assigned: {issue.title}")
        
        print(f"\nDone! {first_official.email} now has {Issue.objects.filter(assigned_to=first_official).count()} assigned issues")
else:
    print("\nNo unassigned issues found")

print("\nYou can now:")
print(f"1. Login as any of these officials")
print(f"2. Visit /dashboard/official")
print(f"3. See your real data!")

