/**
 * Document Header Component
 *
 * Displays document title, save status, and online users.
 */

import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye } from 'lucide-react';
import { PresenceIndicators } from './PresenceIndicators';
import type { PresencePeer } from '../hooks/useDocumentPresence';

interface DocumentHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  isSaving: boolean;
  isOwner: boolean;
  onlinePeers: PresencePeer[];
}

export function DocumentHeader({
  title,
  onTitleChange,
  isSaving,
  isOwner,
  onlinePeers,
}: DocumentHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
            placeholder="Untitled Document"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {isSaving ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <Eye className="h-3 w-3" />
              <span>Auto-save enabled</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <PresenceIndicators peers={onlinePeers} />
        {isOwner && <Badge variant="outline">Owner</Badge>}
      </div>
    </div>
  );
}
