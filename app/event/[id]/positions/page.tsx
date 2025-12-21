'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EventPositions } from '@/features/events/ui/EventPositions';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function EventPositionsPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="events"
        context={{ eventId }}
      >
        <PageWrapper className='container mx-auto max-w-7xl p-8'>
          <EventPositions eventId={eventId} />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}

