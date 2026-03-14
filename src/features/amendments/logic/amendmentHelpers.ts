/**
 * Pure helper functions for amendment wiki page.
 */

export function getSupportStatus(
  groupId: string,
  supportConfirmations: Array<{ group?: { id: string }; status?: string }>,
): 'active' | 'pending' | 'declined' {
  const confirmation = supportConfirmations.find(
    (c) => c.group?.id === groupId && c.status !== 'confirmed',
  );
  if (!confirmation) return 'active';
  if (confirmation.status === 'pending') return 'pending';
  if (confirmation.status === 'declined') return 'declined';
  return 'active';
}

interface VotableAmendment {
  upvotes?: number | null;
  downvotes?: number | null;
  vote_entries?: ReadonlyArray<{ id: string; vote: number | null; user?: { id: string } }>;
  [key: string]: unknown;
}

export function deriveVoteState(
  amendment: VotableAmendment,
  userId: string | undefined,
) {
  const score = (amendment.upvotes || 0) - (amendment.downvotes || 0);
  const userVote = amendment.vote_entries?.find((v) => v.user?.id === userId);
  const hasUpvoted = userVote?.vote === 1;
  const hasDownvoted = userVote?.vote === -1;
  return { score, userVote, hasUpvoted, hasDownvoted };
}

export const AMENDMENT_STATUS_COLORS: Record<string, string> = {
  Passed: 'bg-green-500/10 text-green-500 border-green-500/20',
  Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Drafting: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};
