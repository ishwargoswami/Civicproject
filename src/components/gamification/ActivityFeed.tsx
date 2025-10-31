/**
 * Activity Feed Component
 * Shows recent civic activities and points earned
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  MessageSquare,
  Calendar,
  ThumbsUp,
  FileText,
  Award,
  TrendingUp,
} from 'lucide-react';
import { CivicActivity } from '../../services/gamification';

interface ActivityFeedProps {
  activities: CivicActivity[];
  limit?: number;
  className?: string;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  limit,
  className = '',
}) => {
  const displayActivities = limit ? activities.slice(0, limit) : activities;

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'report_issue':
        return AlertCircle;
      case 'forum_post':
      case 'forum_comment':
        return MessageSquare;
      case 'event_rsvp':
      case 'event_attended':
        return Calendar;
      case 'helpful_vote':
        return ThumbsUp;
      case 'petition_sign':
        return FileText;
      case 'achievement_unlock':
        return Award;
      default:
        return TrendingUp;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'report_issue':
      case 'issue_resolved':
        return 'text-blue-400 bg-blue-500/10';
      case 'forum_post':
      case 'forum_comment':
        return 'text-purple-400 bg-purple-500/10';
      case 'event_rsvp':
      case 'event_attended':
        return 'text-green-400 bg-green-500/10';
      case 'achievement_unlock':
        return 'text-yellow-400 bg-yellow-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (displayActivities.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <p className="text-gray-400">No activities yet</p>
        <p className="text-sm text-gray-500 mt-1">
          Start engaging to see your civic activities here!
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {displayActivities.map((activity, index) => {
        const Icon = getActivityIcon(activity.activity_type);
        const colorClass = getActivityColor(activity.activity_type);

        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-200">
                      {activity.activity_type_display}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.description}
                    </p>
                  </div>

                  {/* Points badge */}
                  <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                    +{activity.points_earned}
                  </div>
                </div>

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-2">
                  {formatTimeAgo(activity.created_at)}
                </p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ActivityFeed;

