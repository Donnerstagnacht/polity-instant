'use client';

/**
 * @deprecated This component is deprecated. Use `VersionControl` from `@/features/editor` instead.
 * Import: `import { VersionControl } from '@/features/editor';`
 * Usage: `<VersionControl entityType="document" entityId={documentId} ... />`
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GitBranch, Clock, User, Plus, History } from 'lucide-react';
import { db, tx, id } from 'db/db';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';

interface Version {
  id: string;
  versionNumber: number;
  title: string;
  content: any[];
  createdAt: number | Date;
  creationType: string;
  creator?: {
    id: string;
    email?: string;
    name?: string;
    avatar?: string;
  };
}

interface VersionControlProps {
  documentId: string;
  currentContent: any[];
  currentUserId: string;
  onRestoreVersion: (content: any[]) => void;
}

export function VersionControl({
  documentId,
  currentContent,
  currentUserId,
  onRestoreVersion,
}: VersionControlProps) {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [versionTitle, setVersionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Query all versions for this document
  const { data: versionsData, isLoading } = db.useQuery({
    documentVersions: {
      $: {
        where: { 'document.id': documentId },
      },
      creator: {},
    },
  });

  const versions = (versionsData?.documentVersions || []) as Version[];
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  // Create a new version manually
  const handleCreateVersion = async () => {
    if (!versionTitle.trim()) {
      toast.error(t('features.documents.versionControl.enterTitle'));
      return;
    }

    setIsCreating(true);
    try {
      const nextVersionNumber =
        versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1;

      const versionId = id();
      await db.transact([
        tx.documentVersions[versionId]
          .update({
            versionNumber: nextVersionNumber,
            title: versionTitle,
            content: currentContent,
            createdAt: Date.now(),
            creationType: 'manual',
          })
          .link({ document: documentId, creator: currentUserId }),
      ]);

      toast.success(
        t('features.documents.versionControl.versionCreated').replace(
          '{{number}}',
          String(nextVersionNumber)
        )
      );

      setVersionTitle('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error(t('features.documents.versionControl.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  // Restore a specific version
  const handleRestoreVersion = async (version: Version) => {
    try {
      onRestoreVersion(version.content);

      toast.success(
        t('features.documents.versionControl.restoredTo').replace(
          '{{number}}',
          String(version.versionNumber)
        )
      );

      setIsHistoryDialogOpen(false);
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error(t('features.documents.versionControl.restoreFailed'));
    }
  };

  // Format date
  const formatDate = (timestamp: number | Date) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get creation type badge
  const getCreationTypeBadge = (type: string) => {
    const variants: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
    > = {
      manual: { label: t('features.documents.versionControl.types.manual'), variant: 'default' },
      suggestion_added: {
        label: t('features.documents.versionControl.types.suggestionAdded'),
        variant: 'secondary',
      },
      suggestion_accepted: {
        label: t('features.documents.versionControl.types.accepted'),
        variant: 'outline',
      },
      suggestion_declined: {
        label: t('features.documents.versionControl.types.declined'),
        variant: 'destructive',
      },
    };

    const config = variants[type] || { label: type, variant: 'outline' };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Create Version Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('features.documents.versionControl.createVersion')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('features.documents.versionControl.createNewVersion')}</DialogTitle>
            <DialogDescription>
              {t('features.documents.versionControl.saveCurrentState')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-title">
                {t('features.documents.versionControl.versionTitle')}
              </Label>
              <Input
                id="version-title"
                placeholder={t('features.documents.versionControl.titlePlaceholder')}
                value={versionTitle}
                onChange={e => setVersionTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleCreateVersion();
                  }
                }}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {t('features.documents.versionControl.versionNumber')}: v.
              {versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateVersion} disabled={isCreating || !versionTitle.trim()}>
              {isCreating
                ? t('features.documents.versionControl.creating')
                : t('features.documents.versionControl.createVersion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            {t('features.documents.versionControl.versionHistory')}
            {versions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {versions.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('features.documents.versionControl.versionHistory')}</DialogTitle>
            <DialogDescription>
              {t('features.documents.versionControl.viewAndRestore')}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] pr-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {t('features.documents.versionControl.loadingVersions')}
              </div>
            ) : sortedVersions.length > 0 ? (
              <div className="space-y-4">
                {sortedVersions.map(version => (
                  <div
                    key={version.id}
                    className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">v.{version.versionNumber}</span>
                        <span className="text-sm font-medium">{version.title}</span>
                        {getCreationTypeBadge(version.creationType)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(version.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.creator?.name ||
                            version.creator?.email ||
                            t('features.documents.versionControl.unknown')}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(version)}
                    >
                      {t('features.documents.versionControl.restore')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <History className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {t('features.documents.versionControl.noVersionsYet')}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t('features.documents.versionControl.createFirstVersion')}
                </p>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
