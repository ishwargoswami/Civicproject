import apiClient from './api';

/**
 * API service for official-specific endpoints
 */
export const officialsAPI = {
  /**
   * Get dashboard statistics for the current official
   */
  getDashboardStats: () => {
    return apiClient.get('/auth/officials/dashboard/stats/');
  },

  /**
   * Get issues assigned to the current official
   * @param params - Filter parameters (priority, status, urgent)
   */
  getAssignedIssues: (params?: {
    priority?: string;
    status?: string;
    urgent?: boolean;
  }) => {
    return apiClient.get('/auth/officials/assigned-issues/', { params });
  },

  /**
   * Get urgent issues requiring immediate attention
   */
  getUrgentIssues: () => {
    return apiClient.get('/auth/officials/urgent-issues/');
  },

  /**
   * Get unassigned issues available for assignment
   * @param params - Filter parameters (category)
   */
  getUnassignedIssues: (params?: {
    category?: string;
  }) => {
    return apiClient.get('/auth/officials/unassigned-issues/', { params });
  },

  /**
   * Assign an issue to an official
   * @param issueId - Issue UUID
   * @param assigneeId - User ID to assign (optional, defaults to self)
   */
  assignIssue: (issueId: string, assigneeId?: string) => {
    return apiClient.post(`/auth/officials/issues/${issueId}/assign/`, {
      assignee_id: assigneeId
    });
  },

  /**
   * Update issue priority
   * @param issueId - Issue UUID
   * @param priority - New priority (low, medium, high, critical)
   */
  updateIssuePriority: (issueId: string, priority: string) => {
    return apiClient.post(`/auth/officials/issues/${issueId}/priority/`, {
      priority
    });
  },

  /**
   * Get projects for the official's department
   * @param params - Filter parameters (status)
   */
  getDepartmentProjects: (params?: {
    status?: string;
  }) => {
    return apiClient.get('/auth/officials/projects/', { params });
  },

  /**
   * Get performance metrics for the official's department
   */
  getPerformanceMetrics: () => {
    return apiClient.get('/auth/officials/performance-metrics/');
  },

  /**
   * Get recent activities
   */
  getRecentActivities: () => {
    return apiClient.get('/auth/officials/recent-activities/');
  },

  /**
   * Update project progress and status
   * @param projectId - Project UUID
   * @param data - Update data (progress_percentage, status, comment)
   */
  updateProject: (projectId: string, data: {
    progress_percentage?: number;
    status?: string;
    comment?: string;
  }) => {
    return apiClient.post(`/transparency/projects/${projectId}/update_progress/`, data);
  },
};

export default officialsAPI;

