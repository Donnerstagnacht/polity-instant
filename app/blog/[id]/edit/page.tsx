'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { BlogEdit } from '@/features/blogs/ui/BlogEdit';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function BlogEditPage({ params }: PageParams) {
  const { id: blogId } = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="blogs"
        context={{ blogId }}
      >
        <PageWrapper>
          <BlogEdit blogId={blogId} />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
