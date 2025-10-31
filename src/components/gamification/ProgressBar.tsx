/**
 * Progress Bar Component for Civic Level
 */
import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  total: number;
  percentage: number;
  color?: string;
  label?: string;
  showNumbers?: boolean;
  height?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  total,
  percentage,
  color = '#3b82f6',
  label,
  showNumbers = true,
  height = 'md',
  className = '',
}) => {
  const heightClasses = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className={className}>
      {(label || showNumbers) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-300">{label}</span>}
          {showNumbers && (
            <span className="text-sm text-gray-400">
              {current.toLocaleString()} / {total.toLocaleString()} points
            </span>
          )}
        </div>
      )}

      <div className={`relative bg-gray-800 rounded-full overflow-hidden ${heightClasses[height]}`}>
        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          }}
        />

        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: 'easeInOut',
          }}
        />

        {/* Percentage text overlay (for larger bars) */}
        {height === 'lg' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressBar;

