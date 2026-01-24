/**
 * Hook for managing document presence (online users)
 *
 * @deprecated Use `useEditorPresence` from `@/features/editor` instead.
 * Import: `import { useEditorPresence } from '@/features/editor';`
 * Usage: `const { onlinePeers, userColor } = useEditorPresence({ entityId, userId, userName });`
 */

import { useEffect, useMemo } from 'react';
import db from '../../../../../db/db';

interface UseDocumentPresenceProps {
  documentId: string | undefined;
  userId: string | undefined;
  userName: string;
  userAvatar: string | undefined;
  userColor: string;
}

export function useDocumentPresence({
  documentId,
  userId,
  userName,
  userAvatar,
  userColor,
}: UseDocumentPresenceProps) {
  // Create room for presence
  const room = db.room('editor', documentId || 'placeholder');

  // Presence hook - show who's online
  const { peers, publishPresence } = db.rooms.usePresence(room, {
    initialData: {
      name: userName,
      avatar: userAvatar,
      color: userColor,
      userId: userId || '',
    },
  });

  // Update presence when user data changes
  useEffect(() => {
    if (publishPresence && userName) {
      publishPresence({
        name: userName,
        avatar: userAvatar,
        color: userColor,
        userId: userId || '',
      });
    }
  }, [userName, userAvatar, userColor, userId, publishPresence]);

  // Get online peers (excluding current user)
  const onlinePeers = useMemo(
    () => Object.values(peers).filter((peer: any) => peer.userId !== userId),
    [peers, userId]
  );

  return {
    onlinePeers,
  };
}
