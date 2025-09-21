import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transparencyAPI } from '../../services/api';

// Types
export interface Department {
  id: string;
  name: string;
  slug: string;
  description: string;
  head: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  budget_allocated: number;
  contact_email: string;
  contact_phone: string;
  is_active: boolean;
  created_at: string;
  total_spending: number;
  active_projects_count: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  parent: string | null;
  color: string;
  total_allocated: number;
  total_spent: number;
  projects_count: number;
}

export interface PublicSpending {
  id: string;
  title: string;
  description: string;
  department: Department;
  category: BudgetCategory;
  amount: number;
  currency: string;
  vendor_name: string;
  vendor_contact: string;
  contract_number: string;
  contract_date: string | null;
  fiscal_year: number;
  transaction_date: string;
  documents: string[];
  is_approved: boolean;
  approved_by: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface PublicSpendingSummary {
  id: string;
  title: string;
  amount: number;
  fiscal_year: number;
  transaction_date: string;
  department_name: string;
  category_name: string;
  category_color: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  target_date: string;
  completion_date: string | null;
  is_completed: boolean;
  created_at: string;
}

export interface PublicProject {
  id: string;
  name: string;
  description: string;
  department: Department;
  category: BudgetCategory;
  manager: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  budget_allocated: number;
  budget_spent: number;
  budget_remaining: number;
  is_over_budget: boolean;
  start_date: string;
  expected_end_date: string;
  actual_end_date: string | null;
  is_overdue: boolean;
  status: 'planned' | 'approved' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';
  progress_percentage: number;
  is_public: boolean;
  website: string;
  milestones: ProjectMilestone[];
  created_at: string;
  updated_at: string;
}

export interface PublicProjectSummary {
  id: string;
  name: string;
  status: string;
  progress_percentage: number;
  budget_allocated: number;
  budget_spent: number;
  budget_remaining: number;
  is_overdue: boolean;
  start_date: string;
  expected_end_date: string;
  department_name: string;
  category_name: string;
  category_color: string;
}

export interface PerformanceMetric {
  id: string;
  name: string;
  metric_type: string;
  description: string;
  department: Department | null;
  project: PublicProjectSummary | null;
  current_value: number;
  target_value: number | null;
  unit: string;
  period_start: string;
  period_end: string;
  is_meeting_target: boolean | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublicDocument {
  id: string;
  title: string;
  description: string;
  document_type: string;
  department: Department;
  file: string;
  file_size: number;
  file_type: string;
  tags: string[];
  date_created: string;
  is_public: boolean;
  requires_request: boolean;
  uploaded_by: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
}

// Chart Data Types
export interface SpendingByDepartment {
  department_name: string;
  total_amount: number;
  transaction_count: number;
}

export interface SpendingByCategory {
  category_name: string;
  category_color: string;
  total_amount: number;
  transaction_count: number;
}

export interface SpendingTrend {
  month: string;
  total_amount: number;
  transaction_count: number;
}

export interface ProjectStatusDistribution {
  status: string;
  count: number;
  total_budget: number;
}

export interface BudgetOverview {
  fiscal_year: number;
  total_allocated: number;
  total_spent: number;
  total_remaining: number;
  utilization_percentage: number;
}

export interface DashboardStats {
  total_spending: number;
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  total_departments: number;
  total_documents: number;
  avg_project_completion: number;
  budget_utilization: number;
}

// Filters
export interface TransparencyFilters {
  year?: number;
  department?: string;
  category?: string;
  status?: string;
  min_amount?: number;
  max_amount?: number;
  document_type?: string;
  metric_type?: string;
  search?: string;
}

// State Interface
export interface TransparencyState {
  // Data
  departments: Department[];
  categories: BudgetCategory[];
  spending: PublicSpendingSummary[];
  projects: PublicProjectSummary[];
  metrics: PerformanceMetric[];
  documents: PublicDocument[];
  
  // Selected items for details
  selectedSpending: PublicSpending | null;
  selectedProject: PublicProject | null;
  
  // Dashboard data
  dashboardStats: DashboardStats | null;
  spendingByDepartment: SpendingByDepartment[];
  spendingByCategory: SpendingByCategory[];
  spendingTrends: SpendingTrend[];
  projectStatusDistribution: ProjectStatusDistribution[];
  budgetOverview: BudgetOverview[];
  
  // UI State
  filters: TransparencyFilters;
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const initialState: TransparencyState = {
  departments: [],
  categories: [],
  spending: [],
  projects: [],
  metrics: [],
  documents: [],
  selectedSpending: null,
  selectedProject: null,
  dashboardStats: null,
  spendingByDepartment: [],
  spendingByCategory: [],
  spendingTrends: [],
  projectStatusDistribution: [],
  budgetOverview: [],
  filters: {},
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  },
};

// Async Thunks
export const fetchDashboardStats = createAsyncThunk(
  'transparency/fetchDashboardStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getDashboardStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

export const fetchDepartments = createAsyncThunk(
  'transparency/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getDepartments();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch departments');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'transparency/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchPublicSpending = createAsyncThunk(
  'transparency/fetchPublicSpending',
  async (params: { page?: number; filters?: TransparencyFilters }, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getPublicSpending({
        page: params.page,
        ...params.filters,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public spending');
    }
  }
);

export const fetchSpendingDetails = createAsyncThunk(
  'transparency/fetchSpendingDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getSpendingDetails(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch spending details');
    }
  }
);

