from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MapLayerViewSet, PublicFacilityViewSet, DistrictViewSet, MapDataViewSet

# Create router and register viewsets
router = DefaultRouter()
router.register(r'layers', MapLayerViewSet, basename='maplayer')
router.register(r'facilities', PublicFacilityViewSet, basename='publicfacility')
router.register(r'districts', DistrictViewSet, basename='district')
router.register(r'', MapDataViewSet, basename='mapdata')

urlpatterns = [
    path('', include(router.urls)),
]
