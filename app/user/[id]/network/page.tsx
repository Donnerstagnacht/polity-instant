'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { UserNetworkFlow } from '@/features/user/ui/UserNetworkFlow';
import { Card, CardContent } from '@/components/ui/card';
import { usePermissions } from '../../../../db/rbac/usePermissions';
import { AccessDenied } from '@/components/shared/AccessDenied';

export default function UserNetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isMe, isLoading: permissionsLoading } = usePermissions({});

  if (permissionsLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div>Loading...</div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!isMe(resolvedParams.id)) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper>
          <AccessDenied />
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">User Network</h1>
          <p className="text-muted-foreground">
            Visualization of the user's group memberships and their network relationships
          </p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="h-[700px]">
              <UserNetworkFlow userId={resolvedParams.id} />
            </div>
          </CardContent>
        </Card>
      </PageWrapper>
    </AuthGuard>
  );
}
