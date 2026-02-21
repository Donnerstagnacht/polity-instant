import React from 'react';
import { useGroupsPage } from '@/features/groups/hooks/useGroupsPage';
import { GroupsHeader } from '@/features/groups/ui/GroupsHeader';
import { GroupsFilters } from '@/features/groups/ui/GroupsFilters';
import { GroupsList } from '@/features/groups/ui/GroupsList';

export const GroupsPage: React.FC = () => {
  const gp = useGroupsPage();

  return (
    <div className="container mx-auto max-w-6xl p-4">
      <GroupsHeader />
      <GroupsFilters
        searchTerm={gp.searchTerm}
        setSearchTerm={gp.setSearchTerm}
        selectedTags={gp.selectedTags}
        setSelectedTags={gp.setSelectedTags}
        toggleTag={gp.toggleTag}
        allTags={gp.allTags}
        hasActiveFilters={gp.hasActiveFilters}
        clearAllFilters={gp.clearAllFilters}
      />
      <GroupsList
        groups={gp.filteredGroups}
        isLoading={gp.isLoading}
      />
    </div>
  );
};
