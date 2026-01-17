'use client';

import { use, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard, PermissionGuard } from '@/features/auth';
import { BlogEditorView } from '@/features/blogs/ui/BlogEditorView';
import { db } from '../../../../db/db';

export default function BlogEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const blogId = resolvedParams.id;
  const { user } = db.useAuth();

  // Get user data
  const { data: userData } = db.useQuery({
    $users: {
      $: { where: { id: user?.id } },
    },
  });
  const userRecord = userData?.$users?.[0];

  // Generate a consistent color for this user
  const userColor = useMemo(
    () => (user?.id ? `hsl(${parseInt(user.id.substring(0, 8), 16) % 360}, 70%, 50%)` : '#888888'),
    [user?.id]
  );

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="blogs"
        context={{ blogId }}
      >
        <PageWrapper className="container mx-auto p-8">
          <BlogEditorView
            blogId={blogId}
            userId={user?.id}
            userRecord={userRecord}
            userColor={userColor}
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
