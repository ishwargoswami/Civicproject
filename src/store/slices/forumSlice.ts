import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { forumAPI } from '../../services/api';

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: number;
  category_name: string;
  category_color: string;
  post_type: 'discussion' | 'poll' | 'petition' | 'announcement';
  author: number;
  author_name: string;
  author_avatar?: string | null;
  author_role: string;
  views: number;
  upvotes: number;
  downvotes: number;
  score: number;
  user_vote?: 'up' | 'down' | null;
  comments_count: number;
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  is_approved: boolean;
  is_flagged: boolean;
  tags: string[];
  poll?: {
    id: number;
    question: string;
    options: PollOption[];
    allow_multiple: boolean;
    ends_at?: string;
    is_anonymous: boolean;
    total_votes: number;
    is_active: boolean;
    user_votes: string[];
    created_at: string;
  } | null;
  petition?: {
    id: number;
    target: string;
    goal: number;
    signatures: number;
    deadline?: string;
    progress_percentage: number;
    is_successful: boolean;
    is_active: boolean;
    user_signed: boolean;
    created_at: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  percentage: number;
}

export interface ForumComment {
  id: string;
  content: string;
  user: number;
  user_name: string;
  user_avatar?: string | null;
  user_role: string;
  parent?: number | null;
  replies: ForumComment[];
  upvotes: number;
  downvotes: number;
  score: number;
  user_vote?: 'up' | 'down' | null;
  is_approved: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

interface ForumState {
  posts: ForumPost[];
  currentPost: ForumPost | null;
  comments: ForumComment[];
  isLoading: boolean;
  error: string | null;
  filters: {
    category: string;
    type: string;
    sortBy: 'newest' | 'oldest' | 'popular' | 'trending';
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

const initialState: ForumState = {
  posts: [],
  currentPost: null,
  comments: [],
  isLoading: false,
  error: null,
  filters: {
    category: 'all',
    type: 'all',
    sortBy: 'newest',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  },
};

// Async thunks
export const fetchPosts = createAsyncThunk(
  'forum/fetchPosts',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    post_type?: string;
    ordering?: string;
    search?: string;
    tags?: string;
  }, { rejectWithValue }) => {
    try {
      const response = await forumAPI.getPosts(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

export const fetchPostById = createAsyncThunk(
  'forum/fetchPostById',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await forumAPI.getPostById(postId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'forum/createPost',
  async (postData: {
    title: string;
    content: string;
    category: string;
    post_type: string;
    tags: string[];
    poll_data?: {
      question: string;
      options: string[];
      allow_multiple: boolean;
      ends_at?: string;
      is_anonymous?: boolean;
    };
    petition_data?: {
      target: string;
      goal: number;
      deadline?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await forumAPI.createPost(postData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  }
);

export const voteOnPost = createAsyncThunk(
  'forum/voteOnPost',
  async ({ postId, voteType }: { postId: string; voteType: 'up' | 'down' }, { rejectWithValue }) => {
    try {
      const response = await forumAPI.voteOnPost(postId, voteType);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote on post');
    }
  }
);

export const voteOnPoll = createAsyncThunk(
  'forum/voteOnPoll',
  async ({ postId, optionIds }: { postId: string; optionIds: string[] }, { rejectWithValue }) => {
    try {
      const response = await forumAPI.voteOnPoll(postId, optionIds);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to vote on poll');
    }
  }
);

export const signPetition = createAsyncThunk(
  'forum/signPetition',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await forumAPI.signPetition(postId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sign petition');
    }
  }
);

const forumSlice = createSlice({
  name: 'forum',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<ForumState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
      state.comments = [];
    },
    setComments: (state, action: PayloadAction<ForumComment[]>) => {
      state.comments = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch posts
      .addCase(fetchPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle both paginated and direct array responses
        if (action.payload.results) {
          state.posts = action.payload.results;
          state.pagination = {
            currentPage: action.payload.page || 1,
            totalPages: Math.ceil(action.payload.count / (action.payload.limit || 10)),
            totalItems: action.payload.count || 0,
          };
        } else if (Array.isArray(action.payload)) {
          state.posts = action.payload;
        } else {
          state.posts = action.payload.posts || [];
          state.pagination = action.payload.pagination || state.pagination;
        }
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch post by ID
      .addCase(fetchPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        // Handle direct post response from API
        if (action.payload.post) {
          // If response has nested structure
          state.currentPost = action.payload.post;
          state.comments = action.payload.comments || [];
        } else {
          // If response is the post directly
          state.currentPost = action.payload;
          state.comments = []; // Comments will be loaded separately
        }
      })
      .addCase(fetchPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts.unshift(action.payload);
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Vote on post
      .addCase(voteOnPost.fulfilled, (state, action) => {
        const { postId, upvotes, downvotes, score, user_vote } = action.payload;
        const index = state.posts.findIndex(post => post.id === postId);
        if (index !== -1) {
          state.posts[index].upvotes = upvotes;
          state.posts[index].downvotes = downvotes;
          state.posts[index].score = score;
          state.posts[index].user_vote = user_vote;
        }
        if (state.currentPost?.id === postId) {
          state.currentPost.upvotes = upvotes;
          state.currentPost.downvotes = downvotes;
          state.currentPost.score = score;
          state.currentPost.user_vote = user_vote;
        }
      })
      // Vote on poll
      .addCase(voteOnPoll.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.posts.findIndex(post => post.id === updatedPost.id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        if (state.currentPost?.id === updatedPost.id) {
          state.currentPost = updatedPost;
        }
      })
      // Sign petition
      .addCase(signPetition.fulfilled, (state, action) => {
        const updatedPost = action.payload;
        const index = state.posts.findIndex(post => post.id === updatedPost.id);
        if (index !== -1) {
          state.posts[index] = updatedPost;
        }
        if (state.currentPost?.id === updatedPost.id) {
          state.currentPost = updatedPost;
        }
      });
  },
});

export const { setFilters, clearCurrentPost, setComments, clearError } = forumSlice.actions;
export default forumSlice.reducer;
