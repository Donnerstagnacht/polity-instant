'use client';

import { useMemo, useCallback } from 'react';
import { useAgendaState } from '@/zero/agendas/useAgendaState';
import type { ElectionWithDetailsRow } from '@/zero/elections';
import { useElectionState } from '@/zero/elections/useElectionState';
import { useVoteState } from '@/zero/votes/useVoteState';
import { computeVoteResultSummary, type MajorityType } from '@/features/vote-cast/logic/computeVoteResults';
import type { VoteWithDetailsRow } from '@/zero/votes';
import type { DecisionItem } from '../ui/types';
import type { Visibility } from '@/features/auth/logic/checkEntityAccess';
import type { TrendData } from '../ui/TrendIndicator';
import {
  getDecisionStatus,
  isUrgent,
  isClosingSoon,
  isClosed,
  isOpeningSoon,
  isRecentlyClosed,
  generateDecisionId,
} from '../logic/decision-status';
import {
  calculateSupportPercentage,
  calculateTrend,
  calculateTurnout,
} from '../logic/trend-calculation';

function normalizeMajorityType(value?: string | null): MajorityType {
  if (value === 'absolute' || value === 'two_thirds') {
    return value;
  }

  return 'simple';
}

function mapClosedVoteResult(
  result: 'passed' | 'rejected' | 'tie'
): Extract<DecisionItem['status'], 'passed' | 'failed' | 'tied'> {
  switch (result) {
    case 'rejected':
      return 'failed';
    case 'tie':
      return 'tied';
    case 'passed':
    default:
      return 'passed';
  }
}

function countVoteChoices(vote: VoteWithDetailsRow, decisionType: 'indicative' | 'final') {
  const decisions =
    decisionType === 'indicative' ? vote.indicative_decisions || [] : vote.final_decisions || [];
  const sortedChoices = [...(vote.choices || [])].sort(
    (left, right) => (left.order_index ?? 0) - (right.order_index ?? 0)
  );
  const choiceCounts = new Map<string, number>();

  for (const decision of decisions) {
    const choiceId = decision.choice_id;
    choiceCounts.set(choiceId, (choiceCounts.get(choiceId) || 0) + 1);
  }

  return {
    support: sortedChoices[0] ? (choiceCounts.get(sortedChoices[0].id) || 0) : 0,
    oppose: sortedChoices[1] ? (choiceCounts.get(sortedChoices[1].id) || 0) : 0,
    abstain: sortedChoices[2] ? (choiceCounts.get(sortedChoices[2].id) || 0) : 0,
  };
}

type ElectionCandidateRow = NonNullable<ElectionWithDetailsRow['candidates']>[number];

function getUserFullName(user?: ElectionCandidateRow['user'] | null): string | null {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  return fullName || null;
}

