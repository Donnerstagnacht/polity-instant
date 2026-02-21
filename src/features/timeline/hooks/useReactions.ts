'use client';

/**
 * Hook for managing reactions (support, oppose, interested) on timeline entities
 */

import { useState, useCallback, useMemo } from 'react';

export type ReactionType = 'support' | 'oppose' | 'interested';

export interface Reaction {
  id: string;
  userId: string;
  entityId: string;
  entityType: string;
  reactionType: ReactionType;
  createdAt: Date;
}

export interface ReactionCounts {
  support: number;
  oppose: number;
  interested: number;
  total: number;
}

export interface UseReactionsOptions {
  entityId: string;
  entityType: 'amendment' | 'event' | 'group' | 'blog' | 'statement' | 'video' | 'image';
  userId?: string;
}

export interface UseReactionsReturn {
  /** Current user's reaction */
  userReaction: ReactionType | null;
  /** Reaction counts */
  counts: ReactionCounts;
  /** Whether data is loading */
  isLoading: boolean;
  /** Add or toggle a reaction */
  toggleReaction: (type: ReactionType) => Promise<void>;
  /** Remove user's reaction */
  removeReaction: () => Promise<void>;
  /** Whether user has reacted */
  hasReacted: boolean;
}

/**
 * Hook for managing reactions on an entity
 *
 * Note: This uses mock state for now. When the reactions schema is added,
 * this will use Zero queries.
 */
export function useReactions(options: UseReactionsOptions): UseReactionsReturn {
  const { entityId, entityType, userId } = options;

  // Mock state for now - replace with db.useQuery when schema exists
  const [userReaction, setUserReaction] = useState<ReactionType | null>(null);
  const [counts, setCounts] = useState<ReactionCounts>({
    support: 0,
    oppose: 0,
    interested: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const toggleReaction = useCallback(
    async (type: ReactionType) => {
      if (!userId) return;

      setIsLoading(true);
      try {
        // If user already has this reaction, remove it
        if (userReaction === type) {
          setUserReaction(null);
          setCounts(prev => ({
            ...prev,
            [type]: Math.max(0, prev[type] - 1),
            total: Math.max(0, prev.total - 1),
          }));
        } else {
          // Remove previous reaction if exists
          if (userReaction) {
            setCounts(prev => ({
              ...prev,
              [userReaction]: Math.max(0, prev[userReaction] - 1),
            }));
          }

          // Add new reaction
          setUserReaction(type);
          setCounts(prev => ({
            ...prev,
            [type]: prev[type] + 1,
            total: userReaction ? prev.total : prev.total + 1,
          }));
        }

        // Known limitation: Reactions table not in Zero schema. Persisted when schema is extended.
      } finally {
        setIsLoading(false);
      }
    },
    [userId, userReaction, entityId, entityType]
  );

  const removeReaction = useCallback(async () => {
    if (!userId || !userReaction) return;

    setIsLoading(true);
    try {
      const previousReaction = userReaction;
      setUserReaction(null);
      setCounts(prev => ({
        ...prev,
        [previousReaction]: Math.max(0, prev[previousReaction] - 1),
        total: Math.max(0, prev.total - 1),
      }));

      // Known limitation: Reactions table not in Zero schema. Persisted when schema is extended.
    } finally {
      setIsLoading(false);
    }
  }, [userId, userReaction]);

  const hasReacted = userReaction !== null;

  return {
    userReaction,
    counts,
    isLoading,
    toggleReaction,
    removeReaction,
    hasReacted,
  };
}

// Re-export pure helpers from logic layer
export { formatReactionCount, getReactionEmoji } from '../logic/reaction-helpers';
