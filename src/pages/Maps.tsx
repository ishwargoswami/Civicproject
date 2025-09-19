import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Layers, 
  Search,
  Settings,
  BarChart3,
  X,
  MapPin,
  Calendar,
  AlertTriangle,
  Building2,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store';
import { 
  fetchMapData, 
  fetchMapStatistics, 
  setFilters, 
  toggleLayer, 
  setClustering,
  clearError 
} from '../store/slices/mapsSlice';
import InteractiveMap from '../components/maps/InteractiveMap';
import MapFilters from '../components/maps/MapFilters';
import MapStatistics from '../components/maps/MapStatistics';
import LayerControl from '../components/maps/LayerControl';

const Maps: React.FC = () => {
  const dispatch = useAppDispatch();
  const { mapData, statistics, isLoading, error, selectedLayers, filters } = useAppSelector(
    (state) => state.maps
  );

  const [showFilters, setShowFilters] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load initial map data and statistics
    dispatch(fetchMapData(filters));
    dispatch(fetchMapStatistics());
  }, [dispatch]);

  useEffect(() => {
    // Reload data when filters change
    if (Object.keys(filters).length > 0) {
      dispatch(fetchMapData(filters));
    }
  }, [dispatch, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      const newFilters = { ...filters, search: searchQuery.trim() };
      dispatch(setFilters(newFilters));
    } else {
      const { search, ...filtersWithoutSearch } = filters;
      dispatch(setFilters(filtersWithoutSearch));
    }
  };

  const layerStats = {
    issues: statistics?.total_issues || 0,
    events: statistics?.total_events || 0,
    facilities: statistics?.total_facilities || 0,
    districts: statistics?.total_districts || 0,
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error Loading Maps</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => {
              dispatch(clearError());
              dispatch(fetchMapData(filters));
            }}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-shrink-0 p-6 pb-4"
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Interactive Maps</h1>
            <p className="text-gray-400">Visualize community data on interactive maps</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                showStats 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Statistics"
            >
              <BarChart3 className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowLayers(!showLayers)}
              className={`p-3 rounded-xl transition-all duration-200 ${
                showLayers 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Layers"
            >
              <Layers className="h-5 w-5" />
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations, issues, events..."
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                const { search, ...filtersWithoutSearch } = filters;
                dispatch(setFilters(filtersWithoutSearch));
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </form>

        {/* Quick Layer Toggles */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { key: 'issues', label: 'Issues', icon: AlertTriangle, color: 'text-red-400' },
            { key: 'events', label: 'Events', icon: Calendar, color: 'text-green-400' },
            { key: 'facilities', label: 'Facilities', icon: Building2, color: 'text-blue-400' },
            { key: 'districts', label: 'Districts', icon: MapPin, color: 'text-purple-400' },
          ].map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => dispatch(toggleLayer(key))}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                selectedLayers.includes(key)
                  ? 'bg-white/10 text-white border border-white/20'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {selectedLayers.includes(key) ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
              <Icon className={`h-4 w-4 ${color}`} />
              <span>{label}</span>
              <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded">
                {layerStats[key as keyof typeof layerStats]}
              </span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Map Container */}
      <div className="flex-1 relative min-h-[600px]">
        {/* Removed loading overlay to allow map interaction */}
        
        <InteractiveMap mapData={mapData} />

        {/* Side Panels */}
        <AnimatePresence>
          {/* Statistics Panel */}
          {showStats && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-4 right-4 z-40"
            >
              <MapStatistics 
                statistics={statistics} 
                onClose={() => setShowStats(false)} 
              />
            </motion.div>
          )}

          {/* Layer Control Panel */}
          {showLayers && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="absolute top-4 left-4 z-40"
            >
              <LayerControl 
                layers={mapData?.layers || []} 
                onClose={() => setShowLayers(false)} 
              />
            </motion.div>
          )}

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, y: -300 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -300 }}
              className="absolute top-4 left-1/2 transform -translate-x-1/2 z-40 w-full max-w-2xl mx-4"
            >
              <MapFilters onClose={() => setShowFilters(false)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Maps;