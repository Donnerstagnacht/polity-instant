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
import { db, tx } from '../../../../../db/db';
import { Loader2, Users, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';
import { useSuggestionIdAssignment } from '@/hooks/use-suggestion-id-assignment';

const DEFAULT_CONTENT = [
  {
    type: 'p',
    children: [{ text: 'Start typing...' }],
  },
];

export default function GroupDocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = db.useAuth();
  const { toast } = useToast();
  const documentId = params.docId as string;
  const groupId = params.id as string;

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

  // Get user data for presence
  const { data: userData } = db.useQuery({
    $users: { $: { where: { id: user?.id } } },
  });

  const currentUser = userData?.$users?.[0];

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
      name: currentUser?.name || user?.email || 'Anonymous',
      avatar: currentUser?.avatar,
      color: userColor,
      userId: user?.id || '',
    },
  });

  useEffect(() => {
    if (user && publishPresence && currentUser) {
      publishPresence({
        name: currentUser.name || user.email || 'Anonymous',
        avatar: currentUser.avatar,
        color: userColor,
        userId: user.id || '',
      });
    }
  }, [user, publishPresence, userColor, currentUser]);

  // Query selected document with real-time updates
  const { data: documentData, isLoading: documentLoading } = db.useQuery({
    documents: {
      owner: {},
    },
  });

  const document = documentData?.documents?.find((d: any) => d.id === documentId);

  // Auto-assign suggestion IDs
  useSuggestionIdAssignment({
    documentId: document?.id || '',
    discussions,
    onDiscussionsUpdate: setDiscussions,
  });

  // Get online peers (excluding current user)
  const onlinePeers = useMemo(
    () => Object.values(peers).filter((peer: any) => peer.userId !== user?.id),
    [peers, user?.id]
  );

  // Build users map for the editor
  const editorUsers = useMemo(() => {
    const users: Record<string, { id: string; name: string; avatarUrl: string }> = {};

    // Add current user
    if (user && currentUser) {
      users[user.id] = {
        id: user.id,
        name: currentUser.name || user.email || 'Anonymous',
        avatarUrl: currentUser.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`,
      };
    }

    return users;
  }, [user, currentUser]);

  // Initialize document data
  useEffect(() => {
    if (document && !isInitialized.current) {
      setDocumentTitle(document.title || '');
      setEditorValue(document.content || DEFAULT_CONTENT);
      setDiscussions((document as any).discussions || []);
      isInitialized.current = true;
    }
  }, [document]);

  // Get document content from the database
  const documentContent = useMemo(() => {
    return editorValue || DEFAULT_CONTENT;
  }, [editorValue]);

  // Optimized onChange handler - throttled saves
  const handleContentChange = useCallback(
    async (newContent: any[]) => {
      if (!documentId || !user) return;

      isLocalChange.current = true;
      setEditorValue(newContent);

      const now = Date.now();
      if (now - lastSaveTime.current < 1000) {
        return;
      }

      lastSaveTime.current = now;

      try {
        await db.transact([
          tx.documents[documentId].merge({
            content: newContent,
            updatedAt: now,
          }),
        ]);
        lastRemoteUpdate.current = now;
      } catch (error) {
        console.error('Content save failed:', error);
      }
    },
    [documentId, user]
  );

  // Save document title (debounced)
  const handleTitleChange = useCallback(
    (newTitle: string) => {
      setDocumentTitle(newTitle);

      if (titleSaveTimeoutRef.current) {
        clearTimeout(titleSaveTimeoutRef.current);
      }

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

  // Save discussions
  const handleDiscussionsChange = useCallback(
    async (newDiscussions: any[]) => {
      if (!documentId || !user) return;

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
    [documentId, user, discussions, toast]
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
  const hasAccess = document && (document.isPublic || document.owner?.id === user?.id);

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
              <Button onClick={() => router.push(`/group/${groupId}/editor`)}>
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
          <Button variant="ghost" onClick={() => router.push(`/group/${groupId}/editor`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>

          <div className="flex items-center gap-4">
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
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              <PlateEditor
                key={documentId}
                value={documentContent}
                onChange={handleContentChange}
                documentId={documentId}
                currentUser={
                  user && currentUser
                    ? {
                        id: user.id,
                        name: currentUser.name || user.email || 'Anonymous',
                        avatar: currentUser.avatar,
                      }
                    : undefined
                }
                users={editorUsers}
                discussions={discussions}
                onDiscussionsChange={handleDiscussionsChange}
              />
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
