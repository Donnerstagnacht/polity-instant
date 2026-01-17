'use client';

import { use } from 'react';
import { AuthGuard } from '@/features/auth';
import { NotificationSettingsPage } from '@/features/notifications/ui/NotificationSettingsPage';
import { usePermissions } from '../../../../db/rbac/usePermissions';
import { AccessDenied } from '@/components/shared/AccessDenied';

export default function UserNotificationsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { isMe, isLoading: permissionsLoading } = usePermissions({});

  if (permissionsLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="container mx-auto max-w-6xl p-8">
          <div>Loading...</div>
        </div>
      </AuthGuard>
    );
  }

  // Only the user themselves can access their notification settings
  if (!isMe(resolvedParams.id)) {
    return (
      <AuthGuard requireAuth={true}>
        <AccessDenied />
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <NotificationSettingsPage userId={resolvedParams.id} />
    </AuthGuard>
  );
}
