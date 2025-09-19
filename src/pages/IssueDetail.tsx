import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  ThumbsUp,
  MessageCircle,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  Tag,
  X,
  Send,
} from 'lucide-react';
import { AppDispatch, RootState } from '../store';
import { fetchIssueById, clearCurrentIssue, voteOnIssue, addComment } from '../store/slices/issuesSlice';

const IssueDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentIssue, comments, isLoading, error } = useSelector((state: RootState) => state.issues);
  
  // State for image lightbox
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // State for comments
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchIssueById(id));
    }
    return () => {
      dispatch(clearCurrentIssue());
    };
  }, [dispatch, id]);


  // Handle voting
  const handleVote = async () => {
    if (!currentIssue || !id) return;
    
    try {
      await dispatch(voteOnIssue(id));
      // Refresh the issue to get updated vote count
      dispatch(fetchIssueById(id));
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !id) return;

    setIsSubmittingComment(true);
    try {
      await dispatch(addComment({ issueId: id, content: newComment.trim() }));
      setNewComment('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-400" />;
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'closed':
        return <XCircle className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'border-red-400 text-red-400 bg-red-400/10';
      case 'in_progress':
        return 'border-yellow-400 text-yellow-400 bg-yellow-400/10';
      case 'resolved':
        return 'border-green-400 text-green-400 bg-green-400/10';
      case 'closed':
        return 'border-gray-400 text-gray-400 bg-gray-400/10';
      default:
        return 'border-red-400 text-red-400 bg-red-400/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'critical':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !currentIssue) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/dashboard/issues')}
            className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-3xl font-bold text-white">Issue Not Found</h1>
        </div>
        <p className="text-gray-400">{error || 'The requested issue could not be found.'}</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center mb-8"
      >
        <button
          onClick={() => navigate('/dashboard/issues')}
          className="mr-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{currentIssue.title || 'Issue Detail'}</h1>
          <p className="text-gray-400">Issue ID: {currentIssue.id}</p>
        </div>
      </motion.div>

      {/* Issue Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white/5 border border-white/10 rounded-xl p-8 space-y-8"
      >
        {/* Status and Priority */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon(currentIssue.status)}
            <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(currentIssue.status)}`}>
              {currentIssue.status ? currentIssue.status.replace('_', ' ') : 'Unknown'}
            </span>
          </div>
          <span className={`px-3 py-1 rounded text-sm ${getPriorityColor(currentIssue.priority)}`}>
            {currentIssue.priority || 'Medium'} Priority
          </span>
          {currentIssue.category_name && (
            <span className="px-3 py-1 rounded text-sm bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {currentIssue.category_name}
            </span>
          )}
        </div>

        {/* Description */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
          <p className="text-gray-300 leading-relaxed">{currentIssue.description || 'No description available'}</p>
        </div>

        {/* Images */}
        {currentIssue.images && currentIssue.images.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">Images</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentIssue.images.map((image: any, index: number) => {
                const imageUrl = typeof image === 'string' ? image : image.image;
                return (
                  <div key={index} className="relative cursor-pointer group">
                    <img
                      src={imageUrl}
                      alt={`Issue image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border border-white/10 group-hover:opacity-80 transition-opacity"
                      onClick={() => setSelectedImage(imageUrl)}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Location */}
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-400 mt-1" />
          <div>
            <h3 className="text-lg font-medium text-white mb-1">Location</h3>
            <p className="text-gray-300">{currentIssue.address || 'Location not specified'}</p>
            {currentIssue.coordinates && (
              <p className="text-gray-400 text-sm mt-1">
                Coordinates: {currentIssue.coordinates.latitude}, {currentIssue.coordinates.longitude}
              </p>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reporter */}
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Reported By</h3>
              <p className="text-gray-300">{currentIssue.reported_by_name || 'Unknown user'}</p>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-1">Created</h3>
              <p className="text-gray-300">
                {currentIssue.created_at ? new Date(currentIssue.created_at).toLocaleDateString() : 'Unknown date'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats & Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center space-x-6">
            <button
              onClick={handleVote}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                currentIssue.is_voted 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
              }`}
            >
              <ThumbsUp className="h-5 w-5" />
              <span>{currentIssue.votes || 0} votes</span>
            </button>
            <div className="flex items-center space-x-2 text-gray-400">
              <MessageCircle className="h-5 w-5" />
              <span>{currentIssue.comments_count || 0} comments</span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {currentIssue.tags && currentIssue.tags.length > 0 && (
          <div className="flex items-start space-x-3">
            <Tag className="h-5 w-5 text-gray-400 mt-1" />
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentIssue.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-white mb-4">Comments</h2>
          
          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-6">
            <div className="flex space-x-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={3}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isSubmittingComment ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span>{isSubmittingComment ? 'Posting...' : 'Post'}</span>
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-300" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{comment.user_name || 'Anonymous'}</p>
                      <p className="text-gray-400 text-sm">
                        {comment.created_at ? new Date(comment.created_at).toLocaleDateString() : 'Just now'}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 leading-relaxed">{comment.content}</p>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-center py-8">
                No comments yet. Be the first to comment!
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Enlarged view"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default IssueDetail;
