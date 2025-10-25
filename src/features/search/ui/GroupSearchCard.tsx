import React from 'react';
import { GroupsCard } from '@/features/user/ui/GroupsCard';
import { getRoleBadgeColor } from '@/features/user/utils/userWiki.utils';

interface GroupSearchCardProps {
  group: any;
}

export function GroupSearchCard({ group }: GroupSearchCardProps) {
  // Default role or get from membership if available
  const role = group.role || 'Member';
  const roleColors = getRoleBadgeColor(role);
  // Create badge classes string from the color object
  const badgeClasses = `${roleColors.bg} ${roleColors.text}`;

  return (
    <a href={`/group/${group.id}`} className="block cursor-pointer">
      <GroupsCard
        group={{
          id: group.id,
          abbr: group.abbr,
          name: group.name,
          description: group.description,
          role: role,
          members: group.memberCount || 0,
          amendments: group.amendments?.length || 0,
          events: group.events?.length || 0,
          tags: group.tags,
        }}
        badgeClasses={badgeClasses}
      />
    </a>
  );
}
