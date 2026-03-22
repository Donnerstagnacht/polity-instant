'use client'

import type { CandidatesByElectionRow } from '@/zero/elections/queries'
import type { ChoicesByVoteRow } from '@/zero/votes/queries'

interface CandidateSelectionEntry {
  candidate_id: string
}

interface CandidateStats {
  candidate: CandidatesByElectionRow
  indicativeCount: number
  finalCount: number
  indicativePercentage: number
  finalPercentage: number
}

interface ChoiceDecisionEntry {
  choice_id: string
}

interface ChoiceStats {
  choice: ChoicesByVoteRow
  indicativeCount: number
  finalCount: number
  indicativePercentage: number
  finalPercentage: number
}

export type VotingPhase = 'unknown' | 'indicative' | 'final' | 'closed'

/**
 * Derive the voting phase from election/vote status.
 */
export function getVotingPhase(status?: string | null): VotingPhase {
  if (!status) return 'unknown'
  if (status === 'indicative') return 'indicative'
  if (status === 'final' || status === 'final_vote') return 'final'
  if (status === 'closed') return 'closed'
  return 'unknown'
}

/**
 * Calculate election stats from candidates + indicative/final selections.
 */
export function calculateElectionStats(
  candidates: CandidatesByElectionRow[],
  indicativeSelections: ReadonlyArray<CandidateSelectionEntry>,
  finalSelections: ReadonlyArray<CandidateSelectionEntry>,
): { candidates: CandidateStats[]; totalIndicative: number; totalFinal: number } {
  if (!candidates?.length) {
    return { candidates: [], totalIndicative: 0, totalFinal: 0 }
  }

  const totalIndicative = indicativeSelections.length
  const totalFinal = finalSelections.length

  const candidateStats = candidates.map((candidate) => {
    const indCount = indicativeSelections.filter((s) => s.candidate_id === candidate.id).length
    const finCount = finalSelections.filter((s) => s.candidate_id === candidate.id).length

    return {
      candidate,
      indicativeCount: indCount,
      finalCount: finCount,
      indicativePercentage: totalIndicative > 0 ? (indCount / totalIndicative) * 100 : 0,
      finalPercentage: totalFinal > 0 ? (finCount / totalFinal) * 100 : 0,
    }
  })

  return { candidates: candidateStats, totalIndicative, totalFinal }
}

/**
 * Calculate vote stats from choices + indicative/final decisions.
 */
export function calculateVoteStats(
  choices: ChoicesByVoteRow[],
  indicativeDecisions: ReadonlyArray<ChoiceDecisionEntry>,
  finalDecisions: ReadonlyArray<ChoiceDecisionEntry>,
): { choices: ChoiceStats[]; totalIndicative: number; totalFinal: number } {
  if (!choices?.length) {
    return { choices: [], totalIndicative: 0, totalFinal: 0 }
  }

  const totalIndicative = indicativeDecisions.length
  const totalFinal = finalDecisions.length

  const choiceStats = choices.map((choice) => {
    const indCount = indicativeDecisions.filter((d) => d.choice_id === choice.id).length
    const finCount = finalDecisions.filter((d) => d.choice_id === choice.id).length

    return {
      choice,
      indicativeCount: indCount,
      finalCount: finCount,
      indicativePercentage: totalIndicative > 0 ? (indCount / totalIndicative) * 100 : 0,
      finalPercentage: totalFinal > 0 ? (finCount / totalFinal) * 100 : 0,
    }
  })

  return { choices: choiceStats, totalIndicative, totalFinal }
}

/**
 * Hook for accessing agenda item voting utilities.
 */
export function useAgendaItemVoting() {
  return {
    getVotingPhase,
    calculateElectionStats,
    calculateVoteStats,
  }
}
