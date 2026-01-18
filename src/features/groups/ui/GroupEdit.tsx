/**
 * Group Edit Component
 *
 * Complete group editing UI with loading and error states.
 * Handles data fetching, form display, and navigation.
 */

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useGroupData } from '../hooks/useGroupData';
import { GroupEditForm } from './GroupEditForm';
import { useAuthStore } from '@/features/auth/auth';
import { useTranslation } from '@/hooks/use-translation';

interface GroupEditProps {
  groupId: string;
}

export function GroupEdit({ groupId }: GroupEditProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { group, isLoading } = useGroupData(groupId);
  const { user } = useAuthStore();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{t('features.groups.editPage.loading')}</p>
      </div>
    );
  }

  // Not found state
  if (!group) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-lg font-semibold">{t('features.groups.editPage.notFound')}</p>
          <p className="text-muted-foreground">{t('features.groups.editPage.notFoundDescription')}</p>
          <div className="mt-6">
            <Button onClick={() => router.push(`/groups`)} variant="default">
              {t('features.groups.backToGroups')}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main edit view
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('features.groups.editPage.title')}</h1>
        <p className="text-muted-foreground">{t('features.groups.editPage.subtitle')}</p>
      </div>

      <GroupEditForm
        groupId={groupId}
        initialData={group}
        onCancel={() => router.push(`/group/${groupId}`)}
        actorId={user?.id}
        visibility={group?.visibility as 'public' | 'private' | 'authenticated' | undefined}
      />
    </div>
  );
}
