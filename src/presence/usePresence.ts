import { useState, useEffect, useCallback, useRef } from "react";

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

interface UsePresenceReturn {
  peers: PeerData[];
  publishPresence: (data: Partial<PeerData>) => void;
  publishTopic: (topic: string, data: Partial<PeerData>) => void;
  isConnected: boolean;
}

const PRESENCE_WS_URL =
  typeof window !== "undefined"
    ? (import.meta.env.VITE_PRESENCE_WS_URL ||
      `ws://${window.location.hostname}:4849`)
    : "";

export function usePresence(
  roomId: string,
  options: UsePresenceOptions = {}
): UsePresenceReturn {
  const { initialData, enabled = true } = options;
  const [peers, setPeers] = useState<PeerData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (!enabled || !roomId) return;

    let mounted = true;

    function connect() {
      const ws = new WebSocket(PRESENCE_WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mounted) return;
        setIsConnected(true);
        // Join room
        ws.send(
          JSON.stringify({
            type: "join",
            room: roomId,
            peer: initialData,
          })
        );
      };

      ws.onmessage = (event) => {
        if (!mounted) return;
        const msg = JSON.parse(event.data);
        switch (msg.type) {
          case "peers":
            setPeers(msg.peers || []);
            break;
          case "join":
            setPeers((prev) => [
              ...prev.filter((p) => p.userId !== msg.peer?.userId),
              msg.peer,
            ]);
            break;
          case "leave":
            setPeers((prev) =>
              prev.filter((p) => p.userId !== msg.peer?.userId)
            );
            break;
          case "update":
            setPeers((prev) =>
              prev.map((p) =>
                p.userId === msg.peer?.userId ? { ...p, ...msg.peer } : p
              )
            );
            break;
        }
      };

      ws.onclose = () => {
        if (!mounted) return;
        setIsConnected(false);
        wsRef.current = null;
        // Reconnect after delay
        reconnectTimeoutRef.current = setTimeout(connect, 2000);
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      mounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [roomId, enabled]);

  const publishPresence = useCallback(
    (data: Partial<PeerData>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "update",
            room: roomId,
            peer: data,
          })
        );
      }
    },
    [roomId]
  );

  const publishTopic = useCallback(
    (topic: string, data: Partial<PeerData>) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "publish",
            room: roomId,
            topic,
            data,
          })
        );
      }
    },
    [roomId]
  );

  return { peers, publishPresence, publishTopic, isConnected };
}
