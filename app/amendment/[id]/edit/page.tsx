'use client';

import { use } from 'react';
import { AuthGuard, PermissionGuard } from '@/features/auth';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
import { AmendmentEditContent } from '@/features/amendments/ui/AmendmentEditContent';
import { useAuthStore } from '@/features/auth/auth';
import type { Amendment } from '@db/rbac/types';

export default function AmendmentEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user } = useAuthStore();
  const { amendment, collaborators, isLoading } = useAmendmentData(resolvedParams.id);

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="amendments"
        context={{ amendment: amendment as Amendment | undefined }}
      >
        <PageWrapper>
          <AmendmentEditContent
            amendmentId={resolvedParams.id}
            amendment={amendment}
            collaborators={collaborators}
            currentUserId={user?.id || ''}
            isLoading={isLoading}
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
