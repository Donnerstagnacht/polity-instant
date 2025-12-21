'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EventEdit } from '@/features/events/ui/EventEdit';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function EventEditPage({ params }: PageParams) {
  const { id: eventId } = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="events"
        context={{ eventId }}
      >
        <PageWrapper>
          <EventEdit eventId={eventId} />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
