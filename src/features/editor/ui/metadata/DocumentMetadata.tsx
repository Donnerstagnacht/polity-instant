'use client';

/**
 * Document Metadata Component
 *
 * Displays document-specific metadata including owner and collaborators.
 */

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, Lock } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface Collaborator {
  id: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  canEdit?: boolean;
}

interface Owner {
  id: string;
  name?: string;
  avatar?: string;
}

interface DocumentMetadataProps {
  /** Document owner */
  owner?: Owner;
  /** Whether the document is public */
  isPublic?: boolean;
  /** Last updated timestamp */
  updatedAt?: number;
  /** List of collaborators */
  collaborators?: Collaborator[];
  /** Whether to show the collaborators list */
  showCollaborators?: boolean;
  /** Group name (for group documents) */
  groupName?: string;
}

export function DocumentMetadata({
  owner,
  isPublic,
  updatedAt,
  collaborators = [],
  showCollaborators = true,
  groupName,
}: DocumentMetadataProps) {
  const { t } = useTranslation();

  // Format the last updated date
  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="space-y-4">
      {/* Document metadata badges */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {groupName && <Badge variant="secondary">{groupName}</Badge>}
        {isPublic !== undefined && (
          <Badge variant="outline" className="flex items-center gap-1">
            {isPublic ? (
              <>
                <Globe className="h-3 w-3" />
                {t('features.editor.metadata.public')}
              </>
            ) : (
              <>
                <Lock className="h-3 w-3" />
                {t('features.editor.metadata.private')}
              </>
            )}
          </Badge>
        )}
        {formattedDate && (
          <span className="text-muted-foreground">
            {t('features.editor.metadata.lastUpdated')}: {formattedDate}
          </span>
        )}
      </div>

      {/* Owner */}
      {owner && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('features.editor.metadata.owner')}:
          </span>
          <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-1">
            <Avatar className="h-5 w-5">
              {owner.avatar ? <AvatarImage src={owner.avatar} alt={owner.name || ''} /> : null}
              <AvatarFallback className="text-xs">
                {owner.name?.[0]?.toUpperCase() || '?'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">{owner.name || 'Unknown'}</span>
          </div>
        </div>
      )}

      {/* Collaborators list */}
      {showCollaborators && collaborators.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {t('features.editor.metadata.collaborators')}:
          </span>
          {collaborators.map(collab => (
            <div
              key={collab.id}
              className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
            >
              <Avatar className="h-5 w-5">
                {collab.user?.avatar ? (
                  <AvatarImage src={collab.user.avatar} alt={collab.user.name || ''} />
                ) : null}
                <AvatarFallback className="text-xs">
                  {collab.user?.name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{collab.user?.name || 'Unknown'}</span>
              {collab.canEdit && (
                <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                  {t('features.editor.metadata.canEdit')}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
