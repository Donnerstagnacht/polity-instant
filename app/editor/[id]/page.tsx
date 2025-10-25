'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cursors } from '@instantdb/react';
import { db, tx } from '../../../db';
import { Loader2, Users, Eye, ArrowLeft } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';

export default function DocumentEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = db.useAuth();
  const { toast } = useToast();
  const documentId = params.id as string;

  // State
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState<any[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Ref to track if content change is from user input or document load
  const isLoadingDocument = useRef(false);
  const lastRemoteUpdate = useRef<number>(0);
  const [editorKey, setEditorKey] = useState(0);

  // Get user profile for presence data
  const { data: profileData } = db.useQuery({
    profiles: {
      $: { where: { 'user.id': user?.id } },
    },
  });
  const userProfile = profileData?.profiles?.[0];

  // Generate a consistent color for this user
  const userColor = user?.id
    ? `hsl(${parseInt(user.id.substring(0, 8), 16) % 360}, 70%, 50%)`
    : '#888888';

  // Create room for presence and cursors
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
  }, [userProfile, publishPresence, userColor, user?.email]);

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
  const onlinePeers = Object.values(peers).filter((peer: any) => peer.userId !== user?.id);

  // Memoized onChange handler to prevent infinite loops
  const handleContentChange = useCallback((newContent: any[]) => {
    if (!isLoadingDocument.current) {
      setDocumentContent(newContent);
    }
  }, []);

  // Load document content and sync real-time updates
  useEffect(() => {
    if (document) {
      const remoteUpdatedAt = document.updatedAt
        ? typeof document.updatedAt === 'number'
          ? document.updatedAt
          : new Date(document.updatedAt).getTime()
        : 0;

      // Set title
      setDocumentTitle(document.title);

      // Set content with fallback to default empty content
      const content = document.content || [
        {
          type: 'p',
          children: [{ text: 'Start typing...' }],
        },
      ];

      // Only update content if this is a new document or a remote update from another user
      const isNewDocument = documentContent === null;
      const isRemoteUpdate = remoteUpdatedAt > lastRemoteUpdate.current;

      if (isNewDocument || isRemoteUpdate) {
        isLoadingDocument.current = true;
        setDocumentContent(content);

        lastRemoteUpdate.current = remoteUpdatedAt;

        // Force editor to re-render with new content on remote updates
        if (isRemoteUpdate && !isNewDocument) {
          setEditorKey(prev => prev + 1);
        }

        // Reset last saved when switching documents
        if (isNewDocument) {
          setLastSaved(null);
        }

        // Reset the flag after a short delay to allow state to update
        setTimeout(() => {
          isLoadingDocument.current = false;
        }, 100);
      }
    }
  }, [document, documentContent]);

  // Auto-save document content (debounced)
  useEffect(() => {
    if (!documentId || !user || !documentContent || isLoadingDocument.current) return;

    const saveTimeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        const now = Date.now();
        await db.transact([
          tx.documents[documentId].update({
            content: documentContent,
            updatedAt: now,
          }),
        ]);
        // Update our local timestamp to prevent re-loading our own changes
        lastRemoteUpdate.current = now;
        setLastSaved(new Date());
        setIsSaving(false);
      } catch (error) {
        console.error('Auto-save failed:', error);
        toast({
          title: 'Auto-save failed',
          description: 'Your changes could not be saved automatically.',
          variant: 'destructive',
        });
        setIsSaving(false);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(saveTimeout);
  }, [documentContent, documentId, user, toast]);

  // Save document title
  const handleSaveTitle = async () => {
    if (!documentId || !documentTitle.trim()) return;

    setIsSaving(true);
    try {
      await db.transact([
        tx.documents[documentId].update({
          title: documentTitle,
          updatedAt: Date.now(),
        }),
      ]);

      toast({
        title: 'Saved',
        description: 'Document title updated',
      });
    } catch (error) {
      console.error('Failed to save title:', error);
      toast({
        title: 'Error',
        description: 'Failed to save title',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

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
                  onChange={e => setDocumentTitle(e.target.value)}
                  onBlur={handleSaveTitle}
                  className="border-none px-0 text-2xl font-bold shadow-none focus-visible:ring-0"
                  placeholder="Untitled Document"
                />
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {isSaving ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Eye className="h-3 w-3" />
                    <span>Saved {lastSaved.toLocaleTimeString()}</span>
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
              Changes are saved automatically. Other users' changes appear in real-time.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="min-h-[600px]">
              {documentContent && (
                <Cursors room={room} userCursorColor={userColor} className="h-full w-full">
                  <PlateEditor
                    key={`${documentId}-${editorKey}`}
                    initialValue={documentContent}
                    onChange={handleContentChange}
                  />
                </Cursors>
              )}
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