function getCandidateDisplayName(candidate: ElectionCandidateRow): string {
  return getUserFullName(candidate.user) || candidate.name?.trim() || 'Candidate';
}

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
  const { electionsWithDetails: electionRows, isLoading: electionsLoading } = useElectionState({
    includeElectionsWithDetails: true,
  });
  const { votesWithDetails: voteRows, isLoading: votesLoading } = useVoteState({
    includeVotesWithDetails: true,
  });

  const agendaEventIds = useMemo(() => {
    const eventIds = new Set<string>()

    for (const election of electionRows || []) {
      const eventId = election.agenda_item?.event?.id
      if (eventId) {
        eventIds.add(eventId)
      }
    }

    for (const vote of voteRows || []) {
      const eventId = vote.agenda_item?.event?.id
      if (eventId) {
        eventIds.add(eventId)
      }
    }

    return Array.from(eventIds)
  }, [electionRows, voteRows])

  const { agendaItems, isLoading: agendaLoading } = useAgendaState({
    eventIds: agendaEventIds.length > 0 ? agendaEventIds : undefined,
  })

  const agendaItemsById = useMemo(() => {
    return new Map(agendaItems.map(item => [item.id, item]))
  }, [agendaItems])

  const isLoading = electionsLoading || votesLoading || agendaLoading;

  const decisions = useMemo(() => {
    const items: DecisionItem[] = [];
    const now = new Date();

    const elections = electionRows || [];
    elections.forEach((election, index) => {
      const calculatedAgendaItem = election.agenda_item?.id
        ? agendaItemsById.get(election.agenda_item.id)
        : undefined

      const endsAt = election.closing_end_time
        ? new Date(election.closing_end_time)
        : election.agenda_item?.end_time
          ? new Date(election.agenda_item.end_time)
          : calculatedAgendaItem?.calculated_end_time
            ? new Date(calculatedAgendaItem.calculated_end_time)
          : election.updated_at
            ? new Date(election.updated_at)
            : election.created_at
              ? new Date(election.created_at)
              : now;

      const startsAt = calculatedAgendaItem?.calculated_start_time
        ? new Date(calculatedAgendaItem.calculated_start_time)
        : election.agenda_item?.start_time
        ? new Date(election.agenda_item.start_time)
        : election.created_at
          ? new Date(election.created_at)
          : undefined;

      const candidates = election.candidates || [];
      const indicativeSelections = election.indicative_selections || [];
      const finalSelections = election.final_selections || [];

      // Count indicative selections per candidate
      const indicationCounts = new Map<string, number>();
      for (const sel of indicativeSelections) {
        const candidateId = sel.candidate_id;
        indicationCounts.set(candidateId, (indicationCounts.get(candidateId) || 0) + 1);
      }

      // Count final selections per candidate
      const voteCounts = new Map<string, number>();
      for (const sel of finalSelections) {
        const candidateId = sel.candidate_id;
        voteCounts.set(candidateId, (voteCounts.get(candidateId) || 0) + 1);
      }

      // Determine if we're in indication phase
      const isIndicationPhase = election.status === 'indicative';
      const totalElectors = election.electors?.length;
      const totalFinalSelections = finalSelections.length;
      const totalIndicationSelections = indicativeSelections.length;

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
        const finalVoteCount = voteCounts.get(candidate.id) || 0;
        const indicationVoteCount = indicationCounts.get(candidate.id) || 0;
        return {
          id: candidate.id,
          name: getCandidateDisplayName(candidate),
          avatarUrl: candidate.image_url ?? candidate.user?.avatar ?? undefined,
          votes: finalVoteCount,
          isWinner: false,
          indicationVotes: indicationVoteCount > 0 ? indicationVoteCount : undefined,
          indicationPercentage:
            totalIndicationSelections > 0
              ? (indicationVoteCount / totalIndicationSelections) * 100
              : undefined,
          actualPercentage:
            totalFinalSelections > 0 ? (finalVoteCount / totalFinalSelections) * 100 : undefined,
        };
      });

      const winner = [...candidateSummaries].sort((a, b) => (b.votes || 0) - (a.votes || 0))[0];
      const isActiveByStatus = election.status === 'indicative' || election.status === 'final';
      const closedByStatus = election.status === 'completed';
      const isEnded = closedByStatus || (!isActiveByStatus && isClosed(endsAt));
      const currentSelectionCount = isEnded || !isIndicationPhase
        ? totalFinalSelections
        : totalIndicationSelections;
      const turnout = totalElectors
        ? calculateTurnout(currentSelectionCount, totalElectors)
        : undefined;

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
        startsAt,
        status,
        isClosed: isEnded,
        isClosingSoon: isClosingSoon(endsAt),
        isOpeningSoon: !isEnded && startsAt ? isOpeningSoon(startsAt) : false,
        isRecentlyClosed: isEnded ? isRecentlyClosed(endsAt) : false,
        isUrgent: isUrgent(endsAt),
        visibility: (election.visibility as Visibility) ?? 'public',
        trend: { direction: 'stable', percentage: 0 },
        votedCount: currentSelectionCount,
        totalMembers: totalElectors,
        turnout,
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

    const votes = voteRows || [];
    votes.forEach((vote, index) => {
      const calculatedAgendaItem = vote.agenda_item?.id
        ? agendaItemsById.get(vote.agenda_item.id)
        : undefined

      const endsAt = vote.closing_end_time
        ? new Date(vote.closing_end_time)
        : vote.agenda_item?.end_time
          ? new Date(vote.agenda_item.end_time)
          : calculatedAgendaItem?.calculated_end_time
            ? new Date(calculatedAgendaItem.calculated_end_time)
          : vote.updated_at
            ? new Date(vote.updated_at)
            : vote.created_at
              ? new Date(vote.created_at)
              : now;

      const voteStartsAt = calculatedAgendaItem?.calculated_start_time
        ? new Date(calculatedAgendaItem.calculated_start_time)
        : vote.agenda_item?.start_time
        ? new Date(vote.agenda_item.start_time)
        : vote.created_at
          ? new Date(vote.created_at)
          : undefined;

      const isIndicationPhase = vote.status === 'indicative';
      const isActiveByStatus = isIndicationPhase || vote.status === 'final';
      const closedByStatus = vote.status === 'closed';
      const isEnded = closedByStatus || (!isActiveByStatus && isClosed(endsAt));
      const finalVotes = countVoteChoices(vote, 'final');
      const indicationVotes = countVoteChoices(vote, 'indicative');
      const hasIndicationData = isIndicationPhase || (vote.indicative_decisions?.length || 0) > 0;
      const currentVotes = isIndicationPhase ? indicationVotes : finalVotes;
      const totalMembers = vote.voters?.length;
      const votedCount = isIndicationPhase
        ? vote.indicative_decisions?.length || 0
        : vote.final_decisions?.length || 0;
      const turnout = totalMembers ? calculateTurnout(votedCount, totalMembers) : undefined;
      const supportPercentage = calculateSupportPercentage(
        isEnded || !isIndicationPhase ? finalVotes : currentVotes
      );
      const indicationSupportPercentage = hasIndicationData
        ? calculateSupportPercentage(indicationVotes)
        : undefined;
      const voteResultSummary =
        isEnded && vote.choices && vote.choices.length > 0
          ? computeVoteResultSummary(
              vote.choices.map((choice, choiceIndex) => ({
                id: choice.id,
                label: choice.label || `Choice ${choiceIndex + 1}`,
                order_index: choice.order_index ?? choiceIndex,
              })),
              vote.final_decisions || [],
              totalMembers ?? (vote.final_decisions?.length || 0),
              normalizeMajorityType(vote.majority_type)
            )
          : null;
      const status = isEnded
        ? voteResultSummary
          ? mapClosedVoteResult(voteResultSummary.result)
          : 'tied'
        : getDecisionStatus(endsAt);
      const agendaItemId = vote.agenda_item?.id;
      const agendaEventId = vote.agenda_item?.event?.id;
      const trend: TrendData =
        !isIndicationPhase && hasIndicationData
          ? calculateTrend(finalVotes, indicationVotes)
          : { direction: 'stable', percentage: 0 };
      const voteTitle = vote.title || vote.agenda_item?.title || vote.amendment?.title || 'Vote';
      const voteBody = vote.agenda_item?.event?.title || vote.amendment?.title || 'Vote';

      items.push({
        id: generateDecisionId('vote', index + 1),
        type: 'vote',
        title: voteTitle,
        body: voteBody,
        endsAt,
        startsAt: voteStartsAt,
        status,
        isClosed: isEnded,
        isClosingSoon: isClosingSoon(endsAt),
        isOpeningSoon: !isEnded && voteStartsAt ? isOpeningSoon(voteStartsAt) : false,
        isRecentlyClosed: isEnded ? isRecentlyClosed(endsAt) : false,
        isUrgent: isUrgent(endsAt),
        visibility: (vote.visibility as Visibility) ?? 'public',
        trend,
        votes: currentVotes,
        turnout,
        totalMembers,
        votedCount,
        supportPercentage,
        href:
          agendaItemId && agendaEventId
            ? `/event/${agendaEventId}/agenda/${agendaItemId}`
            : vote.amendment?.id
              ? `/amendment/${vote.amendment.id}`
              : '#',
        summary: vote.description || undefined,
        entity: vote.amendment?.id
          ? {
              id: vote.amendment.id,
              name: vote.amendment.title || voteTitle,
              type: 'amendment',
              href: `/amendment/${vote.amendment.id}`,
            }
          : undefined,
        agendaItem:
          agendaItemId && agendaEventId
            ? {
                id: agendaItemId,
                name: vote.agenda_item?.title || voteTitle,
                href: `/event/${agendaEventId}/agenda/${agendaItemId}`,
              }
            : undefined,
        isIndicationPhase,
        indicationVotes: hasIndicationData ? indicationVotes : undefined,
        indicationSupportPercentage,
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
  }, [agendaItemsById, electionRows, voteRows]);

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
