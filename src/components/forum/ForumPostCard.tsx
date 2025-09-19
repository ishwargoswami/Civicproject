import React from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquare, 
  ChevronUp, 
  ChevronDown, 
  Eye, 
  Clock, 
  Pin, 
  Lock,
  BarChart3,
  FileText,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ForumPost } from '../../store/slices/forumSlice';
import { formatDistanceToNow } from 'date-fns';

interface ForumPostCardProps {
  post: ForumPost;
  onVote: (postId: string, voteType: 'up' | 'down') => void;
  isVoting?: boolean;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({ post, onVote, isVoting }) => {
  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case 'poll':
        return <BarChart3 className="h-4 w-4" />;
      case 'petition':
        return <FileText className="h-4 w-4" />;
      case 'announcement':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = () => {
    switch (post.post_type) {
      case 'poll':
        return 'text-blue-400';
      case 'petition':
        return 'text-red-400';
      case 'announcement':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  const getCategoryColor = () => {
    // Use the category_color from the backend if available
    return post.category_color || '#6B7280';
  };

  const handleVote = (voteType: 'up' | 'down') => {
    if (!isVoting) {
      onVote(post.id, voteType);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-200"
    >
      <div className="flex items-start space-x-4">
        {/* Voting Section */}
        <div className="flex flex-col items-center space-y-1 min-w-[50px]">
          <button
            onClick={() => handleVote('up')}
            disabled={isVoting}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              post.user_vote === 'up' 
                ? 'text-green-400 bg-green-400/20' 
                : 'text-gray-400 hover:text-green-400'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          
          <span className={`text-sm font-semibold ${
            post.upvotes > post.downvotes 
              ? 'text-green-400' 
              : post.downvotes > post.upvotes 
                ? 'text-red-400' 
                : 'text-gray-300'
          }`}>
            {post.score}
          </span>
          
          <button
            onClick={() => handleVote('down')}
            disabled={isVoting}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              post.user_vote === 'down' 
                ? 'text-red-400 bg-red-400/20' 
                : 'text-gray-400 hover:text-red-400'
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center space-x-2 mb-2">
            {post.is_pinned && (
              <Pin className="h-4 w-4 text-yellow-400" />
            )}
            {post.is_locked && (
              <Lock className="h-4 w-4 text-red-400" />
            )}
            <div className={`${getPostTypeColor()}`}>
              {getPostTypeIcon()}
            </div>
            <span 
              className="px-2 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: getCategoryColor() }}
            >
              {post.category_name}
            </span>
            <span className="text-xs text-gray-400 capitalize">
              {post.post_type}
            </span>
          </div>

          {/* Title */}
          <Link 
            to={`/dashboard/forum/posts/${post.id}`}
            className="block hover:text-blue-400 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
              {post.title}
            </h3>
          </Link>

          {/* Content Preview */}
          <p className="text-gray-300 text-sm mb-3 line-clamp-3">
            {post.content}
          </p>

          {/* Poll Preview */}
          {post.poll && (
            <div className="mb-3 p-3 bg-white/5 rounded-lg border border-blue-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">Poll</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">{post.poll.question}</p>
              <div className="text-xs text-gray-400">
                {post.poll.total_votes} votes • {post.poll.options.length} options
              </div>
            </div>
          )}

          {/* Petition Preview */}
          {post.petition && (
            <div className="mb-3 p-3 bg-white/5 rounded-lg border border-red-500/20">
              <div className="flex items-center space-x-2 mb-2">
                <FileText className="h-4 w-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Petition</span>
              </div>
              <p className="text-sm text-gray-300 mb-2">Target: {post.petition.target}</p>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <span>{post.petition.signatures} / {post.petition.goal} signatures</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${post.petition.progress_percentage}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/10 text-gray-300 text-xs rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <img
                  src={post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_name}`}
                  alt={post.author_name}
                  className="w-5 h-5 rounded-full"
                />
                <span>{post.author_name}</span>
                <span className={`px-1.5 py-0.5 rounded text-xs ${
                  post.author_role === 'official' 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {post.author_role}
                </span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{post.created_at ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true }) : 'Unknown date'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageSquare className="h-3 w-3" />
                <span>{post.comments_count}</span>
              </div>
              
              <div className="flex items-center space-x-1">
                <Eye className="h-3 w-3" />
                <span>{post.views}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ForumPostCard;
