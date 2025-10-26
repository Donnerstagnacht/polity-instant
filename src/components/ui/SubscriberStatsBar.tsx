import React from 'react';
import { StatsBar } from '@/features/user/ui/StatsBar';

interface SubscriberStatsBarProps {
  subscriberCount: number;
  showAnimation?: boolean;
  animationText?: string;
  animationRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Reusable subscriber stats bar component
 * Shows subscriber count with k/M formatting for large numbers
 */
export const SubscriberStatsBar: React.FC<SubscriberStatsBarProps> = ({
  subscriberCount,
  showAnimation = false,
  animationText = '',
  animationRef,
}) => {
  // Format large numbers
  const formatNumberWithUnit = (num: number): { value: number; unit: string } => {
    if (num >= 1000000) {
      return { value: +(num / 1000000).toFixed(1), unit: 'M' };
    } else if (num >= 1000) {
      return { value: +(num / 1000).toFixed(1), unit: 'k' };
    }
    return { value: num, unit: '' };
  };

  const displayStats = [
    {
      label: 'Subscribers',
      value:
        subscriberCount >= 1000 ? formatNumberWithUnit(subscriberCount).value : subscriberCount,
      unit: subscriberCount >= 1000 ? formatNumberWithUnit(subscriberCount).unit : '',
    },
  ];

  return (
    <StatsBar
      stats={displayStats}
      showAnimation={showAnimation}
      animationText={animationText}
      animationRef={animationRef}
    />
  );
};
