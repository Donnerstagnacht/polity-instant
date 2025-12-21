/**
 * Document Presence Hook
 *
 * Manages InstantDB room setup and peer presence tracking for collaborative editing.
 */

import { useMemo, useEffect } from 'react';
import db from '../../../../db/db';

export interface PresencePeer {
  peerId: string;
  userId: string;
  name: string;
  avatar?: string;
  color: string;
}

interface UseDocumentPresenceOptions {
  documentId: string;
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

interface UseDocumentPresenceResult {
  onlinePeers: PresencePeer[];
  userColor: string;
  publishPresence: ((data: any) => void) | null;
}

/**
 * Generate a consistent color for a user based on their ID
 */
function generateUserColor(userId: string): string {
  const hash = parseInt(userId.substring(0, 8), 16);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Hook for managing document presence and collaboration
 *
 * @param options - Configuration options
 * @returns Online peers, user color, and presence publishing function
 *
 * @example
 * const { onlinePeers, userColor } = useDocumentPresence({
 *   documentId,
 *   userId: user.id,
 *   userName: user.name,
 *   userAvatar: user.avatar,
 * });
 */
export function useDocumentPresence(
  options: UseDocumentPresenceOptions
): UseDocumentPresenceResult {
  const { documentId, userId, userName, userAvatar } = options;

  // Generate consistent user color
  const userColor = useMemo(() => {
    return userId ? generateUserColor(userId) : '#888888';
  }, [userId]);

  // Create room for presence
  const room = db.room('editor', documentId);

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
    if (userId && publishPresence) {
      publishPresence({
        name: userName || 'Anonymous',
        avatar: userAvatar,
        color: userColor,
        userId,
      });
    }
  }, [userId, publishPresence, userName, userAvatar, userColor]);

  // Get online peers (excluding current user)
  const onlinePeers = useMemo<PresencePeer[]>(() => {
    return Object.values(peers)
      .filter((peer: any) => peer.userId !== userId)
      .map((peer: any) => ({
        peerId: peer.peerId || '',
        userId: peer.userId || '',
        name: peer.name || 'Anonymous',
        avatar: peer.avatar,
        color: peer.color || '#888888',
      }));
  }, [peers, userId]);

  return {
    onlinePeers,
    userColor,
    publishPresence,
  };
}
