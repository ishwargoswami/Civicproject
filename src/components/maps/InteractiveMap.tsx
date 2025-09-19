import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  Calendar, 
  Building2, 
  MapPin, 
  Clock, 
  Users, 
  Phone,
  Globe,
  ExternalLink
} from 'lucide-react';
import { MapData } from '../../services/mapsApi';
import { useAppSelector, useAppDispatch } from '../../store';
import { setMapCenter, setMapZoom, setMapBounds } from '../../store/slices/mapsSlice';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface InteractiveMapProps {
  mapData: MapData | null;
}

// Custom icons for different marker types
const createCustomIcon = (color: string, iconName: string) => {
  const svgString = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.596 0 0 5.596 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.596 19.404 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="8" fill="white"/>
      <text x="12.5" y="16" text-anchor="middle" font-family="Arial" font-size="10" fill="${color}">
        ${iconName}
      </text>
    </svg>
  `;
  
  return new Icon({
    iconUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

// Map event handler component
const MapEventHandler: React.FC = () => {
  const map = useMap();
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Enable all interactions
    map.dragging.enable();
    map.touchZoom.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();
    map.boxZoom.enable();
    map.keyboard.enable();
    
    const handleMoveEnd = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const bounds = map.getBounds();
      
      dispatch(setMapCenter([center.lat, center.lng]));
      dispatch(setMapZoom(zoom));
      dispatch(setMapBounds({
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      }));
    };

    map.on('moveend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, dispatch]);

  return null;
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ mapData }) => {
  const { selectedLayers, clusteringEnabled, mapCenter, mapZoom } = useAppSelector(
    (state) => state.maps
  );

  const mapRef = useRef<any>(null);

  // Create custom icons
  const issueIcon = createCustomIcon('#EF4444', '!');
  const eventIcon = createCustomIcon('#10B981', 'E');
  const facilityIcon = createCustomIcon('#3B82F6', 'F');

  // Remove automatic map centering to allow user interaction
  // The map will stay at the initial center and zoom set in MapContainer

  const renderIssueMarkers = () => {
    if (!selectedLayers.includes('issues') || !mapData?.issues) return null;

    // Filter out issues without coordinates
    const issuesWithCoordinates = mapData.issues.filter(issue => 
      issue.coordinates && 
      issue.coordinates.latitude && 
      issue.coordinates.longitude
    );

    const markers = issuesWithCoordinates.map(issue => (
      <Marker
        key={`issue-${issue.id}`}
        position={[issue.coordinates.latitude, issue.coordinates.longitude]}
        icon={issueIcon}
      >
        <Popup>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 min-w-[300px]"
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className={`p-2 rounded-lg ${
                issue.priority === 'critical' ? 'bg-red-100 text-red-600' :
                issue.priority === 'high' ? 'bg-orange-100 text-orange-600' :
                issue.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                'bg-gray-100 text-gray-600'
              }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{issue.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${
                    issue.status === 'open' ? 'bg-red-100 text-red-600' :
                    issue.status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {issue.status.replace('_', ' ')}
                  </span>
                  <span className="capitalize">{issue.priority} priority</span>
                  <span>{issue.votes} votes</span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-2">
              <div className="bg-gray-50 p-2 rounded">
                <p className="flex items-center space-x-1 font-medium text-gray-700">
                  <MapPin className="h-3 w-3" />
                  <span>Location</span>
                </p>
                <p className="ml-4 text-gray-600">{issue.address}</p>
                <p className="ml-4 text-xs text-blue-600">
                  📍 {issue.coordinates.latitude.toFixed(4)}, {issue.coordinates.longitude.toFixed(4)}
                </p>
              </div>
              <p className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>Reported by {issue.reporter_name}</span>
              </p>
              <button
                onClick={() => {
                  if (mapRef.current) {
                    mapRef.current.setView([issue.coordinates.latitude, issue.coordinates.longitude], 12);
                  }
                }}
                className="mt-2 w-full bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition-colors"
              >
                📍 Center on Location
              </button>
            </div>
          </motion.div>
        </Popup>
      </Marker>
    ));

    return clusteringEnabled ? (
      <MarkerClusterGroup>{markers}</MarkerClusterGroup>
    ) : (
      <>{markers}</>
    );
  };

  const renderEventMarkers = () => {
    if (!selectedLayers.includes('events') || !mapData?.events) return null;

    // Filter out events without coordinates
    const eventsWithCoordinates = mapData.events.filter(event => 
      event.coordinates && 
      event.coordinates.latitude && 
      event.coordinates.longitude
    );

    const markers = eventsWithCoordinates.map(event => (
      <Marker
        key={`event-${event.id}`}
        position={[event.coordinates.latitude, event.coordinates.longitude]}
        icon={eventIcon}
      >
        <Popup>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 min-w-[300px]"
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{event.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className={`px-2 py-1 rounded-full ${
                    event.is_upcoming ? 'bg-blue-100 text-blue-600' :
                    event.is_ongoing ? 'bg-green-100 text-green-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {event.is_upcoming ? 'Upcoming' : event.is_ongoing ? 'Ongoing' : 'Past'}
                  </span>
                  <span className="flex items-center space-x-1">
                    <Users className="h-3 w-3" />
                    <span>{event.current_attendees}/{event.capacity}</span>
                  </span>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              <p className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{event.location_name} - {event.address}</span>
              </p>
              <p className="flex items-center space-x-1 mt-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</span>
              </p>
              <p className="mt-1">Organized by {event.organizer_name}</p>
            </div>
          </motion.div>
        </Popup>
      </Marker>
    ));

    return clusteringEnabled ? (
      <MarkerClusterGroup>{markers}</MarkerClusterGroup>
    ) : (
      <>{markers}</>
    );
  };

  const renderFacilityMarkers = () => {
    if (!selectedLayers.includes('facilities') || !mapData?.facilities) return null;

    // Filter out facilities without coordinates
    const facilitiesWithCoordinates = mapData.facilities.filter(facility => 
      facility.coordinates && 
      facility.coordinates.latitude && 
      facility.coordinates.longitude
    );

    const markers = facilitiesWithCoordinates.map(facility => (
      <Marker
        key={`facility-${facility.id}`}
        position={[facility.coordinates.latitude, facility.coordinates.longitude]}
        icon={facilityIcon}
      >
        <Popup>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 min-w-[300px]"
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{facility.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{facility.description}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full capitalize">
                    {facility.facility_type.replace('_', ' ')}
                  </span>
                  {facility.is_accessible && (
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full">
                      Accessible
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>{facility.address}</span>
              </p>
              {facility.phone && (
                <p className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{facility.phone}</span>
                </p>
              )}
              {facility.website && (
                <p className="flex items-center space-x-1">
                  <Globe className="h-3 w-3" />
                  <a 
                    href={facility.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center space-x-1"
                  >
                    <span>Visit Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              )}
            </div>
          </motion.div>
        </Popup>
      </Marker>
    ));

    return clusteringEnabled ? (
      <MarkerClusterGroup>{markers}</MarkerClusterGroup>
    ) : (
      <>{markers}</>
    );
  };

  const renderDistricts = () => {
    if (!selectedLayers.includes('districts') || !mapData?.districts) return null;

    return mapData.districts.map(district => (
      <Polygon
        key={`district-${district.id}`}
        positions={district.boundary_coordinates}
        pathOptions={{
          color: '#8B5CF6',
          weight: 2,
          opacity: 0.8,
          fillColor: '#8B5CF6',
          fillOpacity: 0.1,
        }}
      >
        <Popup>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-2 min-w-[250px]"
          >
            <div className="flex items-start space-x-3 mb-3">
              <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                <MapPin className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{district.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{district.description}</p>
                <div className="text-xs text-gray-500 space-y-1">
                  {district.population && (
                    <p>Population: {district.population.toLocaleString()}</p>
                  )}
                  {district.area_sq_km && (
                    <p>Area: {district.area_sq_km} km²</p>
                  )}
                  {district.population_density && (
                    <p>Density: {district.population_density} people/km²</p>
                  )}
                  {district.representative && (
                    <p>Representative: {district.representative}</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </Popup>
      </Polygon>
    ));
  };

  // Always render the map, even with empty data
  const hasData = mapData && (
    (mapData.issues && mapData.issues.length > 0) ||
    (mapData.events && mapData.events.length > 0) ||
    (mapData.facilities && mapData.facilities.length > 0) ||
    (mapData.districts && mapData.districts.length > 0)
  );

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative">
      <MapContainer
        ref={mapRef}
        center={[20.5937, 78.9629]} // India center
        zoom={5} // India zoom level
        style={{ height: '100%', width: '100%' }}
        className="z-10"
        scrollWheelZoom={true}
        dragging={true}
        touchZoom={true}
        doubleClickZoom={true}
        boxZoom={true}
        keyboard={true}
      >
        <MapEventHandler />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {mapData && renderIssueMarkers()}
        {mapData && renderEventMarkers()}
        {mapData && renderFacilityMarkers()}
        {mapData && renderDistricts()}
      </MapContainer>
    </div>
  );
};

export default InteractiveMap;
