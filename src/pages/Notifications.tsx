import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings } from 'lucide-react';

const Notifications: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-gray-400">Stay updated on issues, events, and community activities</p>
        </div>
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </button>
      </motion.div>

      <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <Bell className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-white mb-4">Notifications Coming Soon</h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Stay informed with real-time notifications about issue updates, event reminders, forum replies, and system announcements. 
          Customize your notification preferences to receive only what matters to you.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-lg p-4">
            <Bell className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">Issue Updates</h4>
            <p className="text-gray-400 text-sm">Get notified when issues you've reported or voted on are updated</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Bell className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">Event Reminders</h4>
            <p className="text-gray-400 text-sm">Receive reminders for events you've RSVP'd to</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Bell className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">Forum Activity</h4>
            <p className="text-gray-400 text-sm">Stay updated on replies to your posts and discussions</p>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <Bell className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h4 className="text-white font-medium mb-2">System Updates</h4>
            <p className="text-gray-400 text-sm">Important announcements and platform updates</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
