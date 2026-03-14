/**
 * Main document editor view component for Amendments
 *
 * Uses the unified editor system from @/features/editor
 */

import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Link } from '@tanstack/react-router';
import { PlateEditor } from '@/features/shared/ui/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/features/shared/ui/ui/card';
import { Button } from '@/features/shared/ui/ui/button';
import { Input } from '@/features/shared/ui/ui/input';
import { Badge } from '@/features/shared/ui/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Loader2, Users, Eye, ArrowLeft, FileText, Pencil } from 'lucide-react';
import { ShareButton } from '@/features/shared/ui/action-buttons/ShareButton.tsx';
import { useNavigationStore } from '@/features/navigation/state/navigation.store';
import { useScreenStore } from '@/features/shared/global-state/screen.store';
import { useNavigation } from '@/features/navigation/state/useNavigation';
import { useSuggestionIdAssignment } from '@/features/documents/hooks/use-suggestion-id-assignment.ts';

// Unified editor imports
import {
  useEditor,
  useEditorPresence,
  useEditorUsers,
  VersionControl,
  type EditorUser,
  type EditorMode,
} from '@/features/editor';
import type { ResolvedSuggestion } from '@/features/shared/ui/ui-platejs/block-suggestion.tsx';
import { useEditorOperations } from '@/features/editor/hooks/useEditorOperations';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';

interface DocumentEditorViewProps {
  amendmentId: string;
  userId: string | undefined;
  userRecord: { id: string; name?: string; email?: string; avatar?: string } | undefined;
  userColor: string;
}

