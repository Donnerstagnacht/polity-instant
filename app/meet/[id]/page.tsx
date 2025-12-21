'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { MeetingPage } from '@/features/meet/MeetingPage';

export default function MeetingRoute({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto max-w-6xl p-4">
        <MeetingPage meetingId={resolvedParams.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
