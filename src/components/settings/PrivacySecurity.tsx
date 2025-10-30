import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {Shield, Eye, EyeOff, Lock, Save, CheckCircle, AlertCircle} from 'lucide-react';
import { ExtendedProfile, PasswordChange } from '../../types/settings';
import { settingsAPI } from '../../services/settingsApi';

interface PrivacySecurityProps {
  extendedProfile: ExtendedProfile | null;
  onUpdate: (profile: ExtendedProfile) => void;
}

const PrivacySecurity: React.FC<PrivacySecurityProps> = ({ extendedProfile, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [privacy, setPrivacy] = useState({
    show_email: false,
    show_phone: false,
    show_address: false,
  });

  const [passwordData, setPasswordData] = useState<PasswordChange>({
    current_password: '',
    new_password: '',
    new_password_confirm: '',
  });

  useEffect(() => {
    if (extendedProfile) {
      setPrivacy({
        show_email: extendedProfile.show_email,
        show_phone: extendedProfile.show_phone,
        show_address: extendedProfile.show_address,
      });
    }
  }, [extendedProfile]);

  const handlePrivacyToggle = async (key: keyof typeof privacy) => {
    const newPrivacy = { ...privacy, [key]: !privacy[key] };
    setPrivacy(newPrivacy);

    try {
      const updated = await settingsAPI.extendedProfile.update(newPrivacy);
      onUpdate(updated);
    } catch (err) {
      console.error('Failed to update privacy setting:', err);
      // Revert on error
      setPrivacy(privacy);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (passwordData.new_password !== passwordData.new_password_confirm) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await settingsAPI.security.changePassword(passwordData);
      console.log('✅ Password changed:', response);
      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        new_password_confirm: '',
      });
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('❌ Password change failed:', err);
      const errorMsg = err.response?.data?.current_password?.[0] || 
                       err.response?.data?.new_password?.[0] ||
                       err.response?.data?.message || 
                       'Failed to change password';
      setError(errorMsg);
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

      <div className="space-y-8">
        {/* Privacy Settings */}
        <div>
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-blue-400" />
            Privacy Settings
          </h4>
          <p className="text-sm text-gray-400 mb-4">
            Control what information is visible to other users
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white">Show Email Address</p>
                <p className="text-sm text-gray-400">Make your email visible on your profile</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('show_email')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.show_email ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.show_email ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white">Show Phone Number</p>
                <p className="text-sm text-gray-400">Make your phone number visible on your profile</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('show_phone')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.show_phone ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.show_phone ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white">Show Address</p>
                <p className="text-sm text-gray-400">Make your address visible on your profile</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('show_address')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacy.show_address ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacy.show_address ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div>
          <h4 className="text-white font-semibold mb-4 flex items-center">
            <Lock className="w-5 h-5 mr-2 text-red-400" />
            Change Password
          </h4>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, current_password: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                required
                minLength={8}
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.new_password_confirm}
                onChange={(e) => setPasswordData(prev => ({ ...prev, new_password_confirm: e.target.value }))}
                required
                className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>

        {/* Security Tips */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h5 className="text-white font-semibold mb-2 flex items-center">
            <Shield className="w-4 h-4 mr-2" />
            Security Tips
          </h5>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Use a strong, unique password</li>
            <li>• Enable two-factor authentication (coming soon)</li>
            <li>• Never share your password with anyone</li>
            <li>• Change your password regularly</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default PrivacySecurity;

