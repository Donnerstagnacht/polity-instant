'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { TodosPage } from '@/features/todos/TodosPage';

export default function TodosRoute() {
  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto min-h-screen max-w-7xl p-6">
        <TodosPage />
      </PageWrapper>
    </AuthGuard>
  );
}
