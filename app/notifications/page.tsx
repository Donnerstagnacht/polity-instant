'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { NotificationsPage } from '@/features/notifications/NotificationsPage';

export default function NotificationsRoute() {
  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto min-h-screen max-w-4xl p-4">
        <NotificationsPage />
      </PageWrapper>
    </AuthGuard>
  );
}
