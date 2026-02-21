'use client';

import { cn } from '@/utils/utils';
import { Badge } from '@/components/ui/badge';
import { Check, X, Minus, Trophy } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export type ResultType = 'passed' | 'failed' | 'tied' | 'elected';

export interface ResultBadgeProps {
  result: ResultType;
  winnerName?: string;
  percentage?: number;
  className?: string;
  showIcon?: boolean;
}

/**
 * Get result configuration for display
 */
export function getResultConfig(result: ResultType) {
  switch (result) {
    case 'passed':
      return {
        labelKey: 'timeline.terminal.results.passed',
        emoji: '🟢',
        Icon: Check,
        colorClass: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
      };
    case 'failed':
      return {
        labelKey: 'timeline.terminal.results.failed',
        emoji: '🔴',
        Icon: X,
        colorClass: 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
      };
    case 'tied':
      return {
        labelKey: 'timeline.terminal.results.tied',
        emoji: '⚪',
        Icon: Minus,
        colorClass: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
      };
    case 'elected':
      return {
        labelKey: 'timeline.terminal.results.elected',
        emoji: '🔵',
        Icon: Trophy,
        colorClass: 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
      };
    default:
      return {
        labelKey: 'timeline.terminal.results.unknown',
        emoji: '⚪',
        Icon: Minus,
        colorClass: 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30',
      };
  }
}

/**
 * Result badge for closed decisions
 * Shows PASSED, FAILED, TIED, or ELECTED with winner name
 */
export function ResultBadge({
  result,
  winnerName,
  percentage,
  className,
  showIcon = true,
}: ResultBadgeProps) {
  const { t } = useTranslation();
  const config = getResultConfig(result);
  const Icon = config.Icon;

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-mono text-xs font-bold uppercase tracking-wide',
        config.colorClass,
        className
      )}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      <span>{t(config.labelKey)}</span>
      {result === 'elected' && winnerName && (
        <span className="ml-1 font-normal normal-case">{winnerName}</span>
      )}
      {percentage !== undefined && <span className="ml-1 font-normal">{percentage}%</span>}
    </Badge>
  );
}

/**
 * Compact result display for table rows
 */
export function ResultCompact({
  result,
  winnerName,
  className,
}: {
  result: ResultType;
  winnerName?: string;
  className?: string;
}) {
  const config = getResultConfig(result);

  return (
    <span className={cn('font-mono text-xs font-medium', className)}>
      <span className="mr-1">{config.emoji}</span>
      {result === 'elected' && winnerName ? winnerName : result.toUpperCase()}
    </span>
  );
}
