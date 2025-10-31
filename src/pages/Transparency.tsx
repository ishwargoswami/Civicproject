import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Building2,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Filter,
  Download,
  RefreshCw,
  Edit
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import {
  fetchDashboardStats,
  fetchDepartments,
  fetchCategories,
  fetchSpendingByDepartment,
  fetchSpendingByCategory,
  fetchSpendingTrends,
  fetchProjectStatusDistribution,
  fetchPublicProjects,
  fetchPerformanceMetrics,
  fetchPublicDocuments,
  setFilters,
  clearFilters,
} from '../store/slices/transparencySlice';
import { 
  SpendingChart, 
  TrendChart, 
  ProjectProgressChart, 
  PerformanceMetricsChart 
} from '../components/transparency';
import TransparencyFilters from '../components/transparency/TransparencyFilters';
import DocumentViewer from '../components/transparency/DocumentViewer';

const Transparency: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const {
    dashboardStats,
    departments,
    categories,
    spendingByDepartment,
    spendingByCategory,
    spendingTrends,
    projectStatusDistribution,
    projects,
    metrics,
    documents,
    filters,
    isLoading,
    error,
  } = useAppSelector((state) => state.transparency);

  const [activeTab, setActiveTab] = useState<'overview' | 'spending' | 'projects' | 'metrics' | 'documents'>('overview');
  const [showFilters, setShowFilters] = useState(false);
  
  // Role-based capabilities
  const isOfficial = user?.role === 'official';
  const isAdmin = user?.role === 'admin';
  const canManageProjects = isOfficial || isAdmin;

  useEffect(() => {
    // Load initial data
    dispatch(fetchDashboardStats());
    dispatch(fetchDepartments());
    dispatch(fetchCategories());
    dispatch(fetchSpendingByDepartment());
    dispatch(fetchSpendingByCategory());
    dispatch(fetchSpendingTrends());
    dispatch(fetchProjectStatusDistribution());
    dispatch(fetchPublicProjects({ page: 1, filters }));
    dispatch(fetchPerformanceMetrics());
    dispatch(fetchPublicDocuments({ page: 1, filters }));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchDashboardStats());
    dispatch(fetchSpendingByDepartment());
    dispatch(fetchSpendingByCategory());
    dispatch(fetchSpendingTrends());
    dispatch(fetchProjectStatusDistribution());
  };

  const handleFiltersChange = (newFilters: any) => {
    dispatch(setFilters(newFilters));
    // Refetch data based on active tab
    if (activeTab === 'projects') {
      dispatch(fetchPublicProjects({ page: 1, filters: newFilters }));
    } else if (activeTab === 'documents') {
      dispatch(fetchPublicDocuments({ page: 1, filters: newFilters }));
    } else if (activeTab === 'metrics') {
      dispatch(fetchPerformanceMetrics(newFilters));
    }
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'spending', label: 'Spending', icon: DollarSign },
    { id: 'projects', label: 'Projects', icon: TrendingUp },
    { id: 'metrics', label: 'Performance', icon: Target },
    { id: 'documents', label: 'Documents', icon: FileText },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toLocaleString()}`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-${color}-500/20 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}-400`} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
    </motion.div>
  );

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
            <h1 className="text-3xl font-bold text-white mb-2">Transparency Dashboard</h1>
            <p className="text-gray-400">Track public spending, project progress, and government performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <TransparencyFilters
                filters={filters}
                departments={departments}
                categories={categories}
                onFiltersChange={handleFiltersChange}
                onClearFilters={handleClearFilters}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400"
        >
          {error}
        </motion.div>
      )}

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

      {/* Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Grid */}
          {dashboardStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={DollarSign}
                title="Total Spending"
                value={formatCurrency(dashboardStats.total_spending)}
                subtitle="Current fiscal year"
                color="green"
              />
              <StatCard
                icon={TrendingUp}
                title="Active Projects"
                value={dashboardStats.active_projects}
                subtitle={`${dashboardStats.completed_projects} completed`}
                color="blue"
              />
              <StatCard
                icon={Building2}
                title="Departments"
                value={dashboardStats.total_departments}
                subtitle="Government departments"
                color="purple"
              />
              <StatCard
                icon={FileText}
                title="Public Documents"
                value={dashboardStats.total_documents}
                subtitle="Available for download"
                color="yellow"
              />
            </div>
          )}

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Spending by Department */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <SpendingChart
                data={spendingByDepartment.map(item => ({
                  name: item.department_name,
                  amount: item.total_amount,
                  count: item.transaction_count,
                }))}
                type="bar"
                title="Spending by Department"
                height={300}
              />
            </div>

            {/* Spending by Category */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <SpendingChart
                data={spendingByCategory.map(item => ({
                  name: item.category_name,
                  amount: item.total_amount,
                  color: item.category_color,
                  count: item.transaction_count,
                }))}
                type="pie"
                title="Spending by Category"
                height={300}
              />
            </div>

            {/* Spending Trends */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <TrendChart
                data={spendingTrends}
                type="area"
                title="Spending Trends"
                height={300}
                showSecondaryMetric={false}
              />
            </div>

            {/* Project Status Distribution */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <ProjectProgressChart
                data={projectStatusDistribution}
                type="pie"
                title="Project Status Distribution"
                height={300}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'spending' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <SpendingChart
                data={spendingByDepartment.map(item => ({
                  name: item.department_name,
                  amount: item.total_amount,
                }))}
                type="bar"
                title="Spending by Department"
                height={400}
              />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <TrendChart
                data={spendingTrends}
                type="line"
                title="Monthly Spending Trends"
                height={400}
              />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <SpendingChart
              data={spendingByCategory.map(item => ({
                name: item.category_name,
                amount: item.total_amount,
                color: item.category_color,
              }))}
              type="pie"
              title="Spending by Category"
              height={400}
            />
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <ProjectProgressChart
                data={projectStatusDistribution}
                type="bar"
                title="Projects by Status"
                height={300}
              />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <ProjectProgressChart
                data={projectStatusDistribution}
                type="pie"
                title="Project Distribution"
                height={300}
              />
            </div>
          </div>
          
          {/* Projects List */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-white">Recent Projects</h3>
              {canManageProjects && (
                <span className="text-sm text-blue-400">
                  ✏️ You can update projects from your department
                </span>
              )}
            </div>
            {projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.slice(0, 6).map((project) => {
                  // Check if official can manage this project (same department)
                  const canManageThisProject = canManageProjects && 
                    project.department && 
                    user?.department_name && 
                    project.department.name === user.department_name;
                  
                  return (
                    <div key={project.id} className="bg-white/5 border border-white/10 rounded-lg p-4 relative">
                      <h4 className="text-white font-medium mb-2 pr-8">{project.name}</h4>
                      
                      {canManageThisProject && (
                        <button
                          className="absolute top-4 right-4 p-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 transition-colors"
                          title="Update Project"
                          onClick={() => {
                            // Navigate to official dashboard to update
                            window.location.href = `/dashboard/official?updateProject=${project.id}`;
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-400 mb-1">
                          <span>Progress</span>
                          <span>{project.progress_percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            project.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                            project.status === 'approved' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {project.status.replace('_', ' ')}
                          </span>
                          <span className="text-gray-400">
                            {formatCurrency(project.budget_allocated)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {project.department?.name || 'No department'}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No projects found</p>
            )}
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div className="space-y-8">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <PerformanceMetricsChart
              data={metrics}
              title="Performance Metrics"
              height={400}
            />
          </div>
          
          {/* Metrics Grid */}
          {metrics.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {metrics.map((metric) => (
                <div key={metric.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-2">{metric.name}</h3>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-white">
                      {metric.current_value} {metric.unit}
                    </span>
                    {metric.is_meeting_target !== null && (
                      <span className={`p-2 rounded-full ${
                        metric.is_meeting_target ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {metric.is_meeting_target ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                      </span>
                    )}
                  </div>
                  {metric.target_value && (
                    <p className="text-gray-400 text-sm">
                      Target: {metric.target_value} {metric.unit}
                    </p>
                  )}
                  <p className="text-gray-400 text-xs mt-2">{metric.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-8">
          <DocumentViewer
            documents={documents}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
};

export default Transparency;
