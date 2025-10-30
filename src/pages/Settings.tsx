import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Globe } from 'lucide-react';
import ProfileSettings from '../components/settings/ProfileSettings';
import NotificationPreferences from '../components/settings/NotificationPreferences';
import PrivacySecurity from '../components/settings/PrivacySecurity';
import LanguageRegion from '../components/settings/LanguageRegion';
import { UserProfile, ExtendedProfile } from '../types/settings';
import { settingsAPI } from '../services/settingsApi';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'privacy' | 'language'>('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check URL params for tab
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab === 'notifications' || tab === 'profile' || tab === 'privacy' || tab === 'language') {
      setActiveTab(tab);
    }
    
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [profileData, extendedData] = await Promise.all([
        settingsAPI.profile.get(),
        settingsAPI.extendedProfile.get(),
      ]);
      setProfile(profileData);
      setExtendedProfile(extendedData);
    } catch (error) {
      console.error('Failed to fetch settings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
  };

  const handleExtendedProfileUpdate = (updatedProfile: ExtendedProfile) => {
    setExtendedProfile(updatedProfile);
  };

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile Settings',
      icon: User,
      color: 'text-blue-400',
      component: (
        <ProfileSettings
          profile={profile}
          onUpdate={handleProfileUpdate}
        />
      ),
    },
    {
      id: 'notifications' as const,
      label: 'Notification Preferences',
      icon: Bell,
      color: 'text-green-400',
      component: (
        <NotificationPreferences
          phoneNumber={profile?.phone_number}
        />
      ),
    },
    {
      id: 'privacy' as const,
      label: 'Privacy & Security',
      icon: Shield,
      color: 'text-red-400',
      component: (
        <PrivacySecurity
          extendedProfile={extendedProfile}
          onUpdate={handleExtendedProfileUpdate}
        />
      ),
    },
    {
      id: 'language' as const,
      label: 'Language & Region',
      icon: Globe,
      color: 'text-purple-400',
      component: (
        <LanguageRegion
          extendedProfile={extendedProfile}
          onUpdate={handleExtendedProfileUpdate}
        />
      ),
    },
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2 space-y-1 sticky top-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${activeTab === tab.id ? tab.color : ''}`} />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              {activeTabData && (
                <div className="flex items-center mb-4">
                  {React.createElement(activeTabData.icon, {
                    className: `w-6 h-6 ${activeTabData.color} mr-2`,
                  })}
                  <h2 className="text-2xl font-semibold text-white">
                    {activeTabData.label}
                  </h2>
                </div>
              )}
            </div>

            {activeTabData?.component}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
