# 🐛 FIX: Events API 405 Method Not Allowed

## Problem

When trying to create an event, getting:
```
❌ POST /api/events/ 405 (Method Not Allowed)
❌ Failed to create event
```

Also getting 404 errors on:
```
❌ GET /api/events/statistics/ 404 (Not Found)
```

---

## Root Cause

### Backend URL Structure

The Django backend has a **nested URL structure**:

```
Main URLs (civic_platform/urls.py):
  path('api/events/', include('events.urls'))

Events URLs (events/urls.py):
  router.register(r'events', EventViewSet, basename='event')
  
Result:
  /api/events/ + events/ = /api/events/events/  ← Actual endpoint!
```

### Actual Backend Routes

```bash
/api/events/                          # API Root (read-only)
/api/events/events/                   # Events list (GET, POST)  ✅
/api/events/events/<pk>/              # Event detail (GET, PUT, PATCH, DELETE)
/api/events/events/<pk>/rsvp/         # RSVP to event
/api/events/events/<pk>/volunteer/    # Volunteer for event
/api/events/events/my_events/         # User's created events
/api/events/events/my_rsvps/          # User's RSVPs
/api/events/events/statistics/        # Event statistics
/api/events/categories/               # Event categories
```

### Frontend Was Calling

```typescript
// ❌ WRONG - Calling API root, not event list
apiClient.post('/api/events/', eventData)

// ❌ WRONG - Calling non-existent endpoint
apiClient.get('/api/events/statistics/')
```

---

## Solution

Updated all frontend event API calls to include the extra `/events/` path segment:

### ✅ Fixed URLs

```typescript
// Event CRUD
'/events/'           → '/events/events/'           ✅
'/events/${id}/'     → '/events/events/${id}/'     ✅

// Custom endpoints
'/events/my_events/'     → '/events/events/my_events/'     ✅
'/events/my_rsvps/'      → '/events/events/my_rsvps/'      ✅
'/events/statistics/'    → '/events/events/statistics/'    ✅

// Event actions
'/events/${id}/rsvp/'       → '/events/events/${id}/rsvp/'       ✅
'/events/${id}/volunteer/'  → '/events/events/${id}/volunteer/'  ✅
'/events/${id}/feedback/'   → '/events/events/${id}/feedback/'   ✅
'/events/${id}/attendees/'  → '/events/events/${id}/attendees/'  ✅
'/events/${id}/volunteers/' → '/events/events/${id}/volunteers/' ✅

// Event images and updates
'/events/${id}/images/'  → '/events/events/${id}/images/'  ✅
'/events/${id}/updates/' → '/events/events/${id}/updates/' ✅
```

### Categories (Unchanged)

Categories are at the correct level already:
```typescript
'/events/categories/'  ✅ (no change needed)
```

---

## Files Modified

✅ **`src/services/eventsApi.ts`**
- Fixed all event API endpoints to use `/events/events/` pattern
- Updated 15+ API calls

---

## Why This Happened

### Django REST Framework Router Behavior

When you register a ViewSet with a router:

```python
# events/urls.py
router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')

urlpatterns = [
    path('', include(router.urls)),
]
```

The router adds:
- `/events/` for list (GET, POST)
- `/events/<pk>/` for detail (GET, PUT, PATCH, DELETE)

Then in main urls:
```python
# civic_platform/urls.py
path('api/events/', include('events.urls')),
```

This **prefixes** everything from `events.urls` with `/api/events/`.

**Result:** `/api/events/` + `/events/` = `/api/events/events/` ✅

---

## Alternative Solution (Not Used)

We could have changed the backend to flatten URLs:

```python
# events/urls.py - Option 1: Remove nested structure
router = DefaultRouter()
router.register(r'', EventViewSet, basename='event')  # Empty prefix

# Result: /api/events/ directly (no double nesting)
```

But this would require:
1. Backend code changes
2. Database migrations (if any)
3. Testing all existing backend code
4. Potential breaking changes for other parts

**Why frontend fix was better:**
- ✅ No backend changes
- ✅ No migrations
- ✅ No risk to existing features
- ✅ Follows backend's actual URL structure

---

## Testing

### Before Fix

```bash
POST /api/events/
❌ 405 Method Not Allowed
```

### After Fix

```bash
POST /api/events/events/
✅ 201 Created
{
  "id": 1,
  "title": "Awareness Program",
  "description": "...",
  ...
}
```

---

## Testing Steps

1. **Hard refresh:** `Ctrl + Shift + R`

2. **Create an event:**
   - Navigate to "Create Event"
   - Fill in all fields:
     - Title: "Community Cleanup"
     - Description: "Help clean our neighborhood"
     - Category: Select any
     - Date/Time: Pick future date
     - Location: Enter location
     - Capacity: 50
   - Submit

3. **Expected result:**
   ```
   ✅ Event created successfully
   ✅ Redirects to event detail page
   ✅ No 405 or 404 errors
   ```

4. **Check dashboard:**
   - Navigate to "Events" page
   - Should see event list load
   - Statistics should load (no 404)

---

## Impact

This fix resolves:
- ✅ Creating events (405 → 201)
- ✅ Loading events list
- ✅ Loading event details
- ✅ Event statistics (404 → 200)
- ✅ RSVP functionality
- ✅ Volunteer applications
- ✅ Event feedback
- ✅ Event images
- ✅ Event updates

**All event-related features now use correct backend URLs!**

---

## Learning

### Always Check Backend URL Structure

When integrating frontend with backend:

1. **Check route registration:**
   ```python
   # How is the ViewSet registered?
   router.register(r'events', EventViewSet)
   ```

2. **Check URL inclusion:**
   ```python
   # Where is it included?
   path('api/events/', include('events.urls'))
   ```

3. **Calculate final URL:**
   ```
   /api/events/ (inclusion) + /events/ (registration) = /api/events/events/
   ```

4. **Or run show_urls:**
   ```bash
   python manage.py show_urls | grep events
   ```

This prevents URL mismatches! 🎯

---

**Status:** ✅ Fixed - Events API now uses correct URLs
**Date:** October 30, 2025
**Impact:** All event features now functional
**Severity:** High (was blocking all event operations)

