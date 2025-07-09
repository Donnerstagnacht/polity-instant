import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { GroupsCard } from './GroupsCard';

import type { UserGroup } from '../types/user.types';

interface GroupsListTabProps {
  groups: UserGroup[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  getRoleBadgeColor: (role: string) => { bg: string; text: string; badge: string };
}

export const GroupsListTab: React.FC<GroupsListTabProps> = ({
  groups,
  searchValue,
  onSearchChange,
  getRoleBadgeColor,
}) => {
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
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search groups by name, role or description..."
          className="pl-10"
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>
      {filteredGroups.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center">
          No groups found matching your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredGroups.map(group => {
            const roleColor = getRoleBadgeColor(group.role);
            const badgeClasses = `${roleColor.bg} ${roleColor.text}`;
            return <GroupsCard key={group.id} group={group} badgeClasses={badgeClasses} />;
          })}
        </div>
      )}
    </>
  );
};
