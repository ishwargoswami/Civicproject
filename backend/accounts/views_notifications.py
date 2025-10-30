"""Views for notification preferences"""
from rest_framework import permissions
from rest_framework.generics import RetrieveUpdateAPIView
from .models import UserActivity
from .notification_models import NotificationPreference
from .serializers import NotificationPreferenceSerializer


class NotificationPreferenceView(RetrieveUpdateAPIView):
    """Get and update notification preferences"""
    
    serializer_class = NotificationPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        # Get or create notification preferences for the user
        preference, created = NotificationPreference.objects.get_or_create(user=self.request.user)
        return preference
    
    def perform_update(self, serializer):
        serializer.save()
        
        # Log activity
        try:
            UserActivity.objects.create(
                user=self.request.user,
                activity_type='profile_updated',
                description='User updated notification preferences'
            )
        except:
            pass

