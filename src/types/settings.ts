// Types for Settings/Profile Management

export interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'citizen' | 'official' | 'admin';
  avatar: string | null;
  phone_number: string | null;
  address: string;
  bio: string;
  department_name: string;
  position: string;
  is_verified: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  is_citizen: boolean;
  is_official: boolean;
  is_platform_admin: boolean;
  date_joined: string;
  last_active: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpdate {
  first_name?: string;
  last_name?: string;
  avatar?: File | null;
  phone_number?: string;
  address?: string;
  bio?: string;
  email_notifications?: boolean;
  sms_notifications?: boolean;
}

export interface ExtendedProfile {
  website: string;
  twitter: string;
  linkedin: string;
  github: string;
  timezone: string;
  language: string;
  theme: string;
  issues_reported: number;
  issues_resolved: number;
  forum_posts: number;
  events_attended: number;
  community_score: number;
  show_email: boolean;
  show_phone: boolean;
  show_address: boolean;
}

export interface NotificationPreferences {
  // Email Notifications
  email_enabled: boolean;
  email_issue_updates: boolean;
  email_event_reminders: boolean;
  email_forum_replies: boolean;
  email_system_updates: boolean;
  email_weekly_digest: boolean;
  
  // WhatsApp Notifications
  whatsapp_enabled: boolean;
  whatsapp_verified: boolean;
  whatsapp_issue_updates: boolean;
  whatsapp_event_reminders: boolean;
  whatsapp_system_alerts: boolean;
  
  // Push Notifications
  push_enabled: boolean;
  push_issue_updates: boolean;
  push_event_reminders: boolean;
  push_forum_replies: boolean;
  
  // SMS Notifications
  sms_enabled: boolean;
  sms_critical_only: boolean;
  
  // Settings
  digest_frequency: 'daily' | 'weekly' | 'monthly';
  quiet_hours_enabled: boolean;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
  
  created_at: string;
  updated_at: string;
}

export interface PasswordChange {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface PrivacySettings {
  show_email: boolean;
  show_phone: boolean;
  show_address: boolean;
}

export interface LanguageSettings {
  language: string;
  timezone: string;
  theme: string;
}

