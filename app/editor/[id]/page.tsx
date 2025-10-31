'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { db, tx } from '../../../db';
import { Loader2, Users, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';
import { InviteCollaboratorDialog } from './invite-collaborator-dialog';
import { VersionControl } from './version-control';
import { createDocumentVersion } from './version-utils';

const DEFAULT_CONTENT = [
  {
    type: 'p',
    children: [{ text: 'Start typing...' }],
  },
];

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = db.useAuth();
  const { toast } = useToast();
  const documentId = params.id as string;

  // State
  const [documentTitle, setDocumentTitle] = useState('');
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [editorValue, setEditorValue] = useState<any[] | null>(null);
  const [discussions, setDiscussions] = useState<any[]>([]);

  // Refs to prevent re-renders and update loops
  const isInitialized = useRef(false);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);
  const isLocalChange = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);
  const lastDiscussionsSave = useRef<number>(0);

  // Get user profile for presence data
  const { data: profileData } = db.useQuery({
    profiles: {
      $: { where: { 'user.id': user?.id } },
    },
  });
  const userProfile = profileData?.profiles?.[0];

  // Generate a consistent color for this user
  const userColor = useMemo(
    () => (user?.id ? `hsl(${parseInt(user.id.substring(0, 8), 16) % 360}, 70%, 50%)` : '#888888'),
    [user?.id]
  );

  // Create room for presence
  const room = db.room('editor', documentId);

  // Presence hook - show who's online
  const { peers, publishPresence } = db.rooms.usePresence(room, {
    initialData: {
      name: userProfile?.name || user?.email || 'Anonymous',
      avatar: userProfile?.avatar,
      color: userColor,
      userId: user?.id || '',
    },
  });

  // Update presence when profile changes
  useEffect(() => {
    if (userProfile && publishPresence) {
      publishPresence({
        name: userProfile.name || user?.email || 'Anonymous',
        avatar: userProfile.avatar,
        color: userColor,
        userId: user?.id || '',
      });
    }
  }, [userProfile, publishPresence, userColor, user?.email, user?.id]);

  // Query selected document with real-time updates
  const { data: documentData, isLoading: documentLoading } = db.useQuery({
    documents: {
      $: { where: { id: documentId } },
      owner: {
        profile: {},
      },
      collaborators: {
        user: {
          profile: {},
        },
      },
    },
  });

  const document = documentData?.documents?.[0];

  // Get online peers (excluding current user)
  const onlinePeers = useMemo(
    () => Object.values(peers).filter((peer: any) => peer.userId !== user?.id),
    [peers, user?.id]
  );

  // Build users map for the editor (includes current user, owner, and all collaborators)
  const editorUsers = useMemo(() => {
    const users: Record<string, { id: string; name: string; avatarUrl: string }> = {};

    // Add current user
    if (user && userProfile) {
      users[user.id] = {
        id: user.id,
        name: userProfile.name || user.email || 'Anonymous',
        avatarUrl: userProfile.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`,
      };
    }

    // Add document owner
    if (document?.owner) {
      const owner = document.owner;
      const ownerProfile = owner.profile;
      users[owner.id] = {
        id: owner.id,
        name: ownerProfile?.name || owner.email || 'Owner',
        avatarUrl:
          ownerProfile?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${owner.id}`,
      };
    }

    // Add all collaborators
    if (document?.collaborators) {
      document.collaborators.forEach((collab: any) => {
        const collabUser = collab.user;
        const profile = collabUser?.profile;
        if (collabUser?.id) {
          users[collabUser.id] = {
            id: collabUser.id,
            name: profile?.name || collabUser.email || 'Collaborator',
            avatarUrl:
              profile?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${collabUser.id}`,
          };
        }
      });
    }

    return users;
  }, [user, userProfile, document?.owner, document?.collaborators]);

  // Initialize document data
  useEffect(() => {
    if (document && !isInitialized.current) {
      setDocumentTitle(document.title || '');
      setEditorValue(document.content || DEFAULT_CONTENT);
      // Load discussions from document metadata or content
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

    // Only update if there are actual changes and it's not our own recent save
    if (
      localDiscussionsStr !== remoteDiscussionsStr &&
      Date.now() - lastDiscussionsSave.current > 2000 // Wait 2 seconds after our last save
    ) {
      setDiscussions(remoteDiscussions);
    }
  }, [(document as any)?.discussions]);

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

    // Only update if:
    // 1. This is a remote change (not our own save)
    // 2. There are actual content differences
    // 3. We haven't made a local change recently (to avoid conflicts)
    if (
      remoteUpdatedAt > lastRemoteUpdate.current &&
      hasRemoteChanges &&
      !isLocalChange.current &&
      Date.now() - lastSaveTime.current > 1500 // Wait 1.5 seconds after last local save
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
      }, 2000); // Reset after 2 seconds

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
      if (!documentId || !user) return;

      // Mark this as a local change
      isLocalChange.current = true;
      setEditorValue(newContent);

      // Throttle saves to max 1 per second to prevent performance issues
      const now = Date.now();
      if (now - lastSaveTime.current < 1000) {
        return;
      }

      lastSaveTime.current = now;

      try {
        // Use merge to only update the content field without overwriting everything
        await db.transact([
          tx.documents[documentId].merge({
            content: newContent,
            updatedAt: now,
          }),
        ]);
        // Update our local timestamp to prevent re-loading our own changes
        lastRemoteUpdate.current = now;
      } catch (error) {
        console.error('Content save failed:', error);
        // Don't show error toast for auto-save to avoid annoying the user
      }
    },
    [documentId, user]
  );

  // Restore a version - updates the editor content
  const handleRestoreVersion = useCallback(
    async (content: any[]) => {
      if (!documentId || !user) return;

      try {
        const now = Date.now();

        // Update the document content
        await db.transact([
          tx.documents[documentId].merge({
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
    [documentId, user, toast]
  );

  // Handle suggestion accepted - create a version
  const handleSuggestionAccepted = useCallback(async () => {
    if (!documentId || !user?.id || !editorValue) return;

    try {
      await createDocumentVersion({
        documentId,
        userId: user.id,
        content: editorValue,
        creationType: 'suggestion_accepted',
      });

      console.log('✅ Version created for accepted suggestion');
    } catch (error) {
      console.error('Failed to create version for accepted suggestion:', error);
    }
  }, [documentId, user?.id, editorValue]);

  // Handle suggestion declined - create a version
  const handleSuggestionDeclined = useCallback(async () => {
    if (!documentId || !user?.id || !editorValue) return;

    try {
      await createDocumentVersion({
        documentId,
        userId: user.id,
        content: editorValue,
        creationType: 'suggestion_declined',
      });

      console.log('✅ Version created for declined suggestion');
    } catch (error) {
      console.error('Failed to create version for declined suggestion:', error);
    }
  }, [documentId, user?.id, editorValue]);

  // Save document title (debounced)
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setDocumentTitle(newTitle);

      // Clear existing timeout
      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }

      // Debounce title save
      titleSaveTimeoutRef.current = setTimeout(async () => {
        if (!documentId || !newTitle.trim()) return;

        setIsSavingTitle(true);
        try {
          await db.transact([
            tx.documents[documentId].merge({
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
    [documentId, toast]
  );

  // Save discussions (debounced and deduped)
  const handleDiscussionsChange = useCallback(
    async (newDiscussions: any[]) => {
      if (!documentId || !user) return;

      // Check if discussions actually changed
      const currentDiscussionsStr = JSON.stringify(discussions);
      const newDiscussionsStr = JSON.stringify(newDiscussions);

      if (currentDiscussionsStr === newDiscussionsStr) {
        return; // No actual change, skip save
      }

      // Update local state immediately for UI responsiveness
      setDiscussions(newDiscussions);

      // Debounce saves to max 1 per second to prevent race conditions
      const now = Date.now();
      const timeSinceLastSave = now - lastDiscussionsSave.current;

      if (timeSinceLastSave < 1000) {
        // Schedule a save after the throttle period
        setTimeout(() => {
          handleDiscussionsChange(newDiscussions);
        }, 1000 - timeSinceLastSave);
        return;
      }

      lastDiscussionsSave.current = now;

      try {
        await db.transact([
          tx.documents[documentId].merge({
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
    [documentId, user, discussions]
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

  if (documentLoading) {
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

  if (!document || !hasAccess) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <p className="mb-4 text-lg text-muted-foreground">
                Document not found or you don't have access to it.
              </p>
              <Button onClick={() => router.push('/editor')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Documents
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
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/editor')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>

          <div className="flex items-center gap-4">
            {/* Version Control */}
            {user?.id && (
              <VersionControl
                documentId={documentId}
                currentContent={documentContent}
                currentUserId={user.id}
                onRestoreVersion={handleRestoreVersion}
              />
            )}

            {document.owner?.id === user?.id && user?.id && (
              <InviteCollaboratorDialog
                documentId={documentId}
                currentUserId={user.id}
                existingCollaborators={document.collaborators || []}
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

            {document.owner?.id === user?.id && <Badge variant="outline">Owner</Badge>}
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Input
                  value={documentTitle}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                  placeholder="Untitled Document"
                />
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
              Changes are saved automatically as you type. Other users' changes appear in real-time.
            </CardDescription>

            {/* Collaborators list */}
            {document.collaborators && document.collaborators.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Collaborators:</span>
                {document.collaborators.map((collab: any) => {
                  const profile = collab.user?.profile;
                  return (
                    <div
                      key={collab.id}
                      className="flex items-center gap-1 rounded-full bg-muted px-2 py-1"
                    >
                      <Avatar className="h-5 w-5">
                        {profile?.avatar ? (
                          <AvatarImage src={profile.avatar} alt={profile.name || ''} />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {profile?.name?.[0]?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{profile?.name || 'Unknown'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              <PlateEditor
                key={documentId}
                value={documentContent}
                onChange={handleContentChange}
                currentUser={
                  user && userProfile
                    ? {
                        id: user.id,
                        name: userProfile.name || user.email || 'Anonymous',
                        avatar: userProfile.avatar,
                      }
                    : undefined
                }
                users={editorUsers}
                discussions={discussions}
                onDiscussionsChange={handleDiscussionsChange}
                onSuggestionAccepted={handleSuggestionAccepted}
                onSuggestionDeclined={handleSuggestionDeclined}
              />
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
