'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import { useBlogState } from '@/zero/blogs/useBlogState';

interface BlogNotificationsProps {
  blogId: string;
}

export function BlogNotifications({ blogId }: BlogNotificationsProps) {
  const { blog } = useBlogState({ blogId });

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
