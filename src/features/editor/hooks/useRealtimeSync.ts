/**
 * Real-time Content Sync Hook
 *
 * Bridges Plate editor content changes to Supabase Realtime broadcast.
 * Broadcasts local changes to other users and applies remote changes locally.
 *
 * Uses Supabase broadcast (ephemeral, low-latency) for live sync.
 * Zero mutations remain the durable persistence layer.
 */

import { useEffect, useRef, useCallback } from 'react';
import { usePresence } from '@/presence/usePresence';
import type { Value } from 'platejs';

interface UseRealtimeSyncOptions {
  /** Unique room/entity ID for the broadcast channel */
  entityId: string;
  /** Current user ID to skip self-broadcasts */
  userId?: string;
  /** Current editor content */
  content: Value;
  /** Callback to apply remote content */
  onRemoteContent: (content: Value) => void;
  /** Whether sync is enabled */
  enabled?: boolean;
}

interface UseRealtimeSyncReturn {
  /** Call when local content changes to broadcast to peers */
  broadcastContent: (content: Value) => void;
}

const BROADCAST_THROTTLE_MS = 200;

export function useRealtimeSync({
  entityId,
  userId,
  content,
  onRemoteContent,
  enabled = true,
}: UseRealtimeSyncOptions): UseRealtimeSyncReturn {
  const lastBroadcastTime = useRef(0);
  const broadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onRemoteContentRef = useRef(onRemoteContent);

  // Keep callback ref fresh
  useEffect(() => {
    onRemoteContentRef.current = onRemoteContent;
  }, [onRemoteContent]);

  const { publishTopic, subscribeTopic, isConnected } = usePresence(
    entityId ? `editor:${entityId}` : '',
    { enabled: enabled && !!entityId && !!userId },
  );

  // Subscribe to remote content broadcasts
  useEffect(() => {
    if (!enabled || !entityId || !userId) return;

    const unsubscribe = subscribeTopic('content', (payload) => {
      const senderId = payload.senderId as string | undefined;
      if (senderId === userId) return; // Skip own broadcasts

      const remoteContent = payload.content as Value | undefined;
      if (remoteContent && Array.isArray(remoteContent) && remoteContent.length > 0) {
        onRemoteContentRef.current(remoteContent);
      }
    });

    return unsubscribe;
  }, [enabled, entityId, userId, subscribeTopic]);

  // Broadcast local content changes (throttled)
  const broadcastContent = useCallback(
    (newContent: Value) => {
      if (!isConnected || !userId) return;

      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
      }

      const now = Date.now();
      if (now - lastBroadcastTime.current >= BROADCAST_THROTTLE_MS) {
        // Leading edge: broadcast immediately
        publishTopic('content', { senderId: userId, content: newContent as Record<string, unknown>[] });
        lastBroadcastTime.current = now;
      } else {
        // Trailing edge: schedule broadcast
        broadcastTimeoutRef.current = setTimeout(() => {
          publishTopic('content', { senderId: userId, content: newContent as Record<string, unknown>[] });
          lastBroadcastTime.current = Date.now();
        }, BROADCAST_THROTTLE_MS);
      }
    },
    [isConnected, userId, publishTopic]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (broadcastTimeoutRef.current) {
        clearTimeout(broadcastTimeoutRef.current);
      }
    };
  }, []);

  return { broadcastContent };
}
