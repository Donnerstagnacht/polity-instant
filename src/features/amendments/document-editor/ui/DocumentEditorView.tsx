/**
 * Main document editor view component for Amendments
 *
 * Uses the unified editor system from @/features/editor
 */

import { useCallback, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users, Eye, ArrowLeft, FileText, Pencil } from 'lucide-react';
import { ShareButton } from '@/components/shared/ShareButton';
import { useNavigationStore } from '@/navigation/state/navigation.store';
import { useScreenStore } from '@/global-state/screen.store';
import { useNavigation } from '@/navigation/state/useNavigation';
import { useSuggestionIdAssignment } from '@/hooks/use-suggestion-id-assignment';

// Unified editor imports
import {
  useEditor,
  useEditorPresence,
  useEditorUsers,
  VersionControl,
  handleSuggestionAccepted,
  handleSuggestionDeclined,
  handleVoteOnSuggestion,
  type EditorUser,
  type EditorMode,
} from '@/features/editor';
import db from '@db/db';

interface DocumentEditorViewProps {
  amendmentId: string;
  userId: string | undefined;
  userRecord: any;
  userColor: string;
}

export function DocumentEditorView({
  amendmentId,
  userId,
  userRecord,
  userColor,
}: DocumentEditorViewProps) {
  const router = useRouter();
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
  const { data: amendmentData } = db.useQuery({
    amendments: {
      $: { where: { id: amendmentId } },
      document: {
        collaborators: {
          user: {},
        },
      },
      amendmentRoleCollaborators: {
        user: {},
      },
    },
  });
  const amendment = amendmentData?.amendments?.[0];
  const document = amendment?.document;

  // Build discussions with votes for UI
  const discussionsWithVotes = useMemo(() => {
    return discussions.map((d: any) => ({
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
    async (suggestion: any) => {
      if (!document?.id || !userId || !editorValue || !amendment?.id) return;

      const { updatedDiscussions } = await handleSuggestionAccepted(
        'amendment',
        document.id,
        userId,
        editorValue,
        discussions,
        suggestion,
        document.editingMode as EditorMode,
        amendment.id,
        amendment.title
      );

      setDiscussions(updatedDiscussions);
    },
    [
      document?.id,
      document?.editingMode,
      userId,
      editorValue,
      discussions,
      amendment?.id,
      amendment?.title,
      setDiscussions,
    ]
  );

  const onSuggestionDeclined = useCallback(
    async (suggestion: any) => {
      if (!document?.id || !userId || !editorValue || !amendment?.id) return;

      const { updatedDiscussions } = await handleSuggestionDeclined(
        'amendment',
        document.id,
        userId,
        editorValue,
        discussions,
        suggestion,
        document.editingMode as EditorMode,
        amendment.id,
        amendment.title
      );

      setDiscussions(updatedDiscussions);
    },
    [
      document?.id,
      document?.editingMode,
      userId,
      editorValue,
      discussions,
      amendment?.id,
      amendment?.title,
      setDiscussions,
    ]
  );

  const handleVote = useCallback(
    async (suggestion: any, voteType: 'accept' | 'reject' | 'abstain') => {
      if (!document?.id || !userId || !amendment?.id) return;

      await handleVoteOnSuggestion(
        'amendment',
        document.id,
        amendment.id,
        userId,
        discussions,
        suggestion,
        voteType
      );
    },
    [document?.id, userId, amendment?.id, discussions]
  );

  const handleVoteAccept = useCallback(
    (suggestion: any) => handleVote(suggestion, 'accept'),
    [handleVote]
  );
  const handleVoteReject = useCallback(
    (suggestion: any) => handleVote(suggestion, 'reject'),
    [handleVote]
  );
  const handleVoteAbstain = useCallback(
    (suggestion: any) => handleVote(suggestion, 'abstain'),
    [handleVote]
  );

  // Check if user is owner or collaborator (supplementary check from queried data)
  // Note: This check is currently unused and may be removed in the future
  const isOwnerOrCollabFromData =
    (document &&
      ((document as any).owner?.id === userId ||
        document.collaborators?.some((c: any) => c.user?.id === userId))) ||
    amendment?.amendmentRoleCollaborators?.some(
      (c: any) => c.user?.id === userId && c.status === 'admin'
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
          <Button onClick={() => router.push(`/amendment/${amendmentId}`)}>
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
          <Button onClick={() => router.push(`/amendment/${amendmentId}`)}>
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
        <Link href={`/amendment/${amendmentId}`}>
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Amendment
          </Button>
        </Link>

        <div className="flex items-center gap-4">
          {/* Share Button */}
          <ShareButton
            url={`/amendment/${amendmentId}/text`}
            title={documentTitle || amendment.title}
            description={amendment.subtitle || amendment.code || ''}
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
              amendmentTitle={amendment?.title}
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
                {onlinePeers.map((peer: any) => (
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
            {amendment.date && (
              <span className="text-muted-foreground">Date: {amendment.date}</span>
            )}
            {amendment.supporters !== undefined && (
              <span className="text-muted-foreground">{amendment.supporters} supporters</span>
            )}
          </div>

          {/* Collaborators list */}
          {document.collaborators && document.collaborators.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Collaborators:</span>
              {document.collaborators.map((collab: any) => (
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
