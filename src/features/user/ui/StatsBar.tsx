import React from 'react';
import { StatsItem } from './StatsItem';

interface Stat {
  label: string;
  value: number | string;
  unit?: string;
}

interface WikiStatsBarProps {
  stats: Stat[];
  showAnimation?: boolean;
  animationText?: string;
  animationRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Dumb stats bar for the user wiki profile.
 * Renders a row of WikiStatsItem ui.
 */
export const StatsBar: React.FC<WikiStatsBarProps> = ({
  stats,
  showAnimation,
  animationText,
  animationRef,
}) => (
  <div className="relative mb-6 flex flex-wrap justify-between">
    {stats.map((stat, index) => (
      <StatsItem
        key={index}
        label={stat.label}
        value={stat.value}
        unit={stat.unit}
        showAnimation={stat.label === 'Followers' ? showAnimation : false}
        animationText={stat.label === 'Followers' ? animationText : undefined}
        animationRef={stat.label === 'Followers' ? animationRef : undefined}
      />
    ))}
  </div>
);
