import axios from 'axios';

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock Auth API (for development without backend)
export const authAPI = {
  login: (credentials: { email: string; password: string }) => {
    return apiClient.post('/auth/login/', credentials);
  },

  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'citizen' | 'official';
  }) => {
    // Transform frontend data to match Django backend
    const backendData = {
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password,
      first_name: userData.firstName,
      last_name: userData.lastName,
      username: userData.email.split('@')[0], // Use email prefix as username
      role: userData.role,
    };
    return apiClient.post('/auth/register/', backendData);
  },

  getCurrentUser: () => {
    return apiClient.get('/auth/me/');
  },
  
  logout: () => {
    const refreshToken = localStorage.getItem('refreshToken');
    return apiClient.post('/auth/logout/', { refresh: refreshToken });
  },

  refreshToken: (refreshToken: string) => {
    return apiClient.post('/auth/token/refresh/', { refresh: refreshToken });
  },
  
  forgotPassword: (email: string) =>
    Promise.resolve({ data: { message: 'Password reset email sent' } }),
  
  resetPassword: (token: string, password: string) =>
    Promise.resolve({ data: { message: 'Password reset successful' } }),
};

// Mock Issues API
const mockIssues = [
  {
    id: '1',
    title: 'Broken streetlight on Main Street',
    description: 'The streetlight at the corner of Main Street and 1st Avenue has been out for over a week, creating safety concerns for pedestrians.',
    category: 'infrastructure',
    priority: 'high',
    status: 'open',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'Main Street & 1st Avenue, Downtown'
    },
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    reportedBy: {
      id: '1',
      name: 'Sarah Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    },
    votes: 23,
    comments: 5,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    timeline: []
  },
  {
    id: '2',
    title: 'Pothole on Cedar Avenue',
    description: 'Large pothole causing damage to vehicles. Multiple residents have reported tire damage.',
    category: 'transportation',
    priority: 'medium',
    status: 'in_progress',
    location: {
      latitude: 40.7589,
      longitude: -73.9851,
      address: 'Cedar Avenue, North District'
    },
    images: [],
    reportedBy: {
      id: '2',
      name: 'Mike Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
    },
    assignedTo: {
      id: '3',
      name: 'Public Works Dept',
      department: 'Transportation'
    },
    votes: 45,
    comments: 12,
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-14T09:15:00Z',
    timeline: []
  },
  {
    id: '3',
    title: 'Illegal dumping in Central Park',
    description: 'Someone has been dumping construction waste near the playground area.',
    category: 'environment',
    priority: 'high',
    status: 'resolved',
    location: {
      latitude: 40.7812,
      longitude: -73.9665,
      address: 'Central Park, Playground Area'
    },
    images: ['https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=400'],
    reportedBy: {
      id: '4',
      name: 'Lisa Park',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'
    },
    votes: 67,
    comments: 8,
    createdAt: '2024-01-10T16:45:00Z',
    updatedAt: '2024-01-13T11:30:00Z',
    timeline: []
  }
];

export const issuesAPI = {
  getIssues: (params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    priority?: string;
    location?: string;
  }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredIssues = [...mockIssues];
        
        // Apply filters
        if (params.category && params.category !== 'all') {
          filteredIssues = filteredIssues.filter(issue => issue.category === params.category);
        }
        if (params.status && params.status !== 'all') {
          filteredIssues = filteredIssues.filter(issue => issue.status === params.status);
        }
        if (params.priority && params.priority !== 'all') {
          filteredIssues = filteredIssues.filter(issue => issue.priority === params.priority);
        }

        resolve({
          data: {
            issues: filteredIssues,
            pagination: {
              currentPage: params.page || 1,
              totalPages: 1,
              totalItems: filteredIssues.length,
              hasNext: false,
              hasPrevious: false
            }
          }
        });
      }, 800);
    });
  },
  
  getIssueById: (issueId: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const issue = mockIssues.find(i => i.id === issueId);
        if (issue) {
          resolve({
            data: {
              issue,
              comments: [
                {
                  id: '1',
                  content: 'I also noticed this issue. It\'s been a problem for weeks.',
                  user: {
                    id: '5',
                    name: 'John Smith',
                    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
                    role: 'citizen'
                  },
                  createdAt: '2024-01-15T12:00:00Z',
                  updatedAt: '2024-01-15T12:00:00Z'
                }
              ]
            }
          });
        } else {
          reject({ response: { status: 404, data: { message: 'Issue not found' } } });
        }
      }, 500);
    });
  },
  
  createIssue: (issueData: {
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
  }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newIssue = {
          id: String(mockIssues.length + 1),
          title: issueData.title,
          description: issueData.description,
          category: issueData.category,
          priority: issueData.priority,
          status: 'open',
          location: issueData.location,
          images: issueData.images.map((_, index) => `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&${index}`),
          reportedBy: {
            id: '1',
            name: 'Current User',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current'
          },
          votes: 0,
          comments: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timeline: []
        };
        
        mockIssues.unshift(newIssue);
        resolve({ data: newIssue });
      }, 1500);
    });
  },
  
  updateIssueStatus: (issueId: string, status: string, comment?: string) =>
    apiClient.patch(`/issues/${issueId}/status/`, { status, comment }),
  
  voteOnIssue: (issueId: string) =>
    apiClient.post(`/issues/${issueId}/vote/`),
  
  addComment: (issueId: string, content: string) =>
    apiClient.post(`/issues/${issueId}/comments/`, { content }),
  
  getIssueComments: (issueId: string) =>
    apiClient.get(`/issues/${issueId}/comments/`),
};

