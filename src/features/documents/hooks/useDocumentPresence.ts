/**
 * Document Presence Hook
 *
 * @deprecated Use `useEditorPresence` from `@/features/editor` instead.
 * Import: `import { useEditorPresence } from '@/features/editor';`
 * Usage: `const { onlinePeers, userColor } = useEditorPresence({ entityId, userId, userName });`
 *
 * Manages InstantDB room setup and peer presence tracking for collaborative editing.
 */

import { useMemo, useEffect, useState } from 'react';
import { usePresence, type PeerData } from '@/presence/usePresence';
// Presence handled by editor collaboration layer (Yjs/Plate). This hook provides additional presence metadata.

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
  publishPresence: ((data: Partial<PeerData>) => void) | null;
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

  const { peers: presencePeers, publishPresence: wsPublishPresence } = usePresence(
    documentId ? `document:${documentId}` : '',
    {
      initialData: userId ? { userId, name: userName || 'Anonymous', avatar: userAvatar, color: userColor } : undefined,
      enabled: !!documentId && !!userId,
    }
  );
  const peers: Record<string, PeerData> = Object.fromEntries(presencePeers.map(p => [p.userId, p]));
  const publishPresence: ((data: Partial<PeerData>) => void) | null = wsPublishPresence;

  // Publish presence when user data changes
  // NOTE: publishPresence is null until a real-time presence solution is wired up
  useEffect(() => {
    if (userId && publishPresence != null) {
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
      .filter((peer) => peer.userId !== userId)
      .map((peer) => ({
        peerId: peer.userId || '',
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
