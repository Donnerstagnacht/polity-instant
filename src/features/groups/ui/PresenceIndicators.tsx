/**
 * Presence Indicators Component
 *
 * Displays online users/peers with avatars.
 */

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';
import type { PresencePeer } from '../hooks/useDocumentPresence';

interface PresenceIndicatorsProps {
  peers: PresencePeer[];
}

export function PresenceIndicators({ peers }: PresenceIndicatorsProps) {
  if (peers.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <Users className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">
        {peers.length} {peers.length === 1 ? 'user' : 'users'} online
      </span>
      <div className="flex -space-x-2">
        {peers.map(peer => (
          <Avatar
            key={peer.peerId}
            className="h-6 w-6 border-2 border-background"
            title={peer.name}
          >
            {peer.avatar ? <AvatarImage src={peer.avatar} alt={peer.name} /> : null}
            <AvatarFallback style={{ backgroundColor: peer.color }} className="text-xs text-white">
              {peer.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
    </div>
  );
}
