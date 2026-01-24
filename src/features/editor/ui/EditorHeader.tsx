'use client';

/**
 * Editor Header Component
 *
 * Displays title editing, save status, and online users.
 */

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Eye, Pencil, Users } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import type { EditorPresencePeer } from '../types';

interface EditorHeaderProps {
  title: string;
  onTitleChange: (title: string) => void;
  isEditingTitle: boolean;
  setIsEditingTitle: (editing: boolean) => void;
  isSavingTitle: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  hasUnsavedChanges: boolean;
  onlinePeers?: EditorPresencePeer[];
  showPresence?: boolean;
  statusBadge?: React.ReactNode;
}

export function EditorHeader({
  title,
  onTitleChange,
  isEditingTitle,
  setIsEditingTitle,
  isSavingTitle,
  saveStatus,
  hasUnsavedChanges,
  onlinePeers = [],
  showPresence = true,
  statusBadge,
}: EditorHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        {isEditingTitle ? (
          <Input
            value={title}
            onChange={e => onTitleChange(e.target.value)}
            className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
            placeholder={t('features.editor.header.titlePlaceholder')}
            autoFocus
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === 'Escape') {
                setIsEditingTitle(false);
              }
            }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">{title || t('features.editor.header.untitled')}</h2>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsEditingTitle(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Online presence */}
      {showPresence && onlinePeers.length > 0 && (
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {onlinePeers.length} {onlinePeers.length === 1 ? 'user' : 'users'} online
          </span>
          <div className="flex -space-x-2">
            {onlinePeers.slice(0, 5).map(peer => (
              <Avatar
                key={peer.peerId}
                className="h-6 w-6 border-2 border-background"
                title={peer.name}
              >
                {peer.avatar ? <AvatarImage src={peer.avatar} alt={peer.name} /> : null}
                <AvatarFallback
                  style={{ backgroundColor: peer.color }}
                  className="text-xs text-white"
                >
                  {peer.name?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {onlinePeers.length > 5 && (
              <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                +{onlinePeers.length - 5}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status badge */}
      {statusBadge}

      {/* Save status */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {saveStatus === 'saving' || isSavingTitle ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>{t('features.editor.header.saving')}</span>
          </>
        ) : saveStatus === 'error' ? (
          <>
            <span className="text-destructive">⚠️ {t('features.editor.header.saveFailed')}</span>
          </>
        ) : hasUnsavedChanges ? (
          <>
            <span className="text-yellow-600">{t('features.editor.header.unsavedChanges')}</span>
          </>
        ) : (
          <>
            <Eye className="h-3 w-3" />
            <span>{t('features.editor.header.allSaved')}</span>
          </>
        )}
      </div>
    </div>
  );
}
