import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  MessageSquare,
  BarChart3,
  FileText,
  Users,
  ChevronDown
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPosts, voteOnPost, setFilters } from '../store/slices/forumSlice';
import ForumPostCard from '../components/forum/ForumPostCard';
import CreatePostModal from '../components/forum/CreatePostModal';

const Forum: React.FC = () => {
  const dispatch = useAppDispatch();
  const { posts, isLoading, filters, pagination } = useAppSelector((state) => state.forum);
  const { user } = useAppSelector((state) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [votingPostId, setVotingPostId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: 'all', label: 'All Categories', count: 0 },
    { value: 'general', label: 'General', count: 0 },
    { value: 'policy', label: 'Policy', count: 0 },
    { value: 'events', label: 'Events', count: 0 },
    { value: 'announcements', label: 'Announcements', count: 0 },
    { value: 'feedback', label: 'Feedback', count: 0 },
  ];

  const postTypes = [
    { value: 'all', label: 'All Types', icon: MessageSquare },
    { value: 'discussion', label: 'Discussions', icon: MessageSquare },
    { value: 'poll', label: 'Polls', icon: BarChart3 },
    { value: 'petition', label: 'Petitions', icon: FileText },
    { value: 'announcement', label: 'Announcements', icon: Users },
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'trending', label: 'Trending' },
  ];

  useEffect(() => {
    const params = {
      page: pagination.currentPage,
      limit: 10,
      category: filters.category !== 'all' ? filters.category : undefined,
      post_type: filters.type !== 'all' ? filters.type : undefined,
      ordering: getOrderingParam(),
      search: searchQuery || undefined,
    };

    dispatch(fetchPosts(params));
  }, [dispatch, filters, pagination.currentPage, searchQuery]);

  const getOrderingParam = () => {
    switch (filters.sortBy) {
      case 'oldest':
        return 'created_at';
      case 'popular':
        return '-upvotes';
      case 'trending':
        return '-views';
      default:
        return '-created_at';
    }
  };

  const handleVote = async (postId: string, voteType: 'up' | 'down') => {
    if (!user) return;
    
    setVotingPostId(postId);
    try {
      await dispatch(voteOnPost({ postId, voteType })).unwrap();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingPostId(null);
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect hook
  };

  const trendingTopics = [
    { tag: 'CityBudget2024', posts: 124 },
    { tag: 'GreenInitiatives', posts: 89 },
    { tag: 'TransportationReform', posts: 67 },
    { tag: 'CommunityEvents', posts: 45 },
    { tag: 'PublicSafety', posts: 38 },
  ];

  const forumStats = {
    totalPosts: posts.length,
    totalDiscussions: posts.filter(p => p.post_type === 'discussion').length,
    totalPolls: posts.filter(p => p.post_type === 'poll').length,
    totalPetitions: posts.filter(p => p.post_type === 'petition').length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Community Forum</h1>
          <p className="text-gray-400">Engage in discussions, polls, and petitions</p>
        </div>
        
        {user ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2 self-start lg:self-auto"
          >
          <Plus className="h-5 w-5" />
          <span>New Post</span>
        </button>
        ) : (
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">Please log in to create posts</p>
            <a
              href="/login"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              Log In
            </a>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Search and Filters */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
            <form onSubmit={handleSearch} className="flex space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts..."
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:bg-white/10 transition-colors flex items-center space-x-2"
              >
                <Filter className="h-5 w-5" />
                <span>Filters</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </form>

            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {postTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value as any)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>
            )}
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <ForumPostCard
                  key={post.id}
                  post={post}
                  onVote={handleVote}
                  isVoting={votingPostId === post.id}
                />
              ))
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Posts Found</h3>
                <p className="text-gray-400 mb-6">
                  {searchQuery || filters.category !== 'all' || filters.type !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Be the first to start a discussion!'
                  }
                </p>
                {user && (
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                  >
                    Create First Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Forum Stats */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Forum Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Total Posts</span>
                <span className="text-white font-semibold">{forumStats.totalPosts}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Discussions</span>
                <span className="text-green-400 font-semibold">{forumStats.totalDiscussions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Polls</span>
                <span className="text-blue-400 font-semibold">{forumStats.totalPolls}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Petitions</span>
                <span className="text-red-400 font-semibold">{forumStats.totalPetitions}</span>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-blue-400 font-medium">#{topic.tag}</span>
                  <span className="text-gray-400 text-sm">{topic.posts} posts</span>
                </div>
              ))}
            </div>
              </div>

          {/* Quick Actions */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            {user ? (
              <div className="space-y-2">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Start Discussion</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Create Poll</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-300 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Start Petition</span>
                </button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-3">Log in to participate</p>
                <a
                  href="/login"
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  Log In
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default Forum;
