'use client';

/**
 * Blog Editor Page
 *
 * Uses the unified EditorView component for blog document editing.
 */

import { use } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard, PermissionGuard } from '@/features/auth';
import { EditorView } from '@/features/editor';
import { db } from '@db/db';

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const blogId = resolvedParams.id;
  const { user } = db.useAuth();

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
  const userRecord = userData?.$users?.[0];

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard action="manage" resource="blogs" context={{ blogId }}>
        <PageWrapper className="container mx-auto p-8">
          <EditorView
            entityType="blog"
            entityId={blogId}
            userId={user?.id}
            userRecord={
              userRecord
                ? {
                    id: userRecord.id,
                    name: userRecord.name,
                    email: user?.email,
                    avatar: userRecord.avatar,
                  }
                : undefined
            }
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