export function DocumentEditorView({
  amendmentId,
  userId,
  userRecord,
  userColor,
}: DocumentEditorViewProps) {
  const navigate = useNavigate();
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Navigation state
  const { navigationView, navigationType } = useNavigationStore();
  const { isMobileScreen } = useScreenStore();
  const { secondaryNavItems } = useNavigation();

  // Unified editor hook
  const {
    entity,
    title: documentTitle,
    content: editorValue,
    discussions,
    mode,
    saveStatus,
    hasUnsavedChanges,
    isSavingTitle,
    isLoading: amendmentLoading,
    hasAccess,
    isOwnerOrCollaborator,
    setTitle: handleTitleChange,
    setContent: handleContentChange,
    setDiscussions,
    setMode: handleModeChange,
    restoreVersion: handleRestoreVersion,
  } = useEditor({
    entityType: 'amendment',
    entityId: amendmentId,
    userId,
  });

  // Query amendment and document data for additional metadata
  const { amendmentDocsCollabs: amendmentResults } = useAmendmentState({
    amendmentId,
    includeDocsAndCollabs: true,
  });
  const amendment = amendmentResults;
  const document = amendment?.documents?.[0];

  // Build discussions with votes for UI
  const discussionsWithVotes = useMemo(() => {
    return discussions.map((d) => ({
      ...d,
      votes: d.votes || [],
    }));
  }, [discussions]);

  // Auto-assign suggestion IDs
  useSuggestionIdAssignment({
    documentId: document?.id || '',
    discussions,
    onDiscussionsUpdate: setDiscussions,
  });

  // Editor operations (suggestion accept/decline/vote via Zero)
  const editorOps = useEditorOperations('amendment', document?.id || '');

  // Presence
  const { onlinePeers } = useEditorPresence({
    entityId: document?.id || '',
    userId,
    userName: userRecord?.name || userRecord?.email || 'Anonymous',
    userAvatar: userRecord?.avatar,
    enabled: !!document?.id,
  });

  // Build current user for hooks
  const currentUser: EditorUser | undefined = userId
    ? {
        id: userId,
        name: userRecord?.name || userRecord?.email || 'Anonymous',
        email: userRecord?.email,
        avatarUrl: userRecord?.avatar,
      }
    : undefined;

  // Build users map for the editor
  const editorUsers = useEditorUsers(entity, currentUser);

  // Calculate dynamic top margin based on secondary navigation
  const getTopMargin = useMemo(() => {
    const isSecondaryNavVisible =
      secondaryNavItems &&
      secondaryNavItems.length > 0 &&
      ['secondary', 'combined'].includes(navigationType);

    if (isMobileScreen && isSecondaryNavVisible && navigationView !== 'asButton') {
      if (navigationView === 'asButtonList') return 'mt-8';
      if (navigationView === 'asLabeledButtonList') return 'mt-8';
    }

    return 'mt-8';
  }, [isMobileScreen, secondaryNavItems, navigationType, navigationView]);

  // Handlers
  const onSuggestionAccepted = useCallback(
    async (suggestion: ResolvedSuggestion) => {
      if (!document?.id || !userId || !editorValue || !amendment?.id) return;

      const { updatedDiscussions } = await editorOps.handleSuggestionAccepted(
        userId,
        editorValue,
        discussions,
        suggestion,
        document.editing_mode as EditorMode,
        amendment.id,
      );

      setDiscussions(updatedDiscussions);
    },
    [
      document?.id,
      document?.editing_mode,
      userId,
      editorValue,
      discussions,
      amendment?.id,
      setDiscussions,
      editorOps,
    ]
  );

  const onSuggestionDeclined = useCallback(
    async (suggestion: ResolvedSuggestion) => {
      if (!document?.id || !userId || !editorValue || !amendment?.id) return;

      const { updatedDiscussions } = await editorOps.handleSuggestionDeclined(
        userId,
        editorValue,
        discussions,
        suggestion,
        document.editing_mode as EditorMode,
        amendment.id,
      );

      setDiscussions(updatedDiscussions);
    },
    [
      document?.id,
      document?.editing_mode,
      userId,
      editorValue,
      discussions,
      amendment?.id,
      setDiscussions,
      editorOps,
    ]
  );

  const handleVote = useCallback(
    async (suggestion: ResolvedSuggestion, voteType: 'accept' | 'reject' | 'abstain') => {
      if (!document?.id || !userId || !amendment?.id) return;

      await editorOps.handleVoteOnSuggestion(
        amendment.id,
        userId,
        discussions,
        suggestion,
        voteType
      );
    },
    [document?.id, userId, amendment?.id, discussions, editorOps]
  );

  const handleVoteAccept = useCallback(
    (suggestion: ResolvedSuggestion) => handleVote(suggestion, 'accept'),
    [handleVote]
  );
  const handleVoteReject = useCallback(
    (suggestion: ResolvedSuggestion) => handleVote(suggestion, 'reject'),
    [handleVote]
  );
  const handleVoteAbstain = useCallback(
    (suggestion: ResolvedSuggestion) => handleVote(suggestion, 'abstain'),
    [handleVote]
  );

  // Check if user is owner or collaborator (supplementary check from queried data)
  // Note: This check is currently unused and may be removed in the future
  const isOwnerOrCollabFromData =
    (document &&
      document.collaborators?.some((c: { user?: { id: string } }) => c.user?.id === userId)) ||
    amendment?.collaborators?.some(
      (c: { user?: { id: string }; status?: string | null }) => c.user?.id === userId && c.status === 'admin'
    );

  if (amendmentLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!amendment || !document) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            Amendment or document not found. The amendment may not have a document yet.
          </p>
          <Button onClick={() => navigate({ to: `/amendment/${amendmentId}` })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Amendment
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasAccess) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <p className="mb-4 text-lg text-muted-foreground">
            You don't have access to this amendment document.
          </p>
          <Button onClick={() => navigate({ to: `/amendment/${amendmentId}` })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Amendment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <div className={`mb-6 flex items-center justify-between ${getTopMargin}`}>
        <Link to="/amendment/$id" params={{ id: amendmentId }}>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Amendment
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          {/* Share Button */}
          <ShareButton
            url={`/amendment/${amendmentId}/text`}
            title={documentTitle || amendment.title || ''}
            description={amendment.code || ''}
          />

          {/* Unified Version Control */}
          {userId && document?.id && (
            <VersionControl
              entityType="amendment"
              entityId={document.id}
              currentContent={editorValue}
              currentUserId={userId}
              onRestoreVersion={handleRestoreVersion}
              amendmentId={amendmentId}
              amendmentTitle={amendment?.title ?? undefined}
            />
          )}

          {/* Active users indicator */}
          {onlinePeers.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {onlinePeers.length} {onlinePeers.length === 1 ? 'user' : 'users'} online
              </span>
              <div className="flex -space-x-2">
                {onlinePeers.map((peer) => (
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
              </div>
            </div>
          )}

          {amendment.status && (
            <Badge variant="outline" className="capitalize">
              {amendment.status}
            </Badge>
          )}
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center gap-4">
            <FileText className="h-8 w-8" />
            <div className="flex-1">
              {isEditingTitle ? (
                <Input
                  value={documentTitle}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                  placeholder="Amendment Title"
                  autoFocus
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setIsEditingTitle(false);
                    }
                  }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-bold">{documentTitle || 'Untitled Amendment'}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setIsEditingTitle(true)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {saveStatus === 'saving' || isSavingTitle ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <span className="text-destructive">⚠️ Save failed</span>
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <span className="text-yellow-600">Unsaved changes</span>
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3" />
                  <span>All changes saved</span>
                </>
              )}
            </div>
          </div>
          <CardDescription>
            Edit the full text of this amendment. Changes are saved automatically as you type.
          </CardDescription>

          {/* Amendment metadata */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
            {amendment.code && (
              <Badge variant="secondary" className="font-mono">
                {amendment.code}
              </Badge>
            )}
            {amendment.created_at && (
              <span className="text-muted-foreground">Date: {new Date(amendment.created_at).toLocaleDateString()}</span>
            )}
            {amendment.supporters !== undefined && (
              <span className="text-muted-foreground">{amendment.supporters} supporters</span>
            )}
          </div>

          {/* Collaborators list */}
          {document.collaborators && document.collaborators.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Collaborators:</span>
              {document.collaborators.map((collab: { id: string; user?: { first_name?: string | null; last_name?: string | null; avatar?: string | null } }) => (
                <div
                  key={collab.id}
                  className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
                >
                  <Avatar className="h-5 w-5">
                    {collab.user?.avatar ? (
                      <AvatarImage src={collab.user.avatar} alt={[collab.user.first_name, collab.user.last_name].filter(Boolean).join(' ') || ''} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {collab.user?.first_name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs">{[collab.user?.first_name, collab.user?.last_name].filter(Boolean).join(' ') || 'Unknown'}</span>
                </div>
              ))}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="min-h-[600px]">
            <PlateEditor
              key={document.id}
              value={editorValue}
              onChange={handleContentChange}
              documentId={document.id}
              documentTitle={documentTitle}
              currentMode={mode || 'suggest'}
              onModeChange={handleModeChange}
              isOwnerOrCollaborator={!!(isOwnerOrCollaborator || isOwnerOrCollabFromData)}
              currentUser={
                userId && userRecord
                  ? {
                      id: userId,
                      name: userRecord.name || userRecord.email || 'Anonymous',
                      avatar: userRecord.avatar,
                    }
                  : undefined
              }
              users={editorUsers}
              discussions={discussionsWithVotes}
              onDiscussionsChange={setDiscussions}
              onSuggestionAccepted={onSuggestionAccepted}
              onSuggestionDeclined={onSuggestionDeclined}
              onVoteAccept={handleVoteAccept}
              onVoteReject={handleVoteReject}
              onVoteAbstain={handleVoteAbstain}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
