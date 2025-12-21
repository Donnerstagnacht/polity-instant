'use client';

import { use } from 'react';
import { BlogBloggersManager } from '@/features/blogs/ui/BlogBloggersManager';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth/PermissionGuard';

export default function BlogBloggersPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="blogBloggers"
        context={{ blogId: resolvedParams.id }}
      >
        <BlogBloggersManager blogId={resolvedParams.id} />
      </PermissionGuard>
    </AuthGuard>
  );
}
