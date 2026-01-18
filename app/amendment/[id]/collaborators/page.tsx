'use client';

import { use } from 'react';
import { db } from '../../../../db/db';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
import { AuthGuard, PermissionGuard } from '@/features/auth';
import { CollaboratorsView } from '@/features/amendments/collaborators/ui/CollaboratorsView';
import { useTranslation } from '@/hooks/use-translation';
import type { Amendment } from '@db/rbac/types';

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function AmendmentCollaboratorsPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const amendmentId = resolvedParams.id;
  const { t } = useTranslation();

  const { amendment } = useAmendmentData(amendmentId);
  const { user } = db.useAuth();
  const currentUserId = user?.id;

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="amendments"
        context={{ amendment: amendment as Amendment | undefined }}
      >
        <CollaboratorsView
          amendmentId={amendmentId}
          amendmentTitle={amendment?.title || t('features.amendments.title')}
          currentUserId={currentUserId}
        />
      </PermissionGuard>
    </AuthGuard>
  );
}
