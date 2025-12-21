'use client';

import { useParams } from 'next/navigation';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EventStream } from '@/features/events/ui/EventStream';

export default function EventStreamPage() {
  const params = useParams();
  const eventId = params.id as string;

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-6">
        <EventStream eventId={eventId} />
      </PageWrapper>
    </AuthGuard>
  );
}
