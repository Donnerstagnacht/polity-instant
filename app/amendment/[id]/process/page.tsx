'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AmendmentProcessFlow } from '@/features/amendments/ui/AmendmentProcessFlow';
import { useTranslation } from '@/hooks/use-translation';

export default function AmendmentProcessPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { t } = useTranslation();

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        <div className="mb-8">
          <h1 className="mb-4 text-4xl font-bold">{t('pages.amendment.process.title')}</h1>
          <p className="text-muted-foreground">
            {t('pages.amendment.process.description')}
          </p>
        </div>

        <AmendmentProcessFlow amendmentId={resolvedParams.id} />
      </PageWrapper>
    </AuthGuard>
  );
}
