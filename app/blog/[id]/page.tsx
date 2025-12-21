'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { BlogDetail } from '@/features/blogs/ui/BlogDetail';

export default function BlogPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <BlogDetail blogId={resolvedParams.id} />
    </AuthGuard>
  );
}
