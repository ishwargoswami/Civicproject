import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Filter,
  X,
  Calendar,
  Building2,
  Tag,
  DollarSign,
  Search,
  RotateCcw,
} from 'lucide-react';
import { TransparencyFilters } from '../../store/slices/transparencySlice';

interface TransparencyFiltersProps {
  filters: TransparencyFilters;
  departments: Array<{ id: string; name: string; slug: string }>;
  categories: Array<{ id: string; name: string; slug: string }>;
  onFiltersChange: (filters: TransparencyFilters) => void;
  onClearFilters: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const TransparencyFiltersComponent: React.FC<TransparencyFiltersProps> = ({
  filters,
  departments,
  categories,
  onFiltersChange,
  onClearFilters,
  isOpen,
  onToggle,
}) => {
  const [localFilters, setLocalFilters] = useState<TransparencyFilters>(filters);

  const handleFilterChange = (key: keyof TransparencyFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'planned', label: 'Planned' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const documentTypes = [
    { value: '', label: 'All Types' },
    { value: 'meeting_minutes', label: 'Meeting Minutes' },
    { value: 'budget_report', label: 'Budget Reports' },
    { value: 'policy_document', label: 'Policy Documents' },
    { value: 'contract', label: 'Contracts' },
    { value: 'proposal', label: 'Proposals' },
    { value: 'report', label: 'Reports' },
    { value: 'other', label: 'Other' },
  ];

  const metricTypes = [
    { value: '', label: 'All Metrics' },
    { value: 'efficiency', label: 'Efficiency' },
    { value: 'satisfaction', label: 'Satisfaction' },
    { value: 'response_time', label: 'Response Time' },
    { value: 'completion_rate', label: 'Completion Rate' },
    { value: 'budget_utilization', label: 'Budget Utilization' },
    { value: 'custom', label: 'Custom' },
  ];

  return (
    <>
      {/* Filter Toggle Button */}
      <button
        onClick={onToggle}
        className="flex items-center px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white hover:bg-white/10 transition-colors"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
        {Object.keys(filters).length > 0 && (
          <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
            {Object.keys(filters).length}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-12 right-0 w-96 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Filters</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center px-3 py-1 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </button>
                <button
                  onClick={onToggle}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Search className="h-4 w-4 inline mr-2" />
                  Search
                </label>
                <input
                  type="text"
                  value={localFilters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search by title or description..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Year
                </label>
                <select
                  value={localFilters.year || ''}
                  onChange={(e) => handleFilterChange('year', e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  Department
                </label>
                <select
                  value={localFilters.department || ''}
                  onChange={(e) => handleFilterChange('department', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.slug}>{dept.name}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <Tag className="h-4 w-4 inline mr-2" />
                  Category
                </label>
                <select
                  value={localFilters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Status (for projects) */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={localFilters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* Amount Range */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-2" />
                  Amount Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={localFilters.min_amount || ''}
                    onChange={(e) => handleFilterChange('min_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Min"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    value={localFilters.max_amount || ''}
                    onChange={(e) => handleFilterChange('max_amount', e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Max"
                    className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document Type
                </label>
                <select
                  value={localFilters.document_type || ''}
                  onChange={(e) => handleFilterChange('document_type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Metric Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Metric Type
                </label>
                <select
                  value={localFilters.metric_type || ''}
                  onChange={(e) => handleFilterChange('metric_type', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {metricTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default TransparencyFiltersComponent;
