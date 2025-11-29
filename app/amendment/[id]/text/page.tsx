'use client';

import { use, useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db, tx, id } from '../../../../db';
import { Loader2, Users, Eye, ArrowLeft, FileText, Pencil } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';
import Link from 'next/link';
import { VersionControl } from './version-control';
import { createDocumentVersion } from './version-utils';
import { ShareButton } from '@/components/shared/ShareButton';
import { useNavigationStore } from '@/navigation/state/navigation.store';
import { useScreenStore } from '@/global-state/screen.store';
import { useSuggestionIdAssignment } from '@/hooks/use-suggestion-id-assignment';
import { useNavigation } from '@/navigation/state/useNavigation';

const DEFAULT_CONTENT = [
  {
    type: 'p',
    children: [{ text: 'Start typing the amendment text...' }],
  },
];

export default function AmendmentTextPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = db.useAuth();
  const { toast } = useToast();
  const amendmentId = resolvedParams.id;

  // Navigation state
  const { navigationView, navigationType } = useNavigationStore();
  const { isMobileScreen } = useScreenStore();
  const { secondaryNavItems } = useNavigation();

  // State
  const [documentTitle, setDocumentTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editorValue, setEditorValue] = useState<any[] | null>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);

  // Refs to prevent re-renders and update loops
  const isInitialized = useRef(false);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);
  const isLocalChange = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);
  const lastDiscussionsSave = useRef<number>(0);

  // Get user data for presence
  const { data: userData } = db.useQuery({
    $users: {
      $: { where: { id: user?.id } },
    },
  });
  const userRecord = userData?.$users?.[0];

  // Generate a consistent color for this user
  const userColor = useMemo(
    () => (user?.id ? `hsl(${parseInt(user.id.substring(0, 8), 16) % 360}, 70%, 50%)` : '#888888'),
    [user?.id]
  );

  // Query amendment with its document
  const { data: amendmentData, isLoading: amendmentLoading } = db.useQuery({
    amendments: {
      $: { where: { id: amendmentId } },
      document: {
        owner: {},
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

  // Fetch changeRequests with votes for this amendment
  const { data: changeRequestsData } = db.useQuery(
    amendment?.id
      ? {
          changeRequests: {
            $: {
              where: {
                'amendment.id': amendment.id,
              },
            },
            votes: {
              voter: {},
            },
          },
        }
      : null
  );

  const changeRequests = changeRequestsData?.changeRequests || [];

  // Auto-assign suggestion IDs
  useSuggestionIdAssignment({
    documentId: document?.id || '',
    discussions,
    onDiscussionsUpdate: setDiscussions,
  });

  // Create room for presence using document ID (use a placeholder if no document yet)
  const room = db.room('editor', document?.id || 'placeholder');

  // Presence hook - show who's online (always call the hook)
  const { peers, publishPresence } = db.rooms.usePresence(room, {
    initialData: {
      name: userRecord?.name || user?.email || 'Anonymous',
      avatar: userRecord?.avatar,
      color: userColor,
      userId: user?.id || '',
    },
  });

  // Update presence when user changes
  useEffect(() => {
    if (userRecord && publishPresence) {
      publishPresence({
        name: userRecord.name || user?.email || 'Anonymous',
        avatar: userRecord.avatar,
        color: userColor,
        userId: user?.id || '',
      });
    }
  }, [userRecord, publishPresence, userColor, user?.email, user?.id]);

  // Get online peers (excluding current user)
  const onlinePeers = useMemo(
    () => Object.values(peers).filter((peer: any) => peer.userId !== user?.id),
    [peers, user?.id]
  );

  // Build users map for the editor (includes current user, owner, and all collaborators)
  const editorUsers = useMemo(() => {
    const users: Record<string, { id: string; name: string; avatarUrl: string }> = {};

    // Add current user
    if (user && userRecord) {
      users[user.id] = {
        id: user.id,
        name: userRecord.name || user.email || 'Anonymous',
        avatarUrl: userRecord.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`,
      };
    }

    // Add document owner
    if (document?.owner) {
      const owner = document.owner;
      users[owner.id] = {
        id: owner.id,
        name: owner?.name || owner.email || 'Owner',
        avatarUrl: owner?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${owner.id}`,
      };
    }

    // Add all collaborators
    if (document?.collaborators) {
      document.collaborators.forEach((collab: any) => {
        const collabUser = collab.user;
        if (collabUser?.id) {
          users[collabUser.id] = {
            id: collabUser.id,
            name: collabUser?.name || collabUser.email || 'Collaborator',
            avatarUrl:
              collabUser?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${collabUser.id}`,
          };
        }
      });
    }

    return users;
  }, [user, userRecord, document?.owner, document?.collaborators]);

  // Calculate dynamic top margin based on secondary navigation
  const getTopMargin = useMemo(() => {
    // Check if secondary navigation should be visible
    const isSecondaryNavVisible =
      secondaryNavItems &&
      secondaryNavItems.length > 0 &&
      ['secondary', 'combined'].includes(navigationType);

    // On mobile, when secondary nav is visible and displayed as top bar
    if (isMobileScreen && isSecondaryNavVisible && navigationView !== 'asButton') {
      if (navigationView === 'asButtonList') return 'mt-8'; // Base mt-8 + 64px for secondary nav
      if (navigationView === 'asLabeledButtonList') return 'mt-8'; // Base mt-8 + 80px for secondary nav
    }

    return 'mt-8'; // Default margin
  }, [isMobileScreen, secondaryNavItems, navigationType, navigationView]);

  // Initialize document data
  useEffect(() => {
    if (document && !isInitialized.current) {
      setDocumentTitle(document.title || '');
      setEditorValue(document.content || DEFAULT_CONTENT);
      setDiscussions((document as any).discussions || []);
      isInitialized.current = true;
    }
  }, [document]);

  // Sync discussions from database in real-time
  useEffect(() => {
    if (!document || !isInitialized.current) return;

    const remoteDiscussions = (document as any).discussions || [];
    const localDiscussionsStr = JSON.stringify(discussions);
    const remoteDiscussionsStr = JSON.stringify(remoteDiscussions);

    if (
      localDiscussionsStr !== remoteDiscussionsStr &&
      Date.now() - lastDiscussionsSave.current > 2000
    ) {
      setDiscussions(remoteDiscussions);
    }
  }, [(document as any)?.discussions]);

  // Merge votes into discussions for display in editor
  const discussionsWithVotes = useMemo(() => {
    if (!discussions || discussions.length === 0) return discussions;

    const enriched = discussions.map((discussion: any) => {
      // Find matching changeRequest by crId (stored in title field)
      const matchingChangeRequest = changeRequests.find((cr: any) => cr.title === discussion.crId);

      if (matchingChangeRequest && matchingChangeRequest.votes) {
        // Add votes to the discussion
        return {
          ...discussion,
          votes: matchingChangeRequest.votes.map((vote: any) => ({
            id: vote.id,
            vote: vote.vote,
            voterId: vote.voter?.id,
          })),
        };
      }

      return discussion;
    });
    return enriched;
  }, [discussions, changeRequests]);

  // Sync remote updates without destroying local selection
  useEffect(() => {
    if (!document || !isInitialized.current) return;

    const remoteUpdatedAt = document.updatedAt
      ? typeof document.updatedAt === 'number'
        ? document.updatedAt
        : new Date(document.updatedAt).getTime()
      : 0;

    const remoteContent = document.content || DEFAULT_CONTENT;
    const hasRemoteChanges = JSON.stringify(remoteContent) !== JSON.stringify(editorValue);

    if (
      remoteUpdatedAt > lastRemoteUpdate.current &&
      hasRemoteChanges &&
      !isLocalChange.current &&
      Date.now() - lastSaveTime.current > 1500
    ) {
      setEditorValue(remoteContent);
      lastRemoteUpdate.current = remoteUpdatedAt;
    }
  }, [document?.content, document?.updatedAt, editorValue]);

  // Reset local change flag
  useEffect(() => {
    if (isLocalChange.current) {
      const timeout = setTimeout(() => {
        isLocalChange.current = false;
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [document?.content]);

  // Get document content from the database (memoized to prevent unnecessary re-renders)
  const documentContent = useMemo(() => {
    return editorValue || DEFAULT_CONTENT;
  }, [editorValue]);

  // Optimized onChange handler - throttled saves to prevent performance issues
  const handleContentChange = useCallback(
    async (newContent: any[]) => {
      if (!document?.id || !user) return;

      isLocalChange.current = true;
      setEditorValue(newContent);

      const now = Date.now();
      if (now - lastSaveTime.current < 1000) {
        return;
      }

      lastSaveTime.current = now;

      try {
        await db.transact([
          tx.documents[document.id].merge({
            content: newContent,
            updatedAt: now,
          }),
        ]);
        lastRemoteUpdate.current = now;
      } catch (error) {
        console.error('Content save failed:', error);
      }
    },
    [document?.id, user]
  );

  // Save document title (debounced)
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setDocumentTitle(newTitle);

      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }

      titleSaveTimeoutRef.current = setTimeout(async () => {
        if (!document?.id || !newTitle.trim()) return;

        setIsSavingTitle(true);
        try {
          await db.transact([
            tx.documents[document.id].merge({
              title: newTitle,
              updatedAt: Date.now(),
            }),
          ]);
        } catch (error) {
          console.error('Failed to save title:', error);
          toast({
            title: 'Error',
            description: 'Failed to save title',
            variant: 'destructive',
          });
        } finally {
          setIsSavingTitle(false);
        }
      }, 500);
    },
    [document?.id, toast]
  );

  // Save discussions (debounced and deduped)
  const handleDiscussionsChange = useCallback(
    async (newDiscussions: any[]) => {
      if (!document?.id || !user) return;

      const currentDiscussionsStr = JSON.stringify(discussions);
      const newDiscussionsStr = JSON.stringify(newDiscussions);

      if (currentDiscussionsStr === newDiscussionsStr) {
        return;
      }

      setDiscussions(newDiscussions);

      const now = Date.now();
      const timeSinceLastSave = now - lastDiscussionsSave.current;

      if (timeSinceLastSave < 1000) {
        setTimeout(() => {
          handleDiscussionsChange(newDiscussions);
        }, 1000 - timeSinceLastSave);
        return;
      }

      lastDiscussionsSave.current = now;

      try {
        await db.transact([
          tx.documents[document.id].merge({
            discussions: newDiscussions,
            updatedAt: now,
          }),
        ]);
      } catch (error) {
        console.error('❌ Discussions save failed:', error);
        toast({
          title: 'Error',
          description: 'Failed to save comments',
          variant: 'destructive',
        });
      }
    },
    [document?.id, user, discussions, toast]
  );

  // Restore a version - updates the editor content
  const handleRestoreVersion = useCallback(
    async (content: any[]) => {
      if (!document?.id || !user) return;

      try {
        const now = Date.now();

        // Update the document content
        await db.transact([
          tx.documents[document.id].merge({
            content: content,
            updatedAt: now,
          }),
        ]);

        // Update local state
        isLocalChange.current = true;
        setEditorValue(content);
        lastSaveTime.current = now;
        lastRemoteUpdate.current = now;

        toast({
          title: 'Success',
          description: 'Version restored successfully',
        });
      } catch (error) {
        console.error('Failed to restore version:', error);
        toast({
          title: 'Error',
          description: 'Failed to restore version',
          variant: 'destructive',
        });
      }
    },
    [document?.id, user, toast]
  );

  // Handle suggestion accepted - create a version and save to changeRequests entity
  const handleSuggestionAccepted = useCallback(
    async (suggestion: any) => {
      if (!document?.id || !user?.id || !editorValue || !amendment?.id) return;

      // In vote mode, suggestions cannot be accepted directly
      if (document.editingMode === 'vote') {
        toast({
          title: 'Voting Required',
          description:
            'This document is in voting mode. Changes must be approved by vote on the Change Requests page.',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Use the suggestion's crId as the version title if available
        const versionTitle = suggestion?.crId ? `${suggestion.crId} accepted` : undefined;

        await createDocumentVersion({
          documentId: document.id,
          userId: user.id,
          content: editorValue,
          creationType: 'suggestion_accepted',
          title: versionTitle,
        });

        // Find the discussion for this suggestion
        const discussion = discussions.find(
          (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
        );

        if (discussion) {
          // Generate a new UUID for the changeRequest entity
          const changeRequestId = id();

          // Create a changeRequest entity to preserve the accepted suggestion
          await db.transact([
            tx.changeRequests[changeRequestId]
              .update({
                title: discussion.crId || 'Change Request',
                description: discussion.description || '',
                proposedChange: discussion.proposedChange || '',
                justification: discussion.justification || '',
                status: 'accepted',
                createdAt: discussion.createdAt || Date.now(),
                updatedAt: Date.now(),
              })
              .link({ creator: user.id })
              .link({ amendment: amendment.id }),
          ]);
        }

        // Remove the discussion from the array (it's now persisted as a changeRequest entity)
        const updatedDiscussions = discussions.filter(
          (d: any) => d.id !== suggestion.suggestionId && d.id !== suggestion.id
        );

        // Update discussions in the database
        await db.transact([
          tx.documents[document.id].update({
            discussions: updatedDiscussions,
            updatedAt: Date.now(),
          }),
        ]);
      } catch (error) {
        console.error('Failed to create version for accepted suggestion:', error);
      }
    },
    [document?.id, document?.editingMode, user?.id, editorValue, discussions, amendment?.id, toast]
  );

  // Handle suggestion declined - create a version and save to changeRequests entity
  const handleSuggestionDeclined = useCallback(
    async (suggestion: any) => {
      if (!document?.id || !user?.id || !editorValue || !amendment?.id) return;

      // In vote mode, suggestions cannot be rejected directly
      if (document.editingMode === 'vote') {
        toast({
          title: 'Voting Required',
          description:
            'This document is in voting mode. Changes must be rejected by vote on the Change Requests page.',
          variant: 'destructive',
        });
        return;
      }

      try {
        // Use the suggestion's crId as the version title if available
        const versionTitle = suggestion?.crId ? `${suggestion.crId} declined` : undefined;

        await createDocumentVersion({
          documentId: document.id,
          userId: user.id,
          content: editorValue,
          creationType: 'suggestion_declined',
          title: versionTitle,
        });

        // Find the discussion for this suggestion
        const discussion = discussions.find(
          (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
        );

        if (discussion) {
          // Generate a new UUID for the changeRequest entity
          const changeRequestId = id();

          // Create a changeRequest entity to preserve the rejected suggestion
          await db.transact([
            tx.changeRequests[changeRequestId]
              .update({
                title: discussion.crId || 'Change Request',
                description: discussion.description || '',
                proposedChange: discussion.proposedChange || '',
                justification: discussion.justification || '',
                status: 'rejected',
                createdAt: discussion.createdAt || Date.now(),
                updatedAt: Date.now(),
              })
              .link({ creator: user.id })
              .link({ amendment: amendment.id }),
          ]);
        }

        // Remove the discussion from the array (it's now persisted as a changeRequest entity)
        const updatedDiscussions = discussions.filter(
          (d: any) => d.id !== suggestion.suggestionId && d.id !== suggestion.id
        );

        // Update discussions in the database
        await db.transact([
          tx.documents[document.id].update({
            discussions: updatedDiscussions,
            updatedAt: Date.now(),
          }),
        ]);
      } catch (error) {
        console.error('Failed to create version for declined suggestion:', error);
      }
    },
    [document?.id, document?.editingMode, user?.id, editorValue, discussions, amendment?.id, toast]
  );

  // Handle mode change from PlateJS toolbar
  const handleModeChange = useCallback(
    async (newMode: 'edit' | 'view' | 'suggest' | 'vote') => {
      if (!document?.id) return;

      try {
        await db.transact([
          tx.documents[document.id].update({
            editingMode: newMode,
            updatedAt: Date.now(),
          }),
        ]);

        toast({
          title: 'Mode Changed',
          description: `Document is now in ${newMode} mode.`,
        });
      } catch (error) {
        console.error('Failed to change mode:', error);
        toast({
          title: 'Error',
          description: 'Failed to change document mode.',
          variant: 'destructive',
        });
      }
    },
    [document?.id, toast]
  );

  // Handle vote callbacks - create changeRequest entity and vote
  const handleVote = useCallback(
    async (suggestion: any, voteType: 'accept' | 'reject' | 'abstain') => {
      if (!document?.id || !user?.id || !amendment?.id) return;

      try {
        // Find the discussion for this suggestion
        const discussionId = suggestion.keyId.replace('suggestion_', '');
        const discussion = discussions.find((d: any) => d.id === discussionId);

        if (!discussion) {
          toast({
            title: 'Error',
            description: 'Could not find suggestion data.',
            variant: 'destructive',
          });
          return;
        }

        // Check if a changeRequest entity already exists for this discussion
        const existingChangeRequestQuery = await db.queryOnce({
          changeRequests: {
            $: {
              where: {
                'amendment.id': amendment.id,
                title: discussion.crId,
              },
            },
          },
        });

        let changeRequestId: string;

        if (
          existingChangeRequestQuery?.data?.changeRequests &&
          existingChangeRequestQuery.data.changeRequests.length > 0
        ) {
          // Use existing changeRequest
          changeRequestId = existingChangeRequestQuery.data.changeRequests[0].id;
        } else {
          // Create new changeRequest entity
          changeRequestId = id();

          await db.transact([
            tx.changeRequests[changeRequestId]
              .update({
                title: discussion.crId || 'Change Request',
                description: discussion.description || '',
                proposedChange: discussion.proposedChange || '',
                justification: discussion.justification || '',
                status: 'pending',
                requiresVoting: true,
                createdAt: discussion.createdAt || Date.now(),
                updatedAt: Date.now(),
              })
              .link({ creator: discussion.userId })
              .link({ amendment: amendment.id }),
          ]);
        }

        // Create the vote
        const voteId = id();
        await db.transact([
          tx.changeRequestVotes[voteId]
            .update({
              vote: voteType,
              createdAt: Date.now(),
              updatedAt: Date.now(),
            })
            .link({ changeRequest: changeRequestId })
            .link({ voter: user.id }),
        ]);

        toast({
          title: 'Vote Recorded',
          description: `You voted to ${voteType} this change request.`,
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to record your vote. Please try again.',
          variant: 'destructive',
        });
      }
    },
    [document?.id, user?.id, amendment?.id, discussions, toast]
  );

  // Individual vote handlers
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

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }
    };
  }, []);

  // Check if user has access to this document
  const hasAccess =
    document &&
    (document.owner?.id === user?.id ||
      document.collaborators?.some((c: any) => c.user?.id === user?.id) ||
      document.isPublic);

  // Check if user is owner or collaborator (can change modes)
  // Include amendment admins as well
  const isOwnerOrCollaborator =
    (document &&
      (document.owner?.id === user?.id ||
        document.collaborators?.some((c: any) => c.user?.id === user?.id))) ||
    amendment?.amendmentRoleCollaborators?.some(
      (c: any) => c.user?.id === user?.id && c.status === 'admin'
    );

  if (amendmentLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!amendment || !document) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
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
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!hasAccess) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
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
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
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

            {/* Version Control */}
            {user?.id && document?.id && (
              <VersionControl
                documentId={document.id}
                currentContent={documentContent}
                currentUserId={user.id}
                onRestoreVersion={handleRestoreVersion}
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
                {isSavingTitle ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving title...</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Auto-save enabled</span>
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
                {document.collaborators.map((collab: any) => {
                  return (
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
                  );
                })}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              <PlateEditor
                key={document.id}
                value={documentContent}
                onChange={handleContentChange}
                documentId={document.id}
                documentTitle={documentTitle}
                currentMode={(document.editingMode as any) || 'suggest'}
                onModeChange={handleModeChange}
                isOwnerOrCollaborator={!!isOwnerOrCollaborator}
                currentUser={
                  user && userRecord
                    ? {
                        id: user.id,
                        name: userRecord.name || user.email || 'Anonymous',
                        avatar: userRecord.avatar,
                      }
                    : undefined
                }
                users={editorUsers}
                discussions={discussionsWithVotes}
                onDiscussionsChange={handleDiscussionsChange}
                onSuggestionAccepted={handleSuggestionAccepted}
                onSuggestionDeclined={handleSuggestionDeclined}
                onVoteAccept={handleVoteAccept}
                onVoteReject={handleVoteReject}
                onVoteAbstain={handleVoteAbstain}
              />
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
