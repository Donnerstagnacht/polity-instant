'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/utils/utils';
import { Clock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export interface CountdownTimerProps {
  endsAt: Date | string;
  className?: string;
  showIcon?: boolean;
  compact?: boolean;
  onExpire?: () => void;
}

/**
 * Calculate time remaining from now to target date
 */
function calculateTimeRemaining(endsAt: Date): {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  isExpired: boolean;
} {
  const now = new Date();
  const end = new Date(endsAt);
  const diff = end.getTime() - now.getTime();

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds, isExpired: false };
}

/**
 * Format time as HH:MM:SS
 */
function formatTime(hours: number, minutes: number, seconds: number): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${pad(remainingHours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Get urgency level based on time remaining
 */
function getUrgencyLevel(totalSeconds: number): 'normal' | 'closing' | 'urgent' | 'critical' {
  if (totalSeconds <= 0) return 'normal';
  if (totalSeconds <= 15 * 60) return 'critical'; // < 15 minutes
  if (totalSeconds <= 60 * 60) return 'urgent'; // < 1 hour
  if (totalSeconds <= 24 * 60 * 60) return 'closing'; // < 24 hours
  return 'normal';
}

/**
 * Get color classes based on urgency
 */
function getUrgencyClasses(urgency: string): string {
  switch (urgency) {
    case 'critical':
      return 'text-red-600 dark:text-red-400 animate-pulse';
    case 'urgent':
      return 'text-orange-600 dark:text-orange-400';
    case 'closing':
      return 'text-yellow-600 dark:text-yellow-400';
    default:
      return 'text-green-600 dark:text-green-400';
  }
}

/**
 * Live countdown timer for Decision Terminal
 * Updates every second and changes color based on urgency
 */
export function CountdownTimer({
  endsAt,
  className,
  showIcon = true,
  compact = false,
  onExpire,
}: CountdownTimerProps) {
  const { t } = useTranslation();
  const [timeRemaining, setTimeRemaining] = useState(() =>
    calculateTimeRemaining(new Date(endsAt))
  );

  const updateTime = useCallback(() => {
    const remaining = calculateTimeRemaining(new Date(endsAt));
    setTimeRemaining(remaining);

    if (remaining.isExpired && onExpire) {
      onExpire();
    }
  }, [endsAt, onExpire]);

  useEffect(() => {
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [updateTime]);

  const urgency = getUrgencyLevel(timeRemaining.totalSeconds);
  const urgencyClasses = getUrgencyClasses(urgency);

  if (timeRemaining.isExpired) {
    return (
      <span className={cn('font-mono text-xs text-muted-foreground', className)}>
        {t('timeline.terminal.ended')}
      </span>
    );
  }

  const formattedTime = formatTime(
    timeRemaining.hours,
    timeRemaining.minutes,
    timeRemaining.seconds
  );

  if (compact) {
    return (
      <span className={cn('font-mono text-xs font-medium', urgencyClasses, className)}>
        {formattedTime}
      </span>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1', className)}>
      {showIcon && <Clock className={cn('h-3.5 w-3.5', urgencyClasses)} />}
      <span className={cn('font-mono text-sm font-semibold tabular-nums', urgencyClasses)}>
        {formattedTime}
      </span>
    </div>
  );
}

/**
 * Relative time display for closed items
 * Shows "Ended Xh ago" format
 */
export function EndedAgo({ endedAt, className }: { endedAt: Date | string; className?: string }) {
  const { t } = useTranslation();
  const [, setTick] = useState(0);

  // Update every minute for relative time
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const end = new Date(endedAt);
  const now = new Date();
  const diffMs = now.getTime() - end.getTime();

  if (diffMs < 0) {
    return null; // Not ended yet
  }

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  let timeString: string;
  if (diffDays > 0) {
    timeString = `${diffDays}d`;
  } else if (diffHours > 0) {
    timeString = `${diffHours}h`;
  } else {
    timeString = `${diffMins}m`;
  }

  return (
    <span className={cn('font-mono text-xs text-muted-foreground', className)}>
      {t('timeline.terminal.endedAgo', { time: timeString })}
    </span>
  );
}
