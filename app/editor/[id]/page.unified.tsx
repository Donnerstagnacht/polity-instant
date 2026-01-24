'use client';

/**
 * Standalone Document Editor Page
 *
 * Uses the unified EditorView component for document editing.
 */

import { useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { EditorView } from '@/features/editor';
import { db } from '@db/db';

export default function DocumentEditorPage() {
  const params = useParams();
  const { user } = db.useAuth();
  const documentId = params.id as string;

  // Get user data
  const { data: userData } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: { where: { id: user.id } },
          },
        }
      : null
  );
  const currentUser = userData?.$users?.[0];

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper>
        <EditorView
          entityType="document"
          entityId={documentId}
          userId={user?.id}
          userRecord={
            currentUser
              ? {
                  id: currentUser.id,
                  name: currentUser.name,
                  email: user?.email,
                  avatar: currentUser.avatar,
                }
              : undefined
          }
          backUrl="/editor"
        />
      </PageWrapper>
    </AuthGuard>
  );
}
