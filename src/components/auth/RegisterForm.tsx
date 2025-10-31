import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, UserPlus, Heart } from 'lucide-react';
import { AppDispatch, RootState } from '../../store';
import { registerUser, clearError, sendOTP, verifyOTP, clearOTPState, getRoleDashboardRoute, setRegistrationStep, setPendingRegistrationData } from '../../store/slices/authSlice';
import OTPVerification from './OTPVerification';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'citizen' as 'citizen' | 'official',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [otpEmail, setOtpEmail] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { isLoading, error, otpSent, otpVerified, pendingEmail, registrationStep, pendingRegistrationData } = useSelector((state: RootState) => state.auth);

  // Debug: Track step changes from Redux
  React.useEffect(() => {
    console.log('📍 Current registrationStep (from Redux):', registrationStep);
  }, [registrationStep]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) {
      dispatch(clearError());
    }
    if (passwordError) {
      setPasswordError('');
    }
  };

  const validatePassword = () => {
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔵 Form submitted, starting validation...');
    
    // Clear any existing errors
    dispatch(clearError());
    
    if (!validatePassword()) {
      console.log('❌ Password validation failed');
      return;
    }
    
    console.log('✅ Password validation passed');
    
    // Preserve email before sending OTP
    setOtpEmail(formData.email);
    console.log('📧 Email preserved:', formData.email);
    
    // Save registration data to Redux so it persists through OTP flow
    const registrationData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      role: formData.role,
    };
    dispatch(setPendingRegistrationData(registrationData));
    console.log('💾 Registration data saved to Redux:', registrationData);
    
    try {
      // Send OTP for email verification
      console.log('📤 Dispatching sendOTP action...');
      
      const result = await dispatch(sendOTP({
        email: formData.email,
        purpose: 'registration'
      })).unwrap();
      
      console.log('✅ OTP sent successfully! Response:', result);
      console.log('🔄 Redux will automatically switch to OTP step...');
      
      // Redux automatically sets registrationStep to 'otp' in the reducer
      // No need to manually set it here
      
    } catch (error: any) {
      console.error('❌ Failed to send OTP:', error);
      console.error('Error details:', error);
      // Error is already handled by Redux, just log it
    }
  };

  const handleOTPVerified = async () => {
    try {
      // Use the saved registration data from Redux
      const userData = pendingRegistrationData || formData;
      
      console.log('🎯 Using registration data:', userData);
      
      if (!userData.email || !userData.firstName || !userData.lastName || !userData.password) {
        console.error('❌ Registration data is incomplete!', userData);
        alert('Registration data was lost. Please fill the form again.');
        dispatch(clearOTPState());
        return;
      }
      
      // After OTP is verified, proceed with registration
      const result = await dispatch(registerUser(userData));
      
      if (registerUser.fulfilled.match(result)) {
        // Registration successful, clear OTP state and redirect
        console.log('✅ Registration complete! Redirecting...');
        dispatch(clearOTPState());
        const redirectTo = getRoleDashboardRoute(userData.role);
        navigate(redirectTo);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleResendOTP = async () => {
    try {
      const emailToUse = otpEmail || pendingEmail || formData.email;
      await dispatch(sendOTP({
        email: emailToUse,
        purpose: 'registration'
      }));
    } catch (error) {
      console.error('Failed to resend OTP:', error);
    }
  };

  const handleCancelOTP = () => {
    dispatch(clearOTPState()); // This will reset registrationStep to 'form'
  };

  // Show OTP verification step - using Redux state
  if (registrationStep === 'otp') {
    const emailForOTP = otpEmail || pendingEmail || formData.email;
    
    // Fallback: if email is missing, go back to form
    if (!emailForOTP) {
      console.error('No email available for OTP verification');
      dispatch(setRegistrationStep('form'));
      return null;
    }
    
    return (
      <OTPVerification
        email={emailForOTP}
        purpose="registration"
        onVerified={handleOTPVerified}
        onResendOTP={handleResendOTP}
        onCancel={handleCancelOTP}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  // Show registration form
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Link to="/" className="flex items-center justify-center space-x-2 mb-4 hover:opacity-80 transition-opacity">
            <Heart className="h-10 w-10 text-blue-500" />
            <span className="text-2xl font-bold text-white">Civic Platform</span>
          </Link>
          <h2 className="text-3xl font-bold text-white">Create your account</h2>
          <p className="mt-2 text-gray-400">Join our community and make a difference</p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 space-y-6"
          onSubmit={handleSubmit}
        >
          {(error || passwordError) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/20 rounded-lg p-4"
            >
              <p className="text-red-400 text-sm">{error || passwordError}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                  First name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="First name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Last name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                Account type
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              >
                <option value="citizen">Citizen</option>
                <option value="official">Government Official</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Officials require verification before approval
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded bg-white/5"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
            </label>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <UserPlus className="h-4 w-4" />
                <span>Create account</span>
              </div>
            )}
          </motion.button>

          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default RegisterForm;
