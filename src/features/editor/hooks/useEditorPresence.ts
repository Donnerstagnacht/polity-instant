/**
 * Unified Editor Presence Hook
 *
 * Manages InstantDB room setup and peer presence tracking for collaborative editing.
 * Works with all entity types (amendments, blogs, documents, group documents).
 */

import { useMemo, useEffect } from 'react';
import db from '@db/db';
import { generateUserColor } from '../utils/editor-operations';
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
  publishPresence: ((data: any) => void) | null;
}

/**
 * Hook for managing document presence and collaboration
 *
 * @param options - Configuration options
 * @returns Online peers, user color, and presence publishing function
 *
 * @example
 * const { onlinePeers, userColor } = useEditorPresence({
 *   entityId: documentId,
 *   userId: user.id,
 *   userName: user.name,
 *   userAvatar: user.avatar,
 * });
 */
export function useEditorPresence(options: UseEditorPresenceOptions): UseEditorPresenceResult {
  const { entityId, userId, userName, userAvatar, enabled = true } = options;

  // Generate consistent user color
  const userColor = useMemo(() => {
    return userId ? generateUserColor(userId) : '#888888';
  }, [userId]);

  // Create room for presence
  const room = db.room('editor', entityId);

  // Presence hook - show who's online
  const { peers, publishPresence } = db.rooms.usePresence(room, {
    initialData: {
      name: userName || 'Anonymous',
      avatar: userAvatar,
      color: userColor,
      userId: userId || '',
    },
  });

  // Publish presence when user data changes
  useEffect(() => {
    if (userId && publishPresence && enabled) {
      publishPresence({
        name: userName || 'Anonymous',
        avatar: userAvatar,
        color: userColor,
        userId,
      });
    }
  }, [userId, publishPresence, userName, userAvatar, userColor, enabled]);

  // Get online peers (excluding current user)
  const onlinePeers = useMemo<EditorPresencePeer[]>(() => {
    if (!enabled) return [];

    return Object.values(peers)
      .filter((peer: any) => peer.userId !== userId)
      .map((peer: any) => ({
        peerId: peer.peerId || '',
        userId: peer.userId || '',
        name: peer.name || 'Anonymous',
        avatar: peer.avatar,
        color: peer.color || '#888888',
      }));
  }, [peers, userId, enabled]);

  return {
    onlinePeers,
    userColor,
    publishPresence: enabled ? publishPresence : null,
  };
}
