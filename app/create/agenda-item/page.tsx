'use client';

import { Suspense } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { CreateAgendaItemForm } from '@/features/events/ui/CreateAgendaItemForm';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/hooks/use-translation';

export default function CreateAgendaItemPage() {
  const { t } = useTranslation();
  
  return (
    <AuthGuard requireAuth={true}>
      <Suspense
        fallback={
          <PageWrapper className="flex min-h-screen items-center justify-center p-8">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>{t('pages.create.loading')}</CardTitle>
              </CardHeader>
            </Card>
          </PageWrapper>
        }
      >
        <CreateAgendaItemForm />
      </Suspense>
    </AuthGuard>
  );
}
