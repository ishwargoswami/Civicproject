import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Save,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { NotificationPreferences as NotificationPrefsType } from '../../types/settings';
import { settingsAPI } from '../../services/settingsApi';
import WhatsAppVerification from './WhatsAppVerification';

interface NotificationPreferencesProps {
  phoneNumber?: string | null;
}

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({ phoneNumber }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [preferences, setPreferences] = useState<NotificationPrefsType>({
    email_enabled: true,
    email_issue_updates: true,
    email_event_reminders: true,
    email_forum_replies: true,
    email_system_updates: true,
    email_weekly_digest: false,
    whatsapp_enabled: false,
    whatsapp_verified: false,
    whatsapp_issue_updates: true,
    whatsapp_event_reminders: true,
    whatsapp_system_alerts: true,
    push_enabled: true,
    push_issue_updates: true,
    push_event_reminders: true,
    push_forum_replies: true,
    sms_enabled: false,
    sms_critical_only: true,
    digest_frequency: 'weekly',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00',
    created_at: '',
    updated_at: '',
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const prefs = await settingsAPI.notifications.get();
      setPreferences(prefs);
    } catch (err: any) {
      console.error('Failed to fetch notification preferences:', err);
      // Continue with defaults if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPrefsType) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleChange = (key: keyof NotificationPrefsType, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await settingsAPI.notifications.update(preferences);
      setPreferences(updated);
      setSuccess('Notification preferences saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save preferences');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg p-6 text-center">
        <Bell className="h-12 w-12 text-gray-400 mx-auto mb-3 animate-pulse" />
        <p className="text-gray-400">Loading preferences...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6"
    >
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-blue-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold">Email Notifications</h4>
                <p className="text-sm text-gray-400">Receive updates via email</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('email_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.email_enabled ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.email_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.email_enabled && (
            <div className="ml-8 space-y-3 border-l-2 border-white/10 pl-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Issue updates</span>
                <input
                  type="checkbox"
                  checked={preferences.email_issue_updates}
                  onChange={() => handleToggle('email_issue_updates')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Event reminders</span>
                <input
                  type="checkbox"
                  checked={preferences.email_event_reminders}
                  onChange={() => handleToggle('email_event_reminders')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Forum replies</span>
                <input
                  type="checkbox"
                  checked={preferences.email_forum_replies}
                  onChange={() => handleToggle('email_forum_replies')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">System updates</span>
                <input
                  type="checkbox"
                  checked={preferences.email_system_updates}
                  onChange={() => handleToggle('email_system_updates')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Weekly digest</span>
                <input
                  type="checkbox"
                  checked={preferences.email_weekly_digest}
                  onChange={() => handleToggle('email_weekly_digest')}
                  className="w-4 h-4 rounded border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* WhatsApp Verification */}
        <div>
          <WhatsAppVerification
            phoneNumber={phoneNumber || null}
            isVerified={preferences.whatsapp_verified}
            onVerificationComplete={fetchPreferences}
          />
        </div>

        {/* WhatsApp Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <MessageSquare className="w-5 h-5 text-green-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold">WhatsApp Notifications</h4>
                <p className="text-sm text-gray-400">
                  {preferences.whatsapp_verified ? 
                    `Receive alerts on ${phoneNumber}` : 
                    'Verify your phone number to enable'
                  }
                </p>
                {preferences.whatsapp_verified && (
                  <span className="inline-flex items-center text-xs text-green-400 mt-1">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified & Active
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={() => handleToggle('whatsapp_enabled')}
              disabled={!preferences.whatsapp_verified}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.whatsapp_enabled && preferences.whatsapp_verified ? 'bg-green-500' : 'bg-gray-600'
              } ${!preferences.whatsapp_verified ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.whatsapp_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.whatsapp_enabled && preferences.whatsapp_verified && (
            <div className="ml-8 space-y-3 border-l-2 border-white/10 pl-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Issue updates</span>
                <input
                  type="checkbox"
                  checked={preferences.whatsapp_issue_updates}
                  onChange={() => handleToggle('whatsapp_issue_updates')}
                  className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-2 focus:ring-green-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Event reminders</span>
                <input
                  type="checkbox"
                  checked={preferences.whatsapp_event_reminders}
                  onChange={() => handleToggle('whatsapp_event_reminders')}
                  className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-2 focus:ring-green-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Critical system alerts</span>
                <input
                  type="checkbox"
                  checked={preferences.whatsapp_system_alerts}
                  onChange={() => handleToggle('whatsapp_system_alerts')}
                  className="w-4 h-4 rounded border-gray-600 text-green-500 focus:ring-2 focus:ring-green-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Push Notifications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Smartphone className="w-5 h-5 text-purple-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold">Push Notifications</h4>
                <p className="text-sm text-gray-400">Browser notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('push_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.push_enabled ? 'bg-purple-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.push_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.push_enabled && (
            <div className="ml-8 space-y-3 border-l-2 border-white/10 pl-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Issue updates</span>
                <input
                  type="checkbox"
                  checked={preferences.push_issue_updates}
                  onChange={() => handleToggle('push_issue_updates')}
                  className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Event reminders</span>
                <input
                  type="checkbox"
                  checked={preferences.push_event_reminders}
                  onChange={() => handleToggle('push_event_reminders')}
                  className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-gray-300">Forum replies</span>
                <input
                  type="checkbox"
                  checked={preferences.push_forum_replies}
                  onChange={() => handleToggle('push_forum_replies')}
                  className="w-4 h-4 rounded border-gray-600 text-purple-500 focus:ring-2 focus:ring-purple-500"
                />
              </label>
            </div>
          )}
        </div>

        {/* Digest Frequency */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Digest Frequency
          </label>
          <select
            value={preferences.digest_frequency}
            onChange={(e) => handleChange('digest_frequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Quiet Hours */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-orange-400 mr-3" />
              <div>
                <h4 className="text-white font-semibold">Quiet Hours</h4>
                <p className="text-sm text-gray-400">Pause non-urgent notifications</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle('quiet_hours_enabled')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                preferences.quiet_hours_enabled ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  preferences.quiet_hours_enabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {preferences.quiet_hours_enabled && (
            <div className="ml-8 grid grid-cols-2 gap-4 border-l-2 border-white/10 pl-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Start</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_start || '22:00'}
                  onChange={(e) => handleChange('quiet_hours_start', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">End</label>
                <input
                  type="time"
                  value={preferences.quiet_hours_end || '08:00'}
                  onChange={(e) => handleChange('quiet_hours_end', e.target.value)}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationPreferences;

