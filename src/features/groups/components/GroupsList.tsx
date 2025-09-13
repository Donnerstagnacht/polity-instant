import React from 'react';
import { useGroupsStore } from '@/global-state/groups.store';
import { GroupsCard } from '@/features/user/ui-user/GroupsCard';
import { getRoleBadgeColor } from '@/features/user/utils/userWiki.utils';
import { Loader2 } from 'lucide-react';

export const GroupsList: React.FC = () => {
  const { loading, getFilteredGroups } = useGroupsStore();

  const filteredGroups = getFilteredGroups();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
        <span className="text-muted-foreground ml-2">Loading groups...</span>
      </div>
    );
  }

  if (filteredGroups.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4">
          <div className="bg-muted mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <span className="text-2xl">🔍</span>
          </div>
        </div>
        <h3 className="text-foreground mb-2 text-lg font-medium">No groups found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search terms or clearing the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-lg font-semibold">
          {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map(group => {
          const roleColor = getRoleBadgeColor(group.role);
          const badgeClasses = `${roleColor.bg} ${roleColor.text}`;

          return <GroupsCard key={group.id} group={group} badgeClasses={badgeClasses} />;
        })}
      </div>
    </div>
  );
};
