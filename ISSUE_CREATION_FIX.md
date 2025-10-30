# 🐛 Issue Creation - 400 Bad Request Fix

## Problem
When trying to create an issue via the "Create Issue" form, you get:
```
POST http://localhost:8000/api/issues/ 400 (Bad Request)
```

## Root Cause Analysis

The 400 error when creating issues was likely caused by:

1. **Tags Field JSON Parsing Issue** ❌
   - Frontend was sending `tags` as `JSON.stringify([])` 
   - Django Rest Framework with FormData doesn't parse JSON strings correctly
   - Backend expects native array or omit the field to use default

2. **Empty Latitude/Longitude** ⚠️
   - If user doesn't get location, coordinates are (0, 0)
   - While backend allows `null=True`, sending 0 values might fail validation

## Changes Made

### 1. Fixed `src/services/realApi.ts`

**Before:**
```typescript
formData.append('tags', JSON.stringify([]));  // ❌ Causes parsing errors
formData.append('latitude', String(issueData.location.latitude));  // Sends 0 if no location
formData.append('longitude', String(issueData.location.longitude));
```

**After:**
```typescript
// Don't send tags - let backend use default (empty array)
// Only send latitude/longitude if user actually got their location
if (issueData.location.latitude !== 0 && issueData.location.longitude !== 0) {
  formData.append('latitude', String(issueData.location.latitude));
  formData.append('longitude', String(issueData.location.longitude));
}
```

### 2. Improved Error Logging

**Updated `src/store/slices/issuesSlice.ts`:**
```typescript
catch (error: any) {
  // Now logs full error details for debugging
  console.error('Create issue error:', error.response?.data);
  return rejectWithValue(
    error.response?.data?.message || 
    error.response?.data?.detail ||
    JSON.stringify(error.response?.data) || 
    'Failed to create issue'
  );
}
```

## Verified Backend State

✅ **Categories exist in database:**
```
1: Infrastructure
2: Environment
3: Safety
4: Transportation
5: Utilities
6: Other
```

✅ **Category mapping is correct** in frontend

✅ **Backend serializer expects:**
- title (required)
- description (required)
- category (required, integer ID)
- priority (required)
- latitude (optional)
- longitude (optional)
- address (required)
- tags (optional, defaults to empty array)
- images (optional, list of files)

## Testing Steps

### 1. Test Issue Creation WITH Location

```bash
# Make sure both servers are running
cd backend
python manage.py runserver

# In another terminal
npm run dev
```

1. Navigate to `http://localhost:5173/dashboard/create-issue`
2. Fill in the form:
   - Title: "Test Issue with Location"
   - Description: "Testing issue creation"
   - Category: "Infrastructure"
   - Priority: "Medium"
3. **Click "Use My Location"** (important!)
4. Wait for location to be fetched
5. Fill in or edit the address
6. Optionally add images
7. Click "Submit Issue"
8. **Check browser console for any error details**

### 2. Test Issue Creation WITHOUT Location

1. Fill in the form
2. **Don't click "Use My Location"**
3. Manually type an address (e.g., "123 Main St, City")
4. Submit
5. This should work now (latitude/longitude will be null in database)

### 3. Check Backend Logs

If you still get 400 errors, check the Django terminal for detailed validation errors:

```python
# You should see logs like:
# "POST /api/issues/ HTTP/1.1" 400
# And potentially validation error details
```

### 4. Debug with Better Error Messages

Now when you get a 400 error, check the browser console for:
```
Create issue error: {field_name: ["Error message"]}
```

This will tell you exactly which field is failing validation.

## Common Issues & Solutions

### Issue: "category: This field is required"
**Solution:** Category mapping might be wrong
- Check that categories exist in database
- Verify the category ID being sent

### Issue: "latitude/longitude: Invalid value"
**Solution:** 
- Make sure you clicked "Use My Location"
- Or manually type an address and don't send coordinates

### Issue: "images: Invalid image file"
**Solution:**
- Check file size (max 10MB)
- Check file type (should be image)
- Verify file is not corrupted

### Issue: "reported_by: This field is required"
**Solution:** Authentication issue
- Make sure you're logged in
- Check JWT token is valid
- Backend should auto-set this from request.user

## API Request Format

When creating an issue, the frontend sends FormData like this:

```
title: "Broken streetlight"
description: "The light has been out for days"
category: "1" (string number)
priority: "medium"
latitude: "40.7128" (only if location obtained)
longitude: "-74.0060" (only if location obtained)
address: "Main St & 1st Ave"
images: [File, File, ...] (multiple files with same key)
```

**Note:** No `tags` field is sent - backend uses default empty array

## Backend Validation

The backend `IssueCreateSerializer` will:

1. ✅ Validate all required fields present
2. ✅ Check category exists (ForeignKey validation)
3. ✅ Validate priority is in choices: `['low', 'medium', 'high', 'critical']`
4. ✅ Validate latitude/longitude are valid decimals (if provided)
5. ✅ Create timeline entry automatically
6. ✅ Subscribe reporter to issue updates
7. ✅ Set `reported_by` from authenticated user

## Files Modified

1. ✅ `src/services/realApi.ts` - Fixed tags and coordinates handling
2. ✅ `src/store/slices/issuesSlice.ts` - Improved error logging

## What to Check If Still Failing

1. **Check browser console** for the error object:
   ```javascript
   Create issue error: {...}
   ```

2. **Check Django terminal** for validation errors

3. **Verify authentication:**
   ```javascript
   // In browser console
   localStorage.getItem('token')
   // Should return a JWT token
   ```

4. **Test API directly with curl:**
   ```bash
   curl -X POST http://localhost:8000/api/issues/ \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "title=Test Issue" \
     -F "description=Test Description" \
     -F "category=1" \
     -F "priority=medium" \
     -F "address=123 Main St"
   ```

5. **Check backend database:**
   ```bash
   cd backend
   python manage.py shell
   ```
   ```python
   from issues.models import IssueCategory
   print(IssueCategory.objects.all())
   ```

## Next Steps

After testing:

1. If it works: ✅ Great! You can now create issues
2. If it still fails:
   - Copy the full error from browser console
   - Copy the Django terminal output
   - Check which field is causing validation error
   - We can fix the specific validation issue

---

**Status:** ✅ Fixes applied, ready for testing
**Date:** October 30, 2025

