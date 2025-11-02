'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { db, tx, id } from '../../../../db';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, FileText, Calendar, User } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';

export default function GroupEditorPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = db.useAuth();
  const { toast } = useToast();
  const groupId = params.id as string;

  // State
  const [newDocTitle, setNewDocTitle] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Query group to verify access
  const { data: groupData } = db.useQuery({
    groups: {},
  });

  const group = groupData?.groups?.find((g: any) => g.id === groupId);

  // Query documents in this group
  const { data: documentsData, isLoading: documentsLoading } = db.useQuery({
    documents: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
      owner: {},
      group: {},
      collaborators: {
        user: {},
      },
    },
  });

  const documents = documentsData?.documents || [];

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
          .link({ owner: user.id, group: groupId }),
      ]);

      setNewDocTitle('');
      setIsCreateDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Document created successfully',
      });

      // Navigate to the new document within the group
      router.push(`/group/${groupId}/editor/${docId}`);
    } catch (error) {
      console.error('Failed to create document:', error);
      toast({
        title: 'Error',
        description: 'Failed to create document',
        variant: 'destructive',
      });
    }
  };

  // Open document
  const handleOpenDocument = (docId: string) => {
    router.push(`/group/${groupId}/editor/${docId}`);
  };

  // Format date
  const formatDate = (timestamp: number | string | Date) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{group?.name || 'Group'} Documents</h1>
          <p className="text-muted-foreground">
            Create and manage collaborative documents for this group. Select a document to start
            editing.
          </p>
        </div>

        <div className="mb-6 flex justify-between">
          {/* Create new document button */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg">
                <Plus className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Enter a title for your new document in {group?.name || 'this group'}.
                </DialogDescription>
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
        </div>

        {documentsLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ) : documents.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc: any) => (
              <Card
                key={doc.id}
                className="cursor-pointer transition-shadow hover:shadow-lg"
                onClick={() => handleOpenDocument(doc.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {doc.title}
                      </CardTitle>
                    </div>
                    {doc.owner?.id === user?.id && <Badge variant="outline">Owner</Badge>}
                  </div>
                  <CardDescription className="mt-2 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      <span>Updated: {formatDate(doc.updatedAt || doc.createdAt)}</span>
                    </div>
                    {doc.owner && (
                      <div className="flex items-center gap-2 text-xs">
                        <User className="h-3 w-3" />
                        <span>By {doc.owner.email || 'Unknown'}</span>
                      </div>
                    )}
                    {doc.collaborators && doc.collaborators.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {doc.collaborators.length} collaborator
                        {doc.collaborators.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20 text-center">
              <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="mb-4 text-lg text-muted-foreground">
                No documents yet. Create your first document to get started.
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
