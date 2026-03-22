import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuth } from '@/providers/auth-provider';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useSubscribeAmendment } from './useSubscribeAmendment';
import { useAmendmentCollaboration } from './useAmendmentCollaboration';
import { useCloneAmendment } from './useCloneAmendment';
import {
  deriveVoteState,
  getSupportStatus,
  AMENDMENT_STATUS_COLORS,
} from '../logic/amendmentHelpers';
import { notifyAmendmentVoted } from '@/features/notifications/utils/notification-helpers.ts';

export function useAmendmentWikiPage(amendmentId: string) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Subscribe hook
  const subscribeData = useSubscribeAmendment(amendmentId);

  // Collaboration hook
  const collaborationData = useAmendmentCollaboration(amendmentId);

  const { updateAmendment } = useAmendmentActions();

  // All data via facade
  const facadeResult = useAmendmentState({
    amendmentId,
    userId: user?.id,
    includeFullRelations: true,
    includeClones: true,
    includeNetworkData: true,
    includeUserMemberships: !!user?.id,
    includeAllUsers: !!user?.id,
    includeEventsByGroup: false,
    eventGroupId: '',
  });

  const amendment = facadeResult.amendmentFull;

  const networkData = useMemo(
    () => ({
      groupMemberships: [
        ...(facadeResult.userMemberships ?? []),
        ...(facadeResult.allGroupMemberships ?? []),
      ],
      groups: facadeResult.allGroups ?? [],
      groupRelationships: facadeResult.allGroupRelationships ?? [],
      events: facadeResult.allEvents ?? [],
    }),
    [
      facadeResult.userMemberships,
      facadeResult.allGroupMemberships,
      facadeResult.allGroups,
      facadeResult.allGroupRelationships,
      facadeResult.allEvents,
    ]
  );

  // Clone hook (needs networkData + selectedTargetGroupId for event queries)
  const cloneData = useCloneAmendment(amendmentId, amendment, networkData, user?.id, user?.email);

  // Re-query events for the selected target group
  const { eventsByGroup: targetGroupEventsResult } = useAmendmentState({
    amendmentId,
    includeEventsByGroup: !!cloneData.selectedTargetGroupId,
    eventGroupId: cloneData.selectedTargetGroupId,
  });

  const targetGroupEventsData = useMemo(
    () => ({ events: targetGroupEventsResult ?? [] }),
    [targetGroupEventsResult]
  );

  const usersData = useMemo(
    () => ({
      $users: facadeResult.allUsers ?? [],
    }),
    [facadeResult.allUsers]
  );

  // Derived data
  const collaborators = amendment?.collaborators || [];
  const supportingGroups = amendment?.support_confirmations || [];
  const supportConfirmations = amendment?.support_confirmations || [];
  const clones = facadeResult.clones ?? [];
  const clonedFrom = amendment?.clone_source;
  const totalSupportingMembers = supportingGroups.reduce(
    (sum: number, _group) => sum + 0,
    0
  );
  const path = amendment?.paths?.[0];
  const targetCollaborator = undefined as { imageURL?: string; name?: string } | undefined;
  const targetGroup = amendment?.group;

  const isAdmin = collaborationData.status === 'admin';

  const voteState = useMemo(
    () =>
      amendment
        ? deriveVoteState(amendment, user?.id)
        : { score: 0, userVote: null, hasUpvoted: false, hasDownvoted: false },
    [amendment, user?.id]
  );

  const handleVote = async (voteValue: number) => {
    if (!user?.id) {
      toast.error('Please log in to vote');
      return;
    }
    if (!amendment) {
      toast.error('Amendment not found');
      return;
    }

    try {
      // TODO: Per-user upvote/downvote tracking removed with voting system migration
      // For now, just update the aggregate counts directly
      await updateAmendment({
        id: amendmentId,
        upvotes: voteValue === 1 ? (amendment.upvotes || 0) + 1 : amendment.upvotes,
        downvotes: voteValue === -1 ? (amendment.downvotes || 0) + 1 : amendment.downvotes,
      });

      // Notify amendment author about vote
      const adminCollab = collaborators.find((c) => c.status === 'admin');
      const authorUserId = adminCollab?.user?.id;
      if (authorUserId && authorUserId !== user.id) {
        await notifyAmendmentVoted({
          senderId: user.id,
          senderName: user.email || 'Someone',
          recipientUserId: authorUserId,
          amendmentId,
          amendmentTitle: amendment.title ?? '',
          voteType: voteValue === 1 ? 'upvote' : 'downvote',
        });
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const getSupportStatusForGroup = (groupId: string) =>
    getSupportStatus(
      groupId,
      supportConfirmations.map(sc => ({
        group: sc.group_id ? { id: sc.group_id } : undefined,
        status: sc.status ?? undefined,
      })),
    );

  return {
    // Navigation
    navigate,
    user,

    // Subscribe
    ...subscribeData,

    // Collaboration
    collaboration: collaborationData,

    // Amendment data
    amendment,
    isLoading: facadeResult.isLoading,
    isAdmin,
    collaborators,
    supportingGroups,
    clones,
    clonedFrom,
    totalSupportingMembers,
    targetCollaborator,
    targetGroup,

    // Vote
    ...voteState,
    handleVote,

    // Clone
    ...cloneData,
    networkData,
    targetGroupEventsData,
    usersData,

    // Helpers
    getSupportStatus: getSupportStatusForGroup,
    statusColors: AMENDMENT_STATUS_COLORS,
  };
}
