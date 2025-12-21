'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { StatementDetail } from '@/features/statements/ui/StatementDetail';

export default function StatementPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <StatementDetail statementId={resolvedParams.id} />
    </AuthGuard>
  );
}
