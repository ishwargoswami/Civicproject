# Officials Module - Quick Setup Guide

## 🚀 Quick Start

### Step 1: Run Database Migrations
```bash
cd backend
python manage.py makemigrations
python manage.py migrate
```

### Step 2: Create Test Data

#### Create a Department:
```python
python manage.py shell
```

```python
from transparency.models import Department
from accounts.models import User

# Create a department
dept = Department.objects.create(
    name='Public Works Department',
    slug='public-works',
    description='Handles infrastructure and public facilities',
    budget_allocated=2500000,
    contact_email='publicworks@city.gov',
    contact_phone='+1234567890'
)

print(f"Created department: {dept.name}")
```

#### Create an Official User:
```python
# Create official user
official = User.objects.create_user(
    email='official@city.gov',
    username='official',
    password='official123',  # Change this!
    first_name='John',
    last_name='Official',
    role='official',
    department_name='Public Works Department',
    position='Department Manager',
    is_verified=True
)

print(f"Created official: {official.email}")
```

#### Create Test Issues:
```python
from issues.models import Issue, IssueCategory
from django.utils import timezone

# Create category
category = IssueCategory.objects.get_or_create(
    name='Infrastructure',
    slug='infrastructure',
    defaults={'description': 'Infrastructure related issues', 'color': '#3B82F6'}
)[0]

# Create some issues
Issue.objects.create(
    title='Broken streetlight on Main Street',
    description='The streetlight has been out for 3 days',
    category=category,
    priority='high',
    status='open',
    address='Main Street & 1st Avenue',
    latitude=40.7128,
    longitude=-74.0060,
    reported_by=official,  # Or use a citizen user
    assigned_to=official
)

Issue.objects.create(
    title='Pothole on Cedar Avenue',
    description='Large pothole causing vehicle damage',
    category=category,
    priority='medium',
    status='in_progress',
    address='Cedar Avenue',
    latitude=40.7589,
    longitude=-73.9851,
    reported_by=official,
    assigned_to=official
)

print("Created test issues")
```

#### Create Test Projects:
```python
from transparency.models import PublicProject, BudgetCategory
from datetime import date, timedelta

# Create budget category
budget_cat = BudgetCategory.objects.get_or_create(
    name='Infrastructure Development',
    slug='infrastructure-dev',
    defaults={'color': '#10b981'}
)[0]

# Create project
project = PublicProject.objects.create(
    name='Downtown Sidewalk Renovation',
    description='Complete renovation of downtown sidewalks',
    department=dept,
    category=budget_cat,
    manager=official,
    budget_allocated=250000,
    budget_spent=187500,
    start_date=date.today() - timedelta(days=90),
    expected_end_date=date.today() + timedelta(days=30),
    status='in_progress',
    progress_percentage=75,
    is_public=True
)

print(f"Created project: {project.name}")
```

#### Create Performance Metrics:
```python
from transparency.models import PerformanceMetric
from datetime import date

metric = PerformanceMetric.objects.create(
    name='Issue Resolution Time',
    metric_type='response_time',
    description='Average time to resolve issues',
    department=dept,
    current_value=2.3,
    target_value=2.0,
    unit='days',
    period_start=date.today() - timedelta(days=30),
    period_end=date.today(),
    is_public=True
)

print(f"Created metric: {metric.name}")
```

### Step 3: Start the Backend Server
```bash
python manage.py runserver
```

### Step 4: Start the Frontend
```bash
# In the project root directory
npm run dev
```

### Step 5: Login and Test

1. Go to `http://localhost:5173/login`
2. Login with:
   - **Email:** `official@city.gov`
   - **Password:** `official123`
3. Navigate to `/dashboard/official`
4. You should see real data from the database!

---

## 📊 Expected Dashboard Data

After following the setup, you should see:

### Dashboard Statistics:
- **Assigned Issues:** 2 (1 high priority, 1 medium)
- **Active Projects:** 1 (75% complete)
- **Citizen Requests:** Based on all department issues
- **Budget Utilization:** 67% ($1.7M / $2.5M)

### Urgent Issues Tab:
- 1 high-priority issue (Broken streetlight)

### Projects Tab:
- Downtown Sidewalk Renovation (75% complete, on track)

---

## 🔧 Troubleshooting

### Issue: "No department assigned"
**Solution:** Make sure the official user has `department_name` set and matches a Department in the database.

### Issue: "No data showing"
**Solution:** 
1. Check backend is running (`http://localhost:8000/api/auth/officials/dashboard/stats/`)
2. Check you're logged in as an official user
3. Check console for API errors

### Issue: "Permission denied"
**Solution:** Ensure user role is 'official' or 'admin':
```python
user = User.objects.get(email='official@city.gov')
user.role = 'official'
user.save()
```

### Issue: "CORS errors"
**Solution:** Backend CORS is already configured, but verify `CORS_ALLOW_ALL_ORIGINS = True` in settings.py

---

## 🧪 API Testing

Test endpoints directly with curl or Postman:

