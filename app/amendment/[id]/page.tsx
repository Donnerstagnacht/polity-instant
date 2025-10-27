'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AmendmentWiki } from '@/features/amendments/AmendmentWiki';

export default function AmendmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <AmendmentWiki amendmentId={resolvedParams.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
