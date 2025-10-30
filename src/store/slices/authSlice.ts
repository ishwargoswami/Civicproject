import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/realApi';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'citizen' | 'official' | 'admin';
  avatar?: string;
  is_verified: boolean;
  full_name?: string;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  otpSent: boolean;
  otpVerified: boolean;
  pendingEmail: string | null;
  pendingPurpose: string | null;
  registrationStep: 'form' | 'otp' | 'complete';
  pendingRegistrationData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'citizen' | 'official';
  } | null;
}

const initialState: AuthState = {
  // Mock user for testing - remove this in production
  user: {
    id: '1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'citizen',
    is_verified: true,
    full_name: 'Test User'
  },
  token: localStorage.getItem('token') || 'mock-token',
  isLoading: false,
  error: null,
  isAuthenticated: true, // Mock authentication for testing
  otpSent: false,
  otpVerified: false,
  pendingEmail: null,
  pendingPurpose: null,
  registrationStep: 'form',
  pendingRegistrationData: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.login(credentials);
      console.log('Login response data:', response.data); // Debug log
      
      localStorage.setItem('token', response.data.token);
      console.log('Token saved to localStorage:', response.data.token); // Debug log
      
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
        console.log('Refresh token saved:', response.data.refresh); // Debug log
      }
      
      // Verify token was actually saved
      const savedToken = localStorage.getItem('token');
      console.log('Token verification - saved:', !!savedToken); // Debug log
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

// Helper function to get role-based dashboard route
export const getRoleDashboardRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/dashboard/admin';
    case 'official':
      return '/dashboard/official';
    case 'citizen':
    default:
      return '/dashboard';
  }
};

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'citizen' | 'official';
  }, { rejectWithValue }) => {
    try {
      console.log('📤 Registering user:', { email: userData.email, role: userData.role });
      const response = await authAPI.register(userData);
      console.log('✅ Registration successful:', response.data);
      localStorage.setItem('token', response.data.token);
      if (response.data.refresh) {
        localStorage.setItem('refreshToken', response.data.refresh);
      }
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) ||
        'Registration failed'
      );
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get user');
    }
  }
);

export const sendOTP = createAsyncThunk(
  'auth/sendOTP',
  async (data: { email: string; purpose: 'registration' | 'login' | 'password_reset' }, { rejectWithValue }) => {
    try {
      const response = await authAPI.sendOTP(data);
      // Return both the response and the email for state preservation
      return { ...response.data, email: data.email, purpose: data.purpose };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async (data: { email: string; otp_code: string; purpose: string }, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyOTP(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('token', action.payload);
    },
    clearOTPState: (state) => {
      state.otpSent = false;
      state.otpVerified = false;
      state.pendingEmail = null;
      state.pendingPurpose = null;
      state.registrationStep = 'form';
      state.pendingRegistrationData = null;
    },
    setRegistrationStep: (state, action: PayloadAction<'form' | 'otp' | 'complete'>) => {
      state.registrationStep = action.payload;
    },
    setPendingRegistrationData: (state, action: PayloadAction<{
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      role: 'citizen' | 'official';
    }>) => {
      state.pendingRegistrationData = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        console.log('Redux auth state updated:', { isAuthenticated: true, user: action.payload.user }); // Debug log
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      // Get current user
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        localStorage.removeItem('token');
      })
      // Send OTP
      .addCase(sendOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpSent = true;
        state.pendingEmail = action.payload.email;
        state.pendingPurpose = action.payload.purpose;
        state.registrationStep = 'otp'; // Automatically switch to OTP step
        state.error = null;
      })
      .addCase(sendOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.otpSent = false;
      })
      // Verify OTP
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpVerified = true;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.otpVerified = false;
      });
  },
});

export const { logout, clearError, setToken, clearOTPState, setRegistrationStep, setPendingRegistrationData } = authSlice.actions;
export default authSlice.reducer;
