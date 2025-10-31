/**
 * Redux slice for gamification state
 */
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import gamificationService, {
  UserCivicProfile,
  CivicLevel,
  Achievement,
  UserAchievement,
  CivicActivity,
  LeaderboardEntry,
  CommunityCredit,
} from '../../services/gamification';

export interface GamificationState {
  profile: UserCivicProfile | null;
  levels: CivicLevel[];
  achievements: Achievement[];
  userAchievements: UserAchievement[];
  recentActivities: CivicActivity[];
  leaderboard: LeaderboardEntry[];
  redemptions: CommunityCredit[];
  availableRedemptions: any[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: GamificationState = {
  profile: null,
  levels: [],
  achievements: [],
  userAchievements: [],
  recentActivities: [],
  leaderboard: [],
  redemptions: [],
  availableRedemptions: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

/**
 * Fetch user's civic profile
 */
export const fetchMyProfile = createAsyncThunk(
  'gamification/fetchMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationService.getMyProfile();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch profile');
    }
  }
);

/**
 * Fetch all civic levels
 */
export const fetchLevels = createAsyncThunk(
  'gamification/fetchLevels',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationService.getLevels();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch levels');
    }
  }
);

/**
 * Fetch achievements
 */
export const fetchAchievements = createAsyncThunk(
  'gamification/fetchAchievements',
  async (category: string | undefined, { rejectWithValue }) => {
    try {
      const data = await gamificationService.getAchievements(category);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch achievements');
    }
  }
);

/**
 * Fetch user's achievements
 */
export const fetchMyAchievements = createAsyncThunk(
  'gamification/fetchMyAchievements',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationService.getMyAchievements();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch user achievements');
    }
  }
);

/**
 * Fetch recent activities
 */
export const fetchRecentActivities = createAsyncThunk(
  'gamification/fetchRecentActivities',
  async (limit: number = 20, { rejectWithValue }) => {
    try {
      const data = await gamificationService.getRecentActivities(limit);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch activities');
    }
  }
);

/**
 * Fetch leaderboard
 */
export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (timeframe: 'all' | 'month' | 'week' = 'all', { rejectWithValue }) => {
    try {
      const data = await gamificationService.getLeaderboard(timeframe);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch leaderboard');
    }
  }
);

/**
 * Fetch available redemptions
 */
export const fetchAvailableRedemptions = createAsyncThunk(
  'gamification/fetchAvailableRedemptions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationService.getAvailableRedemptions();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch redemptions');
    }
  }
);

/**
 * Redeem community credits
 */
export const redeemCredits = createAsyncThunk(
  'gamification/redeemCredits',
  async (benefitType: string, { rejectWithValue }) => {
    try {
      const data = await gamificationService.redeemCredits(benefitType);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to redeem credits');
    }
  }
);

/**
 * Fetch redemption history
 */
export const fetchMyRedemptions = createAsyncThunk(
  'gamification/fetchMyRedemptions',
  async (_, { rejectWithValue }) => {
    try {
      const data = await gamificationService.getMyRedemptions();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch redemption history');
    }
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    incrementPoints: (state, action: PayloadAction<number>) => {
      if (state.profile) {
        state.profile.total_points += action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch profile
    builder
      .addCase(fetchMyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyProfile.fulfilled, (state, action: PayloadAction<UserCivicProfile>) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchMyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch levels
    builder
      .addCase(fetchLevels.fulfilled, (state, action: PayloadAction<CivicLevel[]>) => {
        state.levels = action.payload;
      });

    // Fetch achievements
    builder
      .addCase(fetchAchievements.fulfilled, (state, action: PayloadAction<Achievement[]>) => {
        state.achievements = action.payload;
      });

    // Fetch user achievements
    builder
      .addCase(fetchMyAchievements.fulfilled, (state, action: PayloadAction<UserAchievement[]>) => {
        state.userAchievements = action.payload;
      });

    // Fetch recent activities
    builder
      .addCase(fetchRecentActivities.fulfilled, (state, action: PayloadAction<CivicActivity[]>) => {
        state.recentActivities = action.payload;
      });

    // Fetch leaderboard
    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action: PayloadAction<LeaderboardEntry[]>) => {
        state.isLoading = false;
        state.leaderboard = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.leaderboard = [];
      });

    // Fetch available redemptions
    builder
      .addCase(fetchAvailableRedemptions.fulfilled, (state, action) => {
        state.availableRedemptions = action.payload;
      });

    // Redeem credits
    builder
      .addCase(redeemCredits.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(redeemCredits.fulfilled, (state, action: PayloadAction<CommunityCredit>) => {
        state.isLoading = false;
        state.redemptions.unshift(action.payload);
        // Deduct credits from profile
        if (state.profile) {
          state.profile.community_credits -= action.payload.credits_cost;
        }
      })
      .addCase(redeemCredits.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch redemption history
    builder
      .addCase(fetchMyRedemptions.fulfilled, (state, action: PayloadAction<CommunityCredit[]>) => {
        state.redemptions = action.payload;
      });
  },
});

export const { clearError, incrementPoints } = gamificationSlice.actions;
export default gamificationSlice.reducer;

