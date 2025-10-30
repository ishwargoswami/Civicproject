import apiClient from './realApi';

// Types
export interface EventCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  is_active: boolean;
  events_count: number;
  created_at: string;
}

export interface EventImage {
  id: number;
  image: string;
  caption: string;
  is_featured: boolean;
  uploaded_by_name: string;
  created_at: string;
}

export interface EventRSVP {
  id: number;
  status: 'attending' | 'maybe' | 'not_attending' | 'waitlist';
  guests: number;
  dietary_restrictions: string;
  special_needs: string;
  notes: string;
  is_approved: boolean;
  approved_by_name: string;
  approved_at: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar: string;
  total_attendees: number;
}

export interface EventVolunteer {
  id: number;
  role: string;
  description: string;
  hours_committed: number;
  skills_needed: string[];
  is_confirmed: boolean;
  confirmed_by_name: string;
  checked_in: boolean;
  check_in_time: string;
  check_out_time: string;
  created_at: string;
  updated_at: string;
  user_name: string;
  user_avatar: string;
  hours_worked: number;
}

export interface EventFeedback {
  id: number;
  overall_rating: number;
  organization_rating: number;
  content_rating: number;
  venue_rating: number;
  comments: string;
  suggestions: string;
  would_recommend: boolean;
  would_attend_again: boolean;
  is_anonymous: boolean;
  created_at: string;
  user_name: string;
  user_avatar: string;
}

export interface EventUpdate {
  id: number;
  title: string;
  content: string;
  update_type: 'general' | 'schedule_change' | 'location_change' | 'cancellation' | 'reminder' | 'important';
  author_name: string;
  notify_attendees: boolean;
  notify_volunteers: boolean;
  is_urgent: boolean;
  created_at: string;
}

export interface EventCoordinates {
  latitude: number;
  longitude: number;
}

export interface EventListItem {
  id: string;
  title: string;
  description: string;
  category_name: string;
  category_color: string;
  organizer_name: string;
  location_name: string;
  address: string;
  coordinates: EventCoordinates | null;
  is_online: boolean;
  start_date: string;
  end_date: string;
  capacity: number;
  current_attendees: number;
  attendees_count: number;
  is_featured: boolean;
  is_public: boolean;
  tags: string[];
  featured_image: EventImage | null;
  is_full: boolean;
  available_spots: number;
  is_past: boolean;
  is_upcoming: boolean;
  is_ongoing: boolean;
  created_at: string;
}

export interface EventDetail extends EventListItem {
  category: EventCategory;
  organizer_avatar: string;
  organization: string;
  meeting_link: string;
  registration_deadline: string;
  volunteers_needed: number;
  current_volunteers: number;
  requirements: string[];
  age_restriction: number | null;
  requires_approval: boolean;
  allow_waitlist: boolean;
  external_url: string;
  updated_at: string;
  images: EventImage[];
  rsvps: EventRSVP[];
  volunteers: EventVolunteer[];
  feedback: EventFeedback[];
  updates: EventUpdate[];
  volunteers_still_needed: number;
  maybe_count: number;
  volunteers_count: number;
  average_rating: number | null;
  user_rsvp: EventRSVP | null;
  user_volunteer: EventVolunteer | null;
  can_edit: boolean;
}

export interface EventCreateData {
  title: string;
  description: string;
  category: number;
  organization?: string;
  location_name: string;
  address: string;
  latitude?: number;
  longitude?: number;
  is_online: boolean;
  meeting_link?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  capacity: number;
  volunteers_needed: number;
  requirements: string[];
  age_restriction?: number;
  requires_approval: boolean;
  is_featured: boolean;
  is_public: boolean;
  allow_waitlist: boolean;
  tags: string[];
  external_url?: string;
}

export interface RSVPData {
  status: 'attending' | 'maybe' | 'not_attending';
  guests?: number;
  dietary_restrictions?: string;
  special_needs?: string;
  notes?: string;
}

export interface VolunteerData {
  role?: string;
  description?: string;
  hours_committed: number;
  skills_needed: string[];
}

export interface FeedbackData {
  overall_rating: number;
  organization_rating?: number;
  content_rating?: number;
  venue_rating?: number;
  comments?: string;
  suggestions?: string;
  would_recommend?: boolean;
  would_attend_again?: boolean;
  is_anonymous: boolean;
}

