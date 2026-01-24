/**
 * useChangeRequestVoting Hook
 *
 * Manages sequential voting on change requests during event voting sessions.
 * Handles the queue of pending change requests and moves through them as votes complete.
 */

import { db, tx, id } from 'db/db';
import { useCallback, useMemo } from 'react';
import { usePermissions } from '@db/rbac';
import {
  countVotes,
  calculateMajority,
  isQuorumReached,
  type VoteValue,
} from '@/utils/voting-utils';
import {
  notifyChangeRequestAccepted,
  notifyChangeRequestRejected,
} from '@/utils/notification-helpers';
import { triggerSupporterConfirmation } from '@/features/amendments/hooks/useSupportConfirmation';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

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

  // Query current voting session with votes
  const { data, isLoading, error } = db.useQuery({
    eventVotingSessions: {
      $: {
        where: { id: votingSessionId },
      },
      amendment: {},
      votes: {
        voter: {},
      },
    },
  });

  // Query change requests separately for the agenda item
  // Note: This query pattern may need adjustment based on schema
  const { data: changeRequestData } = db.useQuery(
    agendaItemId
      ? ({
          changeRequests: {
            $: {
              where: {
                'agendaItem.id': agendaItemId,
              },
            },
            author: {},
          },
        } as any)
      : null
  ) as { data: any };

  const votingSession = data?.eventVotingSessions?.[0];
  const changeRequests = (changeRequestData?.changeRequests ?? []) as any[];
  const votes = (votingSession?.votes ?? []) as any[];

  // We track current change request via a separate state or the targetEntityId field
  const currentChangeRequestId =
    votingSession?.targetEntityType === 'change_request' ? votingSession?.targetEntityId : null;

  // Current change request being voted on
  const currentChangeRequest = useMemo(() => {
    if (!currentChangeRequestId) return null;
    return changeRequests.find((cr: any) => cr.id === currentChangeRequestId) ?? null;
  }, [currentChangeRequestId, changeRequests]);

  // Change requests that haven't been voted on yet
  // Ordered by votingOrder if present, otherwise by characterCount descending
  const pendingChangeRequests = useMemo(() => {
    return changeRequests
      .filter((cr: any) => cr.status === 'pending')
      .sort((a: any, b: any) => {
        // First, check if either has a votingOrder (manual override)
        if (a.votingOrder !== undefined && b.votingOrder !== undefined) {
          return a.votingOrder - b.votingOrder;
        }
        if (a.votingOrder !== undefined) return -1;
        if (b.votingOrder !== undefined) return 1;

        // Otherwise, sort by character count descending (larger changes first)
        const aCharCount = a.characterCount ?? 0;
        const bCharCount = b.characterCount ?? 0;
        return bCharCount - aCharCount;
      });
  }, [changeRequests]);

  // Get votes for current voting session
  const currentVotes = useMemo(() => {
    return votes.map((v: any) => ({
      vote: v.vote as VoteValue,
      voter: v.voter,
    }));
  }, [votes]);

  // Check if user has already voted
  const hasVoted = useMemo(() => {
    return votes.some((v: any) => v.voter?.id === userId);
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

      const transactions: any[] = [
        tx.eventVotingSessions[votingSessionId].update({
          targetEntityType: 'change_request',
          targetEntityId: changeRequestId,
          phase: 'voting',
        }),
      ];

      // Add timeline event for vote starting
      if (amendmentId) {
        transactions.push(
          createTimelineEvent({
            eventType: 'vote_started',
            entityType: 'amendment',
            entityId: amendmentId,
            actorId: userId,
            title: 'Voting started on change request',
            description: amendmentTitle || undefined,
            contentType: 'vote',
            status: {
              voteStatus: 'open',
            },
          })
        );
      }

      await db.transact(transactions);
    },
    [votingSessionId, can, amendmentId, amendmentTitle, userId]
  );

  // Move to the next change request in queue
  const moveToNextChangeRequest = useCallback(async () => {
    if (!can('manage', 'events')) {
      throw new Error('Permission denied');
    }

    const currentIndex = pendingChangeRequests.findIndex(
      (cr: any) => cr.id === currentChangeRequest?.id
    );

    const nextChangeRequest = pendingChangeRequests[currentIndex + 1];

    if (nextChangeRequest) {
      // Move to next change request
      await db.transact([
        tx.eventVotingSessions[votingSessionId].update({
          targetEntityType: 'change_request',
          targetEntityId: nextChangeRequest.id,
          phase: 'introduction',
        }),
      ]);
      return { hasNext: true, nextId: nextChangeRequest.id };
    } else {
      // No more change requests, complete the session
      await db.transact([
        tx.eventVotingSessions[votingSessionId].update({
          phase: 'completed',
          endedAt: Date.now(),
        }),
      ]);
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

      const voteId = id();
      await db.transact([
        tx.eventVotes[voteId].update({
          vote: voteType,
          createdAt: Date.now(),
        }),
        tx.eventVotes[voteId].link({
          session: votingSessionId,
          voter: userId,
        }),
      ]);

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
      const transactions: any[] = [
        tx.changeRequests[currentChangeRequest.id].update({
          status: newStatus,
          resolvedAt: Date.now(),
        }),
      ];

      // Add timeline event for vote result
      if (amendmentId) {
        transactions.push(
          createTimelineEvent({
            eventType: passed ? 'vote_passed' : 'vote_rejected',
            entityType: 'amendment',
            entityId: amendmentId,
            actorId: userId,
            title: passed ? 'Change request approved' : 'Change request rejected',
            description: amendmentTitle || undefined,
            contentType: 'vote',
            status: {
              voteStatus: passed ? 'passed' : 'rejected',
            },
          })
        );
      }

      await db.transact(transactions);

      // Send notifications to change request author
      const authorId = currentChangeRequest.author?.id;
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
            await triggerSupporterConfirmation({
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
      await db.transact([
        tx.changeRequests[currentChangeRequest.id].update({
          status: 'skipped',
        }),
      ]);
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
    currentIndex: pendingChangeRequests.findIndex((cr: any) => cr.id === currentChangeRequest?.id),
    totalChangeRequests: pendingChangeRequests.length,
    progress:
      pendingChangeRequests.length > 0
        ? (pendingChangeRequests.findIndex((cr: any) => cr.id === currentChangeRequest?.id) + 1) /
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
