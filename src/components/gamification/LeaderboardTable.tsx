/**
 * Leaderboard Table Component
 * Displays top civic contributors
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Medal, Award, TrendingUp } from 'lucide-react';
import { LeaderboardEntry } from '../../services/gamification';
import LevelBadge from './LevelBadge';

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  currentUserId?: number;
  className?: string;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  entries,
  currentUserId,
  className = '',
}) => {
  // Ensure entries is an array
  const safeEntries = Array.isArray(entries) ? entries : [];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 2:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-red-500';
      default:
        return 'bg-gray-700';
    }
  };

  if (safeEntries.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No leaderboard data yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {safeEntries.map((entry, index) => {
        const isCurrentUser = entry.user_id === currentUserId;
        const rankIcon = getRankIcon(entry.rank);

        // Create a level object for the badge
        const levelObj = {
          id: entry.level,
          level: entry.level,
          name: entry.level_name,
          points_required: 0,
          icon: '🏆',
          color: '#3b82f6',
          benefits: [],
          monthly_credits: 0,
        };

        return (
          <motion.div
            key={entry.user_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`bg-gray-800 border ${
              isCurrentUser ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-gray-700'
            } rounded-xl p-4 hover:border-gray-600 transition-all`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex-shrink-0">
                <div
                  className={`w-12 h-12 rounded-full ${getRankBadgeColor(
                    entry.rank
                  )} flex items-center justify-center font-bold text-white shadow-lg`}
                >
                  {rankIcon || `#${entry.rank}`}
                </div>
              </div>

              {/* Level Badge */}
              <div className="flex-shrink-0">
                <LevelBadge level={levelObj} size="sm" showName={false} animate={false} />
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white truncate">
                    {entry.user_name}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                        YOU
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-sm text-gray-400">{entry.level_name}</p>
              </div>

              {/* Stats */}
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-2 justify-end text-blue-400 mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="font-bold">{entry.total_points.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 justify-end text-green-400 text-sm">
                  <Award className="w-3 h-3" />
                  <span>{entry.issues_resolved} resolved</span>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default LeaderboardTable;

