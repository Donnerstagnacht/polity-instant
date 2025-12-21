'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { DocumentEditor } from '@/features/groups/ui/DocumentEditor';
import { useDocumentEditor } from '@/features/groups/hooks/useDocumentEditor';
import db from '../../../../../db/db';

export default function GroupDocumentEditorPage({
  params,
}: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { user } = db.useAuth();
  const documentId = resolvedParams.docId;
  const groupId = resolvedParams.id;

  // Get user data
  const { data: userData } = db.useQuery({
    $users: { $: { where: { id: user?.id } } },
  });

  const currentUser = userData?.$users?.[0];

  // Check document access
  const { document, isLoading, hasAccess } = useDocumentEditor({
    documentId,
    userId: user?.id,
  });

  if (isLoading) {
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
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push(`/group/${groupId}/editor`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Documents
          </Button>
        </div>

        <DocumentEditor
          documentId={documentId}
          groupId={groupId}
          userId={user?.id}
          userName={currentUser?.name}
          userEmail={user?.email ?? undefined}
          userAvatar={currentUser?.avatar}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
