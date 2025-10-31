import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Phone, CheckCircle, AlertCircle, Send, Loader } from 'lucide-react';
import axios from 'axios';

interface WhatsAppVerificationProps {
  phoneNumber: string | null;
  isVerified: boolean;
  onVerificationComplete: () => void;
}

const WhatsAppVerification: React.FC<WhatsAppVerificationProps> = ({
  phoneNumber,
  isVerified,
  onVerificationComplete,
}) => {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [phone, setPhone] = useState(phoneNumber || '');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSendCode = async () => {
    if (!phone) {
      setError('Please enter your phone number');
      return;
    }

    if (!phone.startsWith('+')) {
      setError('Phone number must include country code (e.g., +1234567890)');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/phone/send-verification/`,
        { phone_number: phone },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Verification code sent to your WhatsApp!');
      setStep('verify');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Failed to send verification code:', err);
      setError(
        err.response?.data?.error ||
        err.response?.data?.details ||
        'Failed to send verification code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/phone/verify/`,
        { code: verificationCode },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Phone number verified successfully!');
      setTimeout(() => {
        setSuccess(null);
        onVerificationComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to verify code:', err);
      setError(
        err.response?.data?.error ||
        'Invalid or expired verification code. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePhone = async () => {
    if (!confirm('Are you sure you want to remove your phone number? WhatsApp notifications will be disabled.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/auth/phone/remove/`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess('Phone number removed successfully');
      setTimeout(() => {
        setSuccess(null);
        onVerificationComplete();
      }, 2000);
    } catch (err: any) {
      console.error('Failed to remove phone:', err);
      setError('Failed to remove phone number. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified && phoneNumber) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-500/10 border border-green-500/30 rounded-lg p-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-white font-medium mb-1">WhatsApp Verified</h4>
              <p className="text-sm text-gray-300">
                Your phone number <span className="font-mono">{phoneNumber}</span> is verified.
                You'll receive important notifications via WhatsApp.
              </p>
            </div>
          </div>
          <button
            onClick={handleRemovePhone}
            disabled={isLoading}
            className="text-sm text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      </motion.div>
    );
  }

  if (!phoneNumber) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
      >
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-white font-medium mb-1">Add Phone Number</h4>
            <p className="text-sm text-gray-300 mb-2">
              Please add your phone number in the <strong>Profile Settings</strong> tab first to enable WhatsApp notifications.
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4"
    >
      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 flex items-center text-sm">
          <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 flex items-center text-sm">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-start mb-4">
        <MessageSquare className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="text-white font-medium mb-1">Verify WhatsApp Number</h4>
          <p className="text-sm text-gray-300">
            {step === 'input'
              ? 'We\'ll send you a verification code via WhatsApp to confirm your number.'
              : 'Enter the 6-digit code we sent to your WhatsApp.'}
          </p>
        </div>
      </div>

      {step === 'input' ? (
        <div className="space-y-3">
          <div className="flex items-center bg-white/5 rounded-lg p-3">
            <Phone className="w-5 h-5 text-gray-400 mr-2" />
            <span className="font-mono text-white">{phoneNumber}</span>
          </div>

          <button
            onClick={handleSendCode}
            disabled={isLoading}
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center text-white font-medium"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Verification Code
              </>
            )}
          </button>

          <p className="text-xs text-gray-400 text-center">
            Make sure you have WhatsApp installed and can receive messages.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              placeholder="Enter 6-digit code"
              maxLength={6}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setStep('input');
                setVerificationCode('');
                setError(null);
              }}
              disabled={isLoading}
              className="py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 text-white"
            >
              Back
            </button>
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
              className="py-2 bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center text-white font-medium"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Verify
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Didn't receive the code?{' '}
            <button
              onClick={() => {
                setStep('input');
                setVerificationCode('');
                setError(null);
              }}
              className="text-blue-400 hover:text-blue-300"
            >
              Resend
            </button>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default WhatsAppVerification;

