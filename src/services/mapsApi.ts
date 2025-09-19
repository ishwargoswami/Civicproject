import apiClient from './realApi';

export interface MapLayer {
  id: number;
  name: string;
  layer_type: 'issues' | 'events' | 'facilities' | 'districts' | 'projects' | 'custom';
  description: string;
  default_color: string;
  icon: string;
  is_active: boolean;
  is_public: boolean;
  default_visible: boolean;
  min_zoom: number;
  max_zoom: number;
  created_at: string;
  updated_at: string;
}

export interface PublicFacility {
  id: number;
  name: string;
  facility_type: 'hospital' | 'school' | 'library' | 'park' | 'police_station' | 'fire_station' | 'government_office' | 'community_center' | 'public_transport' | 'other';
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  hours: Record<string, string>;
  is_accessible: boolean;
  accessibility_features: string[];
  is_active: boolean;
  is_public: boolean;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
}

export interface District {
  id: number;
  name: string;
  code: string;
  district_type: 'ward' | 'district' | 'neighborhood' | 'zone';
  boundary_coordinates: [number, number][];
  population?: number;
  area_sq_km?: number;
  representative?: string;
  representative_contact?: string;
  description: string;
  is_active: boolean;
  population_density?: number;
  created_at: string;
  updated_at: string;
}

export interface IssueMapData {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  latitude: number;
  longitude: number;
  address: string;
  reporter_name: string;
  votes: number;
  views: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  created_at: string;
  updated_at: string;
}

export interface EventMapData {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_color: string;
  category_icon: string;
  location_name: string;
  address: string;
  latitude: number;
  longitude: number;
  is_online: boolean;
  meeting_link?: string;
  start_date: string;
  end_date: string;
  capacity: number;
  current_attendees: number;
  organizer_name: string;
  organization: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  available_spots: number;
  is_full: boolean;
  is_past: boolean;
  is_upcoming: boolean;
  is_ongoing: boolean;
  created_at: string;
  updated_at: string;
}

export interface MapData {
  issues: IssueMapData[];
  events: EventMapData[];
  facilities: PublicFacility[];
  districts: District[];
  layers: MapLayer[];
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapStatistics {
  total_issues: number;
  open_issues: number;
  total_events: number;
  upcoming_events: number;
  total_facilities: number;
  accessible_facilities: number;
  total_districts: number;
}

export interface MapFilters {
  // Geographic bounds
  north?: number;
  south?: number;
  east?: number;
  west?: number;
  
  // Layer filters
  layers?: string[];
  
  // Issue filters
  issue_status?: string[];
  issue_priority?: string[];
  issue_categories?: number[];
  
  // Event filters
  event_status?: 'upcoming' | 'ongoing' | 'past' | 'all';
  event_categories?: number[];
  
  // Facility filters
  facility_types?: string[];
  
  // Date range
  date_from?: string;
  date_to?: string;
  
  // Search
  search?: string;
  
  // Clustering
  enable_clustering?: boolean;
  cluster_distance?: number;
}

export const mapsAPI = {
  // Get all map data with optional filters
  getMapData: (filters?: MapFilters) => {
    if (filters && Object.keys(filters).length > 0) {
      return apiClient.post('/maps/data/', filters);
    }
    return apiClient.get('/maps/data/');
  },

  // Get map layers
  getLayers: () => apiClient.get('/maps/layers/'),

  // Get public facilities
  getFacilities: (params?: { facility_type?: string[]; accessible_only?: boolean }) => 
    apiClient.get('/maps/facilities/', { params }),

  // Get facility types
  getFacilityTypes: () => apiClient.get('/maps/facilities/types/'),

  // Get districts
  getDistricts: (params?: { district_type?: string[] }) => 
    apiClient.get('/maps/districts/', { params }),

  // Get district types
  getDistrictTypes: () => apiClient.get('/maps/districts/types/'),

  // Get map statistics
  getStatistics: () => apiClient.get('/maps/statistics/'),

  // Get geographic bounds
  getBounds: () => apiClient.get('/maps/bounds/'),

  // CRUD operations for facilities (admin only)
  createFacility: (facilityData: Partial<PublicFacility>) => 
    apiClient.post('/maps/facilities/', facilityData),

  updateFacility: (id: number, facilityData: Partial<PublicFacility>) => 
    apiClient.patch(`/maps/facilities/${id}/`, facilityData),

  deleteFacility: (id: number) => 
    apiClient.delete(`/maps/facilities/${id}/`),

  // CRUD operations for districts (admin only)
  createDistrict: (districtData: Partial<District>) => 
    apiClient.post('/maps/districts/', districtData),

  updateDistrict: (id: number, districtData: Partial<District>) => 
    apiClient.patch(`/maps/districts/${id}/`, districtData),

  deleteDistrict: (id: number) => 
    apiClient.delete(`/maps/districts/${id}/`),
};
