from django.contrib import admin
from .models import MapLayer, PublicFacility, District


@admin.register(MapLayer)
class MapLayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'layer_type', 'is_active', 'is_public', 'default_visible', 'created_at']
    list_filter = ['layer_type', 'is_active', 'is_public', 'default_visible', 'created_at']
    search_fields = ['name', 'description']


@admin.register(PublicFacility)
class PublicFacilityAdmin(admin.ModelAdmin):
    list_display = ['name', 'facility_type', 'address', 'latitude', 'longitude', 'is_accessible', 'is_active', 'created_at']
    list_filter = ['facility_type', 'is_accessible', 'is_active', 'is_public', 'created_at']
    search_fields = ['name', 'description', 'address']


@admin.register(District)
class DistrictAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'district_type', 'population', 'area_sq_km', 'representative', 'is_active', 'created_at']
    list_filter = ['district_type', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description', 'representative']

