import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  MessageSquare, 
  BarChart3, 
  FileText, 
  Users, 
  Plus, 
  Trash2,
  Calendar
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { createPost } from '../../store/slices/forumSlice';
import { forumAPI } from '../../services/api';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PollOption {
  text: string;
  id: string;
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.forum);
  const { user } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    post_type: 'discussion',
    tags: [] as string[],
  });
  
  const [tagInput, setTagInput] = useState('');
  
  // Poll specific state
  const [pollData, setPollData] = useState({
    question: '',
    options: [{ text: '', id: '1' }, { text: '', id: '2' }] as PollOption[],
    allow_multiple: false,
    ends_at: '',
    is_anonymous: false,
  });
  
  // Petition specific state
  const [petitionData, setPetitionData] = useState({
    target: '',
    goal: 100,
    deadline: '',
  });

  const [categories, setCategories] = useState([
    { id: 1, name: 'General Discussion', slug: 'general' },
    { id: 2, name: 'Policy & Governance', slug: 'policy' },
    { id: 3, name: 'Community Events', slug: 'events' },
    { id: 4, name: 'Announcements', slug: 'announcements' },
    { id: 5, name: 'Feedback & Suggestions', slug: 'feedback' },
  ]);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await forumAPI.getCategories();
        if (response.data.results) {
          setCategories(response.data.results);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      }
    };
    
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const postTypes = [
    { value: 'discussion', label: 'Discussion', icon: MessageSquare, color: 'text-green-400' },
    { value: 'poll', label: 'Poll', icon: BarChart3, color: 'text-blue-400' },
    { value: 'petition', label: 'Petition', icon: FileText, color: 'text-red-400' },
    { value: 'announcement', label: 'Announcement', icon: Users, color: 'text-yellow-400' },
  ];

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({
        title: '',
        content: '',
        category: '',
        post_type: 'discussion',
        tags: [],
      });
      setTagInput('');
      setPollData({
        question: '',
        options: [{ text: '', id: '1' }, { text: '', id: '2' }],
        allow_multiple: false,
        ends_at: '',
        is_anonymous: false,
      });
      setPetitionData({
        target: '',
        goal: 100,
        deadline: '',
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please log in to create a post.');
      return;
    }
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.category) {
      alert('Please fill in all required fields.');
      return;
    }

    const postData: any = {
      ...formData,
      category: parseInt(formData.category), // Ensure category is a number
    };

    // Add poll data if it's a poll
    if (formData.post_type === 'poll' && pollData.question.trim()) {
      const validOptions = pollData.options.filter(opt => opt.text.trim());
      if (validOptions.length >= 2) {
        postData.poll_data = {
          ...pollData,
          options: validOptions.map(opt => opt.text),
        };
      }
    }

    // Add petition data if it's a petition
    if (formData.post_type === 'petition' && petitionData.target.trim()) {
      postData.petition_data = petitionData;
    }

    try {
      await dispatch(createPost(postData)).unwrap();
      onClose();
    } catch (error: any) {
      console.error('Failed to create post:', error);
      
      // Better error handling
      if (error.message?.includes('401') || error.message?.includes('Authentication')) {
        alert('Authentication failed. Please log in again.');
        window.location.href = '/login';
      } else if (error.message?.includes('400')) {
        alert('Invalid data. Please check your input and try again.');
      } else {
        alert('Failed to create post. Please try again.');
      }
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addPollOption = () => {
    setPollData(prev => ({
      ...prev,
      options: [...prev.options, { text: '', id: Date.now().toString() }]
    }));
  };

  const removePollOption = (idToRemove: string) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.filter(opt => opt.id !== idToRemove)
    }));
  };

  const updatePollOption = (id: string, text: string) => {
    setPollData(prev => ({
      ...prev,
      options: prev.options.map(opt => opt.id === id ? { ...opt, text } : opt)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gray-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Post</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Post Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Post Type
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {postTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, post_type: type.value }))}
                      className={`p-3 rounded-lg border transition-all ${
                        formData.post_type === type.value
                          ? 'border-blue-500 bg-blue-500/20'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <type.icon className={`h-5 w-5 mx-auto mb-2 ${type.color}`} />
                      <div className="text-xs text-gray-300">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter post title..."
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  placeholder="Write your post content..."
                  required
                />
              </div>

              {/* Poll Configuration */}
              {formData.post_type === 'poll' && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-400 mb-4">Poll Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Poll Question
                      </label>
                      <input
                        type="text"
                        value={pollData.question}
                        onChange={(e) => setPollData(prev => ({ ...prev, question: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter your poll question..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Options
                      </label>
                      <div className="space-y-2">
                        {pollData.options.map((option, index) => (
                          <div key={option.id} className="flex space-x-2">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => updatePollOption(option.id, e.target.value)}
                              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder={`Option ${index + 1}`}
                            />
                            {pollData.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removePollOption(option.id)}
                                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={addPollOption}
                          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Option</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={pollData.allow_multiple}
                          onChange={(e) => setPollData(prev => ({ ...prev, allow_multiple: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/10 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Allow multiple selections</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={pollData.is_anonymous}
                          onChange={(e) => setPollData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-white/5 border-white/10 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-300">Anonymous voting</span>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        End Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={pollData.ends_at}
                        onChange={(e) => setPollData(prev => ({ ...prev, ends_at: e.target.value }))}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Petition Configuration */}
              {formData.post_type === 'petition' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-4">Petition Configuration</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Target (Who is this petition directed to?)
                      </label>
                      <input
                        type="text"
                        value={petitionData.target}
                        onChange={(e) => setPetitionData(prev => ({ ...prev, target: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="e.g., City Council, Mayor, Department of Transportation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Signature Goal
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={petitionData.goal}
                        onChange={(e) => setPetitionData(prev => ({ ...prev, goal: parseInt(e.target.value) || 100 }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Deadline (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={petitionData.deadline}
                        onChange={(e) => setPetitionData(prev => ({ ...prev, deadline: e.target.value }))}
                        className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tags..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center space-x-1 px-3 py-1 bg-white/10 text-gray-300 rounded-full text-sm"
                      >
                        <span>#{tag}</span>
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 border border-white/20 text-gray-300 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !formData.category}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isLoading ? 'Creating...' : 'Create Post'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
