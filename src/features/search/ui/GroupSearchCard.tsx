import React from 'react';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import db from '../../../../db/db';

interface GroupSearchCardProps {
  group: any;
}

export function GroupSearchCard({ group }: GroupSearchCardProps) {
  const { user } = db.useAuth();

  // Find current user's membership to get their actual role
  const userMembership = group.memberships?.find((m: any) => m.user?.id === user?.id);

  // Use the actual role from membership, fallback to 'Member' if not a member
  const role = userMembership?.role?.name || (userMembership ? 'Member' : 'Visitor');
  // Calculate member count from memberships or use memberCount field
  const memberCount = group.memberCount || group.memberships?.length || 0;

  return (
    <GroupTimelineCard
      group={{
        id: String(group.id),
        name: group.name,
        description: group.description,
        memberCount,
        eventCount: group.events?.length || 0,
        amendmentCount: group.amendments?.length || 0,
        topics: group.tags,
        hashtags: group.hashtags,
        membershipStatus: userMembership?.status || (role === 'Visitor' ? null : 'member'),
      }}
    />
  );
}
