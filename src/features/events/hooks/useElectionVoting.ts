/**
 * useElectionVoting Hook
 *
 * Manages election voting at events, including candidate voting,
 * winner calculation, and position assignment.
 */

import { db, tx, id } from 'db/db';
import { useCallback, useMemo } from 'react';
import { usePermissions } from '@db/rbac';
import { calculateElectionWinner, type MajorityType } from '@/utils/voting-utils';
import { notifyPositionAssigned } from '@/utils/notification-helpers';
import { schedulePositionRevote } from '@/features/events/utils/revote-scheduling';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent';

interface UseElectionVotingOptions {
  eventId: string;
  electionId: string;
  userId: string;
  groupId?: string;
  groupName?: string;
}

interface ElectionCandidate {
  id: string;
  userId?: string;
  name?: string;
  user?: {
    id: string;
    name?: string;
    avatarUrl?: string;
  };
  nominatedAt?: number;
  acceptedNomination?: boolean;
}

interface ElectionVote {
  id: string;
  votedAt?: number;
  voter?: { id: string };
  candidate?: { id: string; name?: string };
}

export function useElectionVoting({
  eventId,
  electionId,
  userId,
  groupId,
  groupName,
}: UseElectionVotingOptions) {
  const { can } = usePermissions({ eventId, groupId });

  // Query election with candidates and votes
  const { data, isLoading, error } = db.useQuery({
    elections: {
      $: {
        where: { id: electionId },
      },
      position: {
        group: {},
      },
      candidates: {
        user: {},
      },
      votes: {
        voter: {},
        candidate: {},
      },
    },
  });

  const election = data?.elections?.[0] as any;
  const candidates = (election?.candidates ?? []) as ElectionCandidate[];
  const votes = (election?.votes ?? []) as ElectionVote[];
  const position = election?.position;

  // Candidates who accepted their nomination
  const eligibleCandidates = useMemo(() => {
    return candidates.filter(c => c.acceptedNomination !== false);
  }, [candidates]);

  // Check if user has already voted
  const userVote = useMemo(() => {
    return votes.find(v => v.voter?.id === userId);
  }, [votes, userId]);

  const hasVoted = !!userVote;

  // Calculate vote counts per candidate
  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const candidate of eligibleCandidates) {
      counts[candidate.id] = votes.filter(v => v.candidate?.id === candidate.id).length;
    }

    return counts;
  }, [votes, eligibleCandidates]);

  // Total votes cast
  const totalVotes = votes.length;

  // Calculate current leader
  const currentLeader = useMemo(() => {
    if (eligibleCandidates.length === 0) return null;

    let leader: ElectionCandidate | null = null;
    let maxVotes = 0;

    for (const candidate of eligibleCandidates) {
      const count = voteCounts[candidate.id] || 0;
      if (count > maxVotes) {
        maxVotes = count;
        leader = candidate;
      }
    }

    return leader;
  }, [eligibleCandidates, voteCounts]);

  // Cast a vote for a candidate
  const castVote = useCallback(
    async (candidateId: string) => {
      if (!can('vote', 'elections')) {
        throw new Error('Permission denied');
      }

      if (hasVoted) {
        throw new Error('Already voted');
      }

      const voteId = id();
      await db.transact([
        tx.electionVotes[voteId].update({
          votedAt: Date.now(),
        }),
        tx.electionVotes[voteId].link({
          election: electionId,
          voter: userId,
          candidate: candidateId,
        }),
      ]);

      return voteId;
    },
    [electionId, userId, hasVoted, can]
  );

  // Change vote (if allowed)
  const changeVote = useCallback(
    async (newCandidateId: string) => {
      if (!userVote) {
        throw new Error('No existing vote to change');
      }

      await db.transact([
        tx.electionVotes[userVote.id].unlink({
          candidate: userVote.candidate?.id,
        }),
        tx.electionVotes[userVote.id].link({
          candidate: newCandidateId,
        }),
        tx.electionVotes[userVote.id].update({
          votedAt: Date.now(),
        }),
      ]);
    },
    [userVote]
  );

  // Complete election and determine winner
  const completeElection = useCallback(
    async (majorityType: MajorityType = 'simple') => {
      if (!can('manage', 'elections')) {
        throw new Error('Permission denied');
      }

      // Transform data for calculateElectionWinner
      const electionVotes = votes.map(v => ({
        candidate: v.candidate || { id: '', name: '' },
      }));
      const candidateList = eligibleCandidates.map(c => ({
        id: c.id,
        name: c.name || c.user?.name,
      }));

      const result = calculateElectionWinner(electionVotes, candidateList, majorityType);

      if (result.isTie) {
        // Mark election as requiring runoff
        await db.transact([
          tx.elections[electionId].update({
            status: 'runoff_required',
            completedAt: Date.now(),
          }),
        ]);

        return {
          success: false,
          isTie: true,
          winner: null,
          voteCount: result.voteCount,
        };
      }

      if (!result.winner) {
        // No winner (e.g., majority threshold not met)
        await db.transact([
          tx.elections[electionId].update({
            status: 'no_winner',
            completedAt: Date.now(),
          }),
        ]);

        return {
          success: false,
          isTie: false,
          winner: null,
          voteCount: result.voteCount,
        };
      }

      // Update election with winner
      await db.transact([
        tx.elections[electionId].update({
          status: 'completed',
          winnerId: result.winner.id,
          completedAt: Date.now(),
        }),
        // Add timeline event for election winner
        createTimelineEvent({
          eventType: 'election_winner_announced',
          entityType: 'election',
          entityId: electionId,
          actorId: userId,
          title: `Election winner: ${result.winner.name || 'Candidate elected'}`,
          description: position?.title ? `Elected to position: ${position.title}` : undefined,
          contentType: 'election',
          status: {
            electionStatus: 'winner',
          },
        }),
      ]);

      return {
        success: true,
        isTie: false,
        winner: result.winner,
        voteCount: result.voteCount,
      };
    },
    [electionId, eligibleCandidates, votes, can]
  );

  // Assign position to election winner
  const assignPositionToWinner = useCallback(
    async (
      positionTitle: string,
      options?: { termDuration?: 'monthly' | 'quarterly' | 'yearly' | 'biannual' }
    ) => {
      if (!election?.winnerId || !position?.id || !groupId) {
        throw new Error('No winner or position to assign');
      }

      if (!can('manage', 'groupPositions')) {
        throw new Error('Permission denied');
      }

      const winningCandidate = candidates.find(c => c.id === election.winnerId);

      if (!winningCandidate || !winningCandidate.userId) {
        throw new Error('Winner not found');
      }

      const now = Date.now();
      const historyId = id();
      const assignmentId = id();

      // Create position assignment with holder history
      await db.transact([
        // Create position assignment
        tx.positionAssignments[assignmentId].update({
          assignedAt: now,
          assignedVia: 'election',
        }),
        tx.positionAssignments[assignmentId].link({
          position: position.id,
          user: winningCandidate.userId,
          election: electionId,
        }),
        // Update position current holder
        tx.groupPositions[position.id].update({
          currentHolderId: winningCandidate.userId,
        }),
        // Create position holder history record
        tx.positionHolderHistory[historyId]
          .update({
            startDate: now,
            endDate: null,
            reason: 'elected',
            createdAt: now,
          })
          .link({
            position: position.id,
            holder: winningCandidate.userId,
          }),
      ]);

      // Notify the winner
      await notifyPositionAssigned({
        senderId: userId,
        recipientUserId: winningCandidate.userId,
        groupId,
        groupName: groupName || 'Group',
        positionTitle,
      });

      // Schedule revote for position term end if term duration is specified
      if (options?.termDuration) {
        await schedulePositionRevote({
          positionId: position.id,
          groupId,
          termDuration: options.termDuration,
          termStartDate: new Date(now),
          userId,
        });
      }

      return assignmentId;
    },
    [election, position, groupId, groupName, candidates, electionId, userId, can]
  );

  // Nominate a candidate
  const nominateCandidate = useCallback(
    async (candidateUserId: string) => {
      if (!can('manage', 'elections')) {
        throw new Error('Permission denied');
      }

      const candidateId = id();
      await db.transact([
        tx.electionCandidates[candidateId].update({
          nominatedAt: Date.now(),
          acceptedNomination: false,
        }),
        tx.electionCandidates[candidateId].link({
          election: electionId,
          user: candidateUserId,
        }),
      ]);

      return candidateId;
    },
    [electionId, can]
  );

  // Accept nomination (by the candidate)
  const acceptNomination = useCallback(
    async (candidateId: string) => {
      const candidate = candidates.find(c => c.id === candidateId);

      if (!candidate || candidate.userId !== userId) {
        throw new Error('Cannot accept nomination for another user');
      }

      await db.transact([
        tx.electionCandidates[candidateId].update({
          acceptedNomination: true,
          acceptedAt: Date.now(),
        }),
      ]);
    },
    [candidates, userId]
  );

  // Decline nomination
  const declineNomination = useCallback(
    async (candidateId: string) => {
      const candidate = candidates.find(c => c.id === candidateId);

      if (!candidate || candidate.userId !== userId) {
        throw new Error('Cannot decline nomination for another user');
      }

      await db.transact([
        tx.electionCandidates[candidateId].update({
          acceptedNomination: false,
          declinedAt: Date.now(),
        }),
      ]);
    },
    [candidates, userId]
  );

  // Check if current user is a candidate
  const isCandidate = useMemo(() => {
    return candidates.some(c => c.userId === userId);
  }, [candidates, userId]);

  // Get current user's candidate record
  const userCandidate = useMemo(() => {
    return candidates.find(c => c.userId === userId);
  }, [candidates, userId]);

  return {
    // State
    isLoading,
    error,
    election,
    position,
    candidates,
    eligibleCandidates,
    votes,
    voteCounts,
    totalVotes,
    currentLeader,
    userVote,
    hasVoted,
    isCandidate,
    userCandidate,

    // Computed
    isCompleted: election?.status === 'completed',
    requiresRunoff: election?.status === 'runoff_required',
    winnerId: election?.winnerId,

    // Actions
    castVote,
    changeVote,
    completeElection,
    assignPositionToWinner,
    nominateCandidate,
    acceptNomination,
    declineNomination,

    // Permissions
    canManage: can('manage', 'elections'),
    canVote: can('vote', 'elections'),
  };
}
