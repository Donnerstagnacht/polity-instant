/**
 * Pure functions for computing election results.
 * Handles indicative + final vote tallying, winner determination,
 * and formatted result sentences.
 *
 * Works with the new selection-based model:
 * - indicative_candidate_selection rows (with candidate relation)
 * - final_candidate_selection rows (with candidate relation)
 */

import type { MajorityType } from './computeVoteResults'

export interface CandidateVoteTally {
  candidateId: string
  candidateName: string
  indicationCount: number
  finalCount: number
  indicationPercent: number
  finalPercent: number
}

export interface ElectionResultSummary {
  candidateTallies: CandidateVoteTally[]
  winnerId: string | null
  winnerName: string | null
  isTie: boolean
  totalIndicationVotes: number
  totalFinalVotes: number
  majorityType: MajorityType
}

interface CandidateInfo {
  id: string
  name: string
}

interface CandidateSelection {
  candidate_id: string
}

/**
 * Tally votes per candidate from selection records.
 */
export function tallyCandidateVotes(
  candidates: ReadonlyArray<CandidateInfo>,
  indicativeSelections: ReadonlyArray<CandidateSelection>,
  finalSelections: ReadonlyArray<CandidateSelection>,
): CandidateVoteTally[] {
  const totalInd = indicativeSelections.length || 1
  const totalFin = finalSelections.length || 1

  return candidates.map((c) => {
    const indCount = indicativeSelections.filter((s) => s.candidate_id === c.id).length
    const finCount = finalSelections.filter((s) => s.candidate_id === c.id).length

    return {
      candidateId: c.id,
      candidateName: c.name,
      indicationCount: indCount,
      finalCount: finCount,
      indicationPercent: Math.round((indCount / totalInd) * 100),
      finalPercent: Math.round((finCount / totalFin) * 100),
    }
  })
}

/**
 * Determine the election winner based on majority type.
 */
export function computeElectionResult(
  candidates: ReadonlyArray<CandidateInfo>,
  indicativeSelections: ReadonlyArray<CandidateSelection>,
  finalSelections: ReadonlyArray<CandidateSelection>,
  majorityType: MajorityType,
): ElectionResultSummary {
  const tallies = tallyCandidateVotes(candidates, indicativeSelections, finalSelections)
  const totalFinalVotes = finalSelections.length
  const totalIndicationVotes = indicativeSelections.length

  // Find the candidate(s) with the most final votes
  let maxVotes = 0
  let topCandidates: CandidateVoteTally[] = []

  for (const tally of tallies) {
    if (tally.finalCount > maxVotes) {
      maxVotes = tally.finalCount
      topCandidates = [tally]
    } else if (tally.finalCount === maxVotes && tally.finalCount > 0) {
      topCandidates.push(tally)
    }
  }

  // Check for tie
  if (topCandidates.length > 1) {
    return {
      candidateTallies: tallies,
      winnerId: null,
      winnerName: null,
      isTie: true,
      totalIndicationVotes,
      totalFinalVotes,
      majorityType,
    }
  }

  if (topCandidates.length === 0) {
    return {
      candidateTallies: tallies,
      winnerId: null,
      winnerName: null,
      isTie: false,
      totalIndicationVotes,
      totalFinalVotes,
      majorityType,
    }
  }

  const winner = topCandidates[0]

  // Check majority threshold
  if (majorityType === 'absolute' && maxVotes <= totalFinalVotes / 2) {
    return {
      candidateTallies: tallies,
      winnerId: null,
      winnerName: null,
      isTie: false,
      totalIndicationVotes,
      totalFinalVotes,
      majorityType,
    }
  }

  if (majorityType === 'two_thirds' && maxVotes < (totalFinalVotes * 2) / 3) {
    return {
      candidateTallies: tallies,
      winnerId: null,
      winnerName: null,
      isTie: false,
      totalIndicationVotes,
      totalFinalVotes,
      majorityType,
    }
  }

  return {
    candidateTallies: tallies,
    winnerId: winner.candidateId,
    winnerName: winner.candidateName,
    isTie: false,
    totalIndicationVotes,
    totalFinalVotes,
    majorityType,
  }
}
