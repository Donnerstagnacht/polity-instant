'use client';

import { use, useMemo } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard, PermissionGuard } from '@/features/auth';
import { db } from '../../../../db/db';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
import { DocumentEditorView } from '@/features/amendments/document-editor/ui/DocumentEditorView';
import type { Amendment } from '@db/rbac/types';

export default function AmendmentTextPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const amendmentId = resolvedParams.id;
  const { user } = db.useAuth();
  const { amendment } = useAmendmentData(amendmentId);

  // Get user data
  const { data: userData } = db.useQuery({
    $users: {
      $: { where: { id: user?.id } },
    },
  });
  const userRecord = userData?.$users?.[0];

  // Generate a consistent color for this user
  const userColor = useMemo(
    () => (user?.id ? `hsl(${parseInt(user.id.substring(0, 8), 16) % 360}, 70%, 50%)` : '#888888'),
    [user?.id]
  );

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="update"
        resource="amendments"
        context={{ amendment: amendment as Amendment | undefined }}
      >
        <PageWrapper className="container mx-auto p-8">
          <DocumentEditorView
            amendmentId={amendmentId}
            userId={user?.id}
            userRecord={userRecord}
            userColor={userColor}
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
