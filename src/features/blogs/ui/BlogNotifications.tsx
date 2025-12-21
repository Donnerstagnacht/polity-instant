'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import db from '../../../../db/db';

interface BlogNotificationsProps {
  blogId: string;
}

export function BlogNotifications({ blogId }: BlogNotificationsProps) {
  // Query for blog details
  const { data: blogData } = db.useQuery({
    blogs: {
      $: { where: { id: blogId } },
    },
  });

  const blog = blogData?.blogs?.[0];

  return (
    <PageWrapper className="container mx-auto max-w-4xl p-8">
      <EntityNotifications
        entityId={blogId}
        entityType="blog"
        entityName={blog?.title || 'Blog'}
      />
    </PageWrapper>
  );
}
