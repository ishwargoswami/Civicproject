import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Filter, 
  Calendar, 
  MapPin, 
  Building2, 
  AlertTriangle,
  Search,
  RotateCcw
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { setFilters, clearFilters } from '../../store/slices/mapsSlice';

interface MapFiltersProps {
  onClose: () => void;
}

const MapFilters: React.FC<MapFiltersProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { filters } = useAppSelector((state) => state.maps);
  
  const [localFilters, setLocalFilters] = useState({
    issue_status: filters.issue_status || [],
    issue_priority: filters.issue_priority || [],
    event_status: filters.event_status || 'all',
    facility_types: filters.facility_types || [],
    date_from: filters.date_from || '',
    date_to: filters.date_to || '',
  });

  const issueStatusOptions = [
    { value: 'open', label: 'Open', color: 'bg-red-500' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'resolved', label: 'Resolved', color: 'bg-green-500' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-500' },
  ];

  const issuePriorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-gray-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  ];

  const eventStatusOptions = [
    { value: 'all', label: 'All Events' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'past', label: 'Past' },
  ];

  const facilityTypeOptions = [
    { value: 'hospital', label: 'Hospital' },
    { value: 'school', label: 'School' },
    { value: 'library', label: 'Library' },
    { value: 'park', label: 'Park' },
    { value: 'police_station', label: 'Police Station' },
    { value: 'fire_station', label: 'Fire Station' },
    { value: 'government_office', label: 'Government Office' },
    { value: 'community_center', label: 'Community Center' },
    { value: 'public_transport', label: 'Public Transport' },
    { value: 'other', label: 'Other' },
  ];

  const handleApplyFilters = () => {
    const filtersToApply: any = { ...filters };
    
    // Only include non-empty filters
    if (localFilters.issue_status.length > 0) {
      filtersToApply.issue_status = localFilters.issue_status;
    } else {
      delete filtersToApply.issue_status;
    }
    
    if (localFilters.issue_priority.length > 0) {
      filtersToApply.issue_priority = localFilters.issue_priority;
    } else {
      delete filtersToApply.issue_priority;
    }
    
    if (localFilters.event_status !== 'all') {
      filtersToApply.event_status = localFilters.event_status;
    } else {
      delete filtersToApply.event_status;
    }
    
    if (localFilters.facility_types.length > 0) {
      filtersToApply.facility_types = localFilters.facility_types;
    } else {
      delete filtersToApply.facility_types;
    }
    
    if (localFilters.date_from) {
      filtersToApply.date_from = localFilters.date_from;
    } else {
      delete filtersToApply.date_from;
    }
    
    if (localFilters.date_to) {
      filtersToApply.date_to = localFilters.date_to;
    } else {
      delete filtersToApply.date_to;
    }

    dispatch(setFilters(filtersToApply));
    onClose();
  };

  const handleClearFilters = () => {
    setLocalFilters({
      issue_status: [],
      issue_priority: [],
      event_status: 'all',
      facility_types: [],
      date_from: '',
      date_to: '',
    });
    dispatch(clearFilters());
  };

  const toggleArrayFilter = (filterKey: keyof typeof localFilters, value: string) => {
    const currentArray = localFilters[filterKey] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setLocalFilters(prev => ({
      ...prev,
      [filterKey]: newArray
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Map Filters</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleClearFilters}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            title="Clear all filters"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Issue Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <h4 className="text-sm font-medium text-white">Issue Filters</h4>
          </div>
          
          {/* Issue Status */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Status</label>
            <div className="space-y-2">
              {issueStatusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter('issue_status', option.value)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${
                    (localFilters.issue_status as string[]).includes(option.value)
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Issue Priority */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Priority</label>
            <div className="space-y-2">
              {issuePriorityOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter('issue_priority', option.value)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${
                    (localFilters.issue_priority as string[]).includes(option.value)
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Event Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Calendar className="h-4 w-4 text-green-400" />
            <h4 className="text-sm font-medium text-white">Event Filters</h4>
          </div>
          
          {/* Event Status */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Status</label>
            <div className="space-y-2">
              {eventStatusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setLocalFilters(prev => ({ ...prev, event_status: option.value }))}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${
                    localFilters.event_status === option.value
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Date Range</label>
            <div className="space-y-2">
              <input
                type="date"
                value={localFilters.date_from}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="From date"
              />
              <input
                type="date"
                value={localFilters.date_to}
                onChange={(e) => setLocalFilters(prev => ({ ...prev, date_to: e.target.value }))}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="To date"
              />
            </div>
          </div>
        </div>

        {/* Facility Filters */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Building2 className="h-4 w-4 text-blue-400" />
            <h4 className="text-sm font-medium text-white">Facility Filters</h4>
          </div>
          
          {/* Facility Types */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Types</label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {facilityTypeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => toggleArrayFilter('facility_types', option.value)}
                  className={`w-full flex items-center space-x-3 p-2 rounded-lg text-sm transition-colors ${
                    (localFilters.facility_types as string[]).includes(option.value)
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-white/10">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleApplyFilters}
          className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          Apply Filters
        </button>
      </div>
    </motion.div>
  );
};

export default MapFilters;
