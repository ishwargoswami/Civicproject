import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  RefreshCw,
  X,
  Check,
  ChevronDown,
  Filter,
  Download,
  UserPlus,
  Bell,
  Megaphone,
  FileSpreadsheet
} from 'lucide-react';
import { RootState, AppDispatch } from '../store';
import {
  fetchDashboardStats,
  fetchAssignedIssues,
  fetchUrgentIssues,
  fetchDepartmentProjects,
  fetchPerformanceMetrics,
  fetchUnassignedIssues,
  assignIssueToSelf,
  updateIssuePriorityAction,
  clearError
} from '../store/slices/officialsSlice';
import { updateIssueStatus, addComment } from '../store/slices/issuesSlice';
import officialsAPI from '../services/officialsApi';

const OfficialDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const {
    dashboardStats,
    assignedIssues,
    urgentIssues,
    unassignedIssues,
    departmentProjects,
    performanceMetrics,
    isLoading,
    error,
    lastUpdated
  } = useSelector((state: RootState) => state.officials);
  
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'projects' | 'communication' | 'reports'>('overview');

  // Modals and UI states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showProjectUpdateModal, setShowProjectUpdateModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [selectedIssues, setSelectedIssues] = useState<Set<string>>(new Set());

  // Form states
  const [statusComment, setStatusComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [announcement, setAnnouncement] = useState({ title: '', content: '', priority: 'medium' });
  const [message, setMessage] = useState({ recipient: '', subject: '', content: '' });
  const [projectUpdate, setProjectUpdate] = useState({ progress: 0, status: '', comment: '' });

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
    dispatch(fetchAssignedIssues());
    dispatch(fetchUnassignedIssues());
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
    dispatch(fetchAssignedIssues());
    dispatch(fetchUnassignedIssues());
  };

  const handleAssignIssueToSelf = async (issueId: string) => {
    try {
      await dispatch(assignIssueToSelf(issueId)).unwrap();
      dispatch(fetchUnassignedIssues());
      dispatch(fetchAssignedIssues());
      dispatch(fetchDashboardStats());
    } catch (error) {
      console.error('Failed to assign issue:', error);
    }
  };

  const handleUpdatePriority = async (issueId: string, priority: string) => {
    try {
      await dispatch(updateIssuePriorityAction({ issueId, priority })).unwrap();
      dispatch(fetchAssignedIssues());
      setShowPriorityModal(false);
      setSelectedIssue(null);
    } catch (error) {
      console.error('Failed to update priority:', error);
    }
  };

  const handleUpdateIssueStatus = async (newStatus: string) => {
    if (!selectedIssue) return;
    
    try {
      await dispatch(updateIssueStatus({ issueId: selectedIssue.id, status: newStatus, comment: statusComment })).unwrap();
      // Refresh all relevant data
      await Promise.all([
        dispatch(fetchUrgentIssues()),
        dispatch(fetchAssignedIssues()),
        dispatch(fetchDashboardStats())
      ]);
      setShowStatusModal(false);
      setSelectedIssue(null);
      setStatusComment('');
      setSelectedStatus('');
    } catch (error) {
      console.error('Failed to update issue status:', error);
    }
  };

  const handleProjectUpdate = async () => {
    if (!selectedProject) return;
    
    try {
      await officialsAPI.updateProject(selectedProject.id, {
        progress_percentage: projectUpdate.progress,
        status: projectUpdate.status,
        comment: projectUpdate.comment
      });
      
      // Refresh projects data to sync with citizens view
      await Promise.all([
        dispatch(fetchDepartmentProjects()),
        dispatch(fetchDashboardStats())
      ]);
      
      setShowProjectUpdateModal(false);
      setSelectedProject(null);
      setProjectUpdate({ progress: 0, status: '', comment: '' });
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleBulkAssign = async () => {
    for (const issueId of selectedIssues) {
      await handleAssignIssueToSelf(issueId);
    }
    setSelectedIssues(new Set());
  };

  const handleSendAnnouncement = async () => {
    // TODO: Implement announcement API
    console.log('Sending announcement:', announcement);
    setShowAnnouncementModal(false);
    setAnnouncement({ title: '', content: '', priority: 'medium' });
    // Show success notification
  };

  const handleSendMessage = async () => {
    // TODO: Implement messaging API
    console.log('Sending message:', message);
    setShowMessageModal(false);
    setMessage({ recipient: '', subject: '', content: '' });
    // Show success notification
  };

  const handleExportReport = () => {
    if (!dashboardStats) return;

    // Generate CSV report
    const reportData = [
      ['Official Dashboard Report'],
      ['Department:', dashboardStats.department_name],
      ['Generated:', new Date().toLocaleString()],
      [''],
      ['=== DEPARTMENT ANALYTICS ==='],
      ['Metric', 'Value'],
      ['Issues Resolved', dashboardStats.citizen_requests.resolved],
      ['Issues In Progress', dashboardStats.assigned_issues.by_status.in_progress],
      ['Pending Issues', dashboardStats.assigned_issues.by_status.open],
      ['Resolution Rate', `${((dashboardStats.citizen_requests.resolved / dashboardStats.citizen_requests.total) * 100).toFixed(1)}%`],
      [''],
      ['=== BUDGET STATUS ==='],
      ['Metric', 'Value'],
      ...(dashboardStats.budget_utilization ? [
        ['Allocated Budget', `$${(dashboardStats.budget_utilization.allocated / 1000000).toFixed(1)}M`],
        ['Spent to Date', `$${(dashboardStats.budget_utilization.spent / 1000000).toFixed(1)}M`],
        ['Remaining', `$${(dashboardStats.budget_utilization.remaining / 1000000).toFixed(1)}M`],
        ['Utilization', `${dashboardStats.budget_utilization.utilization_percentage}%`]
      ] : []),
      [''],
      ['=== PROJECT OVERVIEW ==='],
      ['Metric', 'Value'],
      ['Total Projects', dashboardStats.active_projects.total],
      ['In Progress', dashboardStats.active_projects.in_progress],
      ['Completed', dashboardStats.active_projects.completed],
      ['Completion Rate', `${dashboardStats.active_projects.total > 0 ? ((dashboardStats.active_projects.completed / dashboardStats.active_projects.total) * 100).toFixed(1) : 0}%`],
      [''],
      ['=== ISSUE STATUS DISTRIBUTION ==='],
      ['Status', 'Count'],
      ['Open', dashboardStats.assigned_issues.by_status.open],
      ['In Progress', dashboardStats.assigned_issues.by_status.in_progress],
      ['Resolved', dashboardStats.assigned_issues.by_status.resolved],
      ['Closed', dashboardStats.assigned_issues.by_status.closed || 0],
      [''],
      ['=== PRIORITY DISTRIBUTION ==='],
      ['Priority', 'Count'],
      ['High Priority', dashboardStats.assigned_issues.high_priority],
      ['Medium Priority', dashboardStats.assigned_issues.medium_priority],
      ['Low Priority', dashboardStats.assigned_issues.low_priority],
    ];

    // Convert to CSV
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `official-dashboard-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleIssueSelection = (issueId: string) => {
    const newSelection = new Set(selectedIssues);
    if (newSelection.has(issueId)) {
      newSelection.delete(issueId);
    } else {
      newSelection.add(issueId);
    }
    setSelectedIssues(newSelection);
  };

  const getFilteredIssues = () => {
    let filtered = assignedIssues || [];
    if (filterStatus !== 'all') {
      filtered = filtered.filter((issue: any) => issue.status === filterStatus);
    }
    if (filterPriority !== 'all') {
      filtered = filtered.filter((issue: any) => issue.priority === filterPriority);
    }
    return filtered;
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
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setActiveTab('issues')}
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
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setActiveTab('projects')}
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
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setActiveTab('communication')}
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
              className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => setActiveTab('reports')}
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
          {/* Filters and Actions */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              {selectedIssues.size > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">{selectedIssues.size} selected</span>
                  <button
                    onClick={handleBulkAssign}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Bulk Assign
                  </button>
                  <button
                    onClick={() => setSelectedIssues(new Set())}
                    className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Unassigned Issues */}
          {unassignedIssues && unassignedIssues.length > 0 && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center">
                  <UserPlus className="h-6 w-6 mr-2 text-yellow-400" />
                  Unassigned Issues ({unassignedIssues.length})
                </h3>
              </div>
              <div className="space-y-4">
                {unassignedIssues.slice(0, 5).map((issue: any) => (
                  <div key={issue.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedIssues.has(issue.id)}
                          onChange={() => toggleIssueSelection(issue.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              issue.priority === 'high' || issue.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                              issue.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {issue.priority} priority
                            </span>
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">
                              Unassigned
                            </span>
                          </div>
                          <h4 className="text-white font-medium mb-1">{issue.title}</h4>
                          <div className="flex items-center text-gray-400 text-sm space-x-4">
                            <span className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {issue.location?.address || 'Location not specified'}
                            </span>
                            <span>by {issue.reported_by?.name || issue.reportedBy?.name || 'Unknown'}</span>
                            <span>{new Date(issue.created_at || issue.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAssignIssueToSelf(issue.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                        >
                          Assign to Me
                        </button>
                        <Link
                          to={`/dashboard/issues/${issue.id}`}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Issues */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <AlertTriangle className="h-6 w-6 mr-2 text-red-400" />
                My Assigned Issues ({getFilteredIssues().length})
              </h3>
              <Link
                to="/dashboard/issues"
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center"
              >
                View All Issues →
              </Link>
            </div>
            
            {getFilteredIssues().length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-400">No issues match the current filters</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getFilteredIssues().map((issue: any) => (
                  <div key={issue.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:bg-white/10 transition-colors">
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
                            issue.status === 'resolved' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {issue.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-white font-medium mb-1">{issue.title}</h4>
                        <div className="flex items-center text-gray-400 text-sm space-x-4">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {issue.location?.address || 'Location not specified'}
                          </span>
                          <span>by {issue.reported_by?.name || issue.reportedBy?.name || 'Unknown'}</span>
                          <span>{new Date(issue.created_at || issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowPriorityModal(true);
                            }}
                            className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                          >
                            <Flag className="h-3 w-3 inline mr-1" />
                            Priority
                          </button>
                          <button
                            onClick={() => {
                              setSelectedIssue(issue);
                              setShowStatusModal(true);
                            }}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
                          >
                            <Edit className="h-3 w-3 inline mr-1" />
                            Status
                          </button>
                        </div>
                        <Link
                          to={`/dashboard/issues/${issue.id}`}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm text-center"
                        >
                          View Details
                        </Link>
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
                {departmentProjects.slice(0, 5).map((project: any) => (
                  <div key={project.id} className="bg-white/5 rounded-lg p-6 border border-white/10 hover:bg-white/10 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-white font-medium text-lg">{project.name}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            project.is_overdue ? 'bg-red-500/20 text-red-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                          <span className="flex items-center">
                            <DollarSign className="h-4 w-4 mr-1" />
                            ${project.budget_spent.toLocaleString()} / ${project.budget_allocated.toLocaleString()}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Due {new Date(project.expected_end_date).toLocaleDateString()}
                          </span>
                          {project.is_overdue && (
                            <span className="text-red-400">
                              <Clock className="h-4 w-4 inline mr-1" />
                              Overdue
                            </span>
                          )}
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Progress</span>
                            <span>{project.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-300 ${
                                project.status === 'in_progress' && !project.is_overdue ? 'bg-green-500' : 
                                project.is_overdue ? 'bg-red-500' : 
                                project.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${project.progress_percentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Budget Progress */}
                        <div>
                          <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>Budget Utilization</span>
                            <span>{((project.budget_spent / project.budget_allocated) * 100).toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                (project.budget_spent / project.budget_allocated) > 0.9 ? 'bg-red-500' : 
                                (project.budget_spent / project.budget_allocated) > 0.75 ? 'bg-yellow-500' : 
                                'bg-blue-500'
                              }`}
                              style={{ width: `${(project.budget_spent / project.budget_allocated) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => {
                            setSelectedProject(project);
                            setProjectUpdate({ 
                              progress: project.progress_percentage, 
                              status: project.status, 
                              comment: '' 
                            });
                            setShowProjectUpdateModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm mb-2 w-full"
                        >
                          <Edit className="h-3 w-3 inline mr-1" />
                          Update
                        </button>
                        <Link
                          to={`/dashboard/transparency`}
                          className="flex items-center justify-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm w-full"
                        >
                          <Eye className="h-3 w-3 inline mr-1" />
                          Details
                        </Link>
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
              <button
                onClick={() => setShowAnnouncementModal(true)}
                className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <Megaphone className="h-10 w-10 text-blue-400 mb-3" />
                <span className="text-white font-medium">Create Announcement</span>
                <span className="text-gray-400 text-xs mt-1">Public notice</span>
              </button>
              <button
                onClick={() => setShowMessageModal(true)}
                className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
              >
                <Mail className="h-10 w-10 text-green-400 mb-3" />
                <span className="text-white font-medium">Send Message</span>
                <span className="text-gray-400 text-xs mt-1">To citizens</span>
              </button>
              <button className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                <Phone className="h-10 w-10 text-yellow-400 mb-3" />
                <span className="text-white font-medium">Schedule Call</span>
                <span className="text-gray-400 text-xs mt-1">With citizens</span>
              </button>
              <button className="flex flex-col items-center p-6 bg-white/5 rounded-lg hover:bg-white/10 transition-colors border border-white/10">
                <Bell className="h-10 w-10 text-purple-400 mb-3" />
                <span className="text-white font-medium">Send Alert</span>
                <span className="text-gray-400 text-xs mt-1">Emergency alert</span>
              </button>
            </div>
          </div>

          {/* Recent Communications */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Communications</h3>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Megaphone className="h-5 w-5 text-blue-400 mt-1" />
                    <div>
                      <h4 className="text-white font-medium">Public Works Update</h4>
                      <p className="text-gray-400 text-sm mt-1">Road maintenance schedule for next week announced</p>
                      <span className="text-xs text-gray-500 mt-2 block">2 hours ago</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs">Announcement</span>
                </div>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-green-400 mt-1" />
                    <div>
                      <h4 className="text-white font-medium">Issue #1234 Update Sent</h4>
                      <p className="text-gray-400 text-sm mt-1">Status update sent to reporter: John Doe</p>
                      <span className="text-xs text-gray-500 mt-2 block">5 hours ago</span>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">Message</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reports & Analytics Tab */}
      {activeTab === 'reports' && dashboardStats && (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Department Reports & Analytics</h3>
            <button 
              onClick={handleExportReport}
              className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>

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
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-gray-400">Resolution Rate</span>
                  <span className="text-green-400 font-medium">
                    {((dashboardStats.citizen_requests.resolved / dashboardStats.citizen_requests.total) * 100).toFixed(1)}%
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
                  <div className="pt-3 border-t border-white/10">
                    <div className="flex justify-between text-sm text-gray-400 mb-2">
                      <span>Utilization</span>
                      <span>{dashboardStats.budget_utilization.utilization_percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          dashboardStats.budget_utilization.utilization_percentage > 90 ? 'bg-red-500' : 
                          dashboardStats.budget_utilization.utilization_percentage > 75 ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${dashboardStats.budget_utilization.utilization_percentage}%` }}
                      />
                    </div>
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
                <div className="flex justify-between items-center pt-3 border-t border-white/10">
                  <span className="text-gray-400">Completion Rate</span>
                  <span className="text-green-400 font-medium">
                    {dashboardStats.active_projects.total > 0 
                      ? ((dashboardStats.active_projects.completed / dashboardStats.active_projects.total) * 100).toFixed(1)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Issue Status Distribution</h3>
              <div className="space-y-3">
                {Object.entries(dashboardStats.assigned_issues.by_status).map(([status, count]: [string, any]) => (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400 capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-white">{count}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          status === 'open' ? 'bg-blue-500' :
                          status === 'in_progress' ? 'bg-green-500' :
                          status === 'resolved' ? 'bg-purple-500' :
                          'bg-gray-500'
                        }`}
                        style={{ width: `${(count / dashboardStats.assigned_issues.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Priority Distribution</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">High Priority</span>
                    <span className="text-white">{dashboardStats.assigned_issues.high_priority}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-red-500"
                      style={{ width: `${(dashboardStats.assigned_issues.high_priority / dashboardStats.assigned_issues.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Medium Priority</span>
                    <span className="text-white">{dashboardStats.assigned_issues.medium_priority}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-yellow-500"
                      style={{ width: `${(dashboardStats.assigned_issues.medium_priority / dashboardStats.assigned_issues.total) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Low Priority</span>
                    <span className="text-white">{dashboardStats.assigned_issues.low_priority}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-gray-500"
                      style={{ width: `${(dashboardStats.assigned_issues.low_priority / dashboardStats.assigned_issues.total) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Priority Modal */}
      <AnimatePresence>
        {showPriorityModal && selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPriorityModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Update Priority</h3>
              <p className="text-gray-400 mb-4">Issue: {selectedIssue.title}</p>
              <div className="space-y-3 mb-6">
                {['low', 'medium', 'high', 'critical'].map((priority) => (
                  <button
                    key={priority}
                    onClick={() => handleUpdatePriority(selectedIssue.id, priority)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      priority === 'critical' ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' :
                      priority === 'high' ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30' :
                      priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border border-yellow-500/30' :
                      'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
                    }`}
                  >
                    <span className="font-medium capitalize">{priority}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  setShowPriorityModal(false);
                  setSelectedIssue(null);
                }}
                className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status Modal */}
      <AnimatePresence>
        {showStatusModal && selectedIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowStatusModal(false);
              setSelectedIssue(null);
              setStatusComment('');
              setSelectedStatus('');
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-md w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Update Status</h3>
              <p className="text-gray-400 mb-4">Issue: {selectedIssue.title}</p>
              <p className="text-sm text-gray-500 mb-4">Current status: <span className="capitalize text-blue-400">{selectedIssue.status.replace('_', ' ')}</span></p>
              
              <div className="space-y-3 mb-4">
                {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`w-full p-3 rounded-lg text-left transition-colors ${
                      selectedStatus === status
                        ? status === 'open' ? 'bg-blue-500/40 text-blue-300 border-2 border-blue-500' :
                          status === 'in_progress' ? 'bg-green-500/40 text-green-300 border-2 border-green-500' :
                          status === 'resolved' ? 'bg-purple-500/40 text-purple-300 border-2 border-purple-500' :
                          'bg-gray-500/40 text-gray-300 border-2 border-gray-500'
                        : status === 'open' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30' :
                          status === 'in_progress' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/30' :
                          status === 'resolved' ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 border border-purple-500/30' :
                          'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 border border-gray-500/30'
                    }`}
                  >
                    <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                  </button>
                ))}
              </div>
              
              <textarea
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
                placeholder="Add a comment about this status change (optional)..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                rows={3}
              />
              
              <div className="flex space-x-3">
                <button
                  onClick={() => handleUpdateIssueStatus(selectedStatus)}
                  disabled={!selectedStatus || selectedStatus === selectedIssue.status}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedIssue(null);
                    setStatusComment('');
                    setSelectedStatus('');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project Update Modal */}
      <AnimatePresence>
        {showProjectUpdateModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowProjectUpdateModal(false);
              setSelectedProject(null);
              setProjectUpdate({ progress: 0, status: '', comment: '' });
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-lg w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Update Project</h3>
              <p className="text-gray-400 mb-4">Project: {selectedProject.name}</p>
              
              <div className="space-y-4">
                {/* Progress Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Progress: {projectUpdate.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={projectUpdate.progress}
                    onChange={(e) => setProjectUpdate({ ...projectUpdate, progress: parseInt(e.target.value) })}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Status Update */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Status</label>
                  <select
                    value={projectUpdate.status}
                    onChange={(e) => setProjectUpdate({ ...projectUpdate, status: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select status...</option>
                    <option value="planning">Planning</option>
                    <option value="approved">Approved</option>
                    <option value="in_progress">In Progress</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Update Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Update Notes</label>
                  <textarea
                    value={projectUpdate.comment}
                    onChange={(e) => setProjectUpdate({ ...projectUpdate, comment: e.target.value })}
                    placeholder="Add notes about this update..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                  />
                </div>

                {/* Project Info */}
                <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Progress:</span>
                    <span className="text-white">{selectedProject.progress_percentage}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Budget Used:</span>
                    <span className="text-white">
                      ${selectedProject.budget_spent.toLocaleString()} / ${selectedProject.budget_allocated.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Due Date:</span>
                    <span className={selectedProject.is_overdue ? 'text-red-400' : 'text-white'}>
                      {new Date(selectedProject.expected_end_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleProjectUpdate}
                  disabled={!projectUpdate.status || (projectUpdate.progress === selectedProject.progress_percentage && projectUpdate.status === selectedProject.status)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4 inline mr-2" />
                  Save Update
                </button>
                <button
                  onClick={() => {
                    setShowProjectUpdateModal(false);
                    setSelectedProject(null);
                    setProjectUpdate({ progress: 0, status: '', comment: '' });
                  }}
                  className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Announcement Modal */}
      <AnimatePresence>
        {showAnnouncementModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAnnouncementModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Create Public Announcement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                  <input
                    type="text"
                    value={announcement.title}
                    onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                    placeholder="Announcement title..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                  <select
                    value={announcement.priority}
                    onChange={(e) => setAnnouncement({ ...announcement, priority: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Content</label>
                  <textarea
                    value={announcement.content}
                    onChange={(e) => setAnnouncement({ ...announcement, content: e.target.value })}
                    placeholder="Write your announcement..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSendAnnouncement}
                    disabled={!announcement.title || !announcement.content}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 inline mr-2" />
                    Send Announcement
                  </button>
                  <button
                    onClick={() => {
                      setShowAnnouncementModal(false);
                      setAnnouncement({ title: '', content: '', priority: 'medium' });
                    }}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {showMessageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMessageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-semibold text-white mb-4">Send Message</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Recipient</label>
                  <input
                    type="text"
                    value={message.recipient}
                    onChange={(e) => setMessage({ ...message, recipient: e.target.value })}
                    placeholder="Recipient email or name..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Subject</label>
                  <input
                    type="text"
                    value={message.subject}
                    onChange={(e) => setMessage({ ...message, subject: e.target.value })}
                    placeholder="Message subject..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Message</label>
                  <textarea
                    value={message.content}
                    onChange={(e) => setMessage({ ...message, content: e.target.value })}
                    placeholder="Write your message..."
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={6}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.recipient || !message.subject || !message.content}
                    className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 inline mr-2" />
                    Send Message
                  </button>
                  <button
                    onClick={() => {
                      setShowMessageModal(false);
                      setMessage({ recipient: '', subject: '', content: '' });
                    }}
                    className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OfficialDashboard;
