'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import db from '../../../../db';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/auth';

export default function BlogNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: authUser } = useAuthStore();

  // Query for blog details and check if user is admin
  const { data: blogData } = db.useQuery({
    blogs: {
      $: { where: { id: resolvedParams.id } },
    },
    blogRoleBloggers: {
      $: {
        where: {
          'blog.id': resolvedParams.id,
          'user.id': authUser?.id,
        },
      },
      role: {},
    },
  });

  const blog = blogData?.blogs?.[0];
  const blogRelation = blogData?.blogRoleBloggers?.[0];

  // Check if user is owner
  const isOwner = blogRelation?.status === 'owner';

  // Only owners can view blog notifications
  if (!isOwner) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Only blog owners can view blog notifications.</CardDescription>
            </CardHeader>
          </Card>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto max-w-4xl p-8">
        <EntityNotifications
          entityId={resolvedParams.id}
          entityType="blog"
          entityName={blog?.title || 'Blog'}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
