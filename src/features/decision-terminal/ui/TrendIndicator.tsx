'use client';

import { cn } from '@/utils/utils';
import { TrendingUp, TrendingDown, Minus, Activity } from 'lucide-react';

export type TrendDirection = 'up' | 'down' | 'stable' | 'volatile';

export interface TrendData {
  direction: TrendDirection;
  percentage: number;
}

export interface TrendIndicatorProps {
  trend: TrendData;
  showPercentage?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Get trend configuration for display
 */
export function getTrendConfig(direction: TrendDirection) {
  switch (direction) {
    case 'up':
      return {
        symbol: '▲',
        Icon: TrendingUp,
        colorClass: 'text-green-600 dark:text-green-400',
        bgClass: 'bg-green-500/10',
      };
    case 'down':
      return {
        symbol: '▼',
        Icon: TrendingDown,
        colorClass: 'text-red-600 dark:text-red-400',
        bgClass: 'bg-red-500/10',
      };
    case 'stable':
      return {
        symbol: '●',
        Icon: Minus,
        colorClass: 'text-gray-500 dark:text-gray-400',
        bgClass: 'bg-gray-500/10',
      };
    case 'volatile':
      return {
        symbol: '◆',
        Icon: Activity,
        colorClass: 'text-yellow-600 dark:text-yellow-400',
        bgClass: 'bg-yellow-500/10',
      };
    default:
      return {
        symbol: '●',
        Icon: Minus,
        colorClass: 'text-gray-500',
        bgClass: 'bg-gray-500/10',
      };
  }
}

/**
 * Format percentage change with sign
 */
export function formatPercentageChange(percentage: number): string {
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(0)}%`;
}

/**
 * Trend indicator component for Decision Terminal
 * Shows direction arrow/symbol and optional percentage change
 */
export function TrendIndicator({
  trend,
  showPercentage = true,
  compact = false,
  className,
}: TrendIndicatorProps) {
  const config = getTrendConfig(trend.direction);
  const Icon = config.Icon;

  if (compact) {
    return (
      <span
        className={cn('font-mono text-xs font-medium', config.colorClass, className)}
        title={`Trend: ${formatPercentageChange(trend.percentage)}`}
      >
        {config.symbol}
        {showPercentage && (
          <span className="ml-0.5">{formatPercentageChange(trend.percentage)}</span>
        )}
      </span>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5',
        config.bgClass,
        className
      )}
    >
      <Icon className={cn('h-3 w-3', config.colorClass)} />
      {showPercentage && (
        <span className={cn('font-mono text-xs font-medium', config.colorClass)}>
          {formatPercentageChange(trend.percentage)}
        </span>
      )}
    </div>
  );
}

/**
 * Simple trend arrow for compact displays
 */
export function TrendArrow({
  direction,
  className,
}: {
  direction: TrendDirection;
  className?: string;
}) {
  const config = getTrendConfig(direction);

  return (
    <span className={cn('font-mono', config.colorClass, className)} title={`Trend: ${direction}`}>
      {config.symbol}
    </span>
  );
}
