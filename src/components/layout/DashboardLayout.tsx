import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  AlertTriangle, 
  MessageSquare, 
  Calendar, 
  BarChart3, 
  Map, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Heart,
  Trophy
} from 'lucide-react';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/slices/authSlice';
// Notifications moved to Settings page

const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const { user } = useSelector((state: RootState) => state.auth);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Report Issue',
      href: '/dashboard/issues/new',
      icon: AlertTriangle,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Issues',
      href: '/dashboard/issues',
      icon: AlertTriangle,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Community',
      href: '/dashboard/forum',
      icon: MessageSquare,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Events',
      href: '/dashboard/events',
      icon: Calendar,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Maps',
      href: '/dashboard/maps',
      icon: Map,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Transparency',
      href: '/dashboard/transparency',
      icon: BarChart3,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Rewards',
      href: '/dashboard/rewards',
      icon: Trophy,
      roles: ['citizen', 'official', 'admin']
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: Settings,
      roles: ['citizen', 'official', 'admin']
    },
  ];

  const filteredNavigation = navigationItems.filter(item => 
    user?.role && item.roles.includes(user.role)
  );

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-black/95 via-black/90 to-black/95 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-blue-500" />
            <span className="text-xl font-bold">Civic Platform</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <div className="space-y-1">
            {filteredNavigation.map((item, index) => {
              const isActive = location.pathname === item.href || 
                (item.href === '/dashboard/issues' && location.pathname.startsWith('/dashboard/issues'));
              
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-xl transition-all duration-200 group relative overflow-hidden ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg'
                      : 'text-gray-300 hover:bg-gradient-to-r hover:from-white/5 hover:to-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 transition-colors ${
                    isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'
                  }`} />
                  <span className="font-medium">{item.name}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute right-2 w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <motion.button
              onClick={() => navigate('/settings')}
              className="flex-1 flex items-center justify-center px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Settings className="h-4 w-4" />
            </motion.button>
            
            <motion.button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center px-3 py-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="bg-gradient-to-r from-black/90 via-black/80 to-black/90 backdrop-blur-xl border-b border-white/10 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="hidden lg:block">
                <h2 className="text-lg font-semibold text-white">
                  Welcome back, {user?.first_name}
                </h2>
                <p className="text-sm text-gray-400">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Quick action buttons */}
              <button
                onClick={() => navigate('/dashboard/issues/new')}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
              >
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Report Issue</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}
    </div>
  );
};

export default DashboardLayout;
