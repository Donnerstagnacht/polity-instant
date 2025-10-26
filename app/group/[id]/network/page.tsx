'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupNetworkFlow } from '@/components/groups/GroupNetworkFlow';

export default function GroupNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">Gruppennetzwerk</h1>
          <p className="text-muted-foreground">
            Visualisierung der Beziehungen und Hierarchien dieser Gruppe
          </p>
        </div>

        <GroupNetworkFlow groupId={resolvedParams.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
