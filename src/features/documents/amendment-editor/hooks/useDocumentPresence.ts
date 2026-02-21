/**
 * Hook for managing document presence (online users)
 *
 * @deprecated Use `useEditorPresence` from `@/features/editor` instead.
 * Import: `import { useEditorPresence } from '@/features/editor';`
 * Usage: `const { onlinePeers, userColor } = useEditorPresence({ entityId, userId, userName });`
 */

import { useMemo } from 'react';
import { usePresence } from '@/presence/usePresence';

// Presence handled by editor collaboration layer (Yjs/Plate). This hook provides additional presence metadata.

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
  const { peers } = usePresence(
    documentId ? `document:${documentId}` : '',
    {
      initialData: userId ? { userId, name: userName, avatar: userAvatar, color: userColor } : undefined,
      enabled: !!documentId && !!userId,
    }
  );

  const onlinePeers = useMemo(
    () => peers.filter((p) => p.userId !== userId),
    [peers, userId]
  );

  return {
    onlinePeers,
  };
}
