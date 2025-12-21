'use client';

import { Suspense } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { CreateAgendaItemForm } from '@/features/events/ui/CreateAgendaItemForm';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateAgendaItemPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense
        fallback={
          <PageWrapper className="flex min-h-screen items-center justify-center p-8">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Loading...</CardTitle>
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
