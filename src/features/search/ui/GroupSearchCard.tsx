import React from 'react';
import { GroupTimelineCard } from '@/features/timeline/ui/cards/GroupTimelineCard';
import { extractHashtags } from '@/zero/common/hashtagHelpers';
import { useAuth } from '@/providers/auth-provider';

import { type SearchGroup } from '../types/search.types';

interface GroupSearchCardProps {
  group: SearchGroup | Record<string, unknown>;
}

export function GroupSearchCard({ group }: GroupSearchCardProps) {
  const { user } = useAuth();

  // Type guard: check if this is a full SearchGroup from Zero queries
  const isSearchGroup = (g: SearchGroup | Record<string, unknown>): g is SearchGroup =>
    'memberships' in g && Array.isArray(g.memberships);

  if (isSearchGroup(group)) {
    // Find current user's membership to get their actual role
    const userMembership = group.memberships?.find(m => m.user?.id === user?.id);
    const role = userMembership?.role?.name || (userMembership ? 'Member' : 'Visitor');
    const memberCount = group.member_count ?? group.memberships?.length ?? 0;

    return (
      <GroupTimelineCard
        group={{
          id: String(group.id),
          name: group.name ?? '',
          description: group.description ?? undefined,
          memberCount,
          eventCount: group.events?.length || 0,
          amendmentCount: group.amendments?.length || 0,
          hashtags: extractHashtags(group.group_hashtags),
          membershipStatus: (userMembership?.status as 'admin' | 'invited' | 'requested' | 'member' | null | undefined) || (role === 'Visitor' ? null : 'member'),
        }}
      />
    );
  }

  // Fallback for NetworkGroupEntity or other basic group data
  return (
    <GroupTimelineCard
      group={{
        id: String(group.id ?? ''),
        name: (group.name as string | null) ?? '',
        description: (group.description as string | null) ?? undefined,
        memberCount: 0,
        eventCount: 0,
        amendmentCount: 0,
      }}
    />
  );
}
