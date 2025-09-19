from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers

from .views import (
    EventViewSet, EventCategoryViewSet, 
    EventImageViewSet, EventUpdateViewSet
)

# Main router
router = DefaultRouter()
router.register(r'events', EventViewSet, basename='event')
router.register(r'categories', EventCategoryViewSet, basename='eventcategory')

# Nested routers for event-related resources
events_router = routers.NestedDefaultRouter(router, r'events', lookup='event')
events_router.register(r'images', EventImageViewSet, basename='event-images')
events_router.register(r'updates', EventUpdateViewSet, basename='event-updates')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(events_router.urls)),
]