export const fetchPublicProjects = createAsyncThunk(
  'transparency/fetchPublicProjects',
  async (params: { page?: number; filters?: TransparencyFilters }, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getPublicProjects({
        page: params.page,
        ...params.filters,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public projects');
    }
  }
);

export const fetchProjectDetails = createAsyncThunk(
  'transparency/fetchProjectDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getProjectDetails(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project details');
    }
  }
);

export const fetchPerformanceMetrics = createAsyncThunk(
  'transparency/fetchPerformanceMetrics',
  async (filters?: TransparencyFilters, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getPerformanceMetrics(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch performance metrics');
    }
  }
);

export const fetchPublicDocuments = createAsyncThunk(
  'transparency/fetchPublicDocuments',
  async (params: { page?: number; filters?: TransparencyFilters }, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getPublicDocuments({
        page: params.page,
        ...params.filters,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public documents');
    }
  }
);

// Chart Data Thunks
export const fetchSpendingByDepartment = createAsyncThunk(
  'transparency/fetchSpendingByDepartment',
  async (year?: number, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getSpendingByDepartment(year);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch spending by department');
    }
  }
);

export const fetchSpendingByCategory = createAsyncThunk(
  'transparency/fetchSpendingByCategory',
  async (year?: number, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getSpendingByCategory(year);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch spending by category');
    }
  }
);

export const fetchSpendingTrends = createAsyncThunk(
  'transparency/fetchSpendingTrends',
  async (year?: number, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getSpendingTrends(year);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch spending trends');
    }
  }
);

export const fetchProjectStatusDistribution = createAsyncThunk(
  'transparency/fetchProjectStatusDistribution',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getProjectStatusDistribution();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project status distribution');
    }
  }
);

export const fetchBudgetOverview = createAsyncThunk(
  'transparency/fetchBudgetOverview',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transparencyAPI.getBudgetOverview();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch budget overview');
    }
  }
);

// Slice
const transparencySlice = createSlice({
  name: 'transparency',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<TransparencyFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1; // Reset to first page when filters change
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedItems: (state) => {
      state.selectedSpending = null;
      state.selectedProject = null;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Dashboard Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboardStats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Departments
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.departments = action.payload.results || action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Categories
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload.results || action.payload;
      });

    // Public Spending
    builder
      .addCase(fetchPublicSpending.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicSpending.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spending = action.payload.results || action.payload;
        if (action.payload.count !== undefined) {
          state.pagination = {
            currentPage: Math.floor((action.payload.offset || 0) / (action.payload.limit || 20)) + 1,
            totalPages: Math.ceil(action.payload.count / (action.payload.limit || 20)),
            totalItems: action.payload.count,
            hasNext: !!action.payload.next,
            hasPrev: !!action.payload.previous,
          };
        }
      })
      .addCase(fetchPublicSpending.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Spending Details
    builder
      .addCase(fetchSpendingDetails.fulfilled, (state, action) => {
        state.selectedSpending = action.payload;
      });

    // Public Projects
    builder
      .addCase(fetchPublicProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.results || action.payload;
        if (action.payload.count !== undefined) {
          state.pagination = {
            currentPage: Math.floor((action.payload.offset || 0) / (action.payload.limit || 20)) + 1,
            totalPages: Math.ceil(action.payload.count / (action.payload.limit || 20)),
            totalItems: action.payload.count,
            hasNext: !!action.payload.next,
            hasPrev: !!action.payload.previous,
          };
        }
      })
      .addCase(fetchPublicProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Project Details
    builder
      .addCase(fetchProjectDetails.fulfilled, (state, action) => {
        state.selectedProject = action.payload;
      });

    // Performance Metrics
    builder
      .addCase(fetchPerformanceMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload.results || action.payload;
      });

    // Public Documents
    builder
      .addCase(fetchPublicDocuments.fulfilled, (state, action) => {
        state.documents = action.payload.results || action.payload;
      });

    // Chart Data
    builder
      .addCase(fetchSpendingByDepartment.fulfilled, (state, action) => {
        state.spendingByDepartment = action.payload;
      })
      .addCase(fetchSpendingByCategory.fulfilled, (state, action) => {
        state.spendingByCategory = action.payload;
      })
      .addCase(fetchSpendingTrends.fulfilled, (state, action) => {
        state.spendingTrends = action.payload;
      })
      .addCase(fetchProjectStatusDistribution.fulfilled, (state, action) => {
        state.projectStatusDistribution = action.payload;
      })
      .addCase(fetchBudgetOverview.fulfilled, (state, action) => {
        state.budgetOverview = action.payload;
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearError,
  clearSelectedItems,
  setCurrentPage,
} = transparencySlice.actions;

export default transparencySlice.reducer;
