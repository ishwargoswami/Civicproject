import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import 'leaflet/dist/leaflet.css';
import { registerServiceWorker } from './utils/pwaInstall';

// Register service worker for PWA functionality
// Works in both development (localhost) and production
registerServiceWorker().then((registration) => {
  if (registration) {
    console.log('[PWA] Service Worker registered successfully');
  }
}).catch((error) => {
  console.error('[PWA] Service Worker registration failed:', error);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