// Mock Forum API
const mockPosts = [
  {
    id: '1',
    title: 'Community Budget Meeting - Your Input Needed',
    content: 'The city is planning the 2024 budget. Join us for a community meeting to discuss priorities and share your thoughts on how we should allocate resources.',
    category: 1,
    category_name: 'announcements',
    category_color: '#3b82f6',
    post_type: 'discussion',
    author: 1,
    author_name: 'Mayor Johnson',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mayor',
    author_role: 'official',
    views: 234,
    upvotes: 45,
    downvotes: 2,
    score: 43,
    user_vote: null,
    comments_count: 12,
    is_pinned: true,
    is_locked: false,
    is_featured: false,
    is_approved: true,
    is_flagged: false,
    tags: ['budget', 'community', 'meeting'],
    poll: null,
    petition: null,
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T09:00:00Z'
  },
  {
    id: '2',
    title: 'Poll: What should we do about the downtown parking situation?',
    content: 'Downtown parking has been a major issue. What do you think is the best solution?',
    category: 2,
    category_name: 'policy',
    category_color: '#10b981',
    post_type: 'poll',
    author: 2,
    author_name: 'Sarah Community',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah2',
    author_role: 'citizen',
    views: 456,
    upvotes: 78,
    downvotes: 5,
    score: 73,
    user_vote: null,
    comments_count: 23,
    is_pinned: false,
    is_locked: false,
    is_featured: false,
    is_approved: true,
    is_flagged: false,
    tags: ['parking', 'downtown', 'transportation'],
    poll: {
      id: 1,
      question: 'What should we do about downtown parking?',
      options: [
        { id: '1', text: 'Build more parking garages', votes: 45, percentage: 35 },
        { id: '2', text: 'Improve public transportation', votes: 67, percentage: 52 },
        { id: '3', text: 'Implement time limits', votes: 17, percentage: 13 }
      ],
      allow_multiple: false,
      ends_at: '2024-01-20T23:59:59Z',
      is_anonymous: false,
      total_votes: 129,
      is_active: true,
      user_votes: [],
      created_at: '2024-01-13T15:30:00Z'
    },
    petition: null,
    created_at: '2024-01-13T15:30:00Z',
    updated_at: '2024-01-13T15:30:00Z'
  },
  {
    id: '3',
    title: 'Petition: Save the Community Park',
    content: 'The city council is planning to sell our beloved community park to developers. We need your signature to save this precious green space for our children and future generations.',
    category: 3,
    category_name: 'environment',
    category_color: '#10b981',
    post_type: 'petition',
    author: 3,
    author_name: 'Green Community',
    author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=green',
    author_role: 'citizen',
    views: 892,
    upvotes: 156,
    downvotes: 8,
    score: 148,
    user_vote: null,
    comments_count: 45,
    is_pinned: false,
    is_locked: false,
    is_featured: true,
    is_approved: true,
    is_flagged: false,
    tags: ['environment', 'park', 'community'],
    poll: null,
    petition: {
      id: 1,
      target: 'City Council',
      goal: 1000,
      signatures: 567,
      deadline: '2024-02-15T23:59:59Z',
      progress_percentage: 56.7,
      is_successful: false,
      is_active: true,
      user_signed: false,
      created_at: '2024-01-12T08:00:00Z'
    },
    created_at: '2024-01-12T08:00:00Z',
    updated_at: '2024-01-12T08:00:00Z'
  }
];

