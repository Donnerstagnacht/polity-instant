'use client';

import { Suspense } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { SearchPage } from '@/features/search/SearchPage';
import { useTranslation } from '@/hooks/use-translation';

export default function SearchRoute() {
  const { t } = useTranslation();

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <Suspense fallback={<div>{t('common.loading.default')}</div>}>
          <SearchPage />
        </Suspense>
      </PageWrapper>
    </AuthGuard>
  );
}
