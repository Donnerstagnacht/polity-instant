import React from 'react';
import { useGroupsStore } from '@/global-state/groups.store';
import { GroupsCard } from '@/features/user/ui/GroupsCard';
import { getRoleBadgeColor } from '@/features/user/utils/userWiki.utils';
import { GRADIENTS } from '@/features/user/state/gradientColors';
import { Loader2 } from 'lucide-react';

export const GroupsList: React.FC = () => {
  const { loading, getFilteredGroups } = useGroupsStore();

  const filteredGroups = getFilteredGroups();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading groups...</span>
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
        <h3 className="mb-2 text-lg font-medium text-foreground">No groups found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search terms or clearing the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">
          {filteredGroups.length} group{filteredGroups.length !== 1 ? 's' : ''} found
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group, index) => {
          const roleColor = getRoleBadgeColor(group.role);
          const badgeClasses = `${roleColor.bg} ${roleColor.text}`;
          const gradientClass = GRADIENTS[index % GRADIENTS.length];

          return (
            <GroupsCard
              key={group.id}
              group={group}
              badgeClasses={badgeClasses}
              gradientClass={gradientClass}
            />
          );
        })}
      </div>
    </div>
  );
};
