import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PeerData {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
}

interface UsePresenceOptions {
  initialData?: Partial<PeerData>;
  enabled?: boolean;
}

type TopicCallback = (payload: Record<string, unknown>) => void;

interface UsePresenceReturn {
  peers: PeerData[];
  publishPresence: (data: Partial<PeerData>) => void;
  publishTopic: (topic: string, payload: Record<string, unknown>) => void;
  subscribeTopic: (topic: string, callback: TopicCallback) => () => void;
  isConnected: boolean;
}

export function usePresence(
  roomId: string,
  options: UsePresenceOptions = {}
): UsePresenceReturn {
  const { initialData, enabled = true } = options;
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const currentDataRef = useRef<Partial<PeerData> | undefined>(initialData);
  const topicListenersRef = useRef<Map<string, Set<TopicCallback>>>(new Map());

  // Keep ref in sync so publishPresence always has latest data
  useEffect(() => {
    currentDataRef.current = initialData;
  }, [initialData]);

  useEffect(() => {
    if (!enabled || !roomId) return;

    const supabase = createClient();
    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: initialData?.userId ?? "anon" } },
    });
    channelRef.current = channel;

    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState<PeerData>();
      const allPeers: PeerData[] = [];
      for (const presences of Object.values(state)) {
        for (const p of presences) {
          if (p.userId) {
            allPeers.push({
              userId: p.userId,
              name: p.name || "Anonymous",
              avatar: p.avatar,
              color: p.color || "#888888",
            });
          }
        }
      }
      setPeers(allPeers);
    });

    // Listen for broadcast events and dispatch to registered topic callbacks
    channel.on("broadcast", { event: "*" }, (message) => {
      const event = (message as { event?: string }).event;
      if (!event) return;
      const listeners = topicListenersRef.current.get(event);
      if (listeners) {
        const payload = (message as { payload?: Record<string, unknown> }).payload ?? {};
        for (const cb of listeners) {
          cb(payload);
        }
      }
    });

    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        setIsConnected(true);
        if (currentDataRef.current) {
          await channel.track(currentDataRef.current);
        }
      } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setIsConnected(false);
      }
    });

    return () => {
      channelRef.current = null;
      topicListenersRef.current.clear();
      supabase.removeChannel(channel);
    };
  }, [roomId, enabled]);

  const publishPresence = useCallback(
    (data: Partial<PeerData>) => {
      currentDataRef.current = { ...currentDataRef.current, ...data };
      channelRef.current?.track(currentDataRef.current);
    },
    []
  );

  const publishTopic = useCallback(
    (topic: string, payload: Record<string, unknown>) => {
      channelRef.current?.send({
        type: "broadcast",
        event: topic,
        payload,
      });
    },
    []
  );

  const subscribeTopic = useCallback(
    (topic: string, callback: TopicCallback): (() => void) => {
      let listeners = topicListenersRef.current.get(topic);
      if (!listeners) {
        listeners = new Set();
        topicListenersRef.current.set(topic, listeners);
      }
      listeners.add(callback);

      return () => {
        listeners.delete(callback);
        if (listeners.size === 0) {
          topicListenersRef.current.delete(topic);
        }
      };
    },
    []
  );

  return { peers, publishPresence, publishTopic, subscribeTopic, isConnected };
}
