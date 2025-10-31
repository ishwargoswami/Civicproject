/**
 * Community Credit Redemption Card
 * Allows users to redeem credits for real-world benefits
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Car,
  FileCheck,
  Ticket,
  Bus,
  Users,
  Building,
  Gift,
  CheckCircle,
  Clock,
} from 'lucide-react';

interface RedemptionOption {
  type: string;
  name: string;
  description: string;
  credits_cost: number;
  icon: string;
  category: string;
}

interface RedemptionCardProps {
  option: RedemptionOption;
  userCredits: number;
  onRedeem: (type: string) => Promise<void>;
  className?: string;
}

const RedemptionCard: React.FC<RedemptionCardProps> = ({
  option,
  userCredits,
  onRedeem,
  className = '',
}) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isRedeemed, setIsRedeemed] = useState(false);

  const canAfford = userCredits >= option.credits_cost;

  const getIcon = () => {
    switch (option.type) {
      case 'parking_waiver':
        return Car;
      case 'permit_priority':
        return FileCheck;
      case 'event_ticket':
        return Ticket;
      case 'transit_credit':
        return Bus;
      case 'recreation_pass':
        return Users;
      case 'consultation':
        return Building;
      default:
        return Gift;
    }
  };

  const Icon = getIcon();

  const handleRedeem = async () => {
    if (!canAfford || isRedeeming || isRedeemed) return;

    setIsRedeeming(true);
    try {
      await onRedeem(option.type);
      setIsRedeemed(true);
      setTimeout(() => setIsRedeemed(false), 3000);
    } catch (error) {
      console.error('Redemption failed:', error);
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: canAfford ? 1.02 : 1 }}
      className={`bg-gray-800 border ${
        canAfford ? 'border-gray-700' : 'border-gray-800'
      } rounded-xl overflow-hidden ${!canAfford && 'opacity-60'} ${className}`}
    >
      <div className="p-6">
        {/* Icon and Cost */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
            canAfford ? 'from-blue-500 to-purple-600' : 'from-gray-600 to-gray-700'
          } flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-white" />
          </div>

          <div className="text-right">
            <div className={`text-2xl font-bold ${
              canAfford ? 'text-blue-400' : 'text-gray-500'
            }`}>
              {option.credits_cost}
            </div>
            <div className="text-xs text-gray-500">credits</div>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className="text-lg font-bold text-white mb-2">{option.name}</h3>
        <p className="text-sm text-gray-400 mb-4">{option.description}</p>

        {/* Redeem Button */}
        <button
          onClick={handleRedeem}
          disabled={!canAfford || isRedeeming || isRedeemed}
          className={`w-full py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
            isRedeemed
              ? 'bg-green-500 text-white'
              : canAfford
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-blue-500/50'
              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRedeeming ? (
            <span className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 animate-spin" />
              Processing...
            </span>
          ) : isRedeemed ? (
            <span className="flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Redeemed!
            </span>
          ) : canAfford ? (
            'Redeem Now'
          ) : (
            `Need ${option.credits_cost - userCredits} more credits`
          )}
        </button>

        {/* Category Tag */}
        <div className="mt-3 text-center">
          <span className="inline-block px-2 py-1 bg-gray-700 text-gray-400 text-xs rounded-full">
            {option.category}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RedemptionCard;

