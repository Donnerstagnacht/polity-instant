'use client';

/**
 * Editor Toolbar Component
 *
 * Configurable toolbar for the unified editor with optional features:
 * - Back navigation
 * - Share button
 * - Version control
 * - Mode selector
 * - Online users indicator
 */

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { ShareButton } from '@/components/shared/ShareButton';
import { VersionControl } from './VersionControl';
import { ModeSelector } from './ModeSelector';
import type {
  EditorEntityType,
  EditorMode,
  EditorPresencePeer,
  EditorCapabilities,
} from '../types';

interface EditorToolbarProps {
  /** Entity type for the editor */
  entityType: EditorEntityType;
  /** Entity ID */
  entityId: string;
  /** Current user ID */
  userId?: string;
  /** Back navigation URL */
  backUrl?: string;
  /** Back button label */
  backLabel?: string;
  /** Title for sharing */
  shareTitle?: string;
  /** Description for sharing */
  shareDescription?: string;
  /** Current content for version control */
  currentContent?: any[];
  /** Handler for restoring a version */
  onRestoreVersion?: (content: any[]) => void;
  /** Amendment ID (for amendment-specific notifications) */
  amendmentId?: string;
  /** Amendment title (for amendment-specific notifications) */
  amendmentTitle?: string;
  /** Current editing mode */
  currentMode?: EditorMode;
  /** Handler for mode changes */
  onModeChange?: (mode: EditorMode) => void;
  /** Whether user is owner or collaborator */
  isOwnerOrCollaborator?: boolean;
  /** Online peers for presence indicator */
  onlinePeers?: EditorPresencePeer[];
  /** Status badge text */
  statusBadge?: string;
  /** Capabilities configuration */
  capabilities?: Partial<EditorCapabilities>;
}

export function EditorToolbar({
  entityType,
  entityId,
  userId,
  backUrl,
  backLabel = 'Back',
  shareTitle,
  shareDescription,
  currentContent,
  onRestoreVersion,
  amendmentId,
  amendmentTitle,
  currentMode,
  onModeChange,
  isOwnerOrCollaborator,
  onlinePeers = [],
  statusBadge,
  capabilities = {},
}: EditorToolbarProps) {
  // Determine which features to show based on capabilities
  const showVersioning =
    capabilities.versioning !== false && currentContent && onRestoreVersion && userId;
  const showSharing = capabilities.sharing !== false && shareTitle;
  const showModeSelector = capabilities.modeSelection !== false && currentMode && onModeChange;
  const showPresence = capabilities.presence !== false && onlinePeers.length > 0;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      {/* Left side - Back navigation */}
      <div>
        {backUrl && (
          <Link href={backUrl}>
            <Button variant="ghost">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {backLabel}
            </Button>
          </Link>
        )}
      </div>

      {/* Right side - Tools */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Share Button */}
        {showSharing && (
          <ShareButton
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={shareTitle}
            description={shareDescription || ''}
          />
        )}

        {/* Version Control */}
        {showVersioning && (
          <VersionControl
            entityType={entityType}
            entityId={entityId}
            currentContent={currentContent}
            currentUserId={userId}
            onRestoreVersion={onRestoreVersion}
            amendmentId={amendmentId}
            amendmentTitle={amendmentTitle}
          />
        )}

        {/* Mode Selector */}
        {showModeSelector && (
          <ModeSelector
            entityType={entityType}
            entityId={entityId}
            currentMode={currentMode}
            onModeChange={onModeChange}
            isOwnerOrCollaborator={!!isOwnerOrCollaborator}
          />
        )}

        {/* Online users indicator */}
        {showPresence && (
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
                <Avatar className="h-6 w-6 border-2 border-background">
                  <AvatarFallback className="text-xs">+{onlinePeers.length - 5}</AvatarFallback>
                </Avatar>
              )}
            </div>
          </div>
        )}

        {/* Status Badge */}
        {statusBadge && (
          <Badge variant="outline" className="capitalize">
            {statusBadge}
          </Badge>
        )}
      </div>
    </div>
  );
}
