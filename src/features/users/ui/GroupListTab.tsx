import React, { useMemo } from 'react';
import { Input } from '@/features/shared/ui/ui/input';
import { Search } from 'lucide-react';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { useTranslation } from '@/features/shared/hooks/use-translation';

import type { ProfileGroupMembership } from '../types/user.types';

interface GroupsListTabProps {
  memberships: readonly ProfileGroupMembership[];
  searchValue: string;
  onSearchChange: (value: string) => void;
}

export const GroupsListTab: React.FC<GroupsListTabProps> = ({
  memberships,
  searchValue,
  onSearchChange,
}) => {
  const { t } = useTranslation();

  const withGroup = useMemo(
    () => memberships.filter((m) => m.group),
    [memberships],
  );

  const filteredGroups = useMemo(() => {
    const term = (searchValue ?? '').toLowerCase();
    if (!term) return withGroup;
    return withGroup.filter(
      (m) =>
        (m.group?.name ?? '').toLowerCase().includes(term) ||
        (m.role?.name ?? '').toLowerCase().includes(term) ||
        (m.group?.description ?? '').toLowerCase().includes(term)
    );
  }, [withGroup, searchValue]);

  // Deduplicate by membership id
  const unique = useMemo(() => {
    const seen = new Set<string>();
    return filteredGroups.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [filteredGroups]);

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
      {unique.length === 0 ? (
        <p className="py-8 text-center text-muted-foreground">{t('pages.user.groups.noResults')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {unique.map(membership => {
            const group = membership.group!;
            return (
              <GroupTimelineCard
                key={membership.id}
                group={{
                  id: String(group.id),
                  name: group.name ?? '',
                  description: group.description ?? undefined,
                  memberCount: group.member_count ?? 0,
                  eventCount: group.event_count ?? group.events?.length,
                  amendmentCount: group.amendment_count ?? group.amendments?.length,
                }}
              />
            );
          })}
        </div>
      )}
    </>
  );
};
