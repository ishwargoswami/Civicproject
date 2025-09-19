import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Clock,
  Users,
  Star,
  Grid,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchEvents, 
  fetchEventCategories, 
  fetchEventStatistics,
  setFilters,
  clearFilters
} from '../store/slices/eventsSlice';
import EventCard from '../components/events/EventCard';
import { EventFilters } from '../services/eventsApi';

const Events: React.FC = () => {
  const dispatch = useAppDispatch();
  const eventsState = useAppSelector((state) => state.events);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  // Defensive handling in case the store is not properly initialized
  const { 
    events = [], 
    categories = [], 
    statistics = null, 
    filters = {}, 
    loading = {
      events: false,
      currentEvent: false,
      myEvents: false,
      myRSVPs: false,
      categories: false,
      statistics: false,
      creating: false,
      updating: false,
      rsvp: false,
      volunteer: false,
      feedback: false,
    }, 
    error = {
      events: null,
      currentEvent: null,
      myEvents: null,
      myRSVPs: null,
      categories: null,
      statistics: null,
      creating: null,
      updating: null,
      rsvp: null,
      volunteer: null,
      feedback: null,
    }
  } = eventsState || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    dispatch(fetchEvents(filters));
    dispatch(fetchEventCategories());
    dispatch(fetchEventStatistics());
  }, [dispatch, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newFilters: EventFilters = {
      ...filters,
      search: searchQuery || undefined
    };
    dispatch(setFilters(newFilters));
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    const newFilters: EventFilters = {
      ...filters,
      status: status === 'all' ? undefined : status as any
    };
    dispatch(setFilters(newFilters));
  };

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const newFilters: EventFilters = {
      ...filters,
      category: categoryId === 'all' ? undefined : categoryId
    };
    dispatch(setFilters(newFilters));
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    dispatch(clearFilters());
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold mb-2">Community Events</h1>
            <p className="text-gray-400">Discover events and volunteer opportunities</p>
          </div>
          
          {isAuthenticated && (
            <Link to="/dashboard/events/create">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Create Event</span>
              </motion.button>
            </Link>
          )}
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Events</p>
                  <p className="text-2xl font-bold text-white">{statistics.total_events}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Upcoming</p>
                  <p className="text-2xl font-bold text-green-400">{statistics.upcoming_events}</p>
                </div>
                <Clock className="h-8 w-8 text-green-500" />
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Attendees</p>
                  <p className="text-2xl font-bold text-purple-400">{statistics.total_attendees}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Volunteers</p>
                  <p className="text-2xl font-bold text-yellow-400">{statistics.total_volunteers}</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-800 text-white pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </button>
          </form>

          {/* Filter Options */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-700 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusFilter(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Events</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="past">Past</option>
                    <option value="featured">Featured</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryFilter(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">View</label>
                  <div className="flex rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 px-4 py-2 flex items-center justify-center space-x-2 transition-colors ${
                        viewMode === 'grid' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Grid className="h-4 w-4" />
                      <span>Grid</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className={`flex-1 px-4 py-2 flex items-center justify-center space-x-2 transition-colors ${
                        viewMode === 'list' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <List className="h-4 w-4" />
                      <span>List</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Loading State */}
        {loading.events && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-400">Loading events...</span>
          </div>
        )}

        {/* Error State */}
        {error.events && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 mb-8">
            <p className="text-red-400">Error loading events: {error.events}</p>
          </div>
        )}

        {/* Events Grid */}
        {!loading.events && !error.events && (
          <>
            {events.length > 0 ? (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-6"
              }>
                {events.map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    className={viewMode === 'list' ? 'max-w-none' : ''}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-300 mb-2">No events found</h3>
                <p className="text-gray-500 mb-6">
                  {Object.keys(filters).length > 0 
                    ? "Try adjusting your filters to find more events."
                    : "No events are currently available."
                  }
                </p>
                {Object.keys(filters).length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Events;