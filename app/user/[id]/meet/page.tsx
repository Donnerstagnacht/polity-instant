'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { UserMeetingScheduler } from '@/features/user/ui/UserMeetingScheduler';

export default function UserMeetPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <UserMeetingScheduler userId={resolvedParams.id} />
    </AuthGuard>
  );
}
