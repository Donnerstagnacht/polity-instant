import type { ReactionType } from '../hooks/useReactions';

/**
 * Format reaction count for display
 */
export function formatReactionCount(count: number): string {
  if (count < 1000) return count.toString();
  if (count < 10000) return `${(count / 1000).toFixed(1)}K`;
  if (count < 1000000) return `${Math.floor(count / 1000)}K`;
  return `${(count / 1000000).toFixed(1)}M`;
}

/**
 * Get reaction icon emoji
 */
export function getReactionEmoji(type: ReactionType): string {
  switch (type) {
    case 'support':
      return '👍';
    case 'oppose':
      return '👎';
    case 'interested':
      return '🤔';
    default:
      return '👍';
  }
}
