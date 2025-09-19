import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  MapPin, 
  TrendingUp, 
  Users,
  CheckCircle
} from 'lucide-react';
import { MapStatistics as MapStatsType } from '../../services/mapsApi';

interface MapStatisticsProps {
  statistics: MapStatsType | null;
  onClose: () => void;
}

const MapStatistics: React.FC<MapStatisticsProps> = ({ statistics, onClose }) => {
  if (!statistics) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-sm"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Map Statistics</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading statistics...</p>
        </div>
      </motion.div>
    );
  }

  const stats = [
    {
      label: 'Total Issues',
      value: statistics.total_issues,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      label: 'Open Issues',
      value: statistics.open_issues,
      icon: AlertTriangle,
      color: 'text-orange-400',
      bgColor: 'bg-orange-400/10'
    },
    {
      label: 'Total Events',
      value: statistics.total_events,
      icon: Calendar,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'Upcoming Events',
      value: statistics.upcoming_events,
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'Public Facilities',
      value: statistics.total_facilities,
      icon: Building2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10'
    },
    {
      label: 'Accessible Facilities',
      value: statistics.accessible_facilities,
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      label: 'Districts',
      value: statistics.total_districts,
      icon: MapPin,
      color: 'text-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ];

  const issueResolutionRate = statistics.total_issues > 0 
    ? Math.round(((statistics.total_issues - statistics.open_issues) / statistics.total_issues) * 100)
    : 0;

  const facilityAccessibilityRate = statistics.total_facilities > 0
    ? Math.round((statistics.accessible_facilities / statistics.total_facilities) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Map Statistics</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="space-y-4 mb-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg"
          >
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-400">{stat.label}</p>
              <p className="text-lg font-semibold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Indicators */}
      <div className="space-y-4">
        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Issue Resolution Rate</span>
            <span className="text-sm font-semibold text-white">{issueResolutionRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${issueResolutionRate}%` }}
            />
          </div>
        </div>

        <div className="p-3 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Facility Accessibility</span>
            <span className="text-sm font-semibold text-white">{facilityAccessibilityRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${facilityAccessibilityRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Insights */}
      <div className="mt-6 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Quick Insights</span>
        </div>
        <div className="text-xs text-gray-300 space-y-1">
          {statistics.open_issues > 0 && (
            <p>• {statistics.open_issues} issues need attention</p>
          )}
          {statistics.upcoming_events > 0 && (
            <p>• {statistics.upcoming_events} events coming up</p>
          )}
          {facilityAccessibilityRate < 50 && (
            <p>• Consider improving facility accessibility</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MapStatistics;
