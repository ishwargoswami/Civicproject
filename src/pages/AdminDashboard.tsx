import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Users, 
  Shield, 
  Activity, 
  Settings, 
  BarChart3, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { RootState } from '../store';

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Role-based access control
  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  const stats = [
    {
      title: 'Total Users',
      value: '2,547',
      change: '+12%',
      icon: Users,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Active Issues',
      value: '89',
      change: '-8%',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Resolved Today',
      value: '23',
      change: '+15%',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+0.2%',
      icon: Activity,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentActivity = [
    { action: 'New user registered', user: 'John Doe', time: '2 min ago', type: 'user' },
    { action: 'Issue reported', user: 'Jane Smith', time: '5 min ago', type: 'issue' },
    { action: 'Official verified', user: 'City Council', time: '10 min ago', type: 'verification' },
    { action: 'System backup completed', user: 'System', time: '1 hour ago', type: 'system' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your civic platform</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'user' ? 'bg-blue-500/20' :
                  activity.type === 'issue' ? 'bg-yellow-500/20' :
                  activity.type === 'verification' ? 'bg-green-500/20' :
                  'bg-purple-500/20'
                }`}>
                  {activity.type === 'user' && <Users className="h-4 w-4 text-blue-400" />}
                  {activity.type === 'issue' && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
                  {activity.type === 'verification' && <CheckCircle className="h-4 w-4 text-green-400" />}
                  {activity.type === 'system' && <Activity className="h-4 w-4 text-purple-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.action}</p>
                  <p className="text-gray-400 text-xs">{activity.user}</p>
                </div>
                <span className="text-gray-400 text-xs">{activity.time}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-xl font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Database</span>
              </div>
              <span className="text-green-400 text-sm">Healthy</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">API Services</span>
              </div>
              <span className="text-green-400 text-sm">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-400" />
                <span className="text-white">Background Jobs</span>
              </div>
              <span className="text-yellow-400 text-sm">Processing</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-white">Email Service</span>
              </div>
              <span className="text-green-400 text-sm">Active</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
      >
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <Users className="h-8 w-8 text-blue-400 mb-2" />
            <span className="text-white text-sm">Manage Users</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <Shield className="h-8 w-8 text-green-400 mb-2" />
            <span className="text-white text-sm">Permissions</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <BarChart3 className="h-8 w-8 text-purple-400 mb-2" />
            <span className="text-white text-sm">Analytics</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <Settings className="h-8 w-8 text-gray-400 mb-2" />
            <span className="text-white text-sm">System Config</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
