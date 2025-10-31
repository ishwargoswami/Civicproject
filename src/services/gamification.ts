/**
 * Gamification API Service
 */
import api from './api';

export interface CivicLevel {
  id: number;
  level: number;
  name: string;
  points_required: number;
  icon: string;
  color: string;
  benefits: string[];
  monthly_credits: number;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  points_reward: number;
  requirement_type: string;
  requirement_count: number;
  badge_color: string;
  is_rare: boolean;
}

export interface UserAchievement {
  id: number;
  achievement: Achievement;
  earned_at: string;
  progress: number;
  is_completed: boolean;
}

export interface CivicActivity {
  id: number;
  activity_type: string;
  activity_type_display: string;
  points_earned: number;
  description: string;
  created_at: string;
  related_object_type?: string;
  related_object_id?: number;
}

export interface UserCivicProfile {
  id: number;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
  };
  current_level: CivicLevel | null;
  next_level: CivicLevel | null;
  total_points: number;
  points_to_next_level: number;
  progress_percentage: number;
  community_credits: number;
  lifetime_credits_earned: number;
  achievements_unlocked: number;
  total_activities: number;
  rank: number | null;
  achievements: UserAchievement[];
  recent_activities: CivicActivity[];
}

export interface CommunityCredit {
  id: number;
  benefit_type: string;
  benefit_type_display: string;
  credits_cost: number;
  description: string;
  redemption_code?: string;
  redeemed_at?: string;
  expires_at?: string;
  is_active: boolean;
  status: string;
  status_display: string;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  user_name: string;
  avatar?: string;
  total_points: number;
  level: number;
  level_name: string;
  issues_resolved: number;
  events_attended: number;
  is_current_user: boolean;
}

const gamificationService = {
  /**
   * Get current user's civic profile
   */
  async getMyProfile(): Promise<UserCivicProfile> {
    const response = await api.get('/auth/gamification/profile/me/');
    return response.data;
  },

  /**
   * Get all civic levels
   */
  async getLevels(): Promise<CivicLevel[]> {
    const response = await api.get('/auth/gamification/levels/');
    return response.data;
  },

  /**
   * Get all achievements
   */
  async getAchievements(category?: string): Promise<Achievement[]> {
    const response = await api.get('/auth/gamification/achievements/', {
      params: { category },
    });
    return response.data;
  },

  /**
   * Get user's achievements with progress
   */
  async getMyAchievements(): Promise<UserAchievement[]> {
    const response = await api.get('/auth/gamification/achievements/mine/');
    return response.data;
  },

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 20): Promise<CivicActivity[]> {
    const response = await api.get('/auth/gamification/activities/', {
      params: { limit },
    });
    return response.data;
  },

  /**
   * Get leaderboard
   */
  async getLeaderboard(timeframe: 'all' | 'month' | 'week' = 'all'): Promise<LeaderboardEntry[]> {
    const response = await api.get('/auth/gamification/leaderboard/', {
      params: { period: timeframe },
    });
    // Backend returns { period, leaderboard }, extract leaderboard array
    return response.data.leaderboard || response.data || [];
  },

  /**
   * Get available credit redemptions
   */
  async getAvailableRedemptions(): Promise<any[]> {
    const response = await api.get('/auth/gamification/credits/available/');
    return response.data;
  },

  /**
   * Redeem community credits
   */
  async redeemCredits(benefitType: string): Promise<CommunityCredit> {
    const response = await api.post('/auth/gamification/credits/redeem/', {
      benefit_type: benefitType,
    });
    return response.data;
  },

  /**
   * Get my redemption history
   */
  async getMyRedemptions(): Promise<CommunityCredit[]> {
    const response = await api.get('/auth/gamification/credits/history/');
    return response.data;
  },
};

export default gamificationService;

