'use client';

import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useParams } from 'next/navigation';
import { EventAgenda } from '@/features/events/ui/EventAgenda';

export default function EventAgendaPage() {
  const params = useParams();
  const eventId = params.id as string;

  return (
    <AuthGuard>
      <PageWrapper className="container mx-auto p-6">
        <EventAgenda eventId={eventId} />
      </PageWrapper>
    </AuthGuard>
  );
}
