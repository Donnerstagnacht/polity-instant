'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import { useGroupData } from '@/features/groups/hooks/useGroupData';

export default function GroupNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  // Query for group details using hook
  const { group } = useGroupData(resolvedParams.id);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="groups"
        context={{ groupId: resolvedParams.id }}
      >
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <EntityNotifications
            entityId={resolvedParams.id}
            entityType="group"
            entityName={group?.name || 'Group'}
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
