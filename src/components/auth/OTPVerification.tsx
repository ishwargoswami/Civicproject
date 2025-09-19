import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, RefreshCw, CheckCircle, AlertCircle, Heart } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  purpose: 'registration' | 'login' | 'password_reset';
  onVerified: () => void;
  onResendOTP: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  error?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  purpose,
  onVerified,
  onResendOTP,
  onCancel,
  isLoading = false,
  error = ''
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => digit === '');
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();

    // Auto-submit if complete
    if (pastedData.length === 6) {
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode: string) => {
    setIsVerifying(true);
    try {
      console.log('Verifying OTP:', { email, otp_code: otpCode, purpose });
      
      // Import authAPI dynamically to avoid circular imports
      const { authAPI } = await import('../../services/realApi');
      
      const response = await authAPI.verifyOTP({
        email,
        otp_code: otpCode,
        purpose
      });

      console.log('OTP verification response:', response);

      if (response.data.verified) {
        onVerified();
      } else {
        console.error('OTP verification failed - not verified');
        // Clear OTP inputs on error
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error: any) {
      console.error('OTP verification failed:', error);
      console.error('Error details:', error.response?.data);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setCountdown(60);
    onResendOTP();

    // Restart countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const getPurposeText = () => {
    switch (purpose) {
      case 'registration':
        return 'complete your registration';
      case 'login':
        return 'secure login';
      case 'password_reset':
        return 'reset your password';
      default:
        return 'verification';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Heart className="h-10 w-10 text-blue-500" />
            <span className="text-2xl font-bold text-white">Civic Platform</span>
          </div>
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Verify Your Identity</h2>
          <p className="mt-2 text-gray-400">
            Enter the 6-digit code sent to <span className="text-blue-400">{email}</span> to {getPurposeText()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 space-y-6"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center space-x-2"
            >
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="text-red-400 text-sm">{error}</p>
            </motion.div>
          )}

          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading || isVerifying}
              />
            ))}
          </div>

          {isVerifying && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center space-x-2 text-blue-400"
            >
              <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Verifying...</span>
            </motion.div>
          )}

          <div className="text-center space-y-4">
            <p className="text-gray-400 text-sm">
              Didn't receive the code?
            </p>
            
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={isLoading}
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors flex items-center justify-center space-x-1"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Resend Code</span>
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Resend available in {countdown}s
              </p>
            )}

            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-white transition-colors text-sm"
              disabled={isLoading || isVerifying}
            >
              Cancel and go back
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-400" />
            <p className="text-blue-400 text-sm">
              <strong>Security Notice:</strong> This code expires in 10 minutes. Never share it with anyone.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OTPVerification;
