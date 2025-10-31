/**
 * Compact Profile Widget for Dashboard
 * Shows current level, points, and progress
 */
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../store';
import { fetchMyProfile } from '../../store/slices/gamificationSlice';
import { Trophy, TrendingUp, Gift, ChevronRight, Sparkles } from 'lucide-react';
import LevelBadge from './LevelBadge';
import ProgressBar from './ProgressBar';

interface ProfileWidgetProps {
  className?: string;
}

const ProfileWidget: React.FC<ProfileWidgetProps> = ({ className = '' }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, isLoading } = useSelector((state: RootState) => state.gamification);

  useEffect(() => {
    // Load profile data
    dispatch(fetchMyProfile());
  }, [dispatch]);

  if (isLoading && !profile) {
    return (
      <div className={`bg-gray-800 border border-gray-700 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-700 h-16 w-16"></div>
          <div className="flex-1 space-y-3 py-1">
            <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile || !profile.current_level) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-gray-800 via-gray-800 to-gray-900 border border-gray-700 rounded-xl overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-white" />
          <h3 className="text-white font-bold">Civic Rewards</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Level Badge and Info */}
        <div className="flex items-center gap-4 mb-6">
          {profile.current_level ? (
            <>
              <LevelBadge level={profile.current_level} size="md" showName={false} animate={false} />
              <div className="flex-1">
                <h4 className="font-bold text-white text-lg">{profile.current_level.name}</h4>
                <p className="text-sm text-gray-400">Level {profile.current_level.level}</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                <Trophy className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-white text-lg">New Citizen</h4>
                <p className="text-sm text-gray-400">Level 0</p>
              </div>
            </>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Points */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-gray-400">Points</span>
            </div>
            <p className="text-lg font-bold text-white">
              {profile.total_points.toLocaleString()}
            </p>
          </div>

          {/* Credits */}
          <div className="bg-gray-900/50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-4 h-4 text-green-400" />
              <span className="text-xs text-gray-400">Credits</span>
            </div>
            <p className="text-lg font-bold text-white">
              {profile.community_credits}
            </p>
          </div>
        </div>

        {/* Progress to Next Level */}
        {profile.next_level && (
          <div className="mb-4">
            <ProgressBar
              current={profile.total_points}
              total={profile.next_level.points_required}
              percentage={profile.progress_percentage}
              color="#3b82f6"
              label={`Next: ${profile.next_level.name}`}
              showNumbers={false}
              height="sm"
            />
            <p className="text-xs text-gray-500 mt-2 text-center">
              {profile.points_to_next_level} points to level up
            </p>
          </div>
        )}

        {/* View Full Profile Link */}
        <Link
          to="/dashboard/rewards"
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
        >
          <Trophy className="w-5 h-5" />
          View Rewards
          <ChevronRight className="w-4 h-4" />
        </Link>

        {/* Quick Stats */}
        <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between text-xs text-gray-400">
          <span>Rank: #{profile.rank || 'N/A'}</span>
          <span>{profile.achievements_unlocked} achievements</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileWidget;

