'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EventParticipants } from '../../../../src/features/events/ui/EventParticipants';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function EventParticipantsPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="eventParticipants"
        context={{ eventId }}
      >
        <PageWrapper className='container mx-auto max-w-7xl p-8'>
          <EventParticipants eventId={eventId} />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}

