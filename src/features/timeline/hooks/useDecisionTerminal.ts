'use client';

import { useMemo, useCallback } from 'react';
import { db } from '@db/db';
import type { DecisionItem } from '../ui/terminal/types';
import {
  getDecisionStatus,
  isUrgent,
  isClosingSoon,
  isClosed,
  generateDecisionId,
} from '../utils/decision-status';
import { calculateSupportPercentage } from '../utils/trend-calculation';

// Re-export DecisionItem for use in other hooks
export type { DecisionItem } from '../ui/terminal/types';

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
  const {
    data,
    isLoading,
    error: queryError,
  } = db.useQuery({
    amendmentVotes: {
      voteEntries: {},
      agendaItem: {
        amendment: {},
        event: {},
      },
    },
    elections: {
      candidates: {},
      votes: { candidate: {} },
      agendaItem: { event: {} },
      position: {},
    },
  });

  const decisions = useMemo(() => {
    const items: DecisionItem[] = [];
    const now = new Date();

    const amendmentVotes = data?.amendmentVotes || [];
    amendmentVotes.forEach((vote: any, index: number) => {
      const endsAt = vote.votingEndTime
        ? new Date(vote.votingEndTime)
        : vote.updatedAt
          ? new Date(vote.updatedAt)
          : vote.createdAt
            ? new Date(vote.createdAt)
            : now;

      const entries = vote.voteEntries || [];

      // Separate indication votes from actual votes
      const indicationEntries = entries.filter((entry: any) => entry.isIndication === true);
      const actualEntries = entries.filter((entry: any) => !entry.isIndication);

      // Calculate actual vote counts
      const support = actualEntries.filter(
        (entry: any) => entry.vote === 'yes' || entry.vote === 'accept'
      ).length;
      const oppose = actualEntries.filter(
        (entry: any) => entry.vote === 'no' || entry.vote === 'reject'
      ).length;
      const abstain = actualEntries.filter((entry: any) => entry.vote === 'abstain').length;
      const voteData = { support, oppose, abstain };
      const totalVotes = support + oppose + abstain;

      // Calculate indication vote counts
      const indicationSupport = indicationEntries.filter(
        (entry: any) => entry.vote === 'yes' || entry.vote === 'accept'
      ).length;
      const indicationOppose = indicationEntries.filter(
        (entry: any) => entry.vote === 'no' || entry.vote === 'reject'
      ).length;
      const indicationAbstain = indicationEntries.filter(
        (entry: any) => entry.vote === 'abstain'
      ).length;
      const indicationVoteData = {
        support: indicationSupport,
        oppose: indicationOppose,
        abstain: indicationAbstain,
      };
      const totalIndicationVotes = indicationSupport + indicationOppose + indicationAbstain;

      // Determine if we're in indication phase (agenda status = planned)
      const agendaStatus = vote.agendaItem?.status;
      const isIndicationPhase = agendaStatus === 'planned';

      const closedByStatus = vote.status === 'completed';
      const isEnded = isClosed(endsAt) || closedByStatus;
      const resultStatus = support === oppose ? 'tied' : support > oppose ? 'passed' : 'failed';
      const status = isEnded ? resultStatus : getDecisionStatus(endsAt);

      const amendment = vote.agendaItem?.amendment;
      const amendmentId = amendment?.id || vote.id;
      const amendmentTitle = amendment?.title || vote.title || 'Amendment Vote';
      const eventTitle = vote.agendaItem?.event?.title || vote.agendaItem?.title || 'Vote';
      const agendaItemId = vote.agendaItem?.id;
      const agendaEventId = vote.agendaItem?.event?.id;

      items.push({
        id: generateDecisionId('vote', index + 1),
        type: 'vote',
        title: amendmentTitle,
        body: eventTitle,
        endsAt,
        status,
        isClosed: isEnded,
        isClosingSoon: isClosingSoon(endsAt),
        isUrgent: isUrgent(endsAt),
        trend: { direction: 'stable', percentage: 0 },
        votes: voteData,
        votedCount: totalVotes,
        supportPercentage: isEnded ? calculateSupportPercentage(voteData) : undefined,
        // Indication phase data
        isIndicationPhase,
        indicationVotes: totalIndicationVotes > 0 ? indicationVoteData : undefined,
        indicationSupportPercentage:
          totalIndicationVotes > 0 ? calculateSupportPercentage(indicationVoteData) : undefined,
        href: `/amendment/${amendmentId}`,
        summary: vote.description || undefined,
        entity: amendment
          ? {
              id: amendmentId,
              name: amendmentTitle,
              type: 'amendment',
              href: `/amendment/${amendmentId}`,
            }
          : undefined,
        agendaItem:
          agendaItemId && agendaEventId
            ? {
                id: agendaItemId,
                name: eventTitle,
                href: `/event/${agendaEventId}/agenda/${agendaItemId}`,
              }
            : undefined,
      });
    });

    const elections = data?.elections || [];
    elections.forEach((election: any, index: number) => {
      const endsAt = election.votingEndTime
        ? new Date(election.votingEndTime)
        : election.updatedAt
          ? new Date(election.updatedAt)
          : election.createdAt
            ? new Date(election.createdAt)
            : now;

      const candidates = election.candidates || [];
      const votes = election.votes || [];

      // Separate indication votes from actual votes
      const indicationVotes = votes.filter((v: any) => v.isIndication === true);
      const actualVotes = votes.filter((v: any) => !v.isIndication);

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
      const agendaStatus = election.agendaItem?.status;
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
      }> = candidates.map((candidate: any) => {
        const actualVoteCount = voteCounts.get(candidate.id) || 0;
        const indicationVoteCount = indicationCounts.get(candidate.id) || 0;
        return {
          id: candidate.id,
          name: candidate.name,
          avatarUrl: candidate.imageURL,
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
      const agendaItemId = election.agendaItem?.id;
      const agendaEventId = election.agendaItem?.event?.id;

      items.push({
        id: generateDecisionId('election', index + 1),
        type: 'election',
        title: election.title || 'Election',
        body: election.position?.title || election.agendaItem?.event?.title || 'Election',
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
                name: election.agendaItem?.event?.title || election.title || 'Election',
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

  const error = queryError ? new Error(queryError.message || 'Decision terminal error') : null;

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
