import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  Calendar, 
  Building2, 
  MapPin,
  Layers
} from 'lucide-react';
import { MapLayer } from '../../services/mapsApi';
import { useAppDispatch, useAppSelector } from '../../store';
import { toggleLayer, setClustering } from '../../store/slices/mapsSlice';

interface LayerControlProps {
  layers: MapLayer[];
  onClose: () => void;
}

const LayerControl: React.FC<LayerControlProps> = ({ layers, onClose }) => {
  const dispatch = useAppDispatch();
  const { selectedLayers, clusteringEnabled } = useAppSelector((state) => state.maps);

  const layerIcons = {
    issues: AlertTriangle,
    events: Calendar,
    facilities: Building2,
    districts: MapPin,
    projects: Building2,
    custom: Layers,
  };

  const layerColors = {
    issues: 'text-red-400',
    events: 'text-green-400',
    facilities: 'text-blue-400',
    districts: 'text-purple-400',
    projects: 'text-yellow-400',
    custom: 'text-gray-400',
  };

  const handleToggleLayer = (layerType: string) => {
    dispatch(toggleLayer(layerType));
  };

  const handleToggleClustering = () => {
    dispatch(setClustering(!clusteringEnabled));
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 max-w-sm"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <Layers className="h-5 w-5" />
          <span>Map Layers</span>
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Layer Controls */}
      <div className="space-y-3 mb-6">
        {layers.map((layer, index) => {
          const Icon = layerIcons[layer.layer_type as keyof typeof layerIcons] || Layers;
          const color = layerColors[layer.layer_type as keyof typeof layerColors] || 'text-gray-400';
          const isVisible = selectedLayers.includes(layer.layer_type);
          
          return (
            <motion.div
              key={layer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg transition-all duration-200 ${
                isVisible 
                  ? 'bg-white/10 border border-white/20' 
                  : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${isVisible ? 'bg-white/10' : 'bg-white/5'}`}>
                  <Icon className={`h-4 w-4 ${color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{layer.name}</p>
                  <p className="text-xs text-gray-400">{layer.description}</p>
                </div>
              </div>
              
              <button
                onClick={() => handleToggleLayer(layer.layer_type)}
                className={`p-2 rounded-lg transition-colors ${
                  isVisible 
                    ? 'text-white bg-white/10 hover:bg-white/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Map Settings */}
      <div className="border-t border-white/10 pt-4">
        <h4 className="text-sm font-medium text-white mb-3">Map Settings</h4>
        
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div>
            <p className="text-sm font-medium text-white">Marker Clustering</p>
            <p className="text-xs text-gray-400">Group nearby markers together</p>
          </div>
          <button
            onClick={handleToggleClustering}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              clusteringEnabled ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                clusteringEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Layer Legend */}
      <div className="mt-4 p-3 bg-gradient-to-r from-gray-500/10 to-gray-600/10 rounded-lg border border-gray-500/20">
        <h4 className="text-sm font-medium text-white mb-2">Legend</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">Issues</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-300">Events</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-300">Facilities</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-gray-300">Districts</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LayerControl;
