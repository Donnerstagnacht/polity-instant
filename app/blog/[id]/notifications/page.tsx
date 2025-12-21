'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth';
import { BlogNotifications } from '@/features/blogs/ui/BlogNotifications';

export default function BlogNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="blogs"
        context={{ blogId: resolvedParams.id }}
      >
        <BlogNotifications blogId={resolvedParams.id} />
      </PermissionGuard>
    </AuthGuard>
  );
}
