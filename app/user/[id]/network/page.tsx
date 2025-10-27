'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { UserNetworkFlow } from '@/features/user/ui/UserNetworkFlow';

export default function UserNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">User Network</h1>
          <p className="text-muted-foreground">
            Visualization of the user's group memberships and their network relationships
          </p>
        </div>

        <UserNetworkFlow userId={resolvedParams.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
