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

  // Refs to prevent re-renders and update loops
  const isInitialized = useRef(false);
  const titleSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveTime = useRef<number>(0);
  const isLocalChange = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);

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
      owner: {},
      collaborators: {
        user: {},
      },
    },
  });

  const document = documentData?.documents?.[0];

  // Get online peers (excluding current user)
  const onlinePeers = useMemo(
    () => Object.values(peers).filter((peer: any) => peer.userId !== user?.id),
    [peers, user?.id]
  );

  // Initialize document data
  useEffect(() => {
    if (document && !isInitialized.current) {
      setDocumentTitle(document.title || '');
      setEditorValue(document.content || DEFAULT_CONTENT);
      isInitialized.current = true;
    }
  }, [document]);

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
      console.log('📥 Remote update detected, syncing editor content');
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
              />
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
