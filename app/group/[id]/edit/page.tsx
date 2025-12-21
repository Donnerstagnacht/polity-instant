'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupEdit } from '@/features/groups/ui/GroupEdit';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function GroupEditPage({ params }: PageParams) {
  const { id: groupId } = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="groups"
        context={{ groupId }}
      >
        <PageWrapper>
          <GroupEdit groupId={groupId} />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