export const forumAPI = {
  // Categories
  getCategories: () => {
    // Mock implementation for getting categories
    return new Promise((resolve) => {
      setTimeout(() => {
        const categories = [
          { id: 1, name: 'announcements', color: '#3b82f6', description: 'Official announcements' },
          { id: 2, name: 'policy', color: '#10b981', description: 'Policy discussions' },
          { id: 3, name: 'environment', color: '#10b981', description: 'Environmental issues' },
          { id: 4, name: 'general', color: '#6b7280', description: 'General discussions' },
          { id: 5, name: 'events', color: '#f59e0b', description: 'Community events' }
        ];
        resolve({ data: categories });
      }, 300);
    });
  },
  
  // Posts
  getPosts: (params: {
    page?: number;
    limit?: number;
    category?: string;
    post_type?: string;
    ordering?: string;
    search?: string;
    tags?: string;
  }) => {
    // Mock implementation for getting posts
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredPosts = [...mockPosts];
        
        // Apply filters
        if (params.post_type && params.post_type !== 'all') {
          filteredPosts = filteredPosts.filter(post => post.post_type === params.post_type);
        }
        
        if (params.category && params.category !== 'all') {
          filteredPosts = filteredPosts.filter(post => post.category_name === params.category);
        }
        
        if (params.search) {
          const searchLower = params.search.toLowerCase();
          filteredPosts = filteredPosts.filter(post => 
            post.title.toLowerCase().includes(searchLower) ||
            post.content.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting
        if (params.ordering) {
          switch (params.ordering) {
            case 'created_at':
              filteredPosts.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              break;
            case '-created_at':
              filteredPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              break;
            case '-upvotes':
              filteredPosts.sort((a, b) => b.upvotes - a.upvotes);
              break;
            case '-views':
              filteredPosts.sort((a, b) => b.views - a.views);
              break;
          }
        }
        
        // Apply pagination
        const page = params.page || 1;
        const limit = params.limit || 10;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
        
        resolve({
          data: {
            results: JSON.parse(JSON.stringify(paginatedPosts)), // Deep copy to prevent mutations
            count: filteredPosts.length,
            page: page,
            limit: limit
          }
        });
      }, 500);
    });
  },
  
  getPostById: (postId: string) => {
    // Mock implementation for getting post by ID
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const post = mockPosts.find(p => p.id === postId);
        if (post) {
          // Return a deep copy to prevent mutation issues
          resolve({ data: JSON.parse(JSON.stringify(post)) });
        } else {
          reject({ response: { data: { message: 'Post not found' } } });
        }
      }, 500);
    });
  },
  
  createPost: (postData: {
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
  }) => {
    // Mock implementation for creating posts
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPost = {
          id: String(mockPosts.length + 1),
          title: postData.title,
          content: postData.content,
          category: parseInt(postData.category),
          category_name: postData.category,
          category_color: '#6b7280',
          post_type: postData.post_type as 'discussion' | 'poll' | 'petition' | 'announcement',
          author: 1,
          author_name: 'Test User',
          author_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
          author_role: 'citizen',
          views: 0,
          upvotes: 0,
          downvotes: 0,
          score: 0,
          user_vote: null,
          comments_count: 0,
          is_pinned: false,
          is_locked: false,
          is_featured: false,
          is_approved: true,
          is_flagged: false,
          tags: postData.tags,
          poll: postData.poll_data ? {
            id: 1,
            question: postData.poll_data.question,
            options: postData.poll_data.options.map((opt, idx) => ({
              id: String(idx + 1),
              text: opt,
              votes: 0,
              percentage: 0
            })),
            allow_multiple: postData.poll_data.allow_multiple,
            ends_at: postData.poll_data.ends_at || null,
            is_anonymous: postData.poll_data.is_anonymous || false,
            total_votes: 0,
            is_active: true,
            user_votes: [],
            created_at: new Date().toISOString()
          } : null,
          petition: postData.petition_data ? {
            id: 1,
            target: postData.petition_data.target,
            goal: postData.petition_data.goal,
            signatures: 0,
            deadline: postData.petition_data.deadline || null,
            progress_percentage: 0,
            is_successful: false,
            is_active: true,
            user_signed: false,
            created_at: new Date().toISOString()
          } : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        mockPosts.unshift(newPost);
        resolve({ data: newPost });
      }, 1000);
    });
  },
  
  updatePost: (postId: string, postData: Partial<{
    title: string;
    content: string;
    tags: string[];
  }>) => {
    // Mock implementation for updating posts
    return new Promise((resolve) => {
      setTimeout(() => {
        const postIndex = mockPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          const updatedPost = { ...mockPosts[postIndex], ...postData, updated_at: new Date().toISOString() };
          mockPosts[postIndex] = updatedPost;
          resolve({ data: updatedPost });
        } else {
          resolve({ data: { error: 'Post not found' } });
        }
      }, 500);
    });
  },
  
  deletePost: (postId: string) => {
    // Mock implementation for deleting posts
    return new Promise((resolve) => {
      setTimeout(() => {
        const postIndex = mockPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          mockPosts.splice(postIndex, 1);
          resolve({ data: { message: 'Post deleted successfully' } });
        } else {
          resolve({ data: { error: 'Post not found' } });
        }
      }, 500);
    });
  },
  
  voteOnPost: (postId: string, voteType: 'up' | 'down') => {
    // Mock implementation for voting
    return new Promise((resolve) => {
      setTimeout(() => {
        const postIndex = mockPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1) {
          // Create a deep copy of the post to avoid mutation issues
          const post = JSON.parse(JSON.stringify(mockPosts[postIndex]));
          
          // Simulate voting logic
          if (voteType === 'up') {
            post.upvotes += post.user_vote === 'up' ? -1 : 1;
            if (post.user_vote === 'down') post.downvotes -= 1;
            post.user_vote = post.user_vote === 'up' ? null : 'up';
          } else {
            post.downvotes += post.user_vote === 'down' ? -1 : 1;
            if (post.user_vote === 'up') post.upvotes -= 1;
            post.user_vote = post.user_vote === 'down' ? null : 'down';
          }
          post.score = post.upvotes - post.downvotes;
          
          // Update the original array with the new post
          mockPosts[postIndex] = post;
          
          resolve({ 
            data: { 
              postId, 
              upvotes: post.upvotes,
              downvotes: post.downvotes,
              score: post.score,
              user_vote: post.user_vote
            } 
          });
        } else {
          resolve({ data: { error: 'Post not found' } });
        }
      }, 500);
    });
  },
  
  voteOnPoll: (postId: string, optionIds: string[]) => {
    // Mock implementation for poll voting
    return new Promise((resolve) => {
      setTimeout(() => {
        const postIndex = mockPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1 && mockPosts[postIndex].poll) {
          // Create a deep copy of the post to avoid mutation issues
          const post = JSON.parse(JSON.stringify(mockPosts[postIndex]));
          
          // Remove previous votes (if user already voted)
          post.poll.user_votes = [];
          
          // Add new votes
          optionIds.forEach(optionId => {
            const option = post.poll.options.find(o => o.id === optionId);
            if (option) {
              option.votes += 1;
              post.poll.user_votes.push(optionId);
            }
          });
          
          // Recalculate total votes and percentages
          post.poll.total_votes = post.poll.options.reduce((sum, opt) => sum + opt.votes, 0);
          post.poll.options.forEach(option => {
            option.percentage = post.poll.total_votes > 0 
              ? Math.round((option.votes / post.poll.total_votes) * 100) 
              : 0;
          });
          
          // Update the original array with the new post
          mockPosts[postIndex] = post;
          
          resolve({ data: post });
        } else {
          resolve({ data: { error: 'Post or poll not found' } });
        }
      }, 500);
    });
  },
  
  signPetition: (postId: string, comment?: string, isAnonymous?: boolean) => {
    // Mock implementation for signing petitions
    return new Promise((resolve) => {
      setTimeout(() => {
        // Find the post and update petition signatures
        const postIndex = mockPosts.findIndex(p => p.id === postId);
        if (postIndex !== -1 && mockPosts[postIndex].petition) {
          const post = JSON.parse(JSON.stringify(mockPosts[postIndex]));
          post.petition.signatures += 1;
          post.petition.progress_percentage = Math.min((post.petition.signatures / post.petition.goal) * 100, 100);
          post.petition.user_signed = true;
          mockPosts[postIndex] = post;
          
          resolve({ data: post });
        } else {
          resolve({ data: { error: 'Post or petition not found' } });
        }
      }, 500);
    });
  },
  
  getPetitionSignatures: (postId: string) => {
    // Mock implementation for getting petition signatures
    return new Promise((resolve) => {
      setTimeout(() => {
        const sampleSignatures = [
          {
            id: '1',
            user_name: 'John Doe',
            user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            comment: 'This is important for our community!',
            is_anonymous: false,
            created_at: '2024-01-12T09:00:00Z'
          },
          {
            id: '2',
            user_name: 'Anonymous',
            user_avatar: null,
            comment: '',
            is_anonymous: true,
            created_at: '2024-01-12T10:30:00Z'
          }
        ];
        resolve({ data: sampleSignatures });
      }, 500);
    });
  },
  
  // Comments
  getPostComments: (postId: string) => {
    // Mock implementation for getting post comments
    return new Promise((resolve) => {
      setTimeout(() => {
        // Return some sample comments for testing
        const sampleComments = [
          {
            id: '1',
            content: 'Great initiative! I fully support this proposal.',
            user: 2,
            user_name: 'Sarah Community',
            user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
            user_role: 'citizen',
            parent: null,
            replies: [],
            upvotes: 5,
            downvotes: 0,
            score: 5,
            user_vote: null,
            is_approved: true,
            is_flagged: false,
            created_at: '2024-01-14T10:30:00Z',
            updated_at: '2024-01-14T10:30:00Z'
          },
          {
            id: '2',
            content: 'I have some concerns about the implementation timeline. Could we discuss this further?',
            user: 3,
            user_name: 'John Citizen',
            user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
            user_role: 'citizen',
            parent: null,
            replies: [],
            upvotes: 2,
            downvotes: 1,
            score: 1,
            user_vote: null,
            is_approved: true,
            is_flagged: false,
            created_at: '2024-01-14T11:15:00Z',
            updated_at: '2024-01-14T11:15:00Z'
          }
        ];
        
        resolve({ data: sampleComments });
      }, 300);
    });
  },
  
  addComment: (postId: string, content: string, parentId?: string) => {
    // Mock implementation for adding comments
    return new Promise((resolve) => {
      setTimeout(() => {
        const newComment = {
          id: String(Date.now()), // Simple ID generation
          content: content,
          user: 1,
          user_name: 'Test User',
          user_avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=test',
          user_role: 'citizen',
          parent: parentId ? parseInt(parentId) : null,
          replies: [],
          upvotes: 0,
          downvotes: 0,
          score: 0,
          user_vote: null,
          is_approved: true,
          is_flagged: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        resolve({ data: newComment });
      }, 500);
    });
  },
  
  updateComment: (commentId: string, content: string) => {
    // Mock implementation for updating comments
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: { 
            id: commentId, 
            content: content, 
            updated_at: new Date().toISOString() 
          } 
        });
      }, 500);
    });
  },
  
  deleteComment: (commentId: string) => {
    // Mock implementation for deleting comments
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: { message: 'Comment deleted successfully' } });
      }, 500);
    });
  },
  
  voteOnComment: (commentId: string, voteType: 'up' | 'down') => {
    // Mock implementation for voting on comments
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          data: { 
            commentId, 
            voteType, 
            upvotes: Math.floor(Math.random() * 10), 
            downvotes: Math.floor(Math.random() * 3) 
          } 
        });
      }, 500);
    });
  },
};

