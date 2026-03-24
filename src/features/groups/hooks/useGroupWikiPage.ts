import { useGroupWikiData } from '@/zero/groups/useGroupState';
import { useSubscribeGroup } from '@/features/groups/hooks/useSubscribeGroup';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';
import { checkEntityAccess } from '@/features/auth/logic/checkEntityAccess';
import { useAuth } from '@/providers/auth-provider';

export function useGroupWikiPage(groupId: string) {
  const { user } = useAuth();

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
  const memberCount = group?.member_count ?? membershipCount ?? group?.memberships?.length ?? 0;
  const eventsCount = group?.event_count ?? group?.events?.length ?? 0;
  const amendmentsCount = group?.amendment_count ?? group?.amendments?.length ?? 0;

  // Visibility access check
  const canAccess = checkEntityAccess(group?.visibility, !!user, isMember);

  return {
    // Group data
    group,
    canAccess,

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
