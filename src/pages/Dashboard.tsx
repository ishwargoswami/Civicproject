import React, { useEffect } from 'react';
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

  useEffect(() => {
    // Temporarily disabled to prevent 401 errors during login redirect
    // dispatch(fetchIssues({ limit: 5 }));
    // dispatch(fetchPosts({ limit: 5 }));
    // dispatch(fetchEvents({ limit: 5 }));
    console.log('Dashboard mounted, data fetching disabled temporarily');
  }, [dispatch]);

  const stats = [
    {
      title: 'Active Issues',
      value: issues.filter(issue => issue.status === 'open').length,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      change: '+12%',
    },
    {
      title: 'Community Posts',
      value: posts.length,
      icon: MessageSquare,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20',
      change: '+8%',
    },
    {
      title: 'Upcoming Events',
      value: events.length,
      icon: Calendar,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/20',
      change: '+15%',
    },
    {
      title: 'Community Impact',
      value: '2.5K',
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/20',
      change: '+23%',
    },
  ];

  const quickActions = [
    {
      title: 'Report Issue',
      description: 'Report a problem in your community',
      icon: AlertTriangle,
      href: '/dashboard/issues/new',
      color: 'from-red-500 to-orange-500',
    },
    {
      title: 'Join Discussion',
      description: 'Participate in community forums',
      icon: MessageSquare,
      href: '/dashboard/forum',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Find Events',
      description: 'Discover local events and volunteer opportunities',
      icon: Calendar,
      href: '/dashboard/events',
      color: 'from-green-500 to-emerald-500',
    },
    {
      title: 'View Maps',
      description: 'Explore issues and events on interactive maps',
      icon: Map,
      href: '/dashboard/maps',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.first_name || user?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-gray-400">
          Here's what's happening in your community today.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
            className={`${stat.bgColor} ${stat.borderColor} border rounded-xl p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
              <span className="text-green-400 text-sm font-medium">{stat.change}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={action.href}
                className="block bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors group"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-400 text-sm">{action.description}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Issues */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Issues</h3>
            <Link
              to="/dashboard/issues"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {issues.slice(0, 3).map((issue) => (
              <Link
                key={issue.id}
                to={`/dashboard/issues/${issue.id}`}
                className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{issue.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">{issue.location.address}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        issue.status === 'open' ? 'bg-red-500/20 text-red-400' :
                        issue.status === 'in_progress' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {issue.status.replace('_', ' ')}
                      </span>
                      <span className="text-gray-400 text-xs">{issue.category}</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Recent Forum Posts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Recent Discussions</h3>
            <Link
              to="/dashboard/forum"
              className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            {posts.slice(0, 3).map((post) => (
              <Link
                key={post.id}
                to={`/dashboard/forum/${post.id}`}
                className="block p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-1">{post.title}</h4>
                    <p className="text-gray-400 text-sm mb-2">by {post.author.name}</p>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        post.type === 'discussion' ? 'bg-blue-500/20 text-blue-400' :
                        post.type === 'poll' ? 'bg-green-500/20 text-green-400' :
                        'bg-purple-500/20 text-purple-400'
                      }`}>
                        {post.type}
                      </span>
                      <span className="text-gray-400 text-xs">{post.category}</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
