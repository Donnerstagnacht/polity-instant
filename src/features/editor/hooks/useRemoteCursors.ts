/**
 * Remote Cursors Hook
 *
 * Broadcasts local cursor selection and receives remote cursor positions
 * via Supabase Realtime, then injects them into Plate's CursorOverlayPlugin.
 *
 * Must be called inside a <Plate> context (needs useEditorRef).
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { useEditorRef } from 'platejs/react';
import { CursorOverlayPlugin } from '@platejs/selection/react';
import { usePresence } from '@/presence/usePresence';
import type { TRange } from 'platejs';

interface UseRemoteCursorsOptions {
  /** The entity ID for the broadcast channel */
  entityId: string;
  /** Current user ID */
  userId?: string;
  /** Current user name */
  userName?: string;
  /** Current user color */
  userColor?: string;
  /** Whether remote cursors are enabled */
  enabled?: boolean;
  /** Callback when the set of users with active cursors changes */
  onActiveCursorsChange?: (userIds: Set<string>) => void;
}

const CURSOR_BROADCAST_THROTTLE_MS = 100;

export function useRemoteCursors({
  entityId,
  userId,
  userName,
  userColor,
  enabled = true,
  onActiveCursorsChange,
}: UseRemoteCursorsOptions) {
  const editor = useEditorRef();
  const lastBroadcastTime = useRef(0);
  const broadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const remoteCursorsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const onActiveCursorsChangeRef = useRef(onActiveCursorsChange);
  onActiveCursorsChangeRef.current = onActiveCursorsChange;

  const { publishTopic, subscribeTopic, isConnected } = usePresence(
    entityId ? `editor:${entityId}` : '',
    { enabled: enabled && !!entityId && !!userId },
  );

  // Helper to notify parent about active cursor user IDs
  const notifyActiveCursors = useCallback(() => {
    if (onActiveCursorsChangeRef.current) {
      onActiveCursorsChangeRef.current(new Set(remoteCursorsRef.current.keys()));
    }
  }, []);

  // Subscribe to remote cursor broadcasts
  useEffect(() => {
    if (!enabled || !entityId || !userId || !editor) return;

    const unsubscribe = subscribeTopic('cursor', (payload) => {
      const senderId = payload.senderId as string | undefined;
      if (!senderId || senderId === userId) return;

      const selection = payload.selection as TRange | null;
      const senderColor = (payload.userColor as string) || '#888888';

      const cursorApi = editor.getApi(CursorOverlayPlugin).cursorOverlay;

      if (selection) {
        cursorApi.addCursor(senderId, {
          selection,
          data: {
            style: { backgroundColor: senderColor },
            selectionStyle: { backgroundColor: `${senderColor}33` },
          },
        });
      } else {
        cursorApi.removeCursor(senderId);
      }

      // Clear existing timeout for this user
      const existingTimeout = remoteCursorsRef.current.get(senderId);
      if (existingTimeout) clearTimeout(existingTimeout);

      // Auto-remove cursor after 10s of inactivity
      const timeout = setTimeout(() => {
        editor.getApi(CursorOverlayPlugin).cursorOverlay.removeCursor(senderId);
        remoteCursorsRef.current.delete(senderId);
        notifyActiveCursors();
      }, 10_000);

      const hadUser = remoteCursorsRef.current.has(senderId);
      remoteCursorsRef.current.set(senderId, timeout);
      if (!hadUser) {
        notifyActiveCursors();
      }
    });

    return () => {
      unsubscribe();
      const cleanupApi = editor.getApi(CursorOverlayPlugin).cursorOverlay;
      for (const [cursorId, timeout] of remoteCursorsRef.current) {
        clearTimeout(timeout);
        cleanupApi.removeCursor(cursorId);
      }
      remoteCursorsRef.current.clear();
      notifyActiveCursors();
    };
  }, [enabled, entityId, userId, editor, subscribeTopic, notifyActiveCursors]);

  // Broadcast local cursor/selection changes (throttled)
  const broadcastCursor = useCallback(
    (selection: TRange | null) => {
      if (!isConnected || !userId) return;

      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
      }

      const now = Date.now();
      const payload = {
        senderId: userId,
        userName: userName || 'Anonymous',
        userColor: userColor || '#888888',
        selection,
      };

      if (now - lastBroadcastTime.current >= CURSOR_BROADCAST_THROTTLE_MS) {
        publishTopic('cursor', payload as Record<string, unknown>);
        lastBroadcastTime.current = now;
      } else {
        broadcastTimeoutRef.current = setTimeout(() => {
          publishTopic('cursor', payload as Record<string, unknown>);
          lastBroadcastTime.current = Date.now();
        }, CURSOR_BROADCAST_THROTTLE_MS);
      }
    },
    [isConnected, userId, userName, userColor, publishTopic]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
      }
    };
  }, []);

  return { broadcastCursor };
}
