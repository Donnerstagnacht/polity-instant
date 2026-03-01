import { useGroupWikiData } from '@/zero/groups/useGroupState';
import { useSubscribeGroup } from '@/features/groups/hooks/useSubscribeGroup';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';

export function useGroupWikiPage(groupId: string) {
  // Subscribe hook
  const {
    isSubscribed,
    subscriberCount,
    isLoading: subscribeLoading,
    toggleSubscribe,
  } = useSubscribeGroup(groupId);

  // Membership hook
  const {
    status,
    isMember,
    hasRequested,
    isInvited,
    memberCount: membershipCount,
    isLoading: membershipLoading,
    requestJoin,
    leaveGroup,
    acceptInvitation,
  } = useGroupMembership(groupId);

  // Fetch group data
  const { group } = useGroupWikiData(groupId);

  // ── Derived counts ────────────────────────────────────────────────
  const memberCount = membershipCount || group?.memberships?.length || group?.member_count || 0;
  const eventsCount = group?.events?.length || 0;
  const amendmentsCount = group?.amendments?.length || 0;

  return {
    // Group data
    group,

    // Derived counts
    memberCount,
    eventsCount,
    amendmentsCount,
    subscriberCount,

    // Subscription
    isSubscribed,
    subscribeLoading,
    toggleSubscribe,

    // Group type
    isHierarchical: group?.group_type === 'hierarchical',

    // Membership
    status,
    isMember,
    hasRequested,
    isInvited,
    membershipLoading,
    requestJoin,
    leaveGroup,
    acceptInvitation,
  };
}
