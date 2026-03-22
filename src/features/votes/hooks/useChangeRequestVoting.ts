/**
 * useChangeRequestVoting Hook
 *
 * Manages sequential voting on change requests during event voting sessions.
 * Handles the queue of pending change requests and moves through them as votes complete.
 */

import { useCallback, useMemo } from 'react';
import { useZero } from '@rocicorp/zero/react';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { useChangeRequestsByAmendment } from '@/zero/events/useEventState';
import { usePermissions } from '@/zero/rbac';
import {
  countVotes,
  calculateMajority,
  isQuorumReached,
  type VoteValue,
} from '@/features/shared/utils/voting-utils';
import {
  notifyChangeRequestAccepted,
  notifyChangeRequestRejected,
} from '@/features/notifications/utils/notification-helpers.ts';
import { triggerSupporterConfirmation } from '@/features/amendments/hooks/useSupportConfirmation';

interface UseChangeRequestVotingOptions {
  eventId: string;
  votingSessionId: string;
  userId: string;
  agendaItemId?: string;
  amendmentId?: string;
  amendmentTitle?: string;
}

export function useChangeRequestVoting({
  eventId,
  votingSessionId,
  userId,
  agendaItemId,
  amendmentId,
  amendmentTitle,
}: UseChangeRequestVotingOptions) {
  const { can } = usePermissions({ eventId });
  const zero = useZero();
  const { updateChangeRequest } = useAmendmentActions();
  const { updateAgendaItem } = useAgendaActions();
  const { createTimelineEvent } = useCommonActions();

  // TODO: Wire up to new vote model — session-based voting no longer exists
  const votingSession = null;
  const sessionLoading = false;

  // Query change requests for the agenda item
  const { changeRequests: changeRequestsRaw, isLoading: crLoading } = useChangeRequestsByAmendment(amendmentId);

  const isLoading = sessionLoading || crLoading;
  const error = undefined;

  const changeRequests = changeRequestsRaw ?? [];
  // TODO: Wire up votes from new vote model
  const votes: { vote: string; user: { id: string } | undefined }[] = [];

  // We track current change request by finding the one with voting_status 'voting'
  const currentChangeRequestId = useMemo(() => {
    const active = changeRequests.find((cr) => cr.voting_status === 'voting');
    return active?.id ?? null;
  }, [changeRequests]);

  // Current change request being voted on
  const currentChangeRequest = useMemo(() => {
    if (!currentChangeRequestId) return null;
    return changeRequests.find((cr) => cr.id === currentChangeRequestId) ?? null;
  }, [currentChangeRequestId, changeRequests]);

  // Change requests that haven't been voted on yet
  // Ordered by votingOrder if present, otherwise by characterCount descending
  const pendingChangeRequests = useMemo(() => {
    return changeRequests
      .filter((cr) => cr.status === 'pending')
      .sort((a, b) => {
        // Sort by created_at ascending (oldest first)
        return (a.created_at ?? 0) - (b.created_at ?? 0);
      });
  }, [changeRequests]);

  // Get votes for current voting session
  const currentVotes = useMemo(() => {
    return votes.map((v) => ({
      vote: v.vote as VoteValue,
      voter: v.user,
    }));
  }, [votes]);

  // Check if user has already voted
  const hasVoted = useMemo(() => {
    return votes.some((v) => v.user?.id === userId);
  }, [votes, userId]);

  // Calculate vote results
  const voteResults = useMemo(() => {
    return countVotes(currentVotes);
  }, [currentVotes]);

  // Start voting on a specific change request
  const startChangeRequestVote = useCallback(
    async (changeRequestId: string) => {
      if (!can('manage', 'events')) {
        throw new Error('Permission denied');
      }

      // Mark the change request as actively being voted on
      await updateChangeRequest({
        id: changeRequestId,
        voting_status: 'voting',
      });

      await updateAgendaItem({
        id: votingSessionId,
        voting_phase: 'voting',
      });

      await createTimelineEvent({
        id: crypto.randomUUID(),
        event_type: 'change_request_voting_started',
        entity_id: changeRequestId,
        entity_type: 'change_request',
        metadata: { votingSessionId, changeRequestId, amendmentId: amendmentId! },
        title: '',
        description: '',
        image_url: '',
        video_url: '',
        video_thumbnail_url: '',
        content_type: '',
        tags: null,
        stats: null,
        vote_status: '',
        election_status: '',
        ends_at: 0,
        user_id: userId,
        group_id: null,
        amendment_id: amendmentId ?? '',
        event_id: eventId,
        todo_id: null,
        blog_id: null,
        statement_id: null,
        actor_id: userId,
        election_id: null,
        amendment_vote_id: null,
      });
    },
    [votingSessionId, can, amendmentId, amendmentTitle, userId]
  );

  // Move to the next change request in queue
  const moveToNextChangeRequest = useCallback(async () => {
    if (!can('manage', 'events')) {
      throw new Error('Permission denied');
    }

    const currentIndex = pendingChangeRequests.findIndex(
      (cr) => cr.id === currentChangeRequest?.id
    );

    const nextChangeRequest = pendingChangeRequests[currentIndex + 1];

    if (nextChangeRequest) {
      // Move to next change request
      await updateChangeRequest({
        id: nextChangeRequest.id,
        voting_status: 'voting',
      });

      await updateAgendaItem({
        id: votingSessionId,
        voting_phase: 'voting',
      });
      return { hasNext: true, nextId: nextChangeRequest.id };
    } else {
      // No more change requests, complete the session
      await updateAgendaItem({
        id: votingSessionId,
        voting_phase: 'completed',
        completed_at: Date.now(),
      });
      return { hasNext: false, nextId: null };
    }
  }, [votingSessionId, pendingChangeRequests, currentChangeRequest, can]);

  // Cast a vote on the current change request
  const castVote = useCallback(
    async (voteType: VoteValue) => {
      if (!currentChangeRequest) {
        throw new Error('No active change request');
      }

      if (hasVoted) {
        throw new Error('Already voted');
      }

      if (!can('vote', 'events')) {
        throw new Error('Permission denied');
      }

      // TODO: Wire up to new vote model — castVote no longer exists on event actions
      const voteId = crypto.randomUUID();

      return voteId;
    },
    [votingSessionId, userId, currentChangeRequest, hasVoted, can]
  );

  // Complete voting on current change request and apply result
  const completeChangeRequestVote = useCallback(
    async (
      quorum: number,
      majorityType: 'simple' | 'absolute' | 'two_thirds' = 'simple',
      totalEligibleVoters: number
    ) => {
      if (!can('manage', 'events')) {
        throw new Error('Permission denied');
      }

      if (!currentChangeRequest) {
        throw new Error('No active change request');
      }

      const voteCount = countVotes(currentVotes);
      const quorumReached = isQuorumReached(voteCount.total, totalEligibleVoters, quorum);
      const result = calculateMajority(currentVotes, majorityType, totalEligibleVoters);
      const passed = quorumReached && result === 'passed';
      const newStatus = passed ? 'approved' : 'rejected';

      // Update change request status
      await updateChangeRequest({
        id: currentChangeRequest.id,
        status: newStatus,
        voting_status: newStatus,
      });

      await createTimelineEvent({
        id: crypto.randomUUID(),
        event_type: 'change_request_resolved',
        entity_id: currentChangeRequest.id,
        entity_type: 'change_request',
        metadata: { changeRequestId: currentChangeRequest.id, status: newStatus, amendmentId: amendmentId ?? '' },
        title: '',
        description: '',
        image_url: '',
        video_url: '',
        video_thumbnail_url: '',
        content_type: '',
        tags: null,
        stats: null,
        vote_status: '',
        election_status: '',
        ends_at: 0,
        user_id: userId,
        group_id: null,
        amendment_id: amendmentId ?? '',
        event_id: eventId,
        todo_id: null,
        blog_id: null,
        statement_id: null,
        actor_id: userId,
        election_id: null,
        amendment_vote_id: null,
      });

      // Send notifications to change request author
      const authorId = currentChangeRequest.user?.id;
      if (authorId && amendmentId && amendmentTitle) {
        if (passed) {
          await notifyChangeRequestAccepted({
            senderId: userId,
            recipientUserId: authorId,
            amendmentId,
            amendmentTitle,
          });

          // Trigger supporter confirmation for groups that support this amendment
          // They need to confirm their support now that changes have been made
          try {
            await triggerSupporterConfirmation((mutation) => zero.mutate(mutation).client, {
              amendmentId,
              changeRequestId: currentChangeRequest.id,
              changeRequestTitle: currentChangeRequest.title,
              userId,
            });
          } catch (error) {
            console.error('Failed to trigger supporter confirmation:', error);
            // Don't fail the main operation if confirmation fails
          }
        } else {
          await notifyChangeRequestRejected({
            senderId: userId,
            recipientUserId: authorId,
            amendmentId,
            amendmentTitle,
          });
        }
      }

      return {
        passed,
        voteCount,
        quorumReached,
        result,
      };
    },
    [currentChangeRequest, currentVotes, userId, amendmentId, amendmentTitle, can]
  );

  // Skip current change request (no vote, move to next)
  const skipChangeRequest = useCallback(async () => {
    if (!can('manage', 'events')) {
      throw new Error('Permission denied');
    }

    if (currentChangeRequest) {
      await updateChangeRequest({
        id: currentChangeRequest.id,
        status: 'skipped',
      });
    }

    return moveToNextChangeRequest();
  }, [currentChangeRequest, moveToNextChangeRequest, can]);

  return {
    // State
    isLoading,
    error,
    votingSession,
    changeRequests,
    pendingChangeRequests,
    currentChangeRequest,
    currentVotes,
    voteResults,
    hasVoted,

    // Derived state
    currentIndex: pendingChangeRequests.findIndex((cr) => cr.id === currentChangeRequest?.id),
    totalChangeRequests: pendingChangeRequests.length,
    progress:
      pendingChangeRequests.length > 0
        ? (pendingChangeRequests.findIndex((cr) => cr.id === currentChangeRequest?.id) + 1) /
          pendingChangeRequests.length
        : 0,

    // Actions
    startChangeRequestVote,
    castVote,
    completeChangeRequestVote,
    moveToNextChangeRequest,
    skipChangeRequest,

    // Permissions
    canManage: can('manage', 'events'),
    canVote: can('vote', 'events'),
  };
}
