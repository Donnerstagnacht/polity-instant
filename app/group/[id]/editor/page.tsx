'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PermissionGuard } from '@/features/auth/PermissionGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useGroupData } from '@/features/groups/hooks/useGroupData';
import { GroupDocumentsList } from '@/features/groups/ui/GroupDocumentsList';
import db from '../../../../db/db';

export default function GroupEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const groupId = resolvedParams.id;
  const { user } = db.useAuth();

  // Fetch group data
  const { group } = useGroupData(groupId);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="view"
        resource="groups"
        context={{ groupId }}
      >
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{group?.name || 'Group'} Documents</h1>
          <p className="text-muted-foreground">
            Create and manage collaborative documents for this group. Select a document to start
            editing.
          </p>
        </div>

        <GroupDocumentsList groupId={groupId} groupName={group?.name} userId={user?.id} />
      </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
