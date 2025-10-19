'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';

export default function MessagesPage() {
  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-4">
        <h1 className="mb-4 text-2xl font-bold">Messages</h1>
        <div className="space-y-4">
          <div className="rounded-lg border p-4">
            <h2 className="mb-2 text-lg font-semibold">Inbox</h2>
            <p className="text-muted-foreground">No new messages</p>
          </div>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
