# Testing Official Dashboard Endpoints

## Issue Status Update

**The Problem:**
- Frontend was calling wrong endpoint
- Was using: `PATCH /api/issues/{id}/status/`
- Should use: `POST /api/issues/{id}/update_status/`

**Fix Applied:**
- Updated `src/store/slices/issuesSlice.ts` to use `issuesAPI.updateStatus()` instead of `issuesAPI.updateIssueStatus()`
- This uses the correct backend endpoint

## Project Update

**The Problem:**
- Getting 404 on: `POST /api/transparency/projects/{id}/update_progress/`

**Possible Causes:**
1. Django server not restarted after adding new `@action` decorator
2. ViewSet router not properly registering the action
3. URL configuration issue

**To Fix:**
1. **Restart Django Server**
   ```bash
   cd backend
   python manage.py runserver
   ```

2. **Test the endpoint exists:**
   ```bash
   curl http://localhost:8000/api/transparency/projects/
   ```

3. **Check if action is registered:**
   The `@action(detail=True, methods=['post'])` decorator on `update_progress` method should automatically create the URL:
   - `/api/transparency/projects/{pk}/update_progress/`

## Steps to Verify

### 1. Check Backend Logs
When you try to update a project, check the Django console output for the actual URL being hit.

### 2. Test with Postman/curl
```bash
# Get projects list
curl http://localhost:8000/api/transparency/projects/

# Try updating a project (replace UUID with actual project ID)
curl -X POST http://localhost:8000/api/transparency/projects/a98b5a0b-6bf0-4796-975e-976c2e95d015/update_progress/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"progress_percentage": 50, "status": "in_progress", "comment": "Test update"}'
```

### 3. Check Router Registration
The router in `backend/transparency/urls.py` has:
```python
router.register(r'projects', PublicProjectViewSet, basename='publicproject')
```

This should automatically register all @action decorated methods.

## Alternative Solution (If Still 404)

If the action decorator doesn't work, we can create a manual URL pattern:

### Option A: Add manual URL in transparency/urls.py
```python
from .views import update_project_progress

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<uuid:pk>/update_progress/', update_project_progress, name='update-project-progress'),
]
```

### Option B: Create separate view function
```python
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_project_progress(request, pk):
    # Implementation here
    pass
```

## Current Status

✅ Issue Status Update - **FIXED** (changed to correct endpoint)
⏳ Project Update - **NEEDS SERVER RESTART**

## Next Steps

1. **RESTART THE DJANGO SERVER** - This is critical for the new @action to be registered
2. Clear browser cache/hard refresh
3. Try updating a project again
4. If still 404, check Django console for actual error message

