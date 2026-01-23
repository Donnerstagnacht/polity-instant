/**
 * Voting Utilities
 *
 * Functions for calculating voting results, majority types, and eligible voters.
 */

export type VoteValue = 'accept' | 'reject' | 'abstain';
export type VoteResult = 'passed' | 'rejected' | 'tie';
export type MajorityType = 'simple' | 'absolute' | 'two_thirds';

interface Vote {
  vote: VoteValue;
  voter?: { id: string };
}

interface VoteCount {
  accept: number;
  reject: number;
  abstain: number;
  total: number;
}

/**
 * Calculate vote counts from an array of votes
 */
export function countVotes(votes: Vote[]): VoteCount {
  const counts = {
    accept: 0,
    reject: 0,
    abstain: 0,
    total: votes.length,
  };

  for (const vote of votes) {
    if (vote.vote === 'accept') counts.accept++;
    else if (vote.vote === 'reject') counts.reject++;
    else if (vote.vote === 'abstain') counts.abstain++;
  }

  return counts;
}

/**
 * Calculate the voting result based on majority type
 */
export function calculateMajority(
  votes: Vote[],
  majorityType: MajorityType,
  eligibleVoters: number
): VoteResult {
  const counts = countVotes(votes);

  // Handle tie first
  if (counts.accept === counts.reject) {
    return 'tie';
  }

  switch (majorityType) {
    case 'simple':
      // Simple majority: more accepts than rejects
      return counts.accept > counts.reject ? 'passed' : 'rejected';

    case 'absolute':
      // Absolute majority: more than 50% of all eligible voters
      return counts.accept > eligibleVoters / 2 ? 'passed' : 'rejected';

    case 'two_thirds':
      // Two-thirds majority: at least 2/3 of all eligible voters
      return counts.accept >= (eligibleVoters * 2) / 3 ? 'passed' : 'rejected';

    default:
      return counts.accept > counts.reject ? 'passed' : 'rejected';
  }
}

/**
 * Calculate vote percentages
 */
export function getVotePercentages(votes: Vote[]): {
  accept: number;
  reject: number;
  abstain: number;
} {
  const counts = countVotes(votes);
  const total = counts.total || 1; // Avoid division by zero

  return {
    accept: Math.round((counts.accept / total) * 100),
    reject: Math.round((counts.reject / total) * 100),
    abstain: Math.round((counts.abstain / total) * 100),
  };
}

/**
 * Check if quorum is reached
 * @param votedCount Number of votes cast
 * @param eligibleVoters Total eligible voters
 * @param quorumPercentage Required percentage for quorum (default 50%)
 */
export function isQuorumReached(
  votedCount: number,
  eligibleVoters: number,
  quorumPercentage: number = 50
): boolean {
  if (eligibleVoters === 0) return false;
  return (votedCount / eligibleVoters) * 100 >= quorumPercentage;
}

/**
 * Get human-readable result text
 */
export function getResultText(result: VoteResult): string {
  switch (result) {
    case 'passed':
      return 'Accepted';
    case 'rejected':
      return 'Rejected';
    case 'tie':
      return 'Tie';
    default:
      return 'Unknown';
  }
}

/**
 * Get human-readable majority type text
 */
export function getMajorityTypeText(majorityType: MajorityType): string {
  switch (majorityType) {
    case 'simple':
      return 'Simple Majority';
    case 'absolute':
      return 'Absolute Majority';
    case 'two_thirds':
      return 'Two-Thirds Majority';
    default:
      return 'Unknown';
  }
}

/**
 * Calculate the threshold needed to pass based on majority type
 */
export function getPassThreshold(majorityType: MajorityType, eligibleVoters: number): number {
  switch (majorityType) {
    case 'simple':
      return Math.floor(eligibleVoters / 2) + 1;
    case 'absolute':
      return Math.floor(eligibleVoters / 2) + 1;
    case 'two_thirds':
      return Math.ceil((eligibleVoters * 2) / 3);
    default:
      return Math.floor(eligibleVoters / 2) + 1;
  }
}

/**
 * Format time remaining for display
 */
export function formatTimeRemaining(seconds: number): string {
  if (seconds <= 0) return '0:00';

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Calculate winner for an election
 */
export function calculateElectionWinner(
  votes: Array<{ candidate: { id: string; name?: string } }>,
  candidates: Array<{ id: string; name?: string }>,
  majorityType: MajorityType
): { winner: { id: string; name?: string } | null; voteCount: number; isTie: boolean } {
  // Count votes per candidate
  const voteCounts = new Map<string, number>();

  for (const candidate of candidates) {
    voteCounts.set(candidate.id, 0);
  }

  for (const vote of votes) {
    if (vote.candidate?.id) {
      const current = voteCounts.get(vote.candidate.id) || 0;
      voteCounts.set(vote.candidate.id, current + 1);
    }
  }

  // Find the candidate with the most votes
  let maxVotes = 0;
  let winners: Array<{ id: string; name?: string }> = [];

  for (const candidate of candidates) {
    const count = voteCounts.get(candidate.id) || 0;
    if (count > maxVotes) {
      maxVotes = count;
      winners = [candidate];
    } else if (count === maxVotes && count > 0) {
      winners.push(candidate);
    }
  }

  // Check for tie
  if (winners.length > 1) {
    return { winner: null, voteCount: maxVotes, isTie: true };
  }

  if (winners.length === 0) {
    return { winner: null, voteCount: 0, isTie: false };
  }

  // For absolute/two-thirds majority, check if threshold is met
  const totalVotes = votes.length;
  if (majorityType === 'absolute' && maxVotes <= totalVotes / 2) {
    return { winner: null, voteCount: maxVotes, isTie: false };
  }

  if (majorityType === 'two_thirds' && maxVotes < (totalVotes * 2) / 3) {
    return { winner: null, voteCount: maxVotes, isTie: false };
  }

  return { winner: winners[0], voteCount: maxVotes, isTie: false };
}
