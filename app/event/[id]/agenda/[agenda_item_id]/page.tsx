'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EventAgendaItemDetail } from '@/features/events/ui/EventAgendaItemDetail';

interface PageParams {
  params: Promise<{ id: string; agenda_item_id: string }>;
}

export default function AgendaItemDetailPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const agendaItemId = resolvedParams.agenda_item_id;

  return (
    <AuthGuard>
      <PageWrapper className="container mx-auto p-6">
        <EventAgendaItemDetail eventId={eventId} agendaItemId={agendaItemId} />
      </PageWrapper>
    </AuthGuard>
  );
}
