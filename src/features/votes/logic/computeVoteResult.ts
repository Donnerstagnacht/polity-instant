/**
 * Pure functions for computing vote results.
 */

export type MajorityType = 'simple' | 'absolute' | 'two_thirds';
export type VoteResult = 'passed' | 'rejected' | 'tie';

export function computeVoteResult(
  accept: number,
  reject: number,
  totalVoters: number,
  majorityType: MajorityType,
): VoteResult {
  if (accept === reject) return 'tie';

  switch (majorityType) {
    case 'absolute':
      return accept > totalVoters / 2 ? 'passed' : 'rejected';
    case 'two_thirds':
      return accept >= (totalVoters * 2) / 3 ? 'passed' : 'rejected';
    case 'simple':
    default:
      return accept > reject ? 'passed' : 'rejected';
  }
}
