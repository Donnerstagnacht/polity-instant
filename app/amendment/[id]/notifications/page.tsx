'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PermissionGuard } from '@/features/auth';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';

export default function AmendmentNotificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { amendment } = useAmendmentData(resolvedParams.id);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard action="manage" resource="amendments" context={{ amendment }}>
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <EntityNotifications
            entityId={resolvedParams.id}
            entityType="amendment"
            entityName={amendment?.title || 'Amendment'}
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
