'use client';

import { useCallback, useMemo, useState } from 'react';
import { db, id, tx } from '@db/db';

interface VoteData {
  support: number;
  oppose: number;
  abstain: number;
}

interface ElectionCandidateStats {
  candidate: any;
  totalVotes: number;
  indicationCount: number;
  actualCount: number;
  indicationPercentage: number;
  actualPercentage: number;
}

interface AmendmentVoteStats {
  yes: number;
  no: number;
  abstain: number;
  total: number;
  indicationYes: number;
  indicationNo: number;
  indicationAbstain: number;
  yesPercentage: number;
  noPercentage: number;
  indicationYesPercentage: number;
  indicationNoPercentage: number;
}

export type VotingPhase = 'unknown' | 'indication' | 'voting' | 'closed';

/**
 * Utility function to determine voting phase from agenda item status
 */
export function getVotingPhase(status?: string): VotingPhase {
  if (!status) return 'unknown';
  if (status === 'planned') return 'indication';
  if (status === 'active') return 'voting';
  if (status === 'completed') return 'closed';
  return 'unknown';
}

/**
 * Utility function to calculate election statistics with indication support
 */
export function calculateElectionStats(
  candidates: any[],
  votes: any[]
): { candidates: ElectionCandidateStats[]; totalVotes: number } {
  if (!candidates?.length) {
    return { candidates: [], totalVotes: 0 };
  }

  const totalVotes = votes.length;

  const candidateStats = candidates.map((candidate: any) => {
    const candidateVotes = votes.filter((v: any) => v.candidate?.id === candidate.id);
    const indicationVotesArr = candidateVotes.filter((v: any) => v.isIndication);
    const actualVotesArr = candidateVotes.filter((v: any) => !v.isIndication);

    return {
      candidate,
      totalVotes: candidateVotes.length,
      indicationCount: indicationVotesArr.length,
      actualCount: actualVotesArr.length,
      indicationPercentage: totalVotes > 0 ? (indicationVotesArr.length / totalVotes) * 100 : 0,
      actualPercentage: totalVotes > 0 ? (actualVotesArr.length / totalVotes) * 100 : 0,
    };
  });

  return { candidates: candidateStats, totalVotes };
}

/**
 * Utility function to calculate amendment vote statistics with indication support
 */
export function calculateAmendmentStats(entries: any[]): AmendmentVoteStats {
  if (!entries?.length) {
    return {
      yes: 0,
      no: 0,
      abstain: 0,
      total: 0,
      indicationYes: 0,
      indicationNo: 0,
      indicationAbstain: 0,
      yesPercentage: 0,
      noPercentage: 0,
      indicationYesPercentage: 0,
      indicationNoPercentage: 0,
    };
  }

  const indicationEntries = entries.filter((e: any) => e.isIndication);
  const actualEntries = entries.filter((e: any) => !e.isIndication);

  const countVotes = (votes: any[], type: string) =>
    votes.filter((v: any) => v.vote === type).length;

  const total = entries.length;
  const yes = countVotes(actualEntries, 'yes');
  const no = countVotes(actualEntries, 'no');
  const abstain = countVotes(actualEntries, 'abstain');
  const indicationYes = countVotes(indicationEntries, 'yes');
  const indicationNo = countVotes(indicationEntries, 'no');
  const indicationAbstain = countVotes(indicationEntries, 'abstain');

  const actualTotal = yes + no + abstain;
  const indicationTotal = indicationYes + indicationNo + indicationAbstain;

  return {
    yes,
    no,
    abstain,
    total,
    indicationYes,
    indicationNo,
    indicationAbstain,
    yesPercentage: actualTotal > 0 ? (yes / actualTotal) * 100 : 0,
    noPercentage: actualTotal > 0 ? (no / actualTotal) * 100 : 0,
    indicationYesPercentage: indicationTotal > 0 ? (indicationYes / indicationTotal) * 100 : 0,
    indicationNoPercentage: indicationTotal > 0 ? (indicationNo / indicationTotal) * 100 : 0,
  };
}

/**
 * Hook for accessing agenda item voting utilities.
 * This hook provides helper functions and types for voting operations.
 * For actual vote submissions, use useEventAgendaItem which has the full
 * voting implementation with indication support.
 */
export function useAgendaItemVoting() {
  return {
    getVotingPhase,
    calculateElectionStats,
    calculateAmendmentStats,
  };
}
