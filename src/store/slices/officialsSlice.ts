import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import officialsAPI from '../../services/officialsApi';
import { Issue } from './issuesSlice';

// Types
export interface DashboardStats {
  assigned_issues: {
    total: number;
    new_today: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    by_status: {
      open: number;
      in_progress: number;
      resolved: number;
      closed: number;
    };
  };
  active_projects: {
    total: number;
    in_progress: number;
    on_track: number;
    delayed: number;
    completed: number;
  };
  citizen_requests: {
    total: number;
    this_week: number;
    pending: number;
    in_progress: number;
    resolved: number;
  };
  budget_utilization: {
    allocated: number;
    spent: number;
    remaining: number;
    utilization_percentage: number;
  } | null;
  department_name: string;
  position: string;
}

export interface DepartmentProject {
  id: string;
  name: string;
  description: string;
  department_name: string;
  category_name: string;
  category_color: string;
  budget_allocated: number;
  budget_spent: number;
  budget_remaining: number;
  is_over_budget: boolean;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
  is_overdue: boolean;
  status: string;
  progress_percentage: number;
  is_public: boolean;
  website: string;
  created_at: string;
  updated_at: string;
}

export interface PerformanceMetric {
  issue_resolution_time: {
    current: string;
    target: string;
    trend: string;
    change: string;
  };
  citizen_satisfaction: {
    current: string;
    target: string;
    trend: string;
    change: string;
  };
  project_completion_rate: {
    current: string;
    target: string;
    trend: string;
    change: string;
  };
  budget_efficiency: {
    current: string;
    target: string;
    trend: string;
    change: string;
  };
  department_metrics: Array<{
    name: string;
    metric_type: string;
    current_value: number;
    target_value: number | null;
    unit: string;
    period_start: string;
    period_end: string;
    is_meeting_target: boolean | null;
  }>;
}

export interface Activity {
  id: string;
  event_type: string;
  description: string;
  user: number;
  user_name: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface OfficialsState {
  dashboardStats: DashboardStats | null;
  assignedIssues: Issue[];
  urgentIssues: Issue[];
  unassignedIssues: Issue[];
  departmentProjects: DepartmentProject[];
  performanceMetrics: PerformanceMetric | null;
  recentActivities: Activity[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

const initialState: OfficialsState = {
  dashboardStats: null,
  assignedIssues: [],
  urgentIssues: [],
  unassignedIssues: [],
  departmentProjects: [],
  performanceMetrics: null,
  recentActivities: [],
  isLoading: false,
  error: null,
  lastUpdated: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'officials/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.getDashboardStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchAssignedIssues = createAsyncThunk(
  'officials/fetchAssignedIssues',
  async (params: { priority?: string; status?: string; urgent?: boolean } | undefined, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.getAssignedIssues(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch assigned issues');
    }
  }
);

export const fetchUrgentIssues = createAsyncThunk(
  'officials/fetchUrgentIssues',
  async (_, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.getUrgentIssues();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch urgent issues');
    }
  }
);

export const fetchUnassignedIssues = createAsyncThunk(
  'officials/fetchUnassignedIssues',
  async (params: { category?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.getUnassignedIssues(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch unassigned issues');
    }
  }
);

export const assignIssue = createAsyncThunk(
  'officials/assignIssue',
  async ({ issueId, assigneeId }: { issueId: string; assigneeId?: string }, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.assignIssue(issueId, assigneeId);
      return { issueId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign issue');
    }
  }
);

export const updateIssuePriority = createAsyncThunk(
  'officials/updateIssuePriority',
  async ({ issueId, priority }: { issueId: string; priority: string }, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.updateIssuePriority(issueId, priority);
      return { issueId, priority, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update priority');
    }
  }
);

export const fetchDepartmentProjects = createAsyncThunk(
  'officials/fetchDepartmentProjects',
  async (params: { status?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.getDepartmentProjects(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch department projects');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'officials/fetchPerformanceMetrics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.getPerformanceMetrics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance metrics');
    }
  }
);

export const fetchRecentActivities = createAsyncThunk(
  'officials/fetchRecentActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await officialsAPI.getRecentActivities();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recent activities');
    }
  }
);

// Slice
const officialsSlice = createSlice({
  name: 'officials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetOfficialsState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Assigned Issues
      .addCase(fetchAssignedIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAssignedIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.assignedIssues = action.payload.results || action.payload;
      })
      .addCase(fetchAssignedIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Urgent Issues
      .addCase(fetchUrgentIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUrgentIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.urgentIssues = action.payload;
      })
      .addCase(fetchUrgentIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Unassigned Issues
      .addCase(fetchUnassignedIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUnassignedIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.unassignedIssues = action.payload.results || action.payload;
      })
      .addCase(fetchUnassignedIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Assign Issue
      .addCase(assignIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from unassigned issues
        state.unassignedIssues = state.unassignedIssues.filter(
          issue => issue.id !== action.payload.issueId
        );
      })
      .addCase(assignIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update Issue Priority
      .addCase(updateIssuePriority.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateIssuePriority.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update priority in assigned issues
        const issueIndex = state.assignedIssues.findIndex(
          issue => issue.id === action.payload.issueId
        );
        if (issueIndex !== -1) {
          state.assignedIssues[issueIndex].priority = action.payload.priority as any;
        }
      })
      .addCase(updateIssuePriority.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Department Projects
      .addCase(fetchDepartmentProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departmentProjects = action.payload.results || action.payload;
      })
      .addCase(fetchDepartmentProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Performance Metrics
      .addCase(fetchPerformanceMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.performanceMetrics = action.payload;
      })
      .addCase(fetchPerformanceMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Recent Activities
      .addCase(fetchRecentActivities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecentActivities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentActivities = action.payload;
      })
      .addCase(fetchRecentActivities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetOfficialsState } = officialsSlice.actions;
export default officialsSlice.reducer;

