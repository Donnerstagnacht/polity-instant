'use client';

import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';

export type DecisionStatus =
  | 'open'
  | 'closing_soon'
  | 'last_hour'
  | 'final_minutes'
  | 'passed'
  | 'failed'
  | 'tied'
  | 'elected';

export interface StatusBadgeProps {
  status: DecisionStatus;
  className?: string;
}

/**
 * Get status configuration for display
 */
export function getStatusConfig(status: DecisionStatus) {
  switch (status) {
    case 'open':
      return {
        label: 'OPEN',
        emoji: '🟢',
        colorClass: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
        pulseClass: '',
      };
    case 'closing_soon':
      return {
        label: 'CLOSING',
        emoji: '🟡',
        colorClass: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
        pulseClass: '',
      };
    case 'last_hour':
      return {
        label: 'LAST HOUR',
        emoji: '🟠',
        colorClass: 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border-orange-500/30',
        pulseClass: '',
      };
    case 'final_minutes':
      return {
        label: 'FINAL',
        emoji: '🔴',
        colorClass: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
        pulseClass: 'animate-pulse',
      };
    case 'passed':
      return {
        label: 'PASSED',
        emoji: '✅',
        colorClass: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
        pulseClass: '',
      };
    case 'failed':
      return {
        label: 'FAILED',
        emoji: '❌',
        colorClass: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
        pulseClass: '',
      };
    case 'tied':
      return {
        label: 'TIED',
        emoji: '⚪',
        colorClass: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
        pulseClass: '',
      };
    case 'elected':
      return {
        label: 'ELECTED',
        emoji: '🏆',
        colorClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
        pulseClass: '',
      };
    default:
      return {
        label: 'UNKNOWN',
        emoji: '⚪',
        colorClass: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30',
        pulseClass: '',
      };
  }
}

/**
 * Status badge for Decision Terminal
 * Shows status with color coding and optional pulse animation
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-xs font-bold uppercase tracking-wide',
        config.colorClass,
        config.pulseClass,
        className
      )}
    >
      <span className="mr-1">{config.emoji}</span>
      {config.label}
    </Badge>
  );
}

/**
 * Compact status indicator (just the dot/emoji)
 */
export function StatusDot({ status, className }: { status: DecisionStatus; className?: string }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn('inline-flex items-center justify-center', config.pulseClass, className)}
      title={config.label}
    >
      {config.emoji}
    </span>
  );
}
