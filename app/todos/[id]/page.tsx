'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { useParams } from 'next/navigation';
import { TodoDetailPage } from '@/features/todos/TodoDetailPage';

export default function TodoDetailRoute() {
  const params = useParams();
  const todoId = params.id as string;

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className='container mx-auto max-w-4xl p-6'>
        <TodoDetailPage todoId={todoId} />
      </PageWrapper>
    </AuthGuard>
  );
}
