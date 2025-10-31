import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'citizen' | 'official' | 'admin';
  requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requireAuth = true 
}) => {
  const location = useLocation();
  const { isAuthenticated, user, isLoading, token } = useSelector((state: RootState) => state.auth);
  
  // Check if we have a token in localStorage (persisted session)
  const hasStoredToken = localStorage.getItem('token');
  
  // If we're still loading authentication state OR have a token but not authenticated yet, show loading
  if (isLoading || (hasStoredToken && !isAuthenticated && !user)) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>;
  }

  // Only redirect to login if we don't have a token and not authenticated
  if (requireAuth && !isAuthenticated && !hasStoredToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific role is required but user data isn't loaded yet, wait
  if (requiredRole && isAuthenticated && !user) {
    return <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  if (requiredRole && user && user.role !== requiredRole) {
    // If user doesn't have required role, redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
