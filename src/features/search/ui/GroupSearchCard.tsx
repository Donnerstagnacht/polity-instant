import React from 'react';
import { useRouter } from 'next/navigation';
import { GroupsCard } from '@/features/user/ui/GroupsCard';
import { getRoleBadgeColor } from '@/features/user/utils/userWiki.utils';

interface GroupSearchCardProps {
  group: any;
}

export function GroupSearchCard({ group }: GroupSearchCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/group/${group.id}`);
  };

  // Default role or get from membership if available
  const role = group.role || 'Member';
  const roleColors = getRoleBadgeColor(role);
  // Create badge classes string from the color object
  const badgeClasses = `${roleColors.bg} ${roleColors.text}`;

  return (
    <div onClick={handleClick} className="cursor-pointer">
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
    </div>
  );
}
