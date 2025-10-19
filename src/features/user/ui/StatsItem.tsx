import React from 'react';

interface WikiStatsItemProps {
  label: string;
  value: number | string;
  unit?: string;
  showAnimation?: boolean;
  animationText?: string;
  animationRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Dumb stat item for the user wiki profile.
 * Handles display and animation overlay for a single stat.
 */
export const StatsItem: React.FC<WikiStatsItemProps> = ({
  label,
  value,
  unit,
  showAnimation,
  animationText,
  animationRef,
}) => (
  <div className="relative min-w-[80px] flex-1 px-2 py-2 text-center">
    <p
      className={`text-xl font-bold sm:text-2xl ${
        label === 'Followers' && showAnimation
          ? animationText?.includes('+')
            ? 'animate-flash-green'
            : 'animate-flash-red'
          : ''
      }`}
    >
      {value}
      {unit || ''}
    </p>
    <p className="text-xs text-muted-foreground">{label}</p>
    {/* Animation overlay for the Followers stat */}
    {label === 'Followers' && showAnimation && (
      <div
        ref={animationRef}
        className={`absolute left-0 right-0 top-0 text-xl font-bold ${
          animationText?.includes('+') ? 'text-green-500' : 'text-red-500'
        } animate-fly-up opacity-0`}
      >
        {animationText}
      </div>
    )}
  </div>
);
