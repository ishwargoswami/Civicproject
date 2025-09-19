import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { sendOTP, verifyOTP, clearOTPState } from '../store/slices/authSlice';
import OTPVerification from '../components/auth/OTPVerification';

const TestOTP: React.FC = () => {
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, otpSent } = useSelector((state: RootState) => state.auth);

  const handleSendOTP = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    try {
      console.log('Sending OTP to:', email);
      const result = await dispatch(sendOTP({
        email,
        purpose: 'registration'
      }));
      
      console.log('OTP result:', result);
      
      if (sendOTP.fulfilled.match(result)) {
        console.log('OTP sent successfully, switching to verification step');
        setStep('otp');
      } else {
        console.error('Failed to send OTP:', result);
        alert('Failed to send OTP. Check console for details.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Error sending OTP. Check console for details.');
    }
  };

  const handleOTPVerified = () => {
    alert('OTP verified successfully!');
    setStep('form');
    setEmail('');
    dispatch(clearOTPState());
  };

  const handleResendOTP = async () => {
    try {
      await dispatch(sendOTP({
        email,
        purpose: 'registration'
      }));
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  const handleCancelOTP = () => {
    setStep('form');
    dispatch(clearOTPState());
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        email={email}
        purpose="registration"
        onVerified={handleOTPVerified}
        onResendOTP={handleResendOTP}
        onCancel={handleCancelOTP}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Test OTP Functionality</h1>
          <p className="mt-2 text-gray-400">Debug page for testing OTP verification</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <button
            onClick={handleSendOTP}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50"
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center">
            <p className="text-gray-400 text-sm">
              Current step: <span className="text-blue-400">{step}</span>
            </p>
            <p className="text-gray-400 text-sm">
              OTP sent: <span className="text-blue-400">{otpSent.toString()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestOTP;
