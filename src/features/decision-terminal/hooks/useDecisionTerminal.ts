'use client';

import { useMemo, useCallback } from 'react';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useAgendaState } from '@/zero/agendas/useAgendaState';
import type { DecisionItem } from '../ui/types';
import {
  getDecisionStatus,
  isUrgent,
  isClosingSoon,
  isClosed,
  generateDecisionId,
} from '../logic/decision-status';
import { calculateSupportPercentage } from '../logic/trend-calculation';

// Re-export DecisionItem for use in other hooks
export type { DecisionItem } from '../ui/types';

export interface UseDecisionTerminalOptions {
  /** Only include decisions from these group IDs */
  groupIds?: string[];
  /** Include recently closed (last N days) */
  recentlyClosedDays?: number;
}

export interface UseDecisionTerminalReturn {
  decisions: DecisionItem[];
  isLoading: boolean;
  error: Error | null;
  urgentCount: number;
  activeCount: number;
  recentlyClosedCount: number;
  refetch: () => void;
}

/**
 * Hook to fetch and manage Decision Terminal data
 */
export function useDecisionTerminal(
  _options: UseDecisionTerminalOptions = {}
): UseDecisionTerminalReturn {
  const { amendmentVotes: amendmentVoteRows } = useAmendmentState({
    includeAmendmentVotes: true,
  });

  const { electionsWithDetails: electionRows } = useAgendaState({
    includeElectionsWithDetails: true,
  });

  const data = {
    amendmentVotes: amendmentVoteRows,
    elections: electionRows,
  };
  const isLoading = false;
  const queryError = null;

  const decisions = useMemo(() => {
    const items: DecisionItem[] = [];
    const now = new Date();

    // Group individual amendment_vote rows by amendment_id
    const amendmentVotes = data?.amendmentVotes || [];
    type AmendmentVoteRow = (typeof amendmentVotes)[number];
    const votesByAmendment = new Map<string, AmendmentVoteRow[]>();
    for (const vote of amendmentVotes) {
      const key = vote.amendment_id;
      const existing = votesByAmendment.get(key);
      if (existing) {
        existing.push(vote);
      } else {
        votesByAmendment.set(key, [vote]);
      }
    }

    let voteIndex = 0;
    for (const [amendmentId, votes] of votesByAmendment) {
      voteIndex++;
      const amendment = votes[0]?.amendment;

      const endsAt = amendment?.updated_at
        ? new Date(amendment.updated_at)
        : amendment?.created_at
          ? new Date(amendment.created_at)
          : now;

      // Calculate vote counts
      const support = votes.filter(
        (v) => v.vote === 'yes' || v.vote === 'accept'
      ).length;
      const oppose = votes.filter(
        (v) => v.vote === 'no' || v.vote === 'reject'
      ).length;
      const abstain = votes.filter((v) => v.vote === 'abstain').length;
      const voteData = { support, oppose, abstain };
      const totalVotes = support + oppose + abstain;

      const closedByStatus = amendment?.status === 'completed';
      const isEnded = isClosed(endsAt) || closedByStatus;
      const resultStatus = support === oppose ? 'tied' : support > oppose ? 'passed' : 'failed';
      const status = isEnded ? resultStatus : getDecisionStatus(endsAt);

      const amendmentTitle = amendment?.title ?? 'Amendment Vote';

      items.push({
        id: generateDecisionId('vote', voteIndex),
        type: 'vote',
        title: amendmentTitle,
        body: 'Vote',
        endsAt,
        status,
        isClosed: isEnded,
        isClosingSoon: isClosingSoon(endsAt),
        isUrgent: isUrgent(endsAt),
        trend: { direction: 'stable', percentage: 0 },
        votes: voteData,
        votedCount: totalVotes,
        supportPercentage: isEnded ? calculateSupportPercentage(voteData) : undefined,
        href: `/amendment/${amendmentId}`,
        summary: amendment?.reason ?? undefined,
        entity: amendment
          ? {
              id: amendmentId,
              name: amendmentTitle,
              type: 'amendment',
              href: `/amendment/${amendmentId}`,
            }
          : undefined,
      });
    }

    const elections = data?.elections || [];
    elections.forEach((election, index) => {
      const endsAt = election.voting_end_time
        ? new Date(election.voting_end_time)
        : election.updated_at
          ? new Date(election.updated_at)
          : election.created_at
            ? new Date(election.created_at)
            : now;

      const candidates = election.candidates || [];
      const votes = election.votes || [];

      // Separate indication votes from actual votes
      const indicationVotes = votes.filter(v => v.is_indication === true);
      const actualVotes = votes.filter(v => !v.is_indication);

      // Count actual votes per candidate
      const voteCounts = new Map<string, number>();
      for (const vote of actualVotes) {
        const candidateId = vote.candidate?.id;
        if (!candidateId) continue;
        voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
      }

      // Count indication votes per candidate
      const indicationCounts = new Map<string, number>();
      for (const vote of indicationVotes) {
        const candidateId = vote.candidate?.id;
        if (!candidateId) continue;
        indicationCounts.set(candidateId, (indicationCounts.get(candidateId) || 0) + 1);
      }

      // Determine if we're in indication phase (agenda status = planned)
      const agendaStatus = election.agenda_item?.status;
      const isIndicationPhase = agendaStatus === 'planned';
      const totalActualVotes = actualVotes.length;
      const totalIndicationVotes = indicationVotes.length;

      const candidateSummaries: Array<{
        id: string;
        name: string;
        avatarUrl?: string;
        votes: number;
        isWinner: boolean;
        indicationVotes?: number;
        indicationPercentage?: number;
        actualPercentage?: number;
      }> = candidates.map(candidate => {
        const actualVoteCount = voteCounts.get(candidate.id) || 0;
        const indicationVoteCount = indicationCounts.get(candidate.id) || 0;
        return {
          id: candidate.id,
          name: candidate.name ?? '',
          avatarUrl: candidate.image_url ?? undefined,
          votes: actualVoteCount,
          isWinner: false,
          indicationVotes: indicationVoteCount > 0 ? indicationVoteCount : undefined,
          indicationPercentage:
            totalIndicationVotes > 0
              ? (indicationVoteCount / totalIndicationVotes) * 100
              : undefined,
          actualPercentage:
            totalActualVotes > 0 ? (actualVoteCount / totalActualVotes) * 100 : undefined,
        };
      });

      const winner = [...candidateSummaries].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
      const closedByStatus = election.status === 'completed';
      const isEnded = isClosed(endsAt) || closedByStatus;

      if (winner && isEnded) {
        candidateSummaries.forEach((candidate: { id: string; isWinner: boolean }) => {
          candidate.isWinner = candidate.id === winner.id;
        });
      }

      const status = isEnded ? 'elected' : getDecisionStatus(endsAt);
      const agendaItemId = election.agenda_item?.id;
      const agendaEventId = election.agenda_item?.event?.id;

      items.push({
        id: generateDecisionId('election', index + 1),
        type: 'election',
        title: election.title || 'Election',
        body: election.position?.title || election.agenda_item?.event?.title || 'Election',
        endsAt,
        status,
        isClosed: isEnded,
        isClosingSoon: isClosingSoon(endsAt),
        isUrgent: isUrgent(endsAt),
        trend: { direction: 'stable', percentage: 0 },
        votedCount: actualVotes.length,
        winnerName: isEnded ? winner?.name : undefined,
        href: `/create/election-candidate?electionId=${election.id}`,
        summary: election.description || undefined,
        candidates: candidateSummaries,
        // Indication phase data
        isIndicationPhase,
        agendaItem:
          agendaItemId && agendaEventId
            ? {
                id: agendaItemId,
                name: election.agenda_item?.event?.title || election.title || 'Election',
                href: `/event/${agendaEventId}/agenda/${agendaItemId}`,
              }
            : undefined,
      });
    });

    items.sort((a, b) => {
      if (!a.isClosed && b.isClosed) return -1;
      if (a.isClosed && !b.isClosed) return 1;
      if (!a.isClosed && !b.isClosed) {
        return new Date(a.endsAt).getTime() - new Date(b.endsAt).getTime();
      }
      return new Date(b.endsAt).getTime() - new Date(a.endsAt).getTime();
    });

    return items;
  }, [data]);

  const error = null;

  // Calculate counts
  const urgentCount = useMemo(
    () => decisions.filter(d => !d.isClosed && d.isUrgent).length,
    [decisions]
  );

  const activeCount = useMemo(() => decisions.filter(d => !d.isClosed).length, [decisions]);

  const recentlyClosedCount = useMemo(() => decisions.filter(d => d.isClosed).length, [decisions]);

  // Refetch function (placeholder for real implementation)
  const refetch = useCallback(() => {
    // InstantDB useQuery updates automatically; keep placeholder for API parity.
  }, []);

  return {
    decisions,
    isLoading,
    error,
    urgentCount,
    activeCount,
    recentlyClosedCount,
    refetch,
  };
}
