'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EventWiki } from '@/features/events/EventWiki';

export default function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <EventWiki eventId={resolvedParams.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
