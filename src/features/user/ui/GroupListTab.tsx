import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { useTranslation } from '@/hooks/use-translation';

import type { UserGroup } from '../types/user.types';

interface GroupsListTabProps {
  groups: UserGroup[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const GroupsListTab: React.FC<GroupsListTabProps> = ({
  groups,
  searchValue,
  onSearchChange,
}) => {
  const { t } = useTranslation();
  const filteredGroups = useMemo(() => {
    const term = (searchValue ?? '').toLowerCase();
    if (!term) return groups;
    return groups.filter(
      group =>
        group.name.toLowerCase().includes(term) ||
        group.role.toLowerCase().includes(term) ||
        (group.description && group.description.toLowerCase().includes(term))
    );
  }, [groups, searchValue]);

  return (
    <>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={t('pages.user.groups.searchPlaceholder')}
          className="pl-10"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filteredGroups.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{t('pages.user.groups.noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map(group => {
            const groupId = group.groupId || group.id;
            return (
              <GroupTimelineCard
                key={group.id}
                group={{
                  id: String(groupId),
                  name: group.name,
                  description: group.description,
                  memberCount: group.members,
                  eventCount: group.events,
                  amendmentCount: group.amendments,
                  topics: group.tags,
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
};
