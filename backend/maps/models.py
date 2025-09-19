from django.db import models


class MapLayer(models.Model):
    """Map layers for different data types"""
    
    LAYER_TYPES = [
        ('issues', 'Issues'),
        ('events', 'Events'),
        ('projects', 'Projects'),
        ('facilities', 'Public Facilities'),
        ('districts', 'Districts'),
        ('custom', 'Custom'),
    ]
    
    name = models.CharField(max_length=200)
    layer_type = models.CharField(max_length=50, choices=LAYER_TYPES)
    description = models.TextField(blank=True)
    
    # Styling
    default_color = models.CharField(max_length=7, default='#3B82F6')
    icon = models.CharField(max_length=50, blank=True)
    
    # Visibility
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    default_visible = models.BooleanField(default=True)
    
    # Zoom levels
    min_zoom = models.PositiveIntegerField(default=0)
    max_zoom = models.PositiveIntegerField(default=18)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'map_layers'
        verbose_name = 'Map Layer'
        verbose_name_plural = 'Map Layers'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class PublicFacility(models.Model):
    """Public facilities and services"""
    
    FACILITY_TYPES = [
        ('hospital', 'Hospital'),
        ('school', 'School'),
        ('library', 'Library'),
        ('park', 'Park'),
        ('police_station', 'Police Station'),
        ('fire_station', 'Fire Station'),
        ('government_office', 'Government Office'),
        ('community_center', 'Community Center'),
        ('public_transport', 'Public Transport'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=200)
    facility_type = models.CharField(max_length=50, choices=FACILITY_TYPES)
    description = models.TextField(blank=True)
    
    # Location (simplified for SQLite compatibility)
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    address = models.CharField(max_length=500)
    
    # Contact Information
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    website = models.URLField(blank=True)
    
    # Hours
    hours = models.JSONField(default=dict, blank=True)  # Store operating hours
    
    # Accessibility
    is_accessible = models.BooleanField(default=False)
    accessibility_features = models.JSONField(default=list, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_public = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'public_facilities'
        verbose_name = 'Public Facility'
        verbose_name_plural = 'Public Facilities'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def coordinates(self):
        return {
            'latitude': float(self.latitude),
            'longitude': float(self.longitude)
        }


class District(models.Model):
    """Administrative districts and boundaries"""
    
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True)
    district_type = models.CharField(
        max_length=50,
        choices=[
            ('ward', 'Ward'),
            ('district', 'District'),
            ('neighborhood', 'Neighborhood'),
            ('zone', 'Zone'),
        ],
        default='district'
    )
    
    # Simplified boundary representation (for SQLite compatibility)
    # Store as JSON with coordinate pairs for polygon boundary
    boundary_coordinates = models.JSONField(default=list, blank=True, help_text="Array of [lat, lng] coordinate pairs defining the boundary")
    
    # Demographics
    population = models.PositiveIntegerField(null=True, blank=True)
    area_sq_km = models.FloatField(null=True, blank=True)
    
    # Representative
    representative = models.CharField(max_length=200, blank=True)
    representative_contact = models.TextField(blank=True)
    
    # Metadata
    description = models.TextField(blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'districts'
        verbose_name = 'District'
        verbose_name_plural = 'Districts'
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def population_density(self):
        if self.population and self.area_sq_km:
            return round(self.population / self.area_sq_km, 2)
        return None
