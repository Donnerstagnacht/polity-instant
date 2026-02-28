'use client';

import { PageWrapper } from '@/layout/page-wrapper';
import { EntityNotifications } from '@/features/notifications/ui/EntityNotifications.tsx';
import { useBlogState } from '@/zero/blogs/useBlogState';

interface BlogNotificationsProps {
  blogId: string;
}

export function BlogNotifications({ blogId }: BlogNotificationsProps) {
  const { blog } = useBlogState({ blogId });

  return (
    <PageWrapper>
      <EntityNotifications
        entityId={blogId}
        entityType="blog"
        entityName={blog?.title || 'Blog'}
      />
    </PageWrapper>
  );
}
