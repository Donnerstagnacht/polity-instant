'use client';

/**
 * Amendment Text Editor Page
 *
 * Uses the unified EditorView component for amendment document editing.
 */

import { use } from 'react';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard, PermissionGuard } from '@/features/auth';
import { EditorView } from '@/features/editor';
import { db } from '@db/db';
import { useAmendmentData } from '@/features/amendments/hooks/useAmendmentData';
import type { Amendment } from '@db/rbac/types';

export default function AmendmentTextPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const amendmentId = resolvedParams.id;
  const { user } = db.useAuth();
  const { amendment } = useAmendmentData(amendmentId);

  // Get user data
  const { data: userData } = db.useQuery(
    user?.id
      ? {
          $users: {
            $: { where: { id: user.id } },
          },
        }
      : null
  );
  const userRecord = userData?.$users?.[0];

  return (
    <AuthGuard requireAuth={true}>
      <PermissionGuard
        action="manage"
        resource="amendments"
        context={{ amendment: amendment as Amendment | undefined }}
      >
        <PageWrapper>
          <EditorView
            entityType="amendment"
            entityId={amendmentId}
            userId={user?.id}
            userRecord={
              userRecord
                ? {
                    id: userRecord.id,
                    name: userRecord.name,
                    email: user?.email,
                    avatar: userRecord.avatar,
                  }
                : undefined
            }
          />
        </PageWrapper>
      </PermissionGuard>
    </AuthGuard>
  );
}
