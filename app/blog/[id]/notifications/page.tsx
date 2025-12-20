'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import db from '../../../../db/db';

export default function BlogNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Query for blog details
  const { data: blogData } = db.useQuery({
    blogs: {
      $: { where: { id: resolvedParams.id } },
    },
  });

  const blog = blogData?.blogs?.[0];

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="blogs"
        context={{ blogId: resolvedParams.id }}
      >
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <EntityNotifications
            entityId={resolvedParams.id}
            entityType="blog"
            entityName={blog?.title || 'Blog'}
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
