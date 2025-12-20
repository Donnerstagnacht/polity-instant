'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { GroupWiki } from '@/features/groups/GroupWiki';
import { usePermissions } from '../../../db/rbac/usePermissions';
import { Button } from '@/components/ui/button';

export default function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  const { canManage } = usePermissions({ groupId: resolvedParams.id });
  const canManageGroup = canManage('groups');

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        {canManageGroup && (
          <div className="mb-4 flex justify-end">
            <Button variant="outline" size="sm">
              Group Settings
            </Button>
          </div>
        )}
        <GroupWiki groupId={resolvedParams.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