export interface EventFilters {
  category?: string;
  status?: 'upcoming' | 'ongoing' | 'past' | 'featured';
  is_online?: boolean;
  is_featured?: boolean;
  start_date_after?: string;
  start_date_before?: string;
  bounds?: string; // "north,south,east,west"
  search?: string;
  ordering?: string;
}

export interface EventStatistics {
  total_events: number;
  upcoming_events: number;
  ongoing_events: number;
  past_events: number;
  total_attendees: number;
  total_volunteers: number;
  categories: {
    name: string;
    color: string;
    count: number;
  }[];
}

// API Functions
export const getEvents = async (filters?: EventFilters): Promise<EventListItem[]> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await apiClient.get(`/events/events/?${params.toString()}`);
  return response.data.results || response.data;
};

export const getEvent = async (id: string): Promise<EventDetail> => {
  const response = await apiClient.get(`/events/events/${id}/`);
  return response.data;
};

export const createEvent = async (eventData: EventCreateData): Promise<EventDetail> => {
  const response = await apiClient.post('/events/events/', eventData);
  return response.data;
};

export const updateEvent = async (id: string, eventData: Partial<EventCreateData>): Promise<EventDetail> => {
  const response = await apiClient.patch(`/events/events/${id}/`, eventData);
  return response.data;
};

export const deleteEvent = async (id: string): Promise<void> => {
  await apiClient.delete(`/events/events/${id}/`);
};

export const getMyEvents = async (): Promise<EventListItem[]> => {
  const response = await apiClient.get('/events/events/my_events/');
  return response.data.results || response.data;
};

export const getMyRSVPs = async (): Promise<EventListItem[]> => {
  const response = await apiClient.get('/events/events/my_rsvps/');
  return response.data.results || response.data;
};

export const rsvpToEvent = async (eventId: string, rsvpData: RSVPData): Promise<EventDetail> => {
  const response = await apiClient.post(`/events/events/${eventId}/rsvp/`, rsvpData);
  return response.data;
};

export const updateRSVP = async (eventId: string, rsvpData: RSVPData): Promise<EventDetail> => {
  const response = await apiClient.put(`/events/events/${eventId}/rsvp/`, rsvpData);
  return response.data;
};

export const cancelRSVP = async (eventId: string): Promise<void> => {
  await apiClient.delete(`/events/events/${eventId}/rsvp/`);
};

export const volunteerForEvent = async (eventId: string, volunteerData: VolunteerData): Promise<EventDetail> => {
  const response = await apiClient.post(`/events/events/${eventId}/volunteer/`, volunteerData);
  return response.data;
};

export const updateVolunteerApplication = async (eventId: string, volunteerData: VolunteerData): Promise<EventDetail> => {
  const response = await apiClient.put(`/events/events/${eventId}/volunteer/`, volunteerData);
  return response.data;
};

export const cancelVolunteerApplication = async (eventId: string): Promise<void> => {
  await apiClient.delete(`/events/events/${eventId}/volunteer/`);
};

export const submitEventFeedback = async (eventId: string, feedbackData: FeedbackData): Promise<EventFeedback> => {
  const response = await apiClient.post(`/events/events/${eventId}/feedback/`, feedbackData);
  return response.data;
};

export const getEventAttendees = async (eventId: string): Promise<EventRSVP[]> => {
  const response = await apiClient.get(`/events/events/${eventId}/attendees/`);
  return response.data;
};

export const getEventVolunteers = async (eventId: string): Promise<EventVolunteer[]> => {
  const response = await apiClient.get(`/events/events/${eventId}/volunteers/`);
  return response.data;
};

export const getEventCategories = async (): Promise<EventCategory[]> => {
  const response = await apiClient.get('/events/categories/');
  return response.data.results || response.data;
};

export const getEventStatistics = async (): Promise<EventStatistics> => {
  const response = await apiClient.get('/events/events/statistics/');
  return response.data;
};

export const uploadEventImage = async (eventId: string, imageData: FormData): Promise<EventImage> => {
  const response = await apiClient.post(`/events/events/${eventId}/images/`, imageData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const createEventUpdate = async (eventId: string, updateData: {
  title: string;
  content: string;
  update_type: EventUpdate['update_type'];
  notify_attendees: boolean;
  notify_volunteers: boolean;
  is_urgent: boolean;
}): Promise<EventUpdate> => {
  const response = await apiClient.post(`/events/events/${eventId}/updates/`, updateData);
  return response.data;
};
