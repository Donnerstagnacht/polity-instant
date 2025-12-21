'use client';

import { Suspense } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { SearchPage } from '@/features/search/SearchPage';

export default function SearchRoute() {
  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <Suspense fallback={<div>Loading search...</div>}>
          <SearchPage />
        </Suspense>
      </PageWrapper>
    </AuthGuard>
  );
}
