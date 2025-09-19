import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  MessageSquare, 
  Eye, 
  Clock,
  Pin,
  Lock,
  BarChart3,
  FileText,
  Users,
  Send,
  Flag
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { fetchPostById, voteOnPost, voteOnPoll, signPetition, setComments } from '../store/slices/forumSlice';
import { forumAPI } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const ForumPostDetail: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentPost, comments, isLoading } = useAppSelector((state) => state.forum);
  const { user } = useAppSelector((state) => state.auth);
  
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [votingPostId, setVotingPostId] = useState<string | null>(null);
  const [selectedPollOptions, setSelectedPollOptions] = useState<string[]>([]);
  const [petitionComment, setPetitionComment] = useState('');
  const [showPetitionModal, setShowPetitionModal] = useState(false);

  useEffect(() => {
    if (postId) {
      dispatch(fetchPostById(postId));
    }
  }, [dispatch, postId]);

  // Load comments separately
  useEffect(() => {
    const loadComments = async () => {
      if (postId) {
        try {
          const response = await forumAPI.getPostComments(postId);
          dispatch(setComments(response.data || []));
        } catch (error) {
          console.error('Failed to load comments:', error);
        }
      }
    };

    if (currentPost && postId) {
      loadComments();
    }
  }, [currentPost, postId]);

  const handleVote = async (voteType: 'up' | 'down') => {
    if (!user || !currentPost) return;
    
    setVotingPostId(currentPost.id);
    try {
      await dispatch(voteOnPost({ postId: currentPost.id, voteType })).unwrap();
    } catch (error) {
      console.error('Failed to vote:', error);
    } finally {
      setVotingPostId(null);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !currentPost || !newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      await forumAPI.addComment(currentPost.id, newComment.trim());
      setNewComment('');
      // Refresh comments
      dispatch(fetchPostById(currentPost.id));
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handlePollVote = async () => {
    if (!user || !currentPost?.poll || selectedPollOptions.length === 0) return;

    try {
      await dispatch(voteOnPoll({ postId: currentPost.id, optionIds: selectedPollOptions })).unwrap();
      setSelectedPollOptions([]);
    } catch (error) {
      console.error('Failed to vote on poll:', error);
    }
  };

  const handleSignPetition = async () => {
    if (!user || !currentPost?.petition) return;

    try {
      await dispatch(signPetition(currentPost.id)).unwrap();
      setShowPetitionModal(false);
      setPetitionComment('');
    } catch (error) {
      console.error('Failed to sign petition:', error);
    }
  };

  const handlePollOptionChange = (optionId: string) => {
    if (!currentPost?.poll) return;

    if (currentPost.poll.allow_multiple) {
      setSelectedPollOptions(prev => 
        prev.includes(optionId) 
          ? prev.filter(id => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedPollOptions([optionId]);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="p-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <h3 className="text-xl font-semibold text-white mb-2">Post Not Found</h3>
          <p className="text-gray-400 mb-6">The post you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/dashboard/forum"
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            Back to Forum
          </Link>
        </div>
      </div>
    );
  }

  const getPostTypeIcon = () => {
    switch (currentPost.type) {
      case 'poll':
        return <BarChart3 className="h-5 w-5 text-blue-400" />;
      case 'petition':
        return <FileText className="h-5 w-5 text-red-400" />;
      case 'announcement':
        return <Users className="h-5 w-5 text-yellow-400" />;
      default:
        return <MessageSquare className="h-5 w-5 text-green-400" />;
    }
  };

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      general: 'bg-gray-500',
      policy: 'bg-blue-500',
      events: 'bg-green-500',
      announcements: 'bg-yellow-500',
      feedback: 'bg-purple-500',
    };
    return colors[currentPost.category] || 'bg-gray-500';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={() => navigate('/dashboard/forum')}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Forum Post</h1>
          <p className="text-gray-400">Community discussion</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            {/* Post Header */}
            <div className="flex items-start space-x-4 mb-6">
              {/* Voting */}
              <div className="flex flex-col items-center space-y-1">
                <button
                  onClick={() => handleVote('up')}
                  disabled={!user || votingPostId === currentPost.id}
                  className={`p-2 rounded hover:bg-white/10 transition-colors ${
                    currentPost.user_vote === 'up' 
                      ? 'text-green-400 bg-green-400/20' 
                      : 'text-gray-400 hover:text-green-400'
                  } ${!user || votingPostId === currentPost.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronUp className="h-6 w-6" />
                </button>
                
                <span className={`text-lg font-semibold ${
                  currentPost.upvotes > currentPost.downvotes 
                    ? 'text-green-400' 
                    : currentPost.downvotes > currentPost.upvotes 
                      ? 'text-red-400' 
                      : 'text-gray-300'
                }`}>
                  {currentPost.score}
                </span>
                
                <button
                  onClick={() => handleVote('down')}
                  disabled={!user || votingPostId === currentPost.id}
                  className={`p-2 rounded hover:bg-white/10 transition-colors ${
                    currentPost.user_vote === 'down'
                      ? 'text-red-400 bg-red-400/20' 
                      : 'text-gray-400 hover:text-red-400'
                  } ${!user || votingPostId === currentPost.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <ChevronDown className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Meta info */}
                <div className="flex items-center space-x-2 mb-4">
                  {currentPost.is_pinned && (
                    <Pin className="h-4 w-4 text-yellow-400" />
                  )}
                  {currentPost.is_locked && (
                    <Lock className="h-4 w-4 text-red-400" />
                  )}
                  {getPostTypeIcon()}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor()}`}>
                    {currentPost.category}
                  </span>
                  <span className="text-xs text-gray-400 capitalize">
                    {currentPost.type}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-4">
                  {currentPost.title}
                </h1>

                {/* Author and Meta */}
                <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
                  <div className="flex items-center space-x-2">
                    <img
                      src={currentPost.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentPost.author_name}`}
                      alt={currentPost.author_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-white">{currentPost.author_name}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${
                      currentPost.author_role === 'official' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {currentPost.author_role}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{currentPost.created_at ? formatDistanceToNow(new Date(currentPost.created_at), { addSuffix: true }) : 'Unknown date'}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <Eye className="h-4 w-4" />
                    <span>{currentPost.views} views</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{currentPost.comments_count} comments</span>
                  </div>
                </div>

                {/* Content */}
                <div className="prose prose-invert max-w-none mb-6">
                  <p className="text-gray-300 whitespace-pre-wrap">{currentPost.content}</p>
                </div>

                {/* Poll */}
                {currentPost.poll && (
                  <div className="mb-6 p-6 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <BarChart3 className="h-5 w-5 text-blue-400" />
                      <h3 className="text-lg font-semibold text-blue-400">Poll</h3>
                    </div>
                    
                    <p className="text-white mb-4">{currentPost.poll.question}</p>
                    
                    <div className="space-y-3 mb-4">
                      {currentPost.poll.options.map((option) => (
                        <div key={option.id} className="space-y-2">
                          <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type={currentPost.poll!.allow_multiple ? 'checkbox' : 'radio'}
                              name="poll-option"
                              value={option.id}
                              checked={selectedPollOptions.includes(option.id)}
                              onChange={() => handlePollOptionChange(option.id)}
                              className="w-4 h-4 text-blue-600 bg-white/5 border-white/10 rounded focus:ring-blue-500"
                              disabled={!user || !currentPost.poll!.is_active}
                            />
                            <span className="text-white">{option.text}</span>
                          </label>
                          
                          <div className="ml-7">
                            <div className="flex justify-between text-sm text-gray-400 mb-1">
                              <span>{option.votes} votes</span>
                              <span>{option.percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${option.percentage}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {user && currentPost.poll.is_active && selectedPollOptions.length > 0 && (
                      <button
                        onClick={handlePollVote}
                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Submit Vote
                      </button>
                    )}
                    
                    <div className="text-sm text-gray-400 mt-4">
                      Total votes: {currentPost.poll.total_votes}
                      {currentPost.poll.ends_at && (
                        <span> • Ends {formatDistanceToNow(new Date(currentPost.poll.ends_at), { addSuffix: true })}</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Petition */}
                {currentPost.petition && (
                  <div className="mb-6 p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <div className="flex items-center space-x-2 mb-4">
                      <FileText className="h-5 w-5 text-red-400" />
                      <h3 className="text-lg font-semibold text-red-400">Petition</h3>
                    </div>
                    
                    <p className="text-white mb-4">
                      <span className="font-semibold">Target:</span> {currentPost.petition.target}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-400 mb-2">
                        <span>{currentPost.petition.signatures} signatures</span>
                        <span>Goal: {currentPost.petition.goal}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className="bg-red-500 h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${Math.min((currentPost.petition.signatures / currentPost.petition.goal) * 100, 100)}%` 
                          }}
                        />
                      </div>
                    </div>
                    
                    {user && currentPost.petition.isActive && (
                      <button
                        onClick={() => setShowPetitionModal(true)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Sign Petition
                      </button>
                    )}
                    
                    {currentPost.petition.deadline && (
                      <div className="text-sm text-gray-400 mt-4">
                        Deadline: {formatDistanceToNow(new Date(currentPost.petition.deadline), { addSuffix: true })}
                      </div>
                    )}
                  </div>
                )}

                {/* Tags */}
                {currentPost.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {currentPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Comments Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-white mb-6">
              Comments ({comments.length})
            </h2>

            {/* Add Comment */}
            {user && !currentPost.isLocked && (
              <form onSubmit={handleSubmitComment} className="mb-8">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Share your thoughts..."
                    required
                  />
                  <div className="flex justify-end mt-4">
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isSubmittingComment ? 'Posting...' : 'Post Comment'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 border border-white/10 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={comment.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_name}`}
                      alt={comment.user_name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-semibold text-white">{comment.user_name}</span>
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          comment.user_role === 'official' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {comment.user_role}
                        </span>
                        <span className="text-xs text-gray-400">
                          {comment.created_at ? formatDistanceToNow(new Date(comment.created_at), { addSuffix: true }) : 'Unknown date'}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3 whitespace-pre-wrap">{comment.content}</p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-green-400 transition-colors">
                            <ChevronUp className="h-4 w-4" />
                          </button>
                          <span className="text-sm text-gray-400">{comment.score}</span>
                          <button className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                            <ChevronDown className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button className="text-xs text-gray-400 hover:text-white transition-colors">
                          Reply
                        </button>
                        
                        <button className="text-xs text-gray-400 hover:text-red-400 transition-colors">
                          <Flag className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Post Actions */}
          {user && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-300 hover:bg-white/10 rounded-lg transition-colors">
                  <Flag className="h-4 w-4" />
                  <span>Report Post</span>
                </button>
              </div>
            </div>
          )}

          {/* Related Posts */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Related Posts</h3>
            <div className="space-y-3">
              <p className="text-sm text-gray-400">No related posts found.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumPostDetail;
