import axios from 'axios';

// Base API configuration
// Force localhost for API - backend only runs on computer
const API_BASE_URL = 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only handle 401 errors that are not from login/register endpoints
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/login/') && 
        !error.config?.url?.includes('/auth/register/')) {
      
      // Try to refresh token first
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !error.config?._retry) {
        error.config._retry = true;
        
        return apiClient.post('/auth/token/refresh/', { refresh: refreshToken })
          .then(response => {
            const newToken = response.data.access;
            localStorage.setItem('token', newToken);
            
            // Retry the original request with new token
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return apiClient(error.config);
          })
          .catch(refreshError => {
            // Refresh failed, clear tokens and redirect
            console.log('Token refresh failed:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            return Promise.reject(refreshError);
          });
      } else {
        // No refresh token or refresh already tried, clear and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Real Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    console.log('🔵 Login attempt with:', { email: credentials.email, hasPassword: !!credentials.password });
    return apiClient.post('/auth/login/', credentials);
  },

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'citizen' | 'official';
  }) => {
    // Transform frontend data to match Django backend
    const backendData = {
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      username: userData.email.split('@')[0], // Use email prefix as username
      role: userData.role,
    };
    return apiClient.post('/auth/register/', backendData);
  },

  getCurrentUser: () => {
    return apiClient.get('/auth/me/');
  },

  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiClient.post('/auth/logout/', { refresh: refreshToken });
  },

  refreshToken: (refreshToken: string) => {
    return apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
  },

  // OTP Verification
  sendOTP: (data: { email: string; purpose: 'registration' | 'login' | 'password_reset' }) => {
    return apiClient.post('/auth/otp/send/', data);
  },

  verifyOTP: (data: { email: string; otp_code: string; purpose: string }) => {
    return apiClient.post('/auth/otp/verify/', data);
  },

  changePassword: (currentPassword: string, newPassword: string) => {
    return apiClient.post('/auth/change-password/', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

// Real Issues API
export const issuesAPI = {
  // Get all issues with filtering
  getIssues: (params?: {
    page?: number;
    category?: string;
    status?: string;
    priority?: string;
    search?: string;
    lat?: number;
    lng?: number;
    radius?: number;
    location?: string;
    limit?: number;
  }) => {
    // Filter out 'all' values and undefined/null values
    const cleanParams: Record<string, any> = {};
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== 'all') {
          cleanParams[key] = value;
        }
      });
    }
    
    return apiClient.get('/issues/', { params: cleanParams });
  },

  // Get issue categories
  getCategories: () => {
    return apiClient.get('/issues/categories/');
  },

  // Get single issue by ID
  getIssueById: (issueId: string) => {
    return apiClient.get(`/issues/${issueId}/`);
  },

  // Create new issue
  createIssue: (issueData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    images: File[];
  }) => {
    // Map frontend category names to backend category IDs
    const categoryMap: { [key: string]: number } = {
      'infrastructure': 1,
      'environment': 2,
      'safety': 3,
      'transportation': 4,
      'utilities': 5,
      'other': 6
    };
    
    // Create FormData for multipart upload
    const formData = new FormData();
    formData.append('title', issueData.title);
    formData.append('description', issueData.description);
    formData.append('category', String(categoryMap[issueData.category] || 6));
    formData.append('priority', issueData.priority);
    
    // Only include latitude/longitude if they're not 0 (user got location)
    if (issueData.location.latitude !== 0 && issueData.location.longitude !== 0) {
      formData.append('latitude', String(issueData.location.latitude));
      formData.append('longitude', String(issueData.location.longitude));
    }
    
    formData.append('address', issueData.location.address);
    
    // Don't send tags if empty - let backend use default
    // Sending JSON string in FormData can cause parsing issues
    
    // Add images to FormData (multiple files with same key)
    issueData.images.forEach((image) => {
      formData.append('images', image);
    });
    
    return apiClient.post('/issues/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update issue (for officials/admins)
  updateIssue: (issueId: string, updateData: {
    status?: string;
    priority?: string;
    assigned_to?: string;
  }) => {
    return apiClient.patch(`/issues/${issueId}/`, updateData);
  },

  // Vote on issue
  voteOnIssue: (issueId: string) => {
    return apiClient.post(`/issues/${issueId}/vote/`);
  },

  // Subscribe to issue updates
  subscribeToIssue: (issueId: string) => {
    return apiClient.post(`/issues/${issueId}/subscribe/`);
  },

  // Get issue comments
  getIssueComments: (issueId: string) => {
    return apiClient.get(`/issues/${issueId}/comments/`);
  },

  // Add comment to issue
  addComment: (issueId: string, content: string, parentId?: string) => {
    return apiClient.post(`/issues/${issueId}/add_comment/`, {
      content,
      parent: parentId,
    });
  },

  // Get issue timeline
  getIssueTimeline: (issueId: string) => {
    return apiClient.get(`/issues/${issueId}/timeline/`);
  },

  // Update issue status (for officials)
  updateStatus: (issueId: string, status: string) => {
    return apiClient.post(`/issues/${issueId}/update_status/`, { status });
  },

  // Get issue statistics
  getStats: () => {
    return apiClient.get('/issues/stats/');
  },
};

// Real Forum API (placeholder - to be implemented)
export const forumAPI = {
  getPosts: (params?: any) => {
    return apiClient.get('/forum/', { params });
  },
  
  createPost: (postData: any) => {
    return apiClient.post('/forum/', postData);
  },
  
  getPostById: (postId: string) => {
    return apiClient.get(`/forum/${postId}/`);
  },
};

// Real Events API (placeholder - to be implemented)
export const eventsAPI = {
  getEvents: (params?: any) => {
    return apiClient.get('/events/', { params });
  },
  
  createEvent: (eventData: any) => {
    return apiClient.post('/events/', eventData);
  },
  
  getEventById: (eventId: string) => {
    return apiClient.get(`/events/${eventId}/`);
  },
};

export default apiClient;
