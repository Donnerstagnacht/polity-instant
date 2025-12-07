'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { EntityNotifications } from '@/components/notifications/EntityNotifications';
import db from '../../../../db';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthStore } from '@/features/auth/auth';

export default function AmendmentNotificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { user: authUser } = useAuthStore();

  // Query for amendment details and check if user is admin
  const { data: amendmentData } = db.useQuery(
    (authUser?.id
      ? {
          amendments: {
            $: { where: { id: resolvedParams.id } },
          },
          amendmentRoleCollaborators: {
            $: {
              where: {
                'amendment.id': resolvedParams.id,
                'user.id': authUser.id,
              },
            },
            role: {},
          },
        }
      : null) as any
  ) as any;

  const amendment = amendmentData?.amendments?.[0];
  const collaboration = amendmentData?.amendmentRoleCollaborators?.[0];

  // Check if user is admin (has appropriate role)
  const isAdmin = collaboration?.role?.name === 'Applicant' || collaboration?.status === 'admin';

  // Only admins can view amendment notifications
  if (!isAdmin) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                Only amendment administrators can view amendment notifications.
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
          entityType="amendment"
          entityName={amendment?.title || 'Amendment'}
        />
      </PageWrapper>
    </AuthGuard>
  );
}
