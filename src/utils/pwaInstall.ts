/**
 * PWA Installation utilities
 */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAInstaller {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;

  constructor() {
    this.init();
  }

  private init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      console.log('[PWA] Install prompt available');
      
      // Dispatch custom event for app to show install button
      window.dispatchEvent(new CustomEvent('pwa-install-available'));
    });

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('[PWA] App is running in standalone mode');
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      console.log('[PWA] App installed successfully');
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    });
  }

  /**
   * Check if install prompt is available
   */
  canInstall(): boolean {
    return this.deferredPrompt !== null && !this.isInstalled;
  }

  /**
   * Check if app is already installed
   */
  isAppInstalled(): boolean {
    return this.isInstalled;
  }

  /**
   * Show install prompt
   */
  async showInstallPrompt(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('[PWA] Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`[PWA] User ${outcome} the install prompt`);
      
      // Clear the prompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    }
  }

  /**
   * Get install instructions based on platform
   */
  getInstallInstructions(): string {
    const ua = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(ua)) {
      return 'Tap the Share button and select "Add to Home Screen"';
    }
    
    if (/android/.test(ua)) {
      if (/chrome/.test(ua)) {
        return 'Tap the menu button and select "Install App" or "Add to Home Screen"';
      }
      return 'Look for the "Add to Home Screen" option in your browser menu';
    }
    
    if (/macintosh|mac os x/.test(ua)) {
      return 'Click the install icon in the address bar or browser menu';
    }
    
    if (/windows/.test(ua)) {
      return 'Click the install icon in the address bar or Ctrl+Shift+I';
    }
    
    return 'Look for the install option in your browser';
  }

  /**
   * Check if platform supports PWA
   */
  isPWASupported(): boolean {
    return 'serviceWorker' in navigator;
  }
}

// Singleton instance
export const pwaInstaller = new PWAInstaller();

/**
 * Register service worker
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Check every hour

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('[PWA] New version available');
            window.dispatchEvent(new CustomEvent('pwa-update-available'));
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Unregister service worker (for development/testing)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('[PWA] Service Worker unregistered:', result);
      return result;
    }
    return false;
  } catch (error) {
    console.error('[PWA] Service Worker unregister failed:', error);
    return false;
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.log('[PWA] Notifications not supported');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    console.log('[PWA] Notification permission:', permission);
    return permission;
  }

  return Notification.permission;
}

/**
 * Show local notification
 */
export async function showNotification(
  title: string,
  options?: NotificationOptions
): Promise<void> {
  if (!('serviceWorker' in navigator) || !('Notification' in window)) {
    return;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.showNotification(title, {
        icon: '/icons/icon-192x192.svg',
        badge: '/icons/icon-72x72.svg',
        vibrate: [200, 100, 200],
        ...options,
      });
    }
  } catch (error) {
    console.error('[PWA] Error showing notification:', error);
  }
}

