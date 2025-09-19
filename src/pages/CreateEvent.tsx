import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Globe,
  AlertCircle,
  ArrowLeft,
  Save,
  Plus,
  X
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  createEventAsync, 
  fetchEventCategories 
} from '../store/slices/eventsSlice';
import { EventCreateData } from '../services/eventsApi';

const CreateEvent: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector((state) => state.events);
  
  const [formData, setFormData] = useState<EventCreateData>({
    title: '',
    description: '',
    category: 0,
    organization: '',
    location_name: '',
    address: '',
    latitude: undefined,
    longitude: undefined,
    is_online: false,
    meeting_link: '',
    start_date: '',
    end_date: '',
    registration_deadline: '',
    capacity: 50,
    volunteers_needed: 0,
    requirements: [],
    age_restriction: undefined,
    requires_approval: false,
    is_featured: false,
    is_public: true,
    allow_waitlist: true,
    tags: [],
    external_url: ''
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(fetchEventCategories());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = 'Event title is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Event description is required';
    }

    if (!formData.category) {
      errors.category = 'Please select a category';
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required';
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      errors.end_date = 'End date must be after start date';
    }

    if (formData.start_date && new Date(formData.start_date) <= new Date()) {
      errors.start_date = 'Start date must be in the future';
    }

    if (!formData.is_online) {
      if (!formData.location_name.trim()) {
        errors.location_name = 'Location name is required for in-person events';
      }
      if (!formData.address.trim()) {
        errors.address = 'Address is required for in-person events';
      }
    } else {
      if (!formData.meeting_link.trim()) {
        errors.meeting_link = 'Meeting link is required for online events';
      }
    }

    if (formData.capacity < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const result = await dispatch(createEventAsync(formData)).unwrap();
      navigate(`/events/${result.id}`);
    } catch (err) {
      console.error('Failed to create event:', err);
    }
  };

  const selectedCategory = categories.find(cat => cat.id === formData.category);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold mb-2">Create New Event</h1>
            <p className="text-gray-400">Fill in the details to create your community event</p>
          </div>
        </div>

        {/* Error Display */}
        {error.creating && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-400">Error creating event: {error.creating}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Basic Information
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    validationErrors.title ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Enter event title"
                />
                {validationErrors.title && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.title}</p>
                )}
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    validationErrors.description ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="Describe your event in detail"
                />
                {validationErrors.description && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    validationErrors.category ? 'border-red-500' : 'border-gray-700'
                  }`}
                >
                  <option value={0}>Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {validationErrors.category && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.category}</p>
                )}
                {selectedCategory && (
                  <div className="mt-2">
                    <span 
                      className="inline-block px-3 py-1 rounded-full text-xs font-medium text-white"
                      style={{ backgroundColor: selectedCategory.color }}
                    >
                      {selectedCategory.icon} {selectedCategory.name}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Organization
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Your organization (optional)"
                />
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Date and Time
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    validationErrors.start_date ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {validationErrors.start_date && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.start_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    validationErrors.end_date ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {validationErrors.end_date && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.end_date}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Registration Deadline
                </label>
                <input
                  type="datetime-local"
                  name="registration_deadline"
                  value={formData.registration_deadline}
                  onChange={handleInputChange}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Location
            </h2>

            <div className="mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_online"
                  checked={formData.is_online}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <Globe className="h-4 w-4 mr-1" />
                <span>This is an online event</span>
              </label>
            </div>

            {formData.is_online ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Meeting Link *
                </label>
                <input
                  type="url"
                  name="meeting_link"
                  value={formData.meeting_link}
                  onChange={handleInputChange}
                  className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    validationErrors.meeting_link ? 'border-red-500' : 'border-gray-700'
                  }`}
                  placeholder="https://zoom.us/j/..."
                />
                {validationErrors.meeting_link && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.meeting_link}</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location Name *
                  </label>
                  <input
                    type="text"
                    name="location_name"
                    value={formData.location_name}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      validationErrors.location_name ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="Community Center, Park, etc."
                  />
                  {validationErrors.location_name && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.location_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      validationErrors.address ? 'border-red-500' : 'border-gray-700'
                    }`}
                    placeholder="Street address, City, State, ZIP"
                  />
                  {validationErrors.address && (
                    <p className="text-red-400 text-sm mt-1">{validationErrors.address}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Capacity and Volunteers */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Capacity and Volunteers
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Event Capacity *
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full bg-gray-800 text-white border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                    validationErrors.capacity ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                {validationErrors.capacity && (
                  <p className="text-red-400 text-sm mt-1">{validationErrors.capacity}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Volunteers Needed
                </label>
                <input
                  type="number"
                  name="volunteers_needed"
                  value={formData.volunteers_needed}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age Restriction
                </label>
                <input
                  type="number"
                  name="age_restriction"
                  value={formData.age_restriction || ''}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Minimum age (optional)"
                />
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Requirements</h2>
            
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRequirement}
                  onChange={(e) => setNewRequirement(e.target.value)}
                  className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Add a requirement (e.g., 'Bring water bottle')"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                />
                <button
                  type="button"
                  onClick={addRequirement}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {formData.requirements.length > 0 && (
              <div className="space-y-2">
                {formData.requirements.map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-2">
                    <span>{requirement}</span>
                    <button
                      type="button"
                      onClick={() => removeRequirement(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Tags</h2>
            
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-1 bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Add a tag (e.g., 'community', 'outdoor')"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center bg-blue-600 text-white rounded-full px-3 py-1 text-sm">
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-200 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Event Settings</h2>
            
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="requires_approval"
                  checked={formData.requires_approval}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <span>Require approval for RSVPs</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="allow_waitlist"
                  checked={formData.allow_waitlist}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <span>Allow waitlist when event is full</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <span>Make event public</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <span>Feature this event</span>
              </label>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                External URL
              </label>
              <input
                type="url"
                name="external_url"
                value={formData.external_url}
                onChange={handleInputChange}
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="https://example.com (optional)"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={loading.creating}
              whileHover={{ scale: loading.creating ? 1 : 1.02 }}
              whileTap={{ scale: loading.creating ? 1 : 0.98 }}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              {loading.creating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Create Event</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;
