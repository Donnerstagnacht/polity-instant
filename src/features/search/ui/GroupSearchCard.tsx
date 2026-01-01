import React from 'react';
import { GroupsCard } from '@/features/user/ui/GroupsCard';
import { getRoleBadgeColor } from '@/features/user/utils/userWiki.utils';
import db from '../../../../db/db';

interface GroupSearchCardProps {
  group: any;
  gradientClass?: string;
}

export function GroupSearchCard({
  group,
  gradientClass = 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/50',
}: GroupSearchCardProps) {
  const { user } = db.useAuth();
  
  // Find current user's membership to get their actual role
  const userMembership = group.memberships?.find(
    (m: any) => m.user?.id === user?.id
  );
  
  // Use the actual role from membership, fallback to 'Member' if not a member
  const role = userMembership?.role?.name || (userMembership ? 'Member' : 'Visitor');
  const roleColors = getRoleBadgeColor(role);
  // Create badge classes string from the color object
  const badgeClasses = `${roleColors.bg} ${roleColors.text}`;

  // Calculate member count from memberships or use memberCount field
  const memberCount = group.memberCount || group.memberships?.length || 0;

  return (
    <a href={`/group/${group.id}`} className="block cursor-pointer">
      <GroupsCard
        group={{
          id: group.id,
          abbr: group.abbr,
          name: group.name,
          description: group.description,
          role: role,
          members: memberCount,
          amendments: group.amendments?.length || 0,
          events: group.events?.length || 0,
          tags: group.tags,
        }}
        badgeClasses={badgeClasses}
        gradientClass={gradientClass}
      />
    </a>
  );
}
