'use client';

/**
 * Amendment Metadata Component
 *
 * Displays amendment-specific metadata including code, date, supporters,
 * and collaborators list.
 */

import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslation } from '@/hooks/use-translation';

interface Collaborator {
  id: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
  };
  status?: string;
}

interface AmendmentMetadataProps {
  /** Amendment code (e.g., "A-2024-001") */
  code?: string;
  /** Amendment date */
  date?: string;
  /** Number of supporters */
  supporters?: number;
  /** Amendment status */
  status?: string;
  /** List of collaborators */
  collaborators?: Collaborator[];
  /** Whether to show the collaborators list */
  showCollaborators?: boolean;
}

export function AmendmentMetadata({
  code,
  date,
  supporters,
  status,
  collaborators = [],
  showCollaborators = true,
}: AmendmentMetadataProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Amendment metadata badges */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {code && (
          <Badge variant="secondary" className="font-mono">
            {code}
          </Badge>
        )}
        {status && (
          <Badge variant="outline" className="capitalize">
            {status}
          </Badge>
        )}
        {date && (
          <span className="text-muted-foreground">
            {t('features.editor.metadata.date')}: {date}
          </span>
        )}
        {supporters !== undefined && (
          <span className="text-muted-foreground">
            {supporters} {t('features.editor.metadata.supporters')}
          </span>
        )}
      </div>

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
              {collab.status && collab.status !== 'member' && (
                <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                  {collab.status}
                </Badge>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
