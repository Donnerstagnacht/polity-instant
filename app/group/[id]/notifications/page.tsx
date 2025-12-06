'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import db from '../../../../db';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function GroupNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isAdmin } = useGroupMembership(resolvedParams.id);

  // Query for group details
  const { data: groupData } = db.useQuery({
    groups: {
      $: { where: { id: resolvedParams.id } },
    },
  });

  const group = groupData?.groups?.[0];

  // Only admins can view group notifications
  if (!isAdmin) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only group administrators can view group notifications.
              </CardDescription>
            </CardHeader>
          </Card>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto max-w-4xl p-8">
        <EntityNotifications
          entityId={resolvedParams.id}
          entityType="group"
          entityName={group?.name || 'Group'}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