// Mock Events API
const mockEvents = [
  {
    id: '1',
    title: 'Community Cleanup Day',
    description: 'Join us for a community-wide cleanup event. We\'ll be focusing on the downtown area and local parks. Supplies provided!',
    category: 'cleanup',
    organizer: {
      id: '1',
      name: 'Green Initiative',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=green',
      organization: 'Environmental Committee'
    },
    location: {
      name: 'Central Park',
      address: 'Central Park, Main Entrance',
      latitude: 40.7812,
      longitude: -73.9665
    },
    startDate: '2024-01-20T09:00:00Z',
    endDate: '2024-01-20T15:00:00Z',
    capacity: 100,
    attendees: 67,
    volunteers: 23,
    volunteersNeeded: 30,
    isOnline: false,
    tags: ['environment', 'community', 'volunteer'],
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    requirements: ['Comfortable clothes', 'Water bottle', 'Sun protection'],
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Town Hall Meeting',
    description: 'Monthly town hall meeting to discuss community issues and upcoming projects. All residents welcome.',
    category: 'meeting',
    organizer: {
      id: '2',
      name: 'City Council',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=council',
      organization: 'City Government'
    },
    location: {
      name: 'City Hall',
      address: '123 Government St, Downtown',
      latitude: 40.7589,
      longitude: -73.9851
    },
    startDate: '2024-01-25T19:00:00Z',
    endDate: '2024-01-25T21:00:00Z',
    capacity: 200,
    attendees: 89,
    volunteers: 5,
    volunteersNeeded: 10,
    isOnline: true,
    meetingLink: 'https://zoom.us/j/123456789',
    tags: ['government', 'community', 'meeting'],
    images: [],
    requirements: [],
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-08T14:00:00Z'
  }
];

