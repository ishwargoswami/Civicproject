import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  Star,
  Globe,
  User,
  Edit
} from 'lucide-react';
import { format } from 'date-fns';
import { EventListItem } from '../../services/eventsApi';

interface EventCardProps {
  event: EventListItem;
  className?: string;
  canManage?: boolean;
  onEdit?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, className = '', canManage = false, onEdit }) => {
  const getStatusColor = () => {
    if (event.is_past) return 'bg-gray-100 text-gray-600';
    if (event.is_ongoing) return 'bg-green-100 text-green-700';
    if (event.is_upcoming) return 'bg-blue-100 text-blue-700';
    return 'bg-gray-100 text-gray-600';
  };

  const getStatusText = () => {
    if (event.is_past) return 'Past';
    if (event.is_ongoing) return 'Ongoing';
    if (event.is_upcoming) return 'Upcoming';
    return 'Unknown';
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy • h:mm a');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Featured Image */}
      {event.featured_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={event.featured_image.image}
            alt={event.featured_image.caption || event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          {event.is_featured && (
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-500 text-white p-2 rounded-full">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Image State */}
      {!event.featured_image && (
        <div className="relative h-32 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: event.category_color }}
          >
            {event.category_name.charAt(0)}
          </div>
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white`}>
              {getStatusText()}
            </span>
          </div>
          {event.is_featured && (
            <div className="absolute top-4 right-4">
              <div className="bg-yellow-500 text-white p-2 rounded-full">
                <Star className="h-4 w-4 fill-current" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span 
            className="px-3 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: event.category_color }}
          >
            {event.category_name}
          </span>
          {event.is_online && (
            <div className="flex items-center text-blue-600 text-xs">
              <Globe className="h-3 w-3 mr-1" />
              Online
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {event.description}
        </p>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          {/* Date */}
          <div className="flex items-center text-gray-600 text-sm">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{formatDate(event.start_date)}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-gray-600 text-sm">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{event.location_name}</span>
          </div>

          {/* Organizer */}
          <div className="flex items-center text-gray-600 text-sm">
            <User className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">By {event.organizer_name}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <Users className="h-4 w-4 mr-1" />
            <span>{event.attendees_count}/{event.capacity}</span>
            {event.is_full && (
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                Full
              </span>
            )}
          </div>
          
          {event.available_spots > 0 && (
            <span className="text-green-600 text-sm font-medium">
              {event.available_spots} spots left
            </span>
          )}
        </div>

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {event.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                #{tag}
              </span>
            ))}
            {event.tags.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                +{event.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {canManage && onEdit && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onEdit(event.id)}
              className="flex-shrink-0 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2"
              title="Edit Event"
            >
              <Edit className="h-4 w-4" />
              Edit
            </motion.button>
          )}
          <Link
            to={`/dashboard/events/${event.id}`}
            className="block flex-1"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
            >
              View Details
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
