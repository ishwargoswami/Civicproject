import apiClient from './realApi';
import {
  UserProfile,
  UserProfileUpdate,
  ExtendedProfile,
  NotificationPreferences,
  PasswordChange,
} from '../types/settings';

/**
 * API service for user settings and profile management
 */

// Profile Management
export const getProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/auth/profile/');
  return response.data;
};

export const updateProfile = async (data: UserProfileUpdate): Promise<UserProfile> => {
  // Check if we're uploading an avatar
  const hasAvatar = data.avatar instanceof File;
  
  if (hasAvatar) {
    // Use FormData for avatar upload
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'avatar' && value instanceof File) {
          formData.append(key, value);
        } else if (typeof value === 'boolean') {
          formData.append(key, value.toString());
        } else if (value !== '') {
          formData.append(key, value as string);
        }
      }
    });
    
    const response = await apiClient.patch('/auth/profile/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } else {
    // Use JSON for regular updates (no avatar)
    const jsonData: any = {};
    
    // Fields that should send null instead of empty string when cleared
    const nullableFields = ['phone_number', 'address', 'bio'];
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'avatar') return; // Skip avatar
      
      if (value === undefined) return; // Skip undefined
      
      // Handle strings
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed === '') {
          // Send null for nullable fields, skip others
          if (nullableFields.includes(key)) {
            jsonData[key] = null;
          }
        } else {
          jsonData[key] = value;
        }
      } else {
        // For booleans and other types, always include
        jsonData[key] = value;
      }
    });
    
    console.log('📤 Sending profile update:', jsonData);
    
    try {
      const response = await apiClient.patch('/auth/profile/', jsonData);
      return response.data;
    } catch (error: any) {
      console.error('❌ Profile update error:', error.response?.data);
      throw error;
    }
  }
};

// Extended Profile
export const getExtendedProfile = async (): Promise<ExtendedProfile> => {
  const response = await apiClient.get('/auth/profile/extended/');
  return response.data;
};

export const updateExtendedProfile = async (data: Partial<ExtendedProfile>): Promise<ExtendedProfile> => {
  const response = await apiClient.patch('/auth/profile/extended/', data);
  return response.data;
};

// Notification Preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  const response = await apiClient.get('/auth/notifications/preferences/');
  return response.data;
};

export const updateNotificationPreferences = async (
  data: Partial<NotificationPreferences>
): Promise<NotificationPreferences> => {
  const response = await apiClient.patch('/auth/notifications/preferences/', data);
  return response.data;
};

// Password Management
export const changePassword = async (data: PasswordChange): Promise<{ message: string }> => {
  console.log('🔐 Changing password:', { ...data, current_password: '***', new_password: '***', new_password_confirm: '***' });
  
  try {
    const response = await apiClient.post('/auth/password/change/', data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Password change error:', error.response?.data);
    throw error;
  }
};

// Avatar Management
export const uploadAvatar = async (file: File): Promise<{ avatar: string }> => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await apiClient.patch('/auth/profile/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAvatar = async (): Promise<void> => {
  await apiClient.patch('/auth/profile/', { avatar: null });
};

// Combined Settings API
export const settingsAPI = {
  profile: {
    get: getProfile,
    update: updateProfile,
    uploadAvatar,
    deleteAvatar,
  },
  extendedProfile: {
    get: getExtendedProfile,
    update: updateExtendedProfile,
  },
  notifications: {
    get: getNotificationPreferences,
    update: updateNotificationPreferences,
  },
  security: {
    changePassword,
  },
};

export default settingsAPI;

