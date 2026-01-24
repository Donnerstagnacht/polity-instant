/**
 * Decision status utilities for the Decision Terminal
 * Calculates status, urgency levels, and formats countdowns
 */

import type { DecisionStatus } from '../ui/terminal/StatusBadge';

/**
 * Calculate vote/election status based on end time
 */
export function getDecisionStatus(
  endsAt: Date | string,
  result?: 'passed' | 'failed' | 'tied' | 'elected'
): DecisionStatus {
  const end = new Date(endsAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  // If ended, return the result status
  if (diffMs <= 0) {
    return result || 'passed'; // Default to passed if no result specified
  }

  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffMinutes <= 15) {
    return 'final_minutes';
  }
  if (diffMinutes <= 60) {
    return 'last_hour';
  }
  if (diffHours <= 24) {
    return 'closing_soon';
  }

  return 'open';
}

/**
 * Check if a decision is urgent (less than 1 hour remaining)
 */
export function isUrgent(endsAt: Date | string): boolean {
  const end = new Date(endsAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= 60 * 60 * 1000; // 1 hour
}

/**
 * Check if a decision is closing soon (less than 24 hours remaining)
 */
export function isClosingSoon(endsAt: Date | string): boolean {
  const end = new Date(endsAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();
  return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000; // 24 hours
}

/**
 * Check if a decision has ended
 */
export function isClosed(endsAt: Date | string): boolean {
  const end = new Date(endsAt);
  const now = new Date();
  return end.getTime() <= now.getTime();
}

/**
 * Format countdown as HH:MM:SS or Xd HH:MM:SS for long durations
 */
export function formatCountdown(endsAt: Date | string): string {
  const end = new Date(endsAt);
  const now = new Date();
  const diffMs = end.getTime() - now.getTime();

  if (diffMs <= 0) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${pad(remainingHours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Get CSS color class for a status
 */
export function getStatusColorClass(status: DecisionStatus): string {
  switch (status) {
    case 'open':
      return 'text-green-600 dark:text-green-400';
    case 'closing_soon':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'last_hour':
      return 'text-orange-600 dark:text-orange-400';
    case 'final_minutes':
      return 'text-red-600 dark:text-red-400 animate-pulse';
    case 'passed':
    case 'elected':
      return 'text-green-600 dark:text-green-400';
    case 'failed':
      return 'text-red-600 dark:text-red-400';
    case 'tied':
      return 'text-gray-600 dark:text-gray-400';
    default:
      return 'text-muted-foreground';
  }
}

/**
 * Generate a decision ID prefix based on type
 */
export function generateDecisionId(type: 'vote' | 'election', index: number): string {
  const prefix = type === 'vote' ? 'V' : 'E';
  return `${prefix}-${index.toString().padStart(3, '0')}`;
}