export const eventsAPI = {
  getEvents: (params: {
    page?: number;
    limit?: number;
    category?: string;
    dateRange?: string;
    location?: string;
    type?: string;
  }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        let filteredEvents = [...mockEvents];
        
        if (params.category && params.category !== 'all') {
          filteredEvents = filteredEvents.filter(event => event.category === params.category);
        }

        resolve({
          data: {
            events: filteredEvents,
            pagination: {
              currentPage: params.page || 1,
              totalPages: 1,
              totalItems: filteredEvents.length,
              hasNext: false,
              hasPrevious: false
            }
          }
        });
      }, 700);
    });
  },
  
  getEventById: (eventId: string) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const event = mockEvents.find(e => e.id === eventId);
        if (event) {
          resolve({
            data: {
              event,
              attendees: []
            }
          });
        } else {
          reject({ response: { status: 404, data: { message: 'Event not found' } } });
        }
      }, 400);
    });
  },
  
  createEvent: (eventData: {
    title: string;
    description: string;
    category: string;
    location: {
      name: string;
      address: string;
      latitude: number;
      longitude: number;
    };
    startDate: string;
    endDate: string;
    capacity: number;
    volunteersNeeded: number;
    isOnline: boolean;
    meetingLink?: string;
    tags: string[];
    requirements: string[];
    images: File[];
  }) => {
    const formData = new FormData();
    Object.entries(eventData).forEach(([key, value]) => {
      if (key === 'images') {
        (value as File[]).forEach((file, index) => {
          formData.append(`image_${index}`, file);
        });
      } else if (key === 'location') {
        formData.append('location', JSON.stringify(value));
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value as string);
      }
    });
    return apiClient.post('/events/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  
  rsvpToEvent: (eventId: string, status: 'attending' | 'maybe' | 'not_attending') =>
    apiClient.post(`/events/${eventId}/rsvp/`, { status }),
  
  volunteerForEvent: (eventId: string, role?: string) =>
    apiClient.post(`/events/${eventId}/volunteer/`, { role }),
  
  getEventAttendees: (eventId: string) =>
    apiClient.get(`/events/${eventId}/attendees/`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params: { page?: number; limit?: number; unreadOnly?: boolean }) =>
    apiClient.get('/notifications/', { params }),
  
  markAsRead: (notificationId: string) =>
    apiClient.patch(`/notifications/${notificationId}/read/`),
  
  markAllAsRead: () => apiClient.patch('/notifications/read-all/'),
  
  updateSettings: (settings: Record<string, boolean>) =>
    apiClient.patch('/notifications/settings/', settings),
};

