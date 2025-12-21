/**
 * Group Documents List Component
 *
 * Displays a list of documents for a group with create functionality.
 */

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Plus } from 'lucide-react';
import { useGroupDocuments } from '../hooks/useGroupDocuments';
import { useDocumentMutations } from '../hooks/useDocumentMutations';
import { GroupDocumentCard } from './GroupDocumentCard';
import { CreateDocumentDialog } from './CreateDocumentDialog';

interface GroupDocumentsListProps {
  groupId: string;
  groupName?: string;
  userId?: string;
}

export function GroupDocumentsList({ groupId, groupName, userId }: GroupDocumentsListProps) {
  const router = useRouter();
  const { documents, isLoading } = useGroupDocuments(groupId);
  const { createDocument, isCreating } = useDocumentMutations(groupId);

  const handleOpenDocument = (docId: string) => {
    router.push(`/group/${groupId}/editor/${docId}`);
  };

  const handleCreateDocument = async (title: string) => {
    if (!userId) return;
    await createDocument(title, groupId, userId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (documents.length === 0) {
    return (
      <>
        <div className="mb-6">
          <CreateDocumentDialog
            groupId={groupId}
            groupName={groupName}
            onCreateDocument={handleCreateDocument}
            isCreating={isCreating}
          />
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-4 text-lg text-muted-foreground">
              No documents yet. Create your first document to get started.
            </p>
            <CreateDocumentDialog
              groupId={groupId}
              groupName={groupName}
              onCreateDocument={handleCreateDocument}
              isCreating={isCreating}
            />
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between">
        <CreateDocumentDialog
          groupId={groupId}
          groupName={groupName}
          onCreateDocument={handleCreateDocument}
          isCreating={isCreating}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map(doc => (
          <GroupDocumentCard
            key={doc.id}
            document={doc}
            userId={userId}
            onClick={() => handleOpenDocument(doc.id)}
          />
        ))}
      </div>
    </>
  );
}
