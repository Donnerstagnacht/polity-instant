/**
 * WebSocket Presence Server
 *
 * Manages presence rooms keyed by entityId (e.g., "editor:doc-123").
 * Tracks connected peers with their metadata.
 * Broadcasts peer join/leave/update events to all room members.
 */

interface PeerData {
  userId: string;
  name: string;
  avatar?: string;
  color: string;
}

interface PresenceMessage {
  type: "join" | "leave" | "update" | "peers" | "publish";
  room: string;
  peer?: PeerData;
  peers?: PeerData[];
  data?: Partial<PeerData>;
  topic?: string;
}

// Room state: map of roomId -> map of peerId -> PeerData
const rooms = new Map<
  string,
  Map<string, { ws: WebSocket; data: PeerData }>
>();

export function handlePresenceConnection(ws: WebSocket) {
  let currentRoom: string | null = null;
  let peerId: string | null = null;

  ws.addEventListener("message", (event) => {
    const msg: PresenceMessage = JSON.parse(event.data as string);

    switch (msg.type) {
      case "join": {
        currentRoom = msg.room;
        peerId = msg.peer?.userId ?? crypto.randomUUID();

        if (!rooms.has(currentRoom)) {
          rooms.set(currentRoom, new Map());
        }
        const room = rooms.get(currentRoom)!;
        room.set(peerId, { ws, data: msg.peer! });

        // Send current peers to the new joiner
        const peers = Array.from(room.values()).map((p) => p.data);
        ws.send(JSON.stringify({ type: "peers", room: currentRoom, peers }));

        // Broadcast join to others
        broadcastToRoom(currentRoom, peerId, {
          type: "join",
          room: currentRoom,
          peer: msg.peer,
        });
        break;
      }
      case "update": {
        if (currentRoom && peerId) {
          const room = rooms.get(currentRoom);
          if (room) {
            const existing = room.get(peerId);
            if (existing && msg.peer) {
              existing.data = { ...existing.data, ...msg.peer };
              broadcastToRoom(currentRoom, peerId, {
                type: "update",
                room: currentRoom,
                peer: existing.data,
              });
            }
          }
        }
        break;
      }
      case "publish": {
        if (currentRoom && peerId && msg.topic) {
          broadcastToRoom(currentRoom, peerId, {
            type: "publish",
            room: currentRoom,
            topic: msg.topic,
            data: msg.data,
            peer: rooms.get(currentRoom)?.get(peerId)?.data,
          });
        }
        break;
      }
    }
  });

  ws.addEventListener("close", () => {
    if (currentRoom && peerId) {
      const room = rooms.get(currentRoom);
      if (room) {
        const peerData = room.get(peerId)?.data;
        room.delete(peerId);
        if (room.size === 0) {
          rooms.delete(currentRoom);
        } else if (peerData) {
          broadcastToRoom(currentRoom, null, {
            type: "leave",
            room: currentRoom,
            peer: peerData,
          });
        }
      }
    }
  });
}

function broadcastToRoom(
  roomId: string,
  excludePeerId: string | null,
  message: PresenceMessage
) {
  const room = rooms.get(roomId);
  if (!room) return;
  const data = JSON.stringify(message);
  for (const [id, { ws }] of room) {
    if (id !== excludePeerId && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}
