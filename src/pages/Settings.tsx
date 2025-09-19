import React from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, User, Bell, Shield, Globe } from 'lucide-react';

const Settings: React.FC = () => {
  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400">Manage your account preferences and privacy settings</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <User className="h-6 w-6 mr-2 text-blue-400" />
            Profile Settings
          </h3>
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Profile management coming soon</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Bell className="h-6 w-6 mr-2 text-green-400" />
            Notification Preferences
          </h3>
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Notification settings coming soon</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-red-400" />
            Privacy & Security
          </h3>
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Privacy controls coming soon</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
            <Globe className="h-6 w-6 mr-2 text-purple-400" />
            Language & Region
          </h3>
          <div className="bg-white/5 rounded-lg p-6 text-center">
            <Globe className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-400">Localization settings coming soon</p>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white/5 border border-white/10 rounded-xl p-8 text-center">
        <SettingsIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h3 className="text-2xl font-semibold text-white mb-4">Advanced Settings Coming Soon</h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Customize your experience with comprehensive settings for notifications, privacy, accessibility, 
          and more. Manage your data, control what information is shared, and personalize the platform to your needs.
        </p>
      </div>
    </div>
  );
};

export default Settings;
