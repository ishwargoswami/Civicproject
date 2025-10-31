/**
 * Gamification Page
 * Comprehensive view of user's civic engagement rewards
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import {
  fetchMyProfile,
  fetchLevels,
  fetchMyAchievements,
  fetchRecentActivities,
  fetchLeaderboard,
  fetchAvailableRedemptions,
  redeemCredits,
  fetchMyRedemptions,
} from '../store/slices/gamificationSlice';
import {
  Trophy,
  TrendingUp,
  Award,
  Gift,
  Activity,
  Crown,
  Star,
  Sparkles,
  ChevronRight,
  Shield,
} from 'lucide-react';
import LevelBadge from '../components/gamification/LevelBadge';
import ProgressBar from '../components/gamification/ProgressBar';
import AchievementCard from '../components/gamification/AchievementCard';
import ActivityFeed from '../components/gamification/ActivityFeed';
import LeaderboardTable from '../components/gamification/LeaderboardTable';
import RedemptionCard from '../components/gamification/RedemptionCard';

const Gamification: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    profile,
    levels,
    userAchievements,
    recentActivities,
    leaderboard,
    availableRedemptions,
    redemptions,
    isLoading,
  } = useSelector((state: RootState) => state.gamification);

  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'leaderboard' | 'rewards'>('overview');

  useEffect(() => {
    // Load all gamification data
    dispatch(fetchMyProfile());
    dispatch(fetchLevels());
    dispatch(fetchMyAchievements());
    dispatch(fetchRecentActivities(10));
    dispatch(fetchLeaderboard('all'));
    dispatch(fetchAvailableRedemptions());
    dispatch(fetchMyRedemptions());
  }, [dispatch]);

  const handleRedeem = async (benefitType: string) => {
    try {
      await dispatch(redeemCredits(benefitType)).unwrap();
      // Refresh profile and redemptions
      dispatch(fetchMyProfile());
      dispatch(fetchMyRedemptions());
    } catch (error: any) {
      alert(error || 'Failed to redeem credits');
    }
  };

  if (isLoading && !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading your civic profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-white text-xl mb-2">Civic Profile Not Found</p>
          <p className="text-gray-400">Please log in to view your gamification profile</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'leaderboard', label: 'Leaderboard', icon: Crown },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-purple-900 to-black pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Civic Rewards
            </h1>
            <p className="text-xl text-gray-300">
              Level up your civic engagement and earn real-world benefits
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {/* Level */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6 text-center"
            >
              {profile.current_level ? (
                <>
                  <div className="flex justify-center mb-3">
                    <LevelBadge level={profile.current_level} size="lg" showName={false} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">{profile.current_level.name}</h3>
                  <p className="text-sm text-gray-400">Level {profile.current_level.level}</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-3">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center">
                      <Shield className="w-10 h-10 text-gray-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">New Citizen</h3>
                  <p className="text-sm text-gray-400">Level 0</p>
                </>
              )}
            </motion.div>

            {/* Points */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total Points</p>
                  <p className="text-2xl font-bold text-white">
                    {profile.total_points.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Credits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Gift className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Credits</p>
                  <p className="text-2xl font-bold text-white">
                    {profile.community_credits.toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Achievements</p>
                  <p className="text-2xl font-bold text-white">
                    {profile.achievements_unlocked}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Progress to Next Level */}
          {profile.next_level && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gray-900/50 backdrop-blur-lg border border-gray-800 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1">Progress to Next Level</h3>
                  <p className="text-sm text-gray-400">
                    {profile.points_to_next_level} points until {profile.next_level.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-400">
                    {Math.round(profile.progress_percentage)}%
                  </div>
                </div>
              </div>
              <ProgressBar
                current={profile.total_points}
                total={profile.next_level.points_required}
                percentage={profile.progress_percentage}
                color="#a855f7"
                showNumbers={false}
                height="lg"
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-semibold border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activities */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-400" />
                Recent Activities
              </h2>
              <ActivityFeed activities={recentActivities} limit={10} />
            </div>

            {/* All Levels */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Star className="w-6 h-6 text-purple-400" />
                Civic Levels
              </h2>
              <div className="space-y-4">
                {levels.map((level) => {
                  const isCurrentLevel = profile.current_level?.level === level.level;
                  const isPastLevel = profile.current_level && profile.current_level.level > level.level;

                  return (
                    <motion.div
                      key={level.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`bg-gray-800 border ${
                        isCurrentLevel ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700'
                      } rounded-xl p-4 ${isPastLevel && 'opacity-60'}`}
                    >
                      <div className="flex items-center gap-4">
                        <LevelBadge level={level} size="md" showName={false} animate={false} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-white">{level.name}</h3>
                            {isCurrentLevel && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                                CURRENT
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-400 mb-2">
                            {level.points_required.toLocaleString()} points • {level.monthly_credits} credits/month
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {level.benefits.slice(0, 2).map((benefit, idx) => (
                              <span
                                key={idx}
                                className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full"
                              >
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === 'achievements' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-400" />
                Achievements ({profile.achievements_unlocked} Unlocked)
              </h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {userAchievements.map((ua) => (
                <AchievementCard
                  key={ua.id}
                  achievement={ua.achievement}
                  userAchievement={ua}
                />
              ))}
            </div>
            {userAchievements.length === 0 && (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">No achievements yet</p>
                <p className="text-gray-500 mt-2">Start engaging to unlock achievements!</p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-400" />
              Community Leaderboard
            </h2>
            <LeaderboardTable entries={leaderboard} currentUserId={user?.id} />
          </div>
        )}

        {/* Rewards Tab */}
        {activeTab === 'rewards' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                <Gift className="w-6 h-6 text-green-400" />
                Redeem Community Credits
              </h2>
              <p className="text-gray-400">
                You have <span className="text-green-400 font-bold">{profile.community_credits}</span> credits available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {availableRedemptions.map((option: any) => (
                <RedemptionCard
                  key={option.type}
                  option={option}
                  userCredits={profile.community_credits}
                  onRedeem={handleRedeem}
                />
              ))}
            </div>

            {/* Redemption History */}
            {redemptions.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Redemption History</h3>
                <div className="space-y-3">
                  {redemptions.map((redemption) => (
                    <div
                      key={redemption.id}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-white">{redemption.benefit_type_display}</p>
                          <p className="text-sm text-gray-400 mt-1">{redemption.description}</p>
                          {redemption.redemption_code && (
                            <p className="text-sm text-blue-400 mt-2 font-mono">
                              Code: {redemption.redemption_code}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-red-400">-{redemption.credits_cost}</div>
                          <div className="text-xs text-gray-500">credits</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gamification;

