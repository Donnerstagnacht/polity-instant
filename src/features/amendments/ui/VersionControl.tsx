'use client';

/**
 * @deprecated This component is deprecated. Use `VersionControl` from `@/features/editor` instead.
 * Import: `import { VersionControl } from '@/features/editor';`
 * Usage: `<VersionControl entityType="amendment" entityId={amendmentId} ... />`
 */

import { useState, useMemo } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/features/shared/ui/ui/dialog';
import { Input } from '@/features/shared/ui/ui/input';
import { Label } from '@/features/shared/ui/ui/label';
import { Badge } from '@/features/shared/ui/ui/badge';
import { ScrollArea } from '@/features/shared/ui/ui/scroll-area';
import { GitBranch, Clock, User, Plus, History, Search, Pencil, Check, X } from 'lucide-react';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { toast } from 'sonner';
import type { Value } from 'platejs';
import { notifyVersionCreated } from '@/features/notifications/utils/notification-helpers.ts';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import type { DocumentVersionRow } from '@/zero/documents/queries';

interface VersionControlProps {
  documentId: string;
  currentContent: Value;
  currentUserId: string;
  onRestoreVersion: (content: Value) => void;
  amendmentId?: string;
  amendmentTitle?: string;
}

export function VersionControl({
  documentId,
  currentContent,
  currentUserId,
  onRestoreVersion,
  amendmentId,
  amendmentTitle,
}: VersionControlProps) {
  const { t } = useTranslation();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [versionTitle, setVersionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const { createVersion, updateVersion } = useDocumentActions();

  const { documentVersions: versionsResult } = useAmendmentState({
    includeDocumentVersions: true,
    documentId,
  });

  const versions = (versionsResult || []) as DocumentVersionRow[];
  const sortedVersions = [...versions].sort((a, b) => (b.version_number ?? 0) - (a.version_number ?? 0));

  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) return sortedVersions;

    const query = searchQuery.toLowerCase();
    return sortedVersions.filter(
      version =>
        (version.change_summary ?? '').toLowerCase().includes(query) ||
        (version.version_number ?? 0).toString().includes(query) ||
        [version.author?.first_name, version.author?.last_name].filter(Boolean).join(' ').toLowerCase().includes(query)
    );
  }, [sortedVersions, searchQuery]);

  const handleCreateVersion = async () => {
    if (!versionTitle.trim()) {
      toast.error(t('features.amendments.versionControl.enterTitle'));
      return;
    }

    setIsCreating(true);
    try {
      const nextVersionNumber =
        versions.length > 0 ? Math.max(...versions.map(v => v.version_number ?? 0)) + 1 : 1;

      const versionId = crypto.randomUUID();

      await createVersion({
        id: versionId,
        document_id: documentId,
        amendment_id: null,
        blog_id: null,
        version_number: nextVersionNumber,
        change_summary: versionTitle,
        content: JSON.stringify(currentContent) as import('@rocicorp/zero').ReadonlyJSONValue,
      });

      // Send notification to amendment subscribers if amendmentId is provided
      if (amendmentId) {
        await notifyVersionCreated({
          senderId: currentUserId,
          amendmentId,
          amendmentTitle: amendmentTitle || 'Untitled Amendment',
          version: `v.${nextVersionNumber}`,
        });
      }

      toast.success(
        `${t('features.amendments.versionControl.versionNumber')} ${nextVersionNumber} ${t('features.amendments.versionControl.createdSuccess')}`
      );

      setVersionTitle('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error(t('features.amendments.versionControl.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestoreVersion = async (version: DocumentVersionRow) => {
    try {
      onRestoreVersion(version.content as Value);

      toast.success(
        `${t('features.amendments.versionControl.restoredTo')} ${version.version_number ?? 0}`
      );

      setIsHistoryDialogOpen(false);
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error(t('features.amendments.versionControl.restoreFailed'));
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleUpdateVersionTitle = async (versionId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error(t('features.amendments.versionControl.titleEmpty'));
      return;
    }

    try {
      await updateVersion({
        id: versionId,
        change_summary: newTitle,
      });

      toast.success(t('features.amendments.versionControl.titleUpdated'));

      setEditingVersionId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update version title:', error);
      toast.error(t('features.amendments.versionControl.updateFailed'));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('features.amendments.versionControl.createVersion')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('features.amendments.versionControl.createNewVersion')}</DialogTitle>
            <DialogDescription>
              {t('features.amendments.versionControl.saveCurrentState')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-title">
                {t('features.amendments.versionControl.versionTitle')}
              </Label>
              <Input
                id="version-title"
                placeholder={t('features.amendments.versionControl.versionTitlePlaceholder')}
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
              {t('features.amendments.versionControl.versionNumber')}: v.
              {versions.length > 0 ? Math.max(...versions.map(v => v.version_number ?? 0)) + 1 : 1}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateVersion} disabled={isCreating || !versionTitle.trim()}>
              {isCreating
                ? t('features.amendments.versionControl.creating')
                : t('features.amendments.versionControl.createVersion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            {t('features.amendments.versionControl.versionHistory')}
            {versions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {versions.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('features.amendments.versionControl.versionHistory')}</DialogTitle>
            <DialogDescription>
              {t('features.amendments.versionControl.viewAndRestore')}
            </DialogDescription>
          </DialogHeader>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('features.amendments.versionControl.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {!versionsResult ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {t('features.amendments.versionControl.loadingVersions')}
              </div>
            ) : filteredVersions.length > 0 ? (
              <div className="space-y-4">
                {filteredVersions.map(version => (
                  <div
                    key={version.id}
                    className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">v.{version.version_number ?? 0}</span>

                        {editingVersionId === version.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              className="h-7 text-sm"
                              autoFocus
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  handleUpdateVersionTitle(version.id, editingTitle);
                                } else if (e.key === 'Escape') {
                                  setEditingVersionId(null);
                                  setEditingTitle('');
                                }
                              }}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => handleUpdateVersionTitle(version.id, editingTitle)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2"
                              onClick={() => {
                                setEditingVersionId(null);
                                setEditingTitle('');
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium">{version.change_summary ?? ''}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingVersionId(version.id);
                                setEditingTitle(version.change_summary ?? '');
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(version.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {[version.author?.first_name, version.author?.last_name].filter(Boolean).join(' ') || version.author?.email || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(version)}
                    >
                      {t('features.amendments.versionControl.restore')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <History className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? t('features.amendments.versionControl.noVersionsFound')
                    : t('features.amendments.versionControl.noVersionsYet')}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    {t('features.amendments.versionControl.createFirstVersion')}
                  </p>
                )}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
