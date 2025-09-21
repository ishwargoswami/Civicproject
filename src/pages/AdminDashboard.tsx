import React, { useState } from 'react';
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
  Clock,
  Database,
  UserCheck,
  UserX,
  MessageSquare,
  FileText,
  TrendingUp,
  Eye,
  Ban,
  Key,
  Server,
  Mail,
  Globe,
  Calendar,
  Flag,
  Filter
} from 'lucide-react';
import { RootState } from '../store';

const AdminDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'content' | 'system'>('overview');

  // Role-based access control
  if (!user || user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  const platformStats = [
    {
      title: 'Total Users',
      value: '2,547',
      change: '+12% this month',
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      details: 'Citizens: 2,234 | Officials: 24 | Admins: 3'
    },
    {
      title: 'Active Issues',
      value: '89',
      change: '-8% this week',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-orange-500',
      details: 'Open: 45 | In Progress: 32 | Urgent: 12'
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: '+0.2% uptime',
      icon: Server,
      color: 'from-green-500 to-green-600',
      details: 'API: 99.1% | Database: 98.9% | CDN: 97.5%'
    },
    {
      title: 'Content Moderation',
      value: '24',
      change: '6 pending review',
      icon: Shield,
      color: 'from-purple-500 to-purple-600',
      details: 'Reports: 18 | Flagged: 6 | Reviewed: 156'
    }
  ];

  const userManagementData = [
    {
      category: 'New Registrations',
      today: 23,
      thisWeek: 156,
      thisMonth: 687,
      trend: '+15%'
    },
    {
      category: 'Active Users (24h)',
      today: 1234,
      thisWeek: 8765,
      thisMonth: 25432,
      trend: '+8%'
    },
    {
      category: 'Banned Users',
      today: 2,
      thisWeek: 8,
      thisMonth: 23,
      trend: '-12%'
    }
  ];

  const contentModerationQueue = [
    {
      id: '1',
      type: 'Forum Post',
      title: 'Inappropriate content in community discussion',
      reporter: 'citizen_user_123',
      priority: 'high',
      timeAgo: '2 hours ago'
    },
    {
      id: '2',
      type: 'Issue Report',
      title: 'Spam issue report with fake information',
      reporter: 'official_dept_transport',
      priority: 'medium',
      timeAgo: '4 hours ago'
    },
    {
      id: '3',
      type: 'User Profile',
      title: 'Suspicious user activity and profile content',
      reporter: 'automated_system',
      priority: 'low',
      timeAgo: '1 day ago'
    }
  ];

  const systemAlerts = [
    {
      type: 'warning',
      message: 'Database backup scheduled for tonight at 2:00 AM',
      time: '1 hour ago'
    },
    {
      type: 'info',
      message: 'New transparency data successfully imported',
      time: '3 hours ago'
    },
    {
      type: 'success',
      message: 'System security scan completed - no issues found',
      time: '6 hours ago'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'content', label: 'Content Moderation', icon: Shield },
    { id: 'system', label: 'System Health', icon: Server }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Admin Control Center</h1>
            <p className="text-gray-400">Platform management and system oversight</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              <Ban className="h-4 w-4 mr-2" />
              Emergency Actions
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-white/10">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Platform Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-lg`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                <p className="text-xs text-blue-400 mb-2">{stat.change}</p>
                <p className="text-xs text-gray-500">{stat.details}</p>
              </motion.div>
            ))}
          </div>

          {/* System Alerts */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-yellow-400" />
              System Alerts
            </h3>
            <div className="space-y-4">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${
                    alert.type === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                    alert.type === 'info' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-green-500/20 text-green-400'
                  }`}>
                    {alert.type === 'warning' && <AlertTriangle className="h-4 w-4" />}
                    {alert.type === 'info' && <Activity className="h-4 w-4" />}
                    {alert.type === 'success' && <CheckCircle className="h-4 w-4" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-sm">{alert.message}</p>
                    <p className="text-gray-400 text-xs">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {userManagementData.map((data, index) => (
              <div key={index} className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">{data.category}</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Today</span>
                    <span className="text-white font-medium">{data.today.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">This Week</span>
                    <span className="text-white font-medium">{data.thisWeek.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">This Month</span>
                    <span className="text-white font-medium">{data.thisMonth.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-white/10">
                    <span className={`text-sm ${data.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {data.trend} from last month
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick User Actions */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">User Management Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <UserCheck className="h-8 w-8 text-green-400 mb-2" />
                <span className="text-white text-sm">Verify Users</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <UserX className="h-8 w-8 text-red-400 mb-2" />
                <span className="text-white text-sm">Ban Users</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Mail className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-white text-sm">Send Notifications</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Key className="h-8 w-8 text-purple-400 mb-2" />
                <span className="text-white text-sm">Reset Passwords</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Moderation Tab */}
      {activeTab === 'content' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Moderation Queue</h3>
            <div className="space-y-4">
              {contentModerationQueue.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-400 text-sm font-medium">{item.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          item.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {item.priority} priority
                        </span>
                      </div>
                      <h4 className="text-white font-medium mb-1">{item.title}</h4>
                      <p className="text-gray-400 text-sm">Reported by: {item.reporter}</p>
                      <p className="text-gray-500 text-xs">{item.timeAgo}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                        Approve
                      </button>
                      <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* System Health Tab */}
      {activeTab === 'system' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Server className="h-5 w-5 mr-2 text-green-400" />
                Server Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">API Server</span>
                  <span className="flex items-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Online
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Database</span>
                  <span className="flex items-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Healthy
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Redis Cache</span>
                  <span className="flex items-center text-green-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Connected
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2 text-blue-400" />
                Storage
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Database Size</span>
                  <span className="text-white">2.4 GB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Media Files</span>
                  <span className="text-white">856 MB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Backups</span>
                  <span className="text-white">1.2 GB</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-purple-400" />
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Response Time</span>
                  <span className="text-white">142ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white">99.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Error Rate</span>
                  <span className="text-white">0.02%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;