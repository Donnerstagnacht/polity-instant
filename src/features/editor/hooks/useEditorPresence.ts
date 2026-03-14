/**
 * Unified Editor Presence Hook
 *
 * Manages peer presence tracking for collaborative editing.
 * Uses the custom WebSocket presence system from src/presence/usePresence.ts.
 */

import { useMemo } from 'react';
import { usePresence } from '@/presence/usePresence';
import { generateUserColor } from '../logic/editor-helpers';
import type { EditorPresencePeer } from '../types';

interface UseEditorPresenceOptions {
  /** The entity ID to create a room for */
  entityId: string;
  /** Current user ID */
  userId?: string;
  /** Current user name */
  userName?: string;
  /** Current user avatar URL */
  userAvatar?: string;
  /** Whether presence is enabled */
  enabled?: boolean;
}

interface UseEditorPresenceResult {
  /** List of other users currently online */
  onlinePeers: EditorPresencePeer[];
  /** The current user's color */
  userColor: string;
  /** Function to publish presence updates */
  publishPresence: ((data: Record<string, unknown>) => void) | null;
}

/**
 * Hook for managing document presence and collaboration
 */
export function useEditorPresence(options: UseEditorPresenceOptions): UseEditorPresenceResult {
  const { entityId, userId, userName, userAvatar, enabled = true } = options;

  const userColor = useMemo(() => {
    return userId ? generateUserColor(userId) : '#888888';
  }, [userId]);

  const { peers, publishPresence: wsPublish } = usePresence(
    `editor:${entityId}`,
    {
      enabled,
      initialData: userId
        ? { userId, name: userName || 'Anonymous', avatar: userAvatar, color: userColor }
        : undefined,
    }
  );

  const onlinePeers = useMemo<EditorPresencePeer[]>(() => {
    return peers
      .filter(peer => peer.userId !== userId)
      .map(peer => ({
        peerId: peer.userId,
        odUserId: peer.userId,
        userId: peer.userId,
        name: peer.name || 'Anonymous',
        avatar: peer.avatar,
        color: peer.color || '#888888',
      })) as EditorPresencePeer[];
  }, [peers, userId]);

  const publishPresence = useMemo(() => {
    if (!enabled) return null;
    return (data: Record<string, unknown>) => wsPublish(data);
  }, [enabled, wsPublish]);

  return {
    onlinePeers,
    userColor,
    publishPresence,
  };
}
