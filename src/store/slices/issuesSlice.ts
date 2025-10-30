import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { issuesAPI } from '../../services/realApi';

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: 'infrastructure' | 'environment' | 'safety' | 'transportation' | 'utilities' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images: string[];
  reportedBy: {
    id: string;
    name: string;
    avatar?: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    department: string;
  };
  votes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  type: 'created' | 'status_changed' | 'assigned' | 'comment' | 'resolved';
  description: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface IssueComment {
  id: string;
  content: string;
  user: {
    id: string;
    name: string;
    avatar?: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface IssuesState {
  issues: Issue[];
  currentIssue: Issue | null;
  comments: IssueComment[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    status: string;
    priority: string;
    location: string;
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const initialState: IssuesState = {
  issues: [],
  currentIssue: null,
  comments: [],
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    status: 'all',
    priority: 'all',
    location: 'all',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

// Async thunks
export const fetchIssues = createAsyncThunk(
  'issues/fetchIssues',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    priority?: string;
    location?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.getIssues(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issues/fetchIssueById',
  async (issueId: string, { rejectWithValue }) => {
    try {
      const [issueResponse, commentsResponse] = await Promise.all([
        issuesAPI.getIssueById(issueId),
        issuesAPI.getIssueComments(issueId)
      ]);
      
      return {
        issue: issueResponse.data,
        comments: commentsResponse.data || []
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  }
);

export const createIssue = createAsyncThunk(
  'issues/createIssue',
  async (issueData: {
    title: string;
    description: string;
    category: string;
    priority: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    images: File[];
  }, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.createIssue(issueData);
      return response.data;
    } catch (error: any) {
      // Log the full error for debugging
      console.error('Create issue error:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.detail ||
        JSON.stringify(error.response?.data) || 
        'Failed to create issue'
      );
    }
  }
);

export const updateIssueStatus = createAsyncThunk(
  'issues/updateIssueStatus',
  async ({ issueId, status, comment }: {
    issueId: string;
    status: string;
    comment?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.updateIssueStatus(issueId, status, comment);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue status');
    }
  }
);

export const voteOnIssue = createAsyncThunk(
  'issues/voteOnIssue',
  async (issueId: string, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.voteOnIssue(issueId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote on issue');
    }
  }
);

export const addComment = createAsyncThunk(
  'issues/addComment',
  async ({ issueId, content }: { issueId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await issuesAPI.addComment(issueId, content);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const issuesSlice = createSlice({
  name: 'issues',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<IssuesState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
      state.comments = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch issues
      .addCase(fetchIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle Django REST framework pagination format
        state.issues = action.payload.results || action.payload.issues || [];
        state.pagination = {
          currentPage: 1, // Will need to calculate from next/previous URLs
          totalPages: Math.ceil((action.payload.count || 0) / 10), // Assuming 10 items per page
          totalItems: action.payload.count || 0,
        };
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch issue by ID
      .addCase(fetchIssueById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIssueById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle the new response format with issue and comments
        if (action.payload.issue) {
          state.currentIssue = action.payload.issue;
          state.comments = action.payload.comments || [];
        } else {
          // Fallback for direct issue object
          state.currentIssue = action.payload;
          state.comments = [];
        }
      })
      .addCase(fetchIssueById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create issue
      .addCase(createIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues.unshift(action.payload);
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update issue status
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const updatedIssue = action.payload;
        const index = state.issues.findIndex(issue => issue.id === updatedIssue.id);
        if (index !== -1) {
          state.issues[index] = updatedIssue;
        }
        if (state.currentIssue?.id === updatedIssue.id) {
          state.currentIssue = updatedIssue;
        }
      })
      // Vote on issue
      .addCase(voteOnIssue.fulfilled, (state, action) => {
        const { issueId, votes } = action.payload;
        const index = state.issues.findIndex(issue => issue.id === issueId);
        if (index !== -1) {
          state.issues[index].votes = votes;
        }
        if (state.currentIssue?.id === issueId) {
          state.currentIssue.votes = votes;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        state.comments.push(action.payload);
        // Update comment count in current issue
        if (state.currentIssue) {
          state.currentIssue.comments_count = (state.currentIssue.comments_count || 0) + 1;
        }
      });
  },
});

export const { setFilters, clearCurrentIssue, clearError } = issuesSlice.actions;
export default issuesSlice.reducer;