### Get Token:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "official@city.gov",
    "password": "official123"
  }'
```

### Get Dashboard Stats:
```bash
curl -X GET http://localhost:8000/api/auth/officials/dashboard/stats/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Urgent Issues:
```bash
curl -X GET http://localhost:8000/api/auth/officials/urgent-issues/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📝 Quick Script to Create All Test Data

Save this as `create_test_data.py` in the backend directory:

```python
import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'civic_platform.settings')
django.setup()

from transparency.models import Department, PublicProject, BudgetCategory, PerformanceMetric
from accounts.models import User
from issues.models import Issue, IssueCategory
from django.utils import timezone
from datetime import date, timedelta

# Create Department
dept, _ = Department.objects.get_or_create(
    name='Public Works Department',
    defaults={
        'slug': 'public-works',
        'description': 'Handles infrastructure and public facilities',
        'budget_allocated': 2500000,
        'contact_email': 'publicworks@city.gov',
        'contact_phone': '+1234567890'
    }
)
print(f"✓ Department: {dept.name}")

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
        'is_verified': True
    }
)
if created:
    official.set_password('official123')
    official.save()
    print(f"✓ Created official: {official.email}")
else:
    print(f"✓ Official exists: {official.email}")

# Create Issue Category
category, _ = IssueCategory.objects.get_or_create(
    name='Infrastructure',
    defaults={'slug': 'infrastructure', 'description': 'Infrastructure issues', 'color': '#3B82F6'}
)
print(f"✓ Category: {category.name}")

# Create Issues
issue1, _ = Issue.objects.get_or_create(
    title='Broken streetlight on Main Street',
    defaults={
        'description': 'The streetlight has been out for 3 days',
        'category': category,
        'priority': 'high',
        'status': 'open',
        'address': 'Main Street & 1st Avenue',
        'latitude': 40.7128,
        'longitude': -74.0060,
        'reported_by': official,
        'assigned_to': official
    }
)
print(f"✓ Issue 1: {issue1.title}")

issue2, _ = Issue.objects.get_or_create(
    title='Pothole on Cedar Avenue',
    defaults={
        'description': 'Large pothole causing vehicle damage',
        'category': category,
        'priority': 'medium',
        'status': 'in_progress',
        'address': 'Cedar Avenue',
        'latitude': 40.7589,
        'longitude': -73.9851,
        'reported_by': official,
        'assigned_to': official
    }
)
print(f"✓ Issue 2: {issue2.title}")

# Create Budget Category
budget_cat, _ = BudgetCategory.objects.get_or_create(
    name='Infrastructure Development',
    defaults={'slug': 'infrastructure-dev', 'color': '#10b981'}
)
print(f"✓ Budget Category: {budget_cat.name}")

# Create Project
project, _ = PublicProject.objects.get_or_create(
    name='Downtown Sidewalk Renovation',
    defaults={
        'description': 'Complete renovation of downtown sidewalks',
        'department': dept,
        'category': budget_cat,
        'manager': official,
        'budget_allocated': 250000,
        'budget_spent': 187500,
        'start_date': date.today() - timedelta(days=90),
        'expected_end_date': date.today() + timedelta(days=30),
        'status': 'in_progress',
        'progress_percentage': 75,
        'is_public': True
    }
)
print(f"✓ Project: {project.name}")

# Create Performance Metric
metric, _ = PerformanceMetric.objects.get_or_create(
    name='Issue Resolution Time',
    department=dept,
    defaults={
        'metric_type': 'response_time',
        'description': 'Average time to resolve issues',
        'current_value': 2.3,
        'target_value': 2.0,
        'unit': 'days',
        'period_start': date.today() - timedelta(days=30),
        'period_end': date.today(),
        'is_public': True
    }
)
print(f"✓ Metric: {metric.name}")

print("\n🎉 All test data created successfully!")
print(f"\nLogin credentials:")
print(f"Email: official@city.gov")
print(f"Password: official123")
```

Run it:
```bash
python create_test_data.py
```

---

## ✅ Verification Steps

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/api/auth/officials/dashboard/stats/
   # Should return 401 Unauthorized (expected without token)
   ```

2. **Frontend Connection:**
   - Open browser console at `http://localhost:5173/dashboard/official`
   - Check Network tab for API calls
   - Should see calls to `/api/auth/officials/dashboard/stats/`

3. **Data Verification:**
   - Check Django admin: `http://localhost:8000/admin/`
   - Verify departments, issues, and projects exist

---

## 🎯 Success Criteria

You've successfully set up the Officials Module if you can:
- ✅ Login as an official user
- ✅ See real statistics on the dashboard
- ✅ View assigned issues
- ✅ See department projects
- ✅ View performance metrics
- ✅ Use the refresh button to update data
- ✅ Navigate between tabs without errors

---

## 📞 Need Help?

Check the main documentation: `OFFICIALS_MODULE_IMPLEMENTATION.md`

Common issues are usually:
1. Backend not running
2. Frontend not running
3. User not created or wrong role
4. Department not matching user's department_name
5. No test data created

