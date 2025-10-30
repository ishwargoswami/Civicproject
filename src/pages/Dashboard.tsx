import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  Plus,
  BarChart3,
  Map,
  Bell,
  Star,
  Heart,
  Award,
  MapPin,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share,
  Bookmark,
  Filter,
  Search
} from 'lucide-react';
import { RootState, AppDispatch } from '../store';
import { fetchIssues } from '../store/slices/issuesSlice';
import { fetchPosts } from '../store/slices/forumSlice';
import { fetchEvents } from '../store/slices/eventsSlice';

const Dashboard: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { issues } = useSelector((state: RootState) => state.issues);
  const { posts } = useSelector((state: RootState) => state.forum);
  const { events } = useSelector((state: RootState) => state.events);
  
  const [activeTab, setActiveTab] = useState<'overview' | 'my_activity' | 'community' | 'local_updates'>('overview');

  useEffect(() => {
    // Temporarily disabled to prevent 401 errors during login redirect
    // dispatch(fetchIssues({ limit: 5 }));
    // dispatch(fetchPosts({ limit: 5 }));
    // dispatch(fetchEvents({ limit: 5 }));
  }, [dispatch]);

  const personalStats = [
    {
      title: 'My Issues Reported',
      value: 8,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      change: '2 resolved this week',
      details: 'Open: 3 | In Progress: 2 | Resolved: 3'
    },
    {
      title: 'Community Posts',
      value: 12,
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      change: '156 total likes',
      details: 'Discussions: 8 | Polls: 2 | Announcements: 2'
    },
    {
      title: 'Events Attended',
      value: 6,
      icon: Calendar,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      change: '3 upcoming',
      details: 'This month: 2 | This year: 6 | Volunteered: 4'
    },
    {
      title: 'Community Impact',
      value: '4.8',
      icon: Award,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      change: 'Community Score',
      details: 'Helpful votes: 89 | Contributions: 24'
    }
  ];

  const myRecentIssues = [
    {
      id: '1',
      title: 'Broken streetlight on Oak Street',
      status: 'resolved',
      priority: 'medium',
      reportedDate: '2024-09-15',
      resolvedDate: '2024-09-18',
      department: 'Public Works',
      likes: 12,
      comments: 3
    },
    {
      id: '2',
      title: 'Pothole near downtown intersection',
      status: 'in_progress',
      priority: 'high',
      reportedDate: '2024-09-20',
      department: 'Transportation',
      likes: 8,
      comments: 5
    },
    {
      id: '3',
      title: 'Graffiti removal needed in park',
      status: 'open',
      priority: 'low',
      reportedDate: '2024-09-21',
      department: 'Parks & Recreation',
      likes: 4,
      comments: 2
    }
  ];

  const communityHighlights = [
    {
      type: 'achievement',
      title: 'Community Clean-up Success!',
      description: '150 volunteers helped clean up downtown park last weekend',
      image: '/api/placeholder/300/200',
      likes: 234,
      comments: 45,
      timeAgo: '2 days ago'
    },
    {
      type: 'project_update',
      title: 'New Bike Lane Project Update',
      description: 'Construction is 75% complete on the new downtown bike lanes',
      image: '/api/placeholder/300/200',
      likes: 89,
      comments: 23,
      timeAgo: '1 week ago'
    },
    {
      type: 'announcement',
      title: 'Town Hall Meeting Next Week',
      description: 'Join us for the monthly town hall meeting to discuss community issues',
      likes: 67,
      comments: 18,
      timeAgo: '3 days ago'
    }
  ];

  const localUpdates = [
    {
      type: 'traffic',
      title: 'Road Closure on Main Street',
      description: 'Temporary closure for utility work, detour available via Oak Street',
      severity: 'medium',
      timeAgo: '2 hours ago'
    },
    {
      type: 'event',
      title: 'Farmers Market This Saturday',
      description: 'Weekly farmers market featuring local vendors and fresh produce',
      severity: 'low',
      timeAgo: '1 day ago'
    },
    {
      type: 'alert',
      title: 'Water Service Maintenance',
      description: 'Brief water service interruption scheduled for Sunday 2-4 AM',
      severity: 'high',
      timeAgo: '3 hours ago'
    }
  ];

  const upcomingEvents = [
    {
      id: '1',
      title: 'Community Garden Workshop',
      date: '2024-09-28',
      time: '10:00 AM',
      location: 'Central Park',
      attendees: 24,
      category: 'Environment'
    },
    {
      id: '2',
      title: 'Town Hall Meeting',
      date: '2024-09-30',
      time: '7:00 PM',
      location: 'City Hall',
      attendees: 156,
      category: 'Government'
    },
    {
      id: '3',
      title: 'Youth Soccer Registration',
      date: '2024-10-05',
      time: '9:00 AM',
      location: 'Recreation Center',
      attendees: 45,
      category: 'Sports'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'my_activity', label: 'My Activity', icon: Users },
    { id: 'community', label: 'Community', icon: Heart },
    { id: 'local_updates', label: 'Local Updates', icon: Bell }
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
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome back, {user?.first_name || 'Citizen'}!
            </h1>
            <p className="text-gray-400">Stay connected with your community and local government</p>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard/issues/new"
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Report Issue
            </Link>
            <Link 
              to="/dashboard/forum"
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Join Discussion
            </Link>
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
          {/* Personal Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {personalStats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
                <p className="text-xs text-blue-400 mb-2">{stat.change}</p>
                <p className="text-xs text-gray-500">{stat.details}</p>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link 
                to="/dashboard/issues/new"
                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <AlertTriangle className="h-8 w-8 text-red-400 mb-2" />
                <span className="text-white text-sm">Report Issue</span>
              </Link>
              <Link 
                to="/dashboard/forum"
                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <MessageSquare className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-white text-sm">Forum Discussion</span>
              </Link>
              <Link 
                to="/dashboard/events"
                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Calendar className="h-8 w-8 text-green-400 mb-2" />
                <span className="text-white text-sm">Find Events</span>
              </Link>
              <Link 
                to="/dashboard/maps"
                className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Map className="h-8 w-8 text-purple-400 mb-2" />
                <span className="text-white text-sm">View Map</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* My Activity Tab */}
      {activeTab === 'my_activity' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-400" />
              My Recent Issues
            </h3>
            <div className="space-y-4">
              {myRecentIssues.map((issue) => (
                <div key={issue.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                          issue.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          issue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {issue.priority} priority
                        </span>
                      </div>
                      <h4 className="text-white font-medium mb-1">{issue.title}</h4>
                      <p className="text-gray-400 text-sm">Department: {issue.department}</p>
                      <p className="text-gray-500 text-xs">Reported: {new Date(issue.reportedDate).toLocaleDateString()}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center">
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {issue.likes}
                        </span>
                        <span className="flex items-center">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          {issue.comments}
                        </span>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Community Tab */}
      {activeTab === 'community' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Heart className="h-6 w-6 mr-2 text-pink-400" />
              Community Highlights
            </h3>
            <div className="space-y-6">
              {communityHighlights.map((highlight, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start space-x-4">
                    {highlight.image && (
                      <div className="w-20 h-20 bg-gray-600 rounded-lg flex-shrink-0"></div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">{highlight.title}</h4>
                      <p className="text-gray-400 text-sm mb-3">{highlight.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Heart className="h-3 w-3 mr-1" />
                            {highlight.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {highlight.comments}
                          </span>
                          <span>{highlight.timeAgo}</span>
                        </div>
                        <div className="flex space-x-2">
                          <button className="p-1 text-gray-400 hover:text-white">
                            <Heart className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-white">
                            <Share className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-white">
                            <Bookmark className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Calendar className="h-6 w-6 mr-2 text-green-400" />
              Upcoming Community Events
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <h4 className="text-white font-medium mb-2">{event.title}</h4>
                  <div className="space-y-1 text-sm text-gray-400 mb-3">
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                    <p className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location}
                    </p>
                    <p className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      {event.attendees} attendees
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                      {event.category}
                    </span>
                    <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                      Join Event
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Local Updates Tab */}
      {activeTab === 'local_updates' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Bell className="h-6 w-6 mr-2 text-yellow-400" />
              Local Updates & Alerts
            </h3>
            <div className="space-y-4">
              {localUpdates.map((update, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${
                      update.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      update.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {update.type === 'traffic' && <MapPin className="h-4 w-4" />}
                      {update.type === 'event' && <Calendar className="h-4 w-4" />}
                      {update.type === 'alert' && <AlertTriangle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{update.title}</h4>
                      <p className="text-gray-400 text-sm mb-2">{update.description}</p>
                      <p className="text-gray-500 text-xs">{update.timeAgo}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      update.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                      update.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {update.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;