// Transparency API
export const transparencyAPI = {
  getPublicSpending: (params: {
    year?: number;
    category?: string;
    department?: string;
  }) => apiClient.get('/transparency/spending/', { params }),
  
  getProjectProgress: (params: {
    status?: string;
    category?: string;
  }) => apiClient.get('/transparency/projects/', { params }),
  
  getBudgetData: (year: number) =>
    apiClient.get(`/transparency/budget/${year}/`),
  
  getPerformanceMetrics: () =>
    apiClient.get('/transparency/metrics/'),
};

// Maps API
export const mapsAPI = {
  getIssueMarkers: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, filters?: {
    category?: string;
    status?: string;
    priority?: string;
  }) => apiClient.get('/maps/issues/', { params: { ...bounds, ...filters } }),
  
  getEventMarkers: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }, filters?: {
    category?: string;
    dateRange?: string;
  }) => apiClient.get('/maps/events/', { params: { ...bounds, ...filters } }),
  
  reverseGeocode: (lat: number, lng: number) =>
    apiClient.get(`/maps/geocode/reverse/?lat=${lat}&lng=${lng}`),
  
  searchLocation: (query: string) =>
    apiClient.get(`/maps/geocode/search/?q=${encodeURIComponent(query)}`),
};

export default apiClient;
