import React, { useEffect } from 'react';
import { useGroupsStore } from '@/global-state/groups.store';
import { GroupsHeader } from './components/GroupsHeader';
import { GroupsFilters } from './components/GroupsFilters';
import { GroupsList } from './components/GroupsList';

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
