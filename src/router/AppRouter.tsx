import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { getCurrentUser } from '../store/slices/authSlice';

// Layouts
import DashboardLayout from '../components/layout/DashboardLayout';

// Auth components
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

// Landing page components (existing)
import Header from '../components/Header';
import Hero from '../components/Hero';
import Projects from '../components/Projects';
import Community from '../components/Community';
import Impact from '../components/Impact';
import Resources from '../components/Resources';
import Newsletter from '../components/Newsletter';
import Footer from '../components/Footer';

// Protected route component
import ProtectedRoute from '../components/common/ProtectedRoute';

// Dashboard and module components (to be created)
import Dashboard from '../pages/Dashboard';
import AdminDashboard from '../pages/AdminDashboard';
import OfficialDashboard from '../pages/OfficialDashboard';
import IssuesPage from '../pages/Issues';
import CreateIssuePage from '../pages/CreateIssue';
import IssueDetailPage from '../pages/IssueDetail';
import ForumPage from '../pages/Forum';
import ForumPostDetail from '../pages/ForumPostDetail';
import EventsPage from '../pages/Events';
import CreateEventPage from '../pages/CreateEvent';
import MapsPage from '../pages/Maps';
import TransparencyPage from '../pages/Transparency';
import NotificationsPage from '../pages/Notifications';
import SettingsPage from '../pages/Settings';
import DebugAuth from '../pages/DebugAuth';
import TestOTP from '../pages/TestOTP';

// Landing Page Component
const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main>
        <Hero />
        <Projects />
        <Community />
        <Impact />
        <Resources />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
};

// Loading Component
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Loading...</p>
      </div>
    </div>
  );
};

// Role-based Dashboard Redirect Component
const RoleBasedDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  if (!user) {
    return <LoadingScreen />;
  }
  
  // Redirect based on user role
  switch (user.role) {
    case 'admin':
      return <Navigate to="/dashboard/admin" replace />;
    case 'official':
      return <Navigate to="/dashboard/official" replace />;
    case 'citizen':
    default:
      return <Navigate to="/dashboard/citizen" replace />;
  }
};

// Unauthorized Component
const UnauthorizedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">403</h1>
        <p className="text-gray-400 mb-8">You don't have permission to access this page.</p>
        <button
          onClick={() => window.history.back()}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

const AppRouter: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // Temporarily disabled to prevent redirect loops during development
    // with mock authentication data
    // const storedToken = localStorage.getItem('token');
    
    // if (storedToken && !isAuthenticated && !isLoading) {
    //   dispatch(getCurrentUser()).catch((error) => {
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('refreshToken');
    //   });
    // }
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
        } />
        <Route path="/register" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
        } />
        <Route path="/debug" element={<DebugAuth />} />
        <Route path="/test-otp" element={<TestOTP />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<RoleBasedDashboard />} />
          <Route path="citizen" element={<Dashboard />} />
          <Route path="admin" element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="official" element={
            <ProtectedRoute requiredRole="official">
              <OfficialDashboard />
            </ProtectedRoute>
          } />
          
          {/* Issues routes */}
          <Route path="issues" element={<IssuesPage />} />
          <Route path="issues/new" element={<CreateIssuePage />} />
          <Route path="issues/:id" element={<IssueDetailPage />} />
          
          {/* Forum routes */}
          <Route path="forum" element={<ForumPage />} />
          <Route path="forum/posts/:postId" element={<ForumPostDetail />} />
          
          {/* Events routes */}
          <Route path="events" element={<EventsPage />} />
          <Route path="events/create" element={<CreateEventPage />} />
          
          {/* Maps routes */}
          <Route path="maps" element={<MapsPage />} />
          
          {/* Transparency routes */}
          <Route path="transparency" element={<TransparencyPage />} />
          
          {/* User routes */}
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Legacy routes - redirect to dashboard equivalents */}
        <Route path="/issues" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/issues" replace />
          </ProtectedRoute>
        } />
        <Route path="/issues/new" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/issues/new" replace />
          </ProtectedRoute>
        } />
        <Route path="/forum" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/forum" replace />
          </ProtectedRoute>
        } />
        <Route path="/events" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/events" replace />
          </ProtectedRoute>
        } />
        <Route path="/maps" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/maps" replace />
          </ProtectedRoute>
        } />
        <Route path="/transparency" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/transparency" replace />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/notifications" replace />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Navigate to="/dashboard/settings" replace />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;