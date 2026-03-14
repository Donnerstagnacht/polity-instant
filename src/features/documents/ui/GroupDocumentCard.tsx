/**
 * Group Document Card Component
 *
 * Displays a single document card with metadata.
 */

import { Card, CardHeader, CardTitle, CardDescription } from '@/features/shared/ui/ui/card';
import { Badge } from '@/features/shared/ui/ui/badge';
import { FileText, Calendar } from 'lucide-react';

interface GroupDocumentCardProps {
  document: {
    id: string;
    title?: string | null;
    created_at: number;
    updated_at: number;
    collaborators?: ReadonlyArray<{
      id: string;
      user?: { id: string } | null;
    }>;
  };
  userId?: string;
  onClick?: () => void;
}

/**
 * Format date to localized string
 */
function formatDate(timestamp: number | string | Date): string {
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function GroupDocumentCard({ document, userId, onClick }: GroupDocumentCardProps) {
  const collaboratorCount = document.collaborators?.length || 0;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.title}
            </CardTitle>
          </div>
        </div>
        <CardDescription className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            <span>Updated: {formatDate(document.updated_at || document.created_at)}</span>
          </div>
          {collaboratorCount > 0 && (
            <div className="text-xs text-muted-foreground">
              {collaboratorCount} collaborator{collaboratorCount > 1 ? 's' : ''}
            </div>
          )}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
