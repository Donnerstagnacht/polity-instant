'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import db from '../../../../db/db';
import { ChangeRequestsView } from '@/features/amendments/change-requests/ui/ChangeRequestsView';

export default function AmendmentChangeRequestsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const amendmentId = resolvedParams.id;
  const { user } = db.useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <ChangeRequestsView amendmentId={amendmentId} userId={user?.id} />
    </AuthGuard>
  );
}
