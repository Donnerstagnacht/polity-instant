'use client';

/**
 * Unified Editor View Component
 *
 * Main editor view that works with all entity types.
 */

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, ArrowLeft, FileText } from 'lucide-react';
import { ShareButton } from '@/components/shared/ShareButton';
import { useTranslation } from '@/hooks/use-translation';
import { useSuggestionIdAssignment } from '@/hooks/use-suggestion-id-assignment';
import { useEditor } from '../hooks/useEditor';
import { useEditorPresence } from '../hooks/useEditorPresence';
import { useEditorUsers } from '../hooks/useEditorUsers';
import { VersionControl } from './VersionControl';
import { ModeSelector } from './ModeSelector';
import { InviteCollaboratorDialog } from './InviteCollaboratorDialog';
import { EditorHeader } from './EditorHeader';
import {
  handleSuggestionAccepted,
  handleSuggestionDeclined,
  handleVoteOnSuggestion,
} from '../utils/editor-operations';
import type { EditorViewProps, EditorUser, TDiscussion } from '../types';

export function EditorView({
  entityType,
  entityId,
  userId,
  userRecord,
  capabilities: capabilitiesOverride,
  backUrl,
  backLabel,
}: EditorViewProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Main editor hook
  const editorState = useEditor({
    entityType,
    entityId,
    userId,
    capabilities: capabilitiesOverride,
  });

  const {
    entity,
    isLoading,
    title,
    content,
    discussions,
    mode,
    saveStatus,
    hasUnsavedChanges,
    isSavingTitle,
    hasAccess,
    isOwnerOrCollaborator,
    capabilities,
    setTitle,
    setContent,
    setDiscussions,
    setMode,
    restoreVersion,
  } = editorState;

  // Build current user object
  const currentUser: EditorUser | undefined = useMemo(() => {
    if (!userId) return undefined;
    return {
      id: userId,
      name: userRecord?.name || userRecord?.email || 'Anonymous',
      email: userRecord?.email,
      avatarUrl: userRecord?.avatar,
    };
  }, [userId, userRecord]);

  // Get the content entity ID (document ID for amendments, blog ID for blogs)
  const contentEntityId = useMemo(() => {
    if (entityType === 'amendment') {
      return entity?.id || '';
    }
    return entityId;
  }, [entityType, entityId, entity?.id]);

  // Presence hook
  const { onlinePeers, userColor } = useEditorPresence({
    entityId: contentEntityId,
    userId,
    userName: userRecord?.name || userRecord?.email || 'Anonymous',
    userAvatar: userRecord?.avatar,
    enabled: capabilities.presence,
  });

  // Build users map for the editor
  const editorUsers = useEditorUsers(entity, currentUser);

  // Auto-assign suggestion IDs
  useSuggestionIdAssignment({
    documentId: contentEntityId,
    discussions,
    onDiscussionsUpdate: setDiscussions,
  });

  // Get amendment-specific data
  const amendmentId = entity?.metadata?.amendmentId;
  const amendmentTitle = entity?.metadata?.amendmentCode
    ? `${entity.metadata.amendmentCode} - ${title}`
    : title;

  // Handle suggestion accepted
  const onSuggestionAccepted = useCallback(
    async (suggestion: any) => {
      if (!contentEntityId || !userId || !content) return;

      const { updatedDiscussions } = await handleSuggestionAccepted(
        entityType,
        contentEntityId,
        userId,
        content,
        discussions,
        suggestion,
        mode,
        amendmentId,
        amendmentTitle
      );

      setDiscussions(updatedDiscussions);
    },
    [
      entityType,
      contentEntityId,
      userId,
      content,
      discussions,
      mode,
      amendmentId,
      amendmentTitle,
      setDiscussions,
    ]
  );

  // Handle suggestion declined
  const onSuggestionDeclined = useCallback(
    async (suggestion: any) => {
      if (!contentEntityId || !userId || !content) return;

      const { updatedDiscussions } = await handleSuggestionDeclined(
        entityType,
        contentEntityId,
        userId,
        content,
        discussions,
        suggestion,
        mode,
        amendmentId,
        amendmentTitle
      );

      setDiscussions(updatedDiscussions);
    },
    [
      entityType,
      contentEntityId,
      userId,
      content,
      discussions,
      mode,
      amendmentId,
      amendmentTitle,
      setDiscussions,
    ]
  );

  // Handle voting
  const onVoteAccept = useCallback(
    async (suggestion: any) => {
      if (!contentEntityId || !userId || !amendmentId) return;
      await handleVoteOnSuggestion(
        entityType,
        contentEntityId,
        amendmentId,
        userId,
        discussions,
        suggestion,
        'accept'
      );
    },
    [entityType, contentEntityId, amendmentId, userId, discussions]
  );

  const onVoteReject = useCallback(
    async (suggestion: any) => {
      if (!contentEntityId || !userId || !amendmentId) return;
      await handleVoteOnSuggestion(
        entityType,
        contentEntityId,
        amendmentId,
        userId,
        discussions,
        suggestion,
        'reject'
      );
    },
    [entityType, contentEntityId, amendmentId, userId, discussions]
  );

  const onVoteAbstain = useCallback(
    async (suggestion: any) => {
      if (!contentEntityId || !userId || !amendmentId) return;
      await handleVoteOnSuggestion(
        entityType,
        contentEntityId,
        amendmentId,
        userId,
        discussions,
        suggestion,
        'abstain'
      );
    },
    [entityType, contentEntityId, amendmentId, userId, discussions]
  );

  // Get existing collaborator IDs
  const existingCollaboratorIds = useMemo(() => {
    if (!entity) return [];
    const ids = entity.collaborators.map(c => c.user.id);
    if (entity.owner?.id) ids.push(entity.owner.id);
    return ids;
  }, [entity]);

  // Default back navigation
  const defaultBackUrl = useMemo(() => {
    switch (entityType) {
      case 'amendment':
        return `/amendment/${entityId}`;
      case 'blog':
        return `/blog/${entityId}`;
      case 'document':
        return '/editor';
      case 'groupDocument':
        return entity?.metadata?.groupId ? `/group/${entity.metadata.groupId}` : '/';
      default:
        return '/';
    }
  }, [entityType, entityId, entity?.metadata?.groupId]);

  const defaultBackLabel = useMemo(() => {
    switch (entityType) {
      case 'amendment':
        return t('features.editor.navigation.backToAmendment');
      case 'blog':
        return t('features.editor.navigation.backToBlog');
      case 'document':
        return t('features.editor.navigation.backToDocuments');
      case 'groupDocument':
        return t('features.editor.navigation.backToGroup');
      default:
        return t('common.back');
    }
  }, [entityType, t]);

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Not found state
  if (!entity) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            {t('features.editor.errors.notFound')}
          </p>
          <Button onClick={() => router.push(backUrl || defaultBackUrl)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel || defaultBackLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // No access state
  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            {t('features.editor.errors.noAccess')}
          </p>
          <Button onClick={() => router.push(backUrl || defaultBackUrl)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel || defaultBackLabel}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Status badge based on entity type
  const statusBadge = useMemo(() => {
    if (entityType === 'amendment' && entity.metadata?.amendmentStatus) {
      return (
        <Badge variant="outline" className="capitalize">
          {entity.metadata.amendmentStatus}
        </Badge>
      );
    }
    if (entityType === 'blog') {
      return (
        <Badge variant="outline" className="capitalize">
          {entity.isPublic ? 'Public' : 'Private'}
        </Badge>
      );
    }
    return null;
  }, [entityType, entity]);

  return (
    <div className="container mx-auto p-8">
      {/* Top toolbar */}
      <div className="mb-6 flex items-center justify-between">
        <Link href={backUrl || defaultBackUrl}>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backLabel || defaultBackLabel}
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          {/* Share Button */}
          {capabilities.sharing && (
            <ShareButton
              url={`/${entityType}/${entityId}`}
              title={title}
              description={entity.metadata?.amendmentCode || ''}
            />
          )}

          {/* Version Control */}
          {capabilities.versioning && userId && contentEntityId && (
            <VersionControl
              entityType={entityType}
              entityId={contentEntityId}
              currentContent={content}
              currentUserId={userId}
              onRestoreVersion={restoreVersion}
              amendmentId={amendmentId}
              amendmentTitle={amendmentTitle}
            />
          )}

          {/* Mode Selector */}
          {capabilities.modeSelection && (
            <ModeSelector
              entityType={entityType}
              entityId={contentEntityId}
              currentMode={mode}
              isOwnerOrCollaborator={isOwnerOrCollaborator}
              onModeChange={setMode}
            />
          )}

          {/* Invite Collaborators */}
          {capabilities.invites && userId && (
            <InviteCollaboratorDialog
              entityType={entityType}
              entityId={contentEntityId}
              currentUserId={userId}
              entityTitle={title}
              existingCollaboratorIds={existingCollaboratorIds}
            />
          )}

          {statusBadge}
        </div>
      </div>

      {/* Editor Card */}
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8" />
            <EditorHeader
              title={title}
              onTitleChange={setTitle}
              isEditingTitle={isEditingTitle}
              setIsEditingTitle={setIsEditingTitle}
              isSavingTitle={isSavingTitle}
              saveStatus={saveStatus}
              hasUnsavedChanges={hasUnsavedChanges}
              onlinePeers={onlinePeers}
              showPresence={capabilities.presence}
            />
          </div>
          <CardDescription>{t('features.editor.description')}</CardDescription>

          {/* Entity-specific metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {entity.metadata?.amendmentCode && (
              <Badge variant="secondary" className="font-mono">
                {entity.metadata.amendmentCode}
              </Badge>
            )}
            {entity.metadata?.amendmentDate && (
              <span className="text-muted-foreground">
                {t('features.editor.metadata.date')}: {entity.metadata.amendmentDate}
              </span>
            )}
            {entity.metadata?.amendmentSupporters !== undefined && (
              <span className="text-muted-foreground">
                {entity.metadata.amendmentSupporters} {t('features.editor.metadata.supporters')}
              </span>
            )}
            {entity.metadata?.blogUpvotes !== undefined && (
              <span className="text-muted-foreground">
                {entity.metadata.blogUpvotes} {t('features.editor.metadata.upvotes')}
              </span>
            )}
          </div>

          {/* Collaborators list */}
          {entity.collaborators.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {t('features.editor.metadata.collaborators')}:
              </span>
              {entity.collaborators.map(collab => (
                <div
                  key={collab.id}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
                >
                  <Avatar className="h-5 w-5">
                    {collab.user.avatarUrl ? (
                      <AvatarImage src={collab.user.avatarUrl} alt={collab.user.name} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {collab.user.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{collab.user.name || 'Unknown'}</span>
                </div>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="min-h-[600px]">
            <PlateEditor
              key={contentEntityId}
              value={content}
              onChange={setContent}
              documentId={contentEntityId}
              documentTitle={title}
              currentMode={mode}
              onModeChange={capabilities.modeSelection ? setMode : undefined}
              isOwnerOrCollaborator={isOwnerOrCollaborator}
              currentUser={
                currentUser
                  ? {
                      id: currentUser.id,
                      name: currentUser.name,
                      avatar: currentUser.avatarUrl,
                    }
                  : undefined
              }
              users={editorUsers}
              discussions={discussions}
              onDiscussionsChange={setDiscussions}
              onSuggestionAccepted={capabilities.voting ? onSuggestionAccepted : undefined}
              onSuggestionDeclined={capabilities.voting ? onSuggestionDeclined : undefined}
              onVoteAccept={capabilities.voting ? onVoteAccept : undefined}
              onVoteReject={capabilities.voting ? onVoteReject : undefined}
              onVoteAbstain={capabilities.voting ? onVoteAbstain : undefined}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
