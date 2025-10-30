import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Save, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { ExtendedProfile } from '../../types/settings';
import { settingsAPI } from '../../services/settingsApi';
import { useTheme, Theme } from '../../hooks/useTheme';

interface LanguageRegionProps {
  extendedProfile: ExtendedProfile | null;
  onUpdate: (profile: ExtendedProfile) => void;
}

const LanguageRegion: React.FC<LanguageRegionProps> = ({ extendedProfile, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    theme: theme,
  });

  useEffect(() => {
    if (extendedProfile) {
      setSettings({
        language: extendedProfile.language || 'en',
        timezone: extendedProfile.timezone || 'UTC',
        theme: extendedProfile.theme || 'dark',
      });
      // Apply saved theme
      setTheme(extendedProfile.theme as Theme || 'dark');
    }
  }, [extendedProfile]);

  const handleChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Apply theme immediately when changed
    if (key === 'theme') {
      setTheme(value as Theme);
      // Show instant feedback
      setSuccess('Theme applied! Changes are live.');
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const updated = await settingsAPI.extendedProfile.update(settings);
      onUpdate(updated);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

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
        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="zh">中文</option>
            <option value="ja">日本語</option>
            <option value="ar">العربية</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Timezone
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC (Coordinated Universal Time)</option>
            <option value="America/New_York">Eastern Time (ET)</option>
            <option value="America/Chicago">Central Time (CT)</option>
            <option value="America/Denver">Mountain Time (MT)</option>
            <option value="America/Los_Angeles">Pacific Time (PT)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
            <option value="Asia/Dubai">Dubai (GST)</option>
            <option value="Asia/Kolkata">India (IST)</option>
            <option value="Asia/Shanghai">China (CST)</option>
            <option value="Asia/Tokyo">Japan (JST)</option>
            <option value="Australia/Sydney">Sydney (AEDT)</option>
          </select>
        </div>

        {/* Theme */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
            Theme
            <Sparkles className="w-4 h-4 ml-2 text-yellow-400" />
            <span className="text-xs text-yellow-400 ml-1">Live Preview</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleChange('theme', 'light')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'light'
                  ? 'border-blue-500 bg-white/20 ring-2 ring-blue-400'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="w-full h-12 bg-white rounded mb-2 shadow-lg"></div>
              <p className="text-sm text-white font-medium">Light</p>
            </button>

            <button
              type="button"
              onClick={() => handleChange('theme', 'dark')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'dark'
                  ? 'border-blue-500 bg-white/20 ring-2 ring-blue-400'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="w-full h-12 bg-gray-900 rounded mb-2 shadow-lg"></div>
              <p className="text-sm text-white font-medium">Dark</p>
            </button>

            <button
              type="button"
              onClick={() => handleChange('theme', 'auto')}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.theme === 'auto'
                  ? 'border-blue-500 bg-white/20 ring-2 ring-blue-400'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <div className="w-full h-12 bg-gradient-to-r from-white to-gray-900 rounded mb-2 shadow-lg"></div>
              <p className="text-sm text-white font-medium">Auto</p>
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Click any theme to apply it instantly!
          </p>
        </div>

        {/* Info */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-sm text-gray-300">
            <Globe className="w-4 h-4 inline mr-2" />
            Theme changes apply instantly! Language and timezone settings help us provide a better localized experience
            and show event times in your local timezone.
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            {isLoading ? 'Saving...' : 'Save to Profile'}
          </button>
          <p className="text-xs text-gray-400 text-center mt-2">
            Save to remember your preferences across devices
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LanguageRegion;

