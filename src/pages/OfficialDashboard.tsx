import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Link, useNavigate } from 'react-router-dom';
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
  Bookmark,
  RefreshCw
} from 'lucide-react';
import { RootState, AppDispatch } from '../store';
import {
  fetchDashboardStats,
  fetchAssignedIssues,
  fetchUrgentIssues,
  fetchDepartmentProjects,
  fetchPerformanceMetrics,
  clearError
} from '../store/slices/officialsSlice';
import { updateIssueStatus } from '../store/slices/issuesSlice';

const OfficialDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    dashboardStats,
    urgentIssues,
    departmentProjects,
    performanceMetrics,
    isLoading,
    error,
    lastUpdated
  } = useSelector((state: RootState) => state.officials);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'projects' | 'communication' | 'reports'>('overview');

  // Role-based access control
  if (!user || user.role !== 'official') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchUrgentIssues());
    dispatch(fetchDepartmentProjects());
    dispatch(fetchPerformanceMetrics());
  }, [dispatch]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(fetchDashboardStats());
      dispatch(fetchUrgentIssues());
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchUrgentIssues());
    dispatch(fetchDepartmentProjects());
    dispatch(fetchPerformanceMetrics());
  };

  const handleUpdateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      await dispatch(updateIssueStatus({ issueId, status: newStatus, comment: 'Status updated by official' })).unwrap();
      // Refresh urgent issues after update
      dispatch(fetchUrgentIssues());
      dispatch(fetchDashboardStats());
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

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
            <div className="flex items-center mt-2 text-sm text-gray-500 space-x-4">
              <span className="flex items-center">
                <Building2 className="h-4 w-4 mr-1" />
                {dashboardStats?.department_name || 'Not assigned'}
              </span>
              {lastUpdated && (
                <span className="text-xs text-gray-600">
                  Last updated: {new Date(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link 
              to="/dashboard/issues/new"
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Report Issue
            </Link>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
            <button
              onClick={() => dispatch(clearError())}
              className="text-red-400 hover:text-red-300"
            >
              ×
            </button>
          </div>
        )}
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

      {/* Loading State */}
      {isLoading && !dashboardStats && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading dashboard data...</p>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {activeTab === 'overview' && dashboardStats && (
        <div className="space-y-8">
          {/* Department Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Assigned Issues */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <ClipboardList className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{dashboardStats.assigned_issues.total}</h3>
              <p className="text-gray-400 text-sm mb-2">Assigned Issues</p>
              <p className="text-xs text-blue-400 mb-2">+{dashboardStats.assigned_issues.new_today} new today</p>
              <p className="text-xs text-gray-500">
                High: {dashboardStats.assigned_issues.high_priority} | Medium: {dashboardStats.assigned_issues.medium_priority} | Low: {dashboardStats.assigned_issues.low_priority}
              </p>
            </motion.div>

            {/* Active Projects */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{dashboardStats.active_projects.total}</h3>
              <p className="text-gray-400 text-sm mb-2">Active Projects</p>
              <p className="text-xs text-purple-400 mb-2">{dashboardStats.active_projects.delayed} behind schedule</p>
              <p className="text-xs text-gray-500">
                On Track: {dashboardStats.active_projects.on_track} | Delayed: {dashboardStats.active_projects.delayed} | Completed: {dashboardStats.active_projects.completed}
              </p>
            </motion.div>

            {/* Citizen Requests */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{dashboardStats.citizen_requests.total}</h3>
              <p className="text-gray-400 text-sm mb-2">Citizen Requests</p>
              <p className="text-xs text-green-400 mb-2">+{dashboardStats.citizen_requests.this_week} this week</p>
              <p className="text-xs text-gray-500">
                Pending: {dashboardStats.citizen_requests.pending} | In Progress: {dashboardStats.citizen_requests.in_progress} | Resolved: {dashboardStats.citizen_requests.resolved}
              </p>
            </motion.div>

            {/* Budget Utilization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">
                {dashboardStats.budget_utilization ? `${dashboardStats.budget_utilization.utilization_percentage}%` : 'N/A'}
              </h3>
              <p className="text-gray-400 text-sm mb-2">Budget Utilization</p>
              <p className="text-xs text-yellow-400 mb-2">Q3 spending</p>
              {dashboardStats.budget_utilization && (
                <p className="text-xs text-gray-500">
                  Allocated: ${(dashboardStats.budget_utilization.allocated / 1000000).toFixed(1)}M | 
                  Spent: ${(dashboardStats.budget_utilization.spent / 1000000).toFixed(1)}M | 
                  Remaining: ${(dashboardStats.budget_utilization.remaining / 1000000).toFixed(1)}M
                </p>
              )}
            </motion.div>
          </div>

          {/* Performance Metrics */}
          {performanceMetrics && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Target className="h-6 w-6 mr-2 text-green-400" />
                Department Performance
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(performanceMetrics).filter(([key]) => key !== 'department_metrics').map(([key, metric]: [string, any]) => (
                  <div key={key} className="bg-white/5 rounded-lg p-4">
                    <h4 className="text-white font-medium mb-2 capitalize">{key.replace(/_/g, ' ')}</h4>
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
          )}
        </div>
      )}

      {/* Issue Management Tab */}
      {activeTab === 'issues' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-400" />
                Urgent Issues Requiring Attention
              </h3>
              <Link
                to="/dashboard/issues"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                View All Issues →
              </Link>
            </div>
            
            {urgentIssues.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400">No urgent issues at the moment</p>
              </div>
            ) : (
              <div className="space-y-4">
                {urgentIssues.map((issue) => (
                  <div key={issue.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            issue.priority === 'high' || issue.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                            issue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {issue.priority} priority
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            issue.status === 'open' ? 'bg-blue-500/20 text-blue-400' :
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
                            {issue.location.address}
                          </span>
                          <span>by {issue.reportedBy.name}</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          to={`/dashboard/issues/${issue.id}`}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          View Details
                        </Link>
                        {issue.status === 'open' && (
                          <button
                            onClick={() => handleUpdateIssueStatus(issue.id, 'in_progress')}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                          >
                            Start Working
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Project Oversight Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-400" />
                Active Department Projects
              </h3>
              <Link
                to="/dashboard/transparency"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                View All Projects →
              </Link>
            </div>
            
            {departmentProjects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No active projects</p>
              </div>
            ) : (
              <div className="space-y-6">
                {departmentProjects.slice(0, 5).map((project) => (
                  <div key={project.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-white font-medium mb-2">{project.name}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${project.budget_spent.toLocaleString()} / ${project.budget_allocated.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due {new Date(project.expected_end_date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                              <span>Progress</span>
                              <span>{project.progress_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${
                                  project.status === 'in_progress' && !project.is_overdue ? 'bg-green-500' : 
                                  project.is_overdue ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${project.progress_percentage}%` }}
                              />
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            project.is_overdue ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Communication Tab */}
      {activeTab === 'communication' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
              <MessageSquare className="h-6 w-6 mr-2 text-green-400" />
              Communication Tools
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Mail className="h-10 w-10 text-blue-400 mb-3" />
                <span className="text-white font-medium">Send Email</span>
                <span className="text-gray-400 text-xs mt-1">To citizens</span>
              </button>
              <button className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <MessageSquare className="h-10 w-10 text-green-400 mb-3" />
                <span className="text-white font-medium">Announcement</span>
                <span className="text-gray-400 text-xs mt-1">Public notice</span>
              </button>
              <button className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <Phone className="h-10 w-10 text-yellow-400 mb-3" />
                <span className="text-white font-medium">Schedule Call</span>
                <span className="text-gray-400 text-xs mt-1">With citizens</span>
              </button>
              <button className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <FileText className="h-10 w-10 text-purple-400 mb-3" />
                <span className="text-white font-medium">Create Report</span>
                <span className="text-gray-400 text-xs mt-1">Department report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports & Analytics Tab */}
      {activeTab === 'reports' && dashboardStats && (
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
                  <span className="text-white font-medium">
                    {dashboardStats.citizen_requests.resolved} total
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Issues In Progress</span>
                  <span className="text-white font-medium">
                    {dashboardStats.assigned_issues.by_status.in_progress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Pending Issues</span>
                  <span className="text-white font-medium">
                    {dashboardStats.assigned_issues.by_status.open}
                  </span>
                </div>
              </div>
            </div>

            {dashboardStats.budget_utilization && (
              <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                  Budget Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Allocated Budget</span>
                    <span className="text-white font-medium">
                      ${(dashboardStats.budget_utilization.allocated / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Spent to Date</span>
                    <span className="text-white font-medium">
                      ${(dashboardStats.budget_utilization.spent / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Remaining</span>
                    <span className="text-white font-medium">
                      ${(dashboardStats.budget_utilization.remaining / 1000000).toFixed(1)}M
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                Project Overview
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Projects</span>
                  <span className="text-white font-medium">
                    {dashboardStats.active_projects.total}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">In Progress</span>
                  <span className="text-white font-medium">
                    {dashboardStats.active_projects.in_progress}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Completed</span>
                  <span className="text-white font-medium">
                    {dashboardStats.active_projects.completed}
                  </span>
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
