'use client';

/**
 * Unified Version Control Component
 *
 * Provides version history and management for all entity types.
 */

import { useState, useMemo } from 'react';
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
import {
  GitBranch,
  Clock,
  User,
  Plus,
  History,
  Search,
  Pencil,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { db, tx, id } from '@db/db';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import type { EditorEntityType, EditorVersion, VersionCreationType } from '../types';

interface VersionControlProps {
  entityType: EditorEntityType;
  /** Document ID for amendments/documents, blog ID for blogs */
  entityId: string;
  currentContent: any[];
  currentUserId: string;
  onRestoreVersion: (content: any[]) => void;
  /** Amendment-specific props for notifications */
  amendmentId?: string;
  amendmentTitle?: string;
}

export function VersionControl({
  entityType,
  entityId,
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

  // Build the where clause based on entity type
  const whereClause = useMemo(() => {
    if (entityType === 'blog') {
      return { 'blog.id': entityId };
    }
    return { 'document.id': entityId };
  }, [entityType, entityId]);

  // Query all versions for this entity
  const { data: versionsData, isLoading } = db.useQuery({
    documentVersions: {
      $: {
        where: whereClause,
      },
      creator: {},
    },
  });

  const versions = (versionsData?.documentVersions || []) as EditorVersion[];
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  // Filter versions based on search query
  const filteredVersions = useMemo(() => {
    if (!searchQuery.trim()) return sortedVersions;

    const query = searchQuery.toLowerCase();
    return sortedVersions.filter(
      version =>
        version.title.toLowerCase().includes(query) ||
        version.versionNumber.toString().includes(query) ||
        version.creator?.name?.toLowerCase().includes(query)
    );
  }, [sortedVersions, searchQuery]);

  // Create a new version manually
  const handleCreateVersion = async () => {
    if (!versionTitle.trim()) {
      toast.error(t('features.editor.versionControl.enterTitle'));
      return;
    }

    setIsCreating(true);
    try {
      const nextVersionNumber =
        versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1;

      const versionId = id();
      const linkData = entityType === 'blog' ? { blog: entityId } : { document: entityId };

      await db.transact([
        tx.documentVersions[versionId]
          .update({
            versionNumber: nextVersionNumber,
            title: versionTitle,
            content: currentContent,
            createdAt: Date.now(),
            creationType: 'manual' as VersionCreationType,
          })
          .link({ ...linkData, creator: currentUserId }),
      ]);

      toast.success(
        t('features.editor.versionControl.versionCreated').replace(
          '{{number}}',
          String(nextVersionNumber)
        )
      );

      setVersionTitle('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error(t('features.editor.versionControl.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  // Restore a version
  const handleRestoreVersion = async (version: EditorVersion) => {
    try {
      onRestoreVersion(version.content);
      toast.success(
        t('features.editor.versionControl.restoredTo').replace(
          '{{number}}',
          String(version.versionNumber)
        )
      );
      setIsHistoryDialogOpen(false);
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error(t('features.editor.versionControl.restoreFailed'));
    }
  };

  // Start editing a version title
  const startEditingTitle = (version: EditorVersion) => {
    setEditingVersionId(version.id);
    setEditingTitle(version.title);
  };

  // Save edited version title
  const saveEditedTitle = async (versionId: string) => {
    if (!editingTitle.trim()) {
      toast.error(t('features.editor.versionControl.enterTitle'));
      return;
    }

    try {
      await db.transact([
        tx.documentVersions[versionId].update({
          title: editingTitle,
        }),
      ]);
      toast.success(t('features.editor.versionControl.titleUpdated'));
      setEditingVersionId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update version title:', error);
      toast.error(t('features.editor.versionControl.titleUpdateFailed'));
    }
  };

  // Get badge variant for creation type
  const getCreationTypeBadge = (creationType: string) => {
    const typeConfig: Record<
      string,
      { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
    > = {
      manual: { label: t('features.editor.versionControl.types.manual'), variant: 'default' },
      suggestion_added: {
        label: t('features.editor.versionControl.types.suggestionAdded'),
        variant: 'secondary',
      },
      suggestion_accepted: {
        label: t('features.editor.versionControl.types.suggestionAccepted'),
        variant: 'outline',
      },
      suggestion_declined: {
        label: t('features.editor.versionControl.types.suggestionDeclined'),
        variant: 'destructive',
      },
    };

    const config = typeConfig[creationType] || {
      label: creationType,
      variant: 'secondary' as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Format date
  const formatDate = (date: number | Date) => {
    const d = typeof date === 'number' ? new Date(date) : date;
    return d.toLocaleString();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Create Version Button */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('features.editor.versionControl.saveVersion')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('features.editor.versionControl.createVersion')}</DialogTitle>
            <DialogDescription>
              {t('features.editor.versionControl.createDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="version-title">
                {t('features.editor.versionControl.versionTitle')}
              </Label>
              <Input
                id="version-title"
                value={versionTitle}
                onChange={e => setVersionTitle(e.target.value)}
                placeholder={t('features.editor.versionControl.titlePlaceholder')}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleCreateVersion} disabled={isCreating}>
              {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('features.editor.versionControl.save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Button */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            {t('features.editor.versionControl.history')}
            {versions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {versions.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('features.editor.versionControl.versionHistory')}</DialogTitle>
            <DialogDescription>
              {t('features.editor.versionControl.historyDescription')}
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('features.editor.versionControl.searchVersions')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="h-[400px]">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filteredVersions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <GitBranch className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? t('features.editor.versionControl.noMatchingVersions')
                    : t('features.editor.versionControl.noVersions')}
                </p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {filteredVersions.map(version => (
                  <div
                    key={version.id}
                    className="flex items-start justify-between rounded-lg border p-3 hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">v{version.versionNumber}</Badge>
                        {editingVersionId === version.id ? (
                          <div className="flex items-center gap-1">
                            <Input
                              value={editingTitle}
                              onChange={e => setEditingTitle(e.target.value)}
                              className="h-7 w-48"
                              autoFocus
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => saveEditedTitle(version.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={() => setEditingVersionId(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium">{version.title}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={() => startEditingTitle(version)}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        {getCreationTypeBadge(version.creationType)}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(version.createdAt)}
                        </span>
                        {version.creator && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {version.creator.name || version.creator.email}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(version)}
                    >
                      {t('features.editor.versionControl.restore')}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
