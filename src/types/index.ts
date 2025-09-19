// Re-export all types from store slices for easy importing
export type { User } from '../store/slices/authSlice';
export type { Issue, TimelineEvent, IssueComment } from '../store/slices/issuesSlice';
export type { ForumPost, PollOption, ForumComment } from '../store/slices/forumSlice';
export type { Event, EventAttendee } from '../store/slices/eventsSlice';
export type { Notification } from '../store/slices/notificationsSlice';

// Common utility types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface FilterOptions {
  [key: string]: string | number | boolean;
}
