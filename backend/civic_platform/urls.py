"""
URL configuration for civic_platform project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework.routers import DefaultRouter

# API Router
router = DefaultRouter()

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include(router.urls)),
    path('api/auth/', include('accounts.urls')),
    path('api/issues/', include('issues.urls')),
    path('api/forum/', include('forum.urls')),
    path('api/events/', include('events.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/transparency/', include('transparency.urls')),
    path('api/maps/', include('maps.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    
    # JWT Token refresh
    path('api/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
