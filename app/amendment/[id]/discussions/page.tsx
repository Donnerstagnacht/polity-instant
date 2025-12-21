'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import db from '../../../../db/db';
import { DiscussionsView } from '@/features/amendments/discussions/ui/DiscussionsView';

export default function AmendmentDiscussionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = db.useAuth();

  return (
    <AuthGuard requireAuth={true}>
      <DiscussionsView amendmentId={resolvedParams.id} userId={user?.id} />
    </AuthGuard>
  );
}
