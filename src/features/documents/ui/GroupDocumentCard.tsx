/**
 * Group Document Card Component
 *
 * Displays a single document card with metadata.
 */

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, User } from 'lucide-react';
import type { DocumentWithMetadata } from '../hooks/useGroupDocuments';

interface GroupDocumentCardProps {
  document: DocumentWithMetadata;
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
  const isOwner = document.owner?.id === userId;
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
          {isOwner && <Badge variant="outline">Owner</Badge>}
        </div>
        <CardDescription className="mt-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3 w-3" />
            <span>Updated: {formatDate(document.updatedAt || document.createdAt)}</span>
          </div>
          {document.owner && (
            <div className="flex items-center gap-2 text-xs">
              <User className="h-3 w-3" />
              <span>By {document.owner.email || document.owner.name || 'Unknown'}</span>
            </div>
          )}
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
