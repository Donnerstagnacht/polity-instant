'use client';

import { use } from 'react';
import { GroupRelationshipsManager } from '@/components/groups/GroupRelationshipsManager';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';

export default function GroupRelationshipsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="groupRelationships"
        context={{ groupId: resolvedParams.id }}
      >
        <PageWrapper className="container mx-auto p-8">
           <div className="mb-8">
            <h1 className="mb-4 text-4xl font-bold">Manage Relationships</h1>
            <p className="text-muted-foreground">
              Manage the connections between this group and others.
            </p>
          </div>
          <GroupRelationshipsManager groupId={resolvedParams.id} />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
