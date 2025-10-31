/**
 * Civic Level Badge Component
 * Displays user's current civic level with beautiful styling
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Star, Crown, Sparkles } from 'lucide-react';
import { CivicLevel } from '../../services/gamification';

interface LevelBadgeProps {
  level: CivicLevel;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showName?: boolean;
  animate?: boolean;
  className?: string;
}

const LevelBadge: React.FC<LevelBadgeProps> = ({
  level,
  size = 'md',
  showName = true,
  animate = true,
  className = '',
}) => {
  // Handle null/undefined level
  if (!level) {
    return null;
  }

  const sizeClasses = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-32 h-32 text-xl',
  };

  const iconSizes = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const getIcon = () => {
    if (level.level >= 6) return Crown;
    if (level.level >= 4) return Star;
    if (level.level >= 2) return Sparkles;
    return Shield;
  };

  const Icon = getIcon();

  const badge = (
    <div className={`relative ${className}`}>
      {/* Glow effect */}
      <div
        className="absolute inset-0 rounded-full blur-xl opacity-50"
        style={{ backgroundColor: level.color }}
      />

      {/* Main badge */}
      <div
        className={`relative ${sizeClasses[size]} rounded-full flex items-center justify-center border-4 shadow-xl`}
        style={{
          backgroundColor: level.color,
          borderColor: `${level.color}40`,
        }}
      >
        <Icon className={`${iconSizes[size]} text-white drop-shadow-lg`} />
        
        {/* Level number overlay */}
        <div className="absolute -bottom-1 -right-1 bg-white text-gray-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg border-2"
          style={{ borderColor: level.color }}
        >
          {level.level}
        </div>
      </div>

      {/* Level name */}
      {showName && (
        <div className="text-center mt-2">
          <p className="font-bold text-white" style={{ color: level.color }}>
            {level.name}
          </p>
        </div>
      )}
    </div>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        {badge}
      </motion.div>
    );
  }

  return badge;
};

export default LevelBadge;

