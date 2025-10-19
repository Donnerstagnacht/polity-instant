import React, { useEffect } from 'react';
import { useGroupsStore } from '@/global-state/groups.store';
import { GroupsHeader } from '@/features/groups/ui/GroupsHeader';
import { GroupsFilters } from '@/features/groups/ui/GroupsFilters';
import { GroupsList } from '@/features/groups/ui/GroupsList';

export const GroupsPage: React.FC = () => {
  const { fetchGroups } = useGroupsStore();

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <GroupsHeader />
      <GroupsFilters />
      <GroupsList />
    </div>
  );
};
