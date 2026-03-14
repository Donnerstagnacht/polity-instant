/**
 * Pure voting utility functions (no database dependency).
 * Mutation logic has been moved to useVotingMutations hook.
 */

export interface VoteResult {
  upvotes: number;
  downvotes: number;
  score: number;
  userVote?: number;
}

/**
 * Calculate vote score from vote counts
 */
export function calculateScore(upvotes: number = 0, downvotes: number = 0): number {
  return upvotes - downvotes;
}

/**
 * Get user's vote from a list of votes
 */
export function getUserVote(votes: { user?: { id: string }; vote?: number }[], userId: string | undefined): number | undefined {
  if (!userId) return undefined;
  const userVote = votes?.find(v => v.user?.id === userId);
  return userVote?.vote;
}
