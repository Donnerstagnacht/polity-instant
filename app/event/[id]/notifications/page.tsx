'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import db from '../../../../db';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/auth';

export default function EventNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: authUser } = useAuthStore();

  // Query for event details and check if user is admin
  const { data: eventData } = db.useQuery({
    events: {
      $: { where: { id: resolvedParams.id } },
    },
    eventParticipants: {
      $: {
        where: {
          'event.id': resolvedParams.id,
          'user.id': authUser?.id,
        },
      },
      role: {},
    },
  });

  const event = eventData?.events?.[0];
  const participation = eventData?.eventParticipants?.[0];

  // Check if user is admin (has Board Member role or similar admin role)
  const isAdmin = participation?.role?.name === 'Board Member' || participation?.status === 'admin';

  // Only admins can view event notifications
  if (!isAdmin) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only event administrators can view event notifications.
              </CardDescription>
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
          entityType="event"
          entityName={event?.title || 'Event'}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
