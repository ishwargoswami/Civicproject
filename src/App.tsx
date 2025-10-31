import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import AppRouter from './router/AppRouter';
import PWAInstallPrompt from './components/common/PWAInstallPrompt';
import PWAUpdatePrompt from './components/common/PWAUpdatePrompt';
import OfflineBanner from './components/common/OfflineBanner';

function App() {
  useEffect(() => {
    // Apply saved theme on app load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    const root = document.documentElement;
    
    root.classList.remove('light', 'dark');
    
    if (savedTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(prefersDark ? 'dark' : 'light');
    } else {
      root.classList.add(savedTheme);
    }
    
    root.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Provider store={store}>
      <AppRouter />
      
      {/* PWA Components */}
      <PWAInstallPrompt />
      <PWAUpdatePrompt />
      <OfflineBanner />
    </Provider>
  );
}

export default App;