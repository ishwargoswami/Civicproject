import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Link } from 'react-router-dom';
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
  MapPin,
  FileText,
  BarChart3,
  Building2,
  Target,
  DollarSign,
  Zap,
  Phone,
  Mail,
  Flag,
  Eye,
  Edit,
  Send,
  Archive,
  Bookmark
} from 'lucide-react';
import { RootState } from '../store';

const OfficialDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'projects' | 'communication' | 'reports'>('overview');

  // Role-based access control
  if (!user || user.role !== 'official') {
    return <Navigate to="/unauthorized" replace />;
  }

  const departmentStats = [
    {
      title: 'Assigned Issues',
      value: '24',
      change: '+3 new today',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600',
      details: 'High: 6 | Medium: 12 | Low: 6'
    },
    {
      title: 'Active Projects',
      value: '8',
      change: '2 behind schedule',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      details: 'On Track: 5 | Delayed: 2 | Completed: 1'
    },
    {
      title: 'Citizen Requests',
      value: '156',
      change: '+18 this week',
      icon: Users,
      color: 'from-green-500 to-green-600',
      details: 'Pending: 23 | In Progress: 45 | Resolved: 88'
    },
    {
      title: 'Budget Utilization',
      value: '67%',
      change: 'Q3 spending',
      icon: DollarSign,
      color: 'from-yellow-500 to-orange-500',
      details: 'Allocated: $2.5M | Spent: $1.7M | Remaining: $0.8M'
    }
  ];

  const urgentIssues = [
    {
      id: '1',
      title: 'Water pipe burst on Main Street',
      priority: 'high',
      location: 'Main St & 5th Ave',
      reportedBy: 'John Smith',
      timeAgo: '2 hours ago',
      status: 'assigned'
    },
    {
      id: '2',
      title: 'Traffic light malfunction causing delays',
      priority: 'high',
      location: 'Downtown Intersection',
      reportedBy: 'City Traffic Dept',
      timeAgo: '4 hours ago',
      status: 'in_progress'
    },
    {
      id: '3',
      title: 'Broken streetlight in residential area',
      priority: 'medium',
      location: 'Oak Street',
      reportedBy: 'Sarah Johnson',
      timeAgo: '1 day ago',
      status: 'pending'
    }
  ];

  const activeProjects = [
    {
      id: '1',
      name: 'Downtown Sidewalk Renovation',
      progress: 75,
      budget: 250000,
      spent: 187500,
      deadline: '2024-12-15',
      status: 'on_track',
      team: 8
    },
    {
      id: '2',
      name: 'Park Equipment Installation',
      progress: 45,
      budget: 85000,
      spent: 42500,
      deadline: '2024-11-30',
      status: 'delayed',
      team: 4
    },
    {
      id: '3',
      name: 'Street Lighting Upgrade Phase 2',
      progress: 90,
      budget: 150000,
      spent: 135000,
      deadline: '2024-10-31',
      status: 'on_track',
      team: 6
    }
  ];

  const recentCommunications = [
    {
      type: 'email',
      from: 'Mayor\'s Office',
      subject: 'Budget approval for Q4 projects',
      time: '1 hour ago',
      priority: 'high'
    },
    {
      type: 'citizen_message',
      from: 'Lisa Davis',
      subject: 'Thank you for fixing the pothole issue',
      time: '3 hours ago',
      priority: 'normal'
    },
    {
      type: 'department_update',
      from: 'Engineering Team',
      subject: 'Weekly progress report - Infrastructure projects',
      time: '1 day ago',
      priority: 'normal'
    }
  ];

  const performanceMetrics = [
    {
      metric: 'Issue Resolution Time',
      current: '2.3 days',
      target: '2.0 days',
      trend: 'improving',
      change: '-0.2 days'
    },
    {
      metric: 'Citizen Satisfaction',
      current: '4.2/5',
      target: '4.5/5',
      trend: 'stable',
      change: '+0.1'
    },
    {
      metric: 'Project Completion Rate',
      current: '87%',
      target: '90%',
      trend: 'improving',
      change: '+5%'
    },
    {
      metric: 'Budget Efficiency',
      current: '92%',
      target: '95%',
      trend: 'stable',
      change: '0%'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'issues', label: 'Issue Management', icon: AlertTriangle },
    { id: 'projects', label: 'Project Oversight', icon: TrendingUp },
    { id: 'communication', label: 'Citizen Communication', icon: MessageSquare },
    { id: 'reports', label: 'Reports & Analytics', icon: FileText }
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
            <h1 className="text-3xl font-bold text-white mb-2">Official Dashboard</h1>
            <p className="text-gray-400">Department management and citizen services</p>
            <div className="flex items-center mt-2 text-sm text-gray-500">
              <Building2 className="h-4 w-4 mr-1" />
              {user?.department_name || 'Public Services Department'}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link 
              to="/dashboard/issues/new"
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Report Issue
            </Link>
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
              <Send className="h-4 w-4 mr-2" />
              Send Update
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
          {/* Department Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {departmentStats.map((stat, index) => (
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

          {/* Performance Metrics */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <Target className="h-6 w-6 mr-2 text-green-400" />
              Department Performance
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-medium mb-2">{metric.metric}</h4>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold text-white">{metric.current}</span>
                    <span className={`text-sm ${
                      metric.trend === 'improving' ? 'text-green-400' : 
                      metric.trend === 'declining' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm">Target: {metric.target}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Issue Management Tab */}
      {activeTab === 'issues' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2 text-red-400" />
              Urgent Issues Requiring Attention
            </h3>
            <div className="space-y-4">
              {urgentIssues.map((issue) => (
                <div key={issue.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          issue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {issue.priority} priority
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.status === 'assigned' ? 'bg-blue-500/20 text-blue-400' :
                          issue.status === 'in_progress' ? 'bg-green-500/20 text-green-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {issue.status.replace('_', ' ')}
                        </span>
                      </div>
                      <h4 className="text-white font-medium mb-1">{issue.title}</h4>
                      <div className="flex items-center text-gray-400 text-sm space-x-4">
                        <span className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {issue.location}
                        </span>
                        <span>by {issue.reportedBy}</span>
                        <span>{issue.timeAgo}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Project Oversight Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
              Active Department Projects
            </h3>
            <div className="space-y-6">
              {activeProjects.map((project) => (
                <div key={project.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-2">{project.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          ${project.spent.toLocaleString()} / ${project.budget.toLocaleString()}
                        </span>
                        <span className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {project.team} team members
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          Due {new Date(project.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-sm text-gray-400 mb-1">
                            <span>Progress</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                project.status === 'on_track' ? 'bg-green-500' : 
                                project.status === 'delayed' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          project.status === 'on_track' ? 'bg-green-500/20 text-green-400' :
                          project.status === 'delayed' ? 'bg-red-500/20 text-red-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                        View Details
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                        Update Progress
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Communication Tab */}
      {activeTab === 'communication' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-green-400" />
              Recent Communications
            </h3>
            <div className="space-y-4">
              {recentCommunications.map((comm, index) => (
                <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-blue-400 text-sm font-medium">
                          {comm.type.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          comm.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {comm.priority}
                        </span>
                      </div>
                      <h4 className="text-white font-medium mb-1">{comm.subject}</h4>
                      <p className="text-gray-400 text-sm">From: {comm.from}</p>
                      <p className="text-gray-500 text-xs">{comm.time}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm">
                        Read
                      </button>
                      <button className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Communication Tools</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Mail className="h-8 w-8 text-blue-400 mb-2" />
                <span className="text-white text-sm">Send Email</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <MessageSquare className="h-8 w-8 text-green-400 mb-2" />
                <span className="text-white text-sm">Public Announcement</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Phone className="h-8 w-8 text-yellow-400 mb-2" />
                <span className="text-white text-sm">Schedule Call</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <FileText className="h-8 w-8 text-purple-400 mb-2" />
                <span className="text-white text-sm">Create Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports & Analytics Tab */}
      {activeTab === 'reports' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-400" />
                Department Analytics
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Issues Resolved</span>
                  <span className="text-white font-medium">156 this month</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Average Response Time</span>
                  <span className="text-white font-medium">2.3 days</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Citizen Satisfaction</span>
                  <span className="text-white font-medium">4.2/5.0</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                Budget Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Allocated Budget</span>
                  <span className="text-white font-medium">$2.5M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Spent to Date</span>
                  <span className="text-white font-medium">$1.7M</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Remaining</span>
                  <span className="text-white font-medium">$0.8M</span>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-400" />
                Team Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Active Team Members</span>
                  <span className="text-white font-medium">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Projects Completed</span>
                  <span className="text-white font-medium">12 this quarter</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Efficiency Rating</span>
                  <span className="text-white font-medium">87%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficialDashboard;