'use client';

/**
 * @deprecated This component is deprecated. Use `VersionControl` from `@/features/editor` instead.
 * Import: `import { VersionControl } from '@/features/editor';`
 * Usage: `<VersionControl entityType="blog" entityId={blogId} ... />`
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
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation';

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
  blogId: string;
  currentContent: any[];
  currentUserId: string;
  onRestoreVersion: (content: any[]) => void;
}

export function VersionControl({
  blogId,
  currentContent,
  currentUserId,
  onRestoreVersion,
}: VersionControlProps) {
  const { t } = useTranslation();
  const { versions: versionsRaw } = useBlogState({ blogId, includeVersions: true });
  const { createVersion, updateVersion } = useDocumentActions();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [versionTitle, setVersionTitle] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVersionId, setEditingVersionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const versions = (versionsRaw || []).map(v => ({
    id: v.id,
    versionNumber: v.version_number,
    title: v.change_summary || '',
    content: v.content as any[],
    createdAt: v.created_at,
    creationType: 'manual',
    creator: v.author ? { id: v.author.id, email: v.author.email, name: v.author.first_name, avatar: v.author.avatar } : undefined,
  })) as Version[];
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
      toast.error(t('features.blogs.versionControl.enterTitle'));
      return;
    }

    setIsCreating(true);
    try {
      const nextVersionNumber =
        versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1;

      const versionId = crypto.randomUUID();
      await createVersion({
        id: versionId,
        document_id: null,
        amendment_id: null,
        blog_id: blogId,
        version_number: nextVersionNumber,
        change_summary: versionTitle,
        content: currentContent,
      });

      toast.success(
        `${t('features.blogs.versionControl.versionNumber')} ${nextVersionNumber} ${t('features.blogs.versionControl.createdSuccess')}`
      );

      setVersionTitle('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create version:', error);
      toast.error(t('features.blogs.versionControl.createFailed'));
    } finally {
      setIsCreating(false);
    }
  };

  // Restore a specific version
  const handleRestoreVersion = async (version: Version) => {
    try {
      onRestoreVersion(version.content);

      toast.success(`${t('features.blogs.versionControl.restoredTo')} ${version.versionNumber}`);

      setIsHistoryDialogOpen(false);
    } catch (error) {
      console.error('Failed to restore version:', error);
      toast.error(t('features.blogs.versionControl.restoreFailed'));
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

  // Update version title
  const handleUpdateVersionTitle = async (versionId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error(t('features.blogs.versionControl.titleEmpty'));
      return;
    }

    try {
      await updateVersion({
        id: versionId,
        change_summary: newTitle,
      });

      toast.success(t('features.blogs.versionControl.titleUpdated'));

      setEditingVersionId(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to update version title:', error);
      toast.error(t('features.blogs.versionControl.updateFailed'));
    }
  };

  // Get creation type badge
  const getCreationTypeBadge = (type: string) => {
    const variants: Record<
      string,
      { labelKey: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
    > = {
      manual: { labelKey: 'features.blogs.versionControl.creationType.manual', variant: 'default' },
      suggestion_added: {
        labelKey: 'features.blogs.versionControl.creationType.suggestionAdded',
        variant: 'secondary',
      },
      suggestion_accepted: {
        labelKey: 'features.blogs.versionControl.creationType.suggestionAccepted',
        variant: 'outline',
      },
      suggestion_declined: {
        labelKey: 'features.blogs.versionControl.creationType.suggestionDeclined',
        variant: 'destructive',
      },
    };

    const config = variants[type] || { labelKey: type, variant: 'outline' };
    return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
  };

  return (
    <div className="flex items-center gap-2">
      {/* Create Version Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t('features.blogs.versionControl.createVersion')}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('features.blogs.versionControl.createNewVersion')}</DialogTitle>
            <DialogDescription>
              {t('features.blogs.versionControl.saveCurrentState')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="version-title">
                {t('features.blogs.versionControl.versionTitle')}
              </Label>
              <Input
                id="version-title"
                placeholder={t('features.blogs.versionControl.versionTitlePlaceholder')}
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
              {t('features.blogs.versionControl.versionNumber')}: v.
              {versions.length > 0 ? Math.max(...versions.map(v => v.versionNumber)) + 1 : 1}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateVersion} disabled={isCreating || !versionTitle.trim()}>
              {isCreating
                ? t('features.blogs.versionControl.creating')
                : t('features.blogs.versionControl.createVersion')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <History className="mr-2 h-4 w-4" />
            {t('features.blogs.versionControl.versionHistory')}
            {versions.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {versions.length}
              </Badge>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('features.blogs.versionControl.versionHistory')}</DialogTitle>
            <DialogDescription>
              {t('features.blogs.versionControl.viewAndRestore')}
            </DialogDescription>
          </DialogHeader>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('features.blogs.versionControl.searchPlaceholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-[400px] pr-4">
            {!versionsRaw ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                {t('features.blogs.versionControl.loadingVersions')}
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
                        <span className="font-semibold">v.{version.versionNumber}</span>

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
                            <span className="text-sm font-medium">{version.title}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
                              onClick={() => {
                                setEditingVersionId(version.id);
                                setEditingTitle(version.title);
                              }}
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                          </>
                        )}

                        {getCreationTypeBadge(version.creationType)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(version.createdAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.creator?.name || version.creator?.email || 'Unknown'}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestoreVersion(version)}
                    >
                      {t('features.blogs.versionControl.restore')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <History className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery
                    ? t('features.blogs.versionControl.noVersionsFound')
                    : t('features.blogs.versionControl.noVersionsYet')}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground">
                    {t('features.blogs.versionControl.createFirstVersion')}
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
