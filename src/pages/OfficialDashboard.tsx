import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  MessageSquare, 
  Calendar, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MapPin
} from 'lucide-react';
import { RootState } from '../store';

const OfficialDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Role-based access control
  if (!user || user.role !== 'official') {
    return <Navigate to="/unauthorized" replace />;
  }
  const stats = [
    {
      title: 'Assigned Issues',
      value: '24',
      change: '+3 new',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Resolved This Week',
      value: '18',
      change: '+22%',
      icon: CheckCircle,
      color: 'from-green-500 to-green-600'
    },
    {
      title: 'Pending Review',
      value: '6',
      change: '-2',
      icon: Clock,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Citizen Engagement',
      value: '89%',
      change: '+5%',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const recentIssues = [
    { 
      id: 1, 
      title: 'Street Light Malfunction', 
      location: 'Main St & 5th Ave', 
      priority: 'High', 
      status: 'In Progress',
      reportedBy: 'John Doe',
      time: '2 hours ago'
    },
    { 
      id: 2, 
      title: 'Pothole Repair Needed', 
      location: 'Oak Street', 
      priority: 'Medium', 
      status: 'Pending',
      reportedBy: 'Jane Smith',
      time: '4 hours ago'
    },
    { 
      id: 3, 
      title: 'Graffiti Removal', 
      location: 'City Park', 
      priority: 'Low', 
      status: 'Assigned',
      reportedBy: 'Mike Johnson',
      time: '1 day ago'
    },
  ];

  const upcomingEvents = [
    { title: 'Town Hall Meeting', date: 'Nov 15, 2024', attendees: '150+' },
    { title: 'Community Cleanup', date: 'Nov 18, 2024', attendees: '85' },
    { title: 'Budget Planning Session', date: 'Nov 20, 2024', attendees: '25' },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-400 bg-red-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Low': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'text-blue-400 bg-blue-500/20';
      case 'Pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'Assigned': return 'text-purple-400 bg-purple-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Official Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage civic issues and community engagement</p>
        </div>
        <div className="flex items-center space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            <span>New Announcement</span>
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
              <span className="text-sm font-medium text-gray-400">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Issues - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Issues</h3>
            <button className="text-blue-400 hover:text-blue-300 text-sm">View All</button>
          </div>
          <div className="space-y-4">
            {recentIssues.map((issue) => (
              <div key={issue.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{issue.title}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400 text-sm">{issue.location}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(issue.priority)}`}>
                      {issue.priority}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(issue.status)}`}>
                      {issue.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Reported by {issue.reportedBy}</span>
                  <span className="text-gray-400">{issue.time}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm"
        >
          <h3 className="text-xl font-semibold text-white mb-4">Upcoming Events</h3>
          <div className="space-y-4">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                <h4 className="text-white font-medium mb-2">{event.title}</h4>
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">{event.attendees} attendees</span>
                </div>
              </div>
            ))}
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
            <ClipboardList className="h-8 w-8 text-blue-400 mb-2" />
            <span className="text-white text-sm">Review Issues</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <MessageSquare className="h-8 w-8 text-green-400 mb-2" />
            <span className="text-white text-sm">Send Update</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <Calendar className="h-8 w-8 text-purple-400 mb-2" />
            <span className="text-white text-sm">Schedule Event</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
            <TrendingUp className="h-8 w-8 text-yellow-400 mb-2" />
            <span className="text-white text-sm">View Analytics</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default OfficialDashboard;
