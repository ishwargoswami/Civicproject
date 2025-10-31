import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';
import { pwaInstaller } from '../../utils/pwaInstall';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if install is available
    const checkInstall = () => {
      if (pwaInstaller.canInstall() && !localStorage.getItem('pwa-prompt-dismissed')) {
        // Show prompt after 30 seconds on the site
        setTimeout(() => {
          setShowPrompt(true);
        }, 30000);
      }
    };

    // Listen for install available event
    const handleInstallAvailable = () => {
      checkInstall();
    };

    // Listen for app installed event
    const handleInstalled = () => {
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);

    checkInstall();

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    const accepted = await pwaInstaller.showInstallPrompt();
    
    if (accepted) {
      setShowPrompt(false);
      localStorage.setItem('pwa-installed', 'true');
    } else {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!showPrompt || pwaInstaller.isAppInstalled()) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 z-50"
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-2xl p-6 text-white">
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                Install Civic Platform
              </h3>
              <p className="text-sm text-white/90 mb-4">
                Install our app for quick access, offline support, and a better experience!
              </p>

              {/* Benefits */}
              <ul className="text-xs text-white/80 mb-4 space-y-1">
                <li>✓ Works offline</li>
                <li>✓ Faster loading</li>
                <li>✓ Push notifications</li>
                <li>✓ Home screen access</li>
              </ul>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {isInstalling ? (
                    <span>Installing...</span>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Install App
                    </>
                  )}
                </button>
                <button
                  onClick={handleDismiss}
                  className="px-4 py-2 rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  Not Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;

