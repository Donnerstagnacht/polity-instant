'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import { useEventData } from '@/features/events/hooks/useEventData';

export default function EventNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Query for event details using hook
  const { event } = useEventData(resolvedParams.id);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="events"
        context={{ eventId: resolvedParams.id }}
      >
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <EntityNotifications
            entityId={resolvedParams.id}
            entityType="event"
            entityName={event?.title || 'Event'}
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
