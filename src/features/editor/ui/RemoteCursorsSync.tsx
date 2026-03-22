/**
 * Remote Cursors Sync Component
 *
 * Renders inside a <Plate> context. Broadcasts the local user's selection
 * and applies remote cursor positions via CursorOverlayPlugin.
 */

import { useEffect, useRef } from 'react';
import { useEditorRef } from 'platejs/react';
import { useRemoteCursors } from '@/features/editor/hooks/useRemoteCursors';

interface RemoteCursorsSyncProps {
  entityId: string;
  userId?: string;
  userName?: string;
  userColor?: string;
  enabled?: boolean;
  onActiveCursorsChange?: (userIds: Set<string>) => void;
}

export function RemoteCursorsSync({
  entityId,
  userId,
  userName,
  userColor,
  enabled = true,
  onActiveCursorsChange,
}: RemoteCursorsSyncProps) {
  const editor = useEditorRef();
  const { broadcastCursor } = useRemoteCursors({
    entityId,
    userId,
    userName,
    userColor,
    enabled,
    onActiveCursorsChange,
  });

  const broadcastCursorRef = useRef(broadcastCursor);
  useEffect(() => {
    broadcastCursorRef.current = broadcastCursor;
  }, [broadcastCursor]);

  // Broadcast selection changes on editor onChange
  useEffect(() => {
    if (!enabled || !editor || !userId) return;

    const interval = setInterval(() => {
      broadcastCursorRef.current(editor.selection);
    }, 150);

    return () => clearInterval(interval);
  }, [enabled, editor, userId]);

  return null;
}
