/**
 * Points Toast Notification
 * Shows when user earns points
 */
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, X } from 'lucide-react';

interface PointsToastProps {
  points: number;
  message: string;
  duration?: number;
  onClose?: () => void;
}

const PointsToast: React.FC<PointsToastProps> = ({
  points,
  message,
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for exit animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className="fixed top-20 right-6 z-50 max-w-sm"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3">
              {/* Icon with animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ type: 'spring', damping: 10 }}
                className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center"
              >
                <TrendingUp className="w-6 h-6" />
              </motion.div>

              {/* Content */}
              <div className="flex-1">
                <p className="font-bold text-lg">+{points} Points!</p>
                <p className="text-sm text-blue-100">{message}</p>
              </div>

              {/* Close button */}
              <button
                onClick={() => {
                  setIsVisible(false);
                  if (onClose) onClose();
                }}
                className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: duration / 1000, ease: 'linear' }}
              className="h-1 bg-white/30"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PointsToast;

