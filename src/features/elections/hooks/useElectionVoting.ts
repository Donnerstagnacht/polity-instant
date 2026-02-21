/**
 * useElectionVoting Hook
 *
 * Manages election voting at events, including candidate voting,
 * winner calculation, and position assignment.
 */

import { useCallback, useMemo } from 'react';
import { useAgendaActions } from '@/zero/agendas/useAgendaActions';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { useElectionWithVotes } from '@/zero/events/useEventState';
import { usePermissions } from '@/zero/rbac';
import { calculateElectionWinner, type MajorityType } from '@/utils/voting-utils';
import { notifyPositionAssigned } from '@/utils/notification-helpers';
import { sendNotificationFn } from '@/server/notifications';
import { schedulePositionRevote } from '@/features/votes/utils/revote-scheduling';

interface UseElectionVotingOptions {
  eventId: string;
  electionId: string;
  userId: string;
  groupId?: string;
  groupName?: string;
}

interface ElectionCandidate {
  id: string;
  user_id?: string;
  name?: string;
  user?: {
    id: string;
    first_name?: string;
    last_name?: string;
    avatar?: string;
  };
  status?: string;
  created_at?: number;
}

interface ElectionVote {
  id: string;
  created_at?: number;
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
  const { castElectionVote, updateElectionVote, updateElection, addCandidate, updateCandidate } = useAgendaActions();
  const { createTimelineEvent } = useCommonActions();
  const { createPositionHolderHistory } = useGroupActions();

  // Query election with candidates and votes
  const { election: electionRaw, isLoading } = useElectionWithVotes(electionId);
  const error = undefined;

  const election = electionRaw as any;
  const candidates = (election?.candidates ?? []) as ElectionCandidate[];
  const votes = (election?.votes ?? []) as ElectionVote[];
  const position = election?.position;

  // Candidates who accepted their nomination
  const eligibleCandidates = useMemo(() => {
    return candidates.filter(c => c.status !== 'declined');
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

      const voteId = crypto.randomUUID();
      await castElectionVote({
        id: voteId,
        election_id: electionId,
        candidate_id: candidateId,
        is_indication: false,
        indicated_at: 0,
      });

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

      await updateElectionVote({
        id: userVote.id,
        candidate_id: newCandidateId,
      });
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
        name: c.name || c.user?.first_name,
      }));

      const result = calculateElectionWinner(electionVotes, candidateList, majorityType);

      if (result.isTie) {
        // Mark election as requiring runoff
        await updateElection({
          id: electionId,
          status: 'runoff_required',
        });

        return {
          success: false,
          isTie: true,
          winner: null,
          voteCount: result.voteCount,
        };
      }

      if (!result.winner) {
        // No winner (e.g., majority threshold not met)
        await updateElection({
          id: electionId,
          status: 'no_winner',
        });

        return {
          success: false,
          isTie: false,
          winner: null,
          voteCount: result.voteCount,
        };
      }

      // Update election with winner
      await updateElection({
        id: electionId,
        status: 'completed',
        description: `winner:${result.winner.id}`,
      });

      sendNotificationFn({ data: { helper: 'notifyElectionResult', params: { senderId: userId, eventId, electionId, winnerId: result.winner.id, winnerName: result.winner.name } } }).catch(console.error)

      await createTimelineEvent({
        id: crypto.randomUUID(),
        event_type: 'election_completed',
        entity_id: electionId,
        entity_type: 'election',
        metadata: { electionId, winnerId: result.winner.id },
        tags: [],
        stats: {},
        title: 'Election Completed',
        description: `Winner: ${result.winner.name || result.winner.id}`,
        image_url: '',
        video_url: '',
        video_thumbnail_url: '',
        content_type: '',
        vote_status: '',
        election_status: 'completed',
        ends_at: 0,
        user_id: userId,
        group_id: groupId || '',
        amendment_id: '',
        event_id: eventId,
        todo_id: '',
        blog_id: '',
        statement_id: '',
        actor_id: userId,
        election_id: electionId,
        amendment_vote_id: '',
      });

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
      if (!election?.winner_id || !position?.id || !groupId) {
        throw new Error('No winner or position to assign');
      }

      if (!can('manage', 'groupPositions')) {
        throw new Error('Permission denied');
      }

      const winningCandidate = candidates.find(c => c.id === election.winner_id);

      if (!winningCandidate || !winningCandidate.user_id) {
        throw new Error('Winner not found');
      }

      const now = Date.now();
      const historyId = crypto.randomUUID();

      // Create position holder history record
      await createPositionHolderHistory({
        id: historyId,
        start_date: now,
        end_date: 0,
        reason: 'elected',
        position_id: position.id,
        user_id: winningCandidate.user_id,
      });

      sendNotificationFn({ data: { helper: 'notifyPositionAssigned', params: { senderId: userId, recipientId: winningCandidate.user_id, eventId, positionId: position.id, positionTitle, electionId } } }).catch(console.error)

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

      return historyId;
    },
    [election, position, groupId, groupName, candidates, electionId, userId, can]
  );

  // Nominate a candidate
  const nominateCandidate = useCallback(
    async (candidateUserId: string) => {
      if (!can('manage', 'elections')) {
        throw new Error('Permission denied');
      }

      const candidateId = crypto.randomUUID();
      await addCandidate({
        id: candidateId,
        status: 'nominated',
        election_id: electionId,
        user_id: candidateUserId,
        name: '',
        description: '',
        image_url: '',
        order_index: 0,
      });

      return candidateId;
    },
    [electionId, can]
  );

  // Accept nomination (by the candidate)
  const acceptNomination = useCallback(
    async (candidateId: string) => {
      const candidate = candidates.find(c => c.id === candidateId);

      if (!candidate || candidate.user_id !== userId) {
        throw new Error('Cannot accept nomination for another user');
      }

      await updateCandidate({
        id: candidateId,
        status: 'accepted',
      });
    },
    [candidates, userId]
  );

  // Decline nomination
  const declineNomination = useCallback(
    async (candidateId: string) => {
      const candidate = candidates.find(c => c.id === candidateId);

      if (!candidate || candidate.user_id !== userId) {
        throw new Error('Cannot decline nomination for another user');
      }

      await updateCandidate({
        id: candidateId,
        status: 'declined',
      });
    },
    [candidates, userId]
  );

  // Check if current user is a candidate
  const isCandidate = useMemo(() => {
    return candidates.some(c => c.user_id === userId);
  }, [candidates, userId]);

  // Get current user's candidate record
  const userCandidate = useMemo(() => {
    return candidates.find(c => c.user_id === userId);
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
    winnerId: election?.winner_id,

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
