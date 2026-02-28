import { useMemo } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/auth';
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
import { notifyAmendmentVoted } from '@/features/shared/utils/notification-helpers';

export function useAmendmentWikiPage(amendmentId: string) {
  const navigate = useNavigate();
  const user = useAuthStore((state: any) => state.user);

  // Subscribe hook
  const subscribeData = useSubscribeAmendment(amendmentId);

  // Collaboration hook
  const collaborationData = useAmendmentCollaboration(amendmentId);

  const { updateAmendment, deleteVoteEntry, updateVoteEntry, createVoteEntry } =
    useAmendmentActions();

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

  const amendment = (facadeResult.amendmentFull as any)?.[0] as any;

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
      $users: (facadeResult as any).allUsers ?? [],
    }),
    [(facadeResult as any).allUsers]
  );

  // Derived data
  const collaborators = amendment?.collaborators || [];
  const supportingGroups = amendment?.support_confirmations || [];
  const supportConfirmations = amendment?.support_confirmations || [];
  const clones = facadeResult.clones ?? [];
  const clonedFrom = amendment?.clone_source;
  const totalSupportingMembers = supportingGroups.reduce(
    (sum: number, group: any) => sum + (group.memberships?.length || 0),
    0
  );
  const path = amendment?.paths?.[0];
  const targetCollaborator = path?.user;
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

    try {
      const { userVote } = voteState;
      if (userVote) {
        if (userVote.vote === voteValue) {
          await deleteVoteEntry(userVote.id);
          await updateAmendment({
            id: amendmentId,
            upvotes: voteValue === 1 ? (amendment.upvotes || 1) - 1 : amendment.upvotes,
            downvotes: voteValue === -1 ? (amendment.downvotes || 1) - 1 : amendment.downvotes,
          });
        } else {
          await updateVoteEntry({ id: userVote.id, vote: voteValue });
          await updateAmendment({
            id: amendmentId,
            upvotes:
              voteValue === 1
                ? (amendment.upvotes || 0) + 1
                : Math.max(0, (amendment.upvotes || 1) - 1),
            downvotes:
              voteValue === -1
                ? (amendment.downvotes || 0) + 1
                : Math.max(0, (amendment.downvotes || 1) - 1),
          });
        }
      } else {
        const voteId = crypto.randomUUID();
        await createVoteEntry({
          id: voteId,
          vote: voteValue,
          amendment_id: amendmentId,
        });
        await updateAmendment({
          id: amendmentId,
          upvotes: voteValue === 1 ? (amendment.upvotes || 0) + 1 : amendment.upvotes,
          downvotes: voteValue === -1 ? (amendment.downvotes || 0) + 1 : amendment.downvotes,
        });
      }

      // Notify amendment author about vote (skip on vote removal)
      if (!(userVote && userVote.vote === voteValue)) {
        const adminCollab = collaborators.find((c: any) => c.status === 'admin');
        const authorUserId = adminCollab?.user?.id;
        if (authorUserId && authorUserId !== user.id) {
          await notifyAmendmentVoted({
            senderId: user.id,
            senderName: user.email || 'Someone',
            recipientUserId: authorUserId,
            amendmentId,
            amendmentTitle: amendment.title,
            voteType: voteValue === 1 ? 'upvote' : 'downvote',
          });
        }
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const getSupportStatusForGroup = (groupId: string) =>
    getSupportStatus(groupId, supportConfirmations);

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
