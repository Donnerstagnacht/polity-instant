'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PlateEditor } from '@/components/kit-platejs/plate-editor';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cursors } from '@instantdb/react';
import { db, tx, id } from '../../db';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Users, Eye } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';

export default function EditorPage() {
  const { user } = db.useAuth();
  const { toast } = useToast();

  // State
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentContent, setDocumentContent] = useState<any[] | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

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

  // Create room for presence and cursors - use a default room if no document selected
  // This ensures the hook is always called with a valid room
  const room = db.room('editor', selectedDocId || 'default');

  // Presence hook - show who's online
  // Always call the hook (required by Rules of Hooks)
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
    if (selectedDocId && userProfile && publishPresence) {
      publishPresence({
        name: userProfile.name || user?.email || 'Anonymous',
        avatar: userProfile.avatar,
        color: userColor,
        userId: user?.id || '',
      });
    }
  }, [userProfile, selectedDocId, publishPresence, userColor, user?.email]);

  // Query documents owned by or collaborated on by current user
  const { data: documentsData, isLoading: documentsLoading } = db.useQuery({
    documents: {
      $: {
        where: {
          or: [{ 'owner.id': user?.id }, { 'collaborators.user.id': user?.id }],
        },
      },
      owner: {},
      collaborators: {
        user: {},
      },
    },
  });

  // Query selected document with real-time cursors
  const { data: selectedDocData } = db.useQuery(
    selectedDocId
      ? {
          documents: {
            $: { where: { id: selectedDocId } },
            owner: {},
            collaborators: {
              user: {},
            },
          },
        }
      : null
  );

  const documents = documentsData?.documents || [];
  const selectedDocument = selectedDocData?.documents?.[0];

  // Get online peers (excluding current user) - only show when a document is selected
  const onlinePeers = selectedDocId
    ? Object.values(peers).filter((peer: any) => peer.userId !== user?.id)
    : [];

  // Reset content when switching documents
  useEffect(() => {
    setDocumentContent(null);
    lastRemoteUpdate.current = 0;
    setEditorKey(prev => prev + 1);
  }, [selectedDocId]);

  // Memoized onChange handler to prevent infinite loops
  const handleContentChange = useCallback((newContent: any[]) => {
    if (!isLoadingDocument.current) {
      setDocumentContent(newContent);
    }
  }, []);

  // Load selected document content and sync real-time updates
  useEffect(() => {
    if (selectedDocument) {
      const remoteUpdatedAt = selectedDocument.updatedAt
        ? typeof selectedDocument.updatedAt === 'number'
          ? selectedDocument.updatedAt
          : new Date(selectedDocument.updatedAt).getTime()
        : 0;

      // Set title
      setDocumentTitle(selectedDocument.title);

      // Set content with fallback to default empty content
      const content = selectedDocument.content || [
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
  }, [selectedDocument, documentContent]);

  // Auto-save document content (debounced)
  useEffect(() => {
    if (!selectedDocId || !user || !documentContent || isLoadingDocument.current) return;

    const saveTimeout = setTimeout(async () => {
      setIsSaving(true);
      try {
        const now = Date.now();
        await db.transact([
          tx.documents[selectedDocId].update({
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
  }, [documentContent, selectedDocId, user, toast]);

  // Create new document
  const handleCreateDocument = async () => {
    if (!user || !newDocTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a document title',
        variant: 'destructive',
      });
      return;
    }

    try {
      const docId = id();
      await db.transact([
        tx.documents[docId]
          .update({
            title: newDocTitle,
            content: [
              {
                type: 'h1',
                children: [{ text: newDocTitle }],
              },
              {
                type: 'p',
                children: [{ text: 'Start writing your document...' }],
              },
            ],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isPublic: false,
          })
          .link({ owner: user.id }),
      ]);

      setNewDocTitle('');
      setIsCreateDialogOpen(false);
      setSelectedDocId(docId);

      toast({
        title: 'Success',
        description: 'Document created successfully',
      });
    } catch (error) {
      console.error('Failed to create document:', error);
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive',
      });
    }
  };

  // Save document title
  const handleSaveTitle = async () => {
    if (!selectedDocId || !documentTitle.trim()) return;

    setIsSaving(true);
    try {
      await db.transact([
        tx.documents[selectedDocId].update({
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

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Collaborative Editor</h1>
          <p className="text-muted-foreground">
            Create and edit documents in real-time with automatic saving and live collaboration.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          {/* Document selector */}
          <div className="min-w-[250px] flex-1">
            <Select value={selectedDocId || ''} onValueChange={setSelectedDocId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a document..." />
              </SelectTrigger>
              <SelectContent>
                {documents.map((doc: any) => (
                  <SelectItem key={doc.id} value={doc.id}>
                    <div className="flex items-center gap-2">
                      <span>{doc.title}</span>
                      {doc.owner?.id === user?.id && <Badge variant="outline">Owner</Badge>}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Create new document button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>Enter a title for your new document.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Document Title</Label>
                  <Input
                    id="title"
                    placeholder="My Document"
                    value={newDocTitle}
                    onChange={e => setNewDocTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleCreateDocument();
                      }
                    }}
                  />
                </div>
                <Button onClick={handleCreateDocument} className="w-full">
                  Create Document
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Active users indicator */}
          {selectedDocId && onlinePeers.length > 0 && (
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
        </div>

        {documentsLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : selectedDocId ? (
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
                {documentContent && selectedDocId && (
                  <Cursors room={room} userCursorColor={userColor} className="h-full w-full">
                    <PlateEditor
                      key={`${selectedDocId}-${editorKey}`}
                      initialValue={documentContent}
                      onChange={handleContentChange}
                    />
                  </Cursors>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <p className="mb-4 text-lg text-muted-foreground">
                No document selected. Create a new document or select an existing one.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </PageWrapper>
    </AuthGuard>
  );
}
