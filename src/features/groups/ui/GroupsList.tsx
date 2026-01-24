import React from 'react';
import { useGroupsStore } from '@/global-state/groups.store';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

export const GroupsList: React.FC = () => {
  const { t } = useTranslation();
  const { loading, getFilteredGroups } = useGroupsStore();

  const filteredGroups = getFilteredGroups();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">{t('features.groups.list.loading')}</span>
      </div>
    );
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <span className="text-2xl">🔍</span>
          </div>
        </div>
        <h3 className="mb-2 text-lg font-medium text-foreground">
          {t('features.groups.list.noGroups')}
        </h3>
        <p className="text-muted-foreground">{t('features.groups.list.noGroupsDescription')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {t('features.groups.list.groupsFound', { count: filteredGroups.length })}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map(group => (
          <GroupTimelineCard
            key={group.id}
            group={{
              id: String(group.id),
              name: group.name,
              description: group.description,
              memberCount: group.members,
              eventCount: group.events,
              amendmentCount: group.amendments,
              topics: group.tags,
            }}
          />
        ))}
      </div>
    </div>
  );
};
