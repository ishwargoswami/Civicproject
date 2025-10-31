/**
 * Achievement Card Component
 * Displays achievement with unlock status and progress
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Lock, CheckCircle, Trophy, Target } from 'lucide-react';
import { Achievement, UserAchievement } from '../../services/gamification';

interface AchievementCardProps {
  achievement: Achievement;
  userAchievement?: UserAchievement;
  className?: string;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  userAchievement,
  className = '',
}) => {
  const isCompleted = userAchievement?.is_completed || false;
  const progress = userAchievement?.progress || 0;
  const progressPercentage = (progress / achievement.requirement_count) * 100;

  const getBadgeColor = () => {
    if (achievement.is_rare) return 'from-yellow-500 to-orange-500';
    switch (achievement.category) {
      case 'reporting':
        return 'from-blue-500 to-blue-600';
      case 'participation':
        return 'from-green-500 to-green-600';
      case 'community':
        return 'from-purple-500 to-purple-600';
      case 'milestone':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gray-800 border border-gray-700 rounded-xl overflow-hidden ${
        isCompleted ? 'ring-2 ring-green-500/50' : ''
      } ${className}`}
    >
      <div className="p-6">
        {/* Achievement icon */}
        <div className="flex items-start gap-4">
          <div
            className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${getBadgeColor()} flex items-center justify-center relative ${
              !isCompleted && 'opacity-50'
            }`}
          >
            <span className="text-3xl">{achievement.icon}</span>
            
            {/* Lock overlay for locked achievements */}
            {!isCompleted && progress === 0 && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <Lock className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Check mark for completed */}
            {isCompleted && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1"
              >
                <CheckCircle className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3
                className={`font-bold text-lg ${
                  isCompleted ? 'text-white' : 'text-gray-300'
                }`}
              >
                {achievement.name}
                {achievement.is_rare && (
                  <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">
                    RARE
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1 text-blue-400">
                <Trophy className="w-4 h-4" />
                <span className="text-sm font-semibold">+{achievement.points_reward}</span>
              </div>
            </div>

            <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>

            {/* Progress indicator */}
            {!isCompleted && progress > 0 && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Progress
                  </span>
                  <span>
                    {progress} / {achievement.requirement_count}
                  </span>
                </div>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    className={`h-full bg-gradient-to-r ${getBadgeColor()}`}
                  />
                </div>
              </div>
            )}

            {/* Completed badge */}
            {isCompleted && userAchievement && (
              <div className="mt-3 flex items-center gap-2 text-xs text-green-400">
                <CheckCircle className="w-4 h-4" />
                <span>
                  Unlocked {new Date(userAchievement.earned_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AchievementCard;

