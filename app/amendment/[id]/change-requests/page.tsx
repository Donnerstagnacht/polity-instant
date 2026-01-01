'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PermissionGuard } from '@/features/auth';
import db from '../../../../db/db';
import { ChangeRequestsView } from '@/features/amendments/change-requests/ui/ChangeRequestsView';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
import type { Amendment } from '@db/rbac/types';

export default function AmendmentChangeRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const amendmentId = resolvedParams.id;
  const { user } = db.useAuth();
  const { amendment } = useAmendmentData(amendmentId);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="view"
        resource="amendments"
        context={{ amendment: amendment as Amendment | undefined }}
      >
        <ChangeRequestsView amendmentId={amendmentId} userId={user?.id} />
      </PermissionGuard>
    </AuthGuard>
  );
}
