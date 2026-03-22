/**
 * Pure helper functions for amendment wiki page.
 */

import type { AmendmentFullRow } from '@/zero/amendments/queries';

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

type VotableAmendment = Pick<NonNullable<AmendmentFullRow>, 'upvotes' | 'downvotes'>;

export function deriveVoteState(
  amendment: VotableAmendment,
  _userId: string | undefined,
) {
  const score = (amendment.upvotes || 0) - (amendment.downvotes || 0);
  // TODO: Per-user upvote/downvote tracking removed with voting system migration
  const userVote = undefined;
  const hasUpvoted = false;
  const hasDownvoted = false;
  return { score, userVote, hasUpvoted, hasDownvoted };
}

export const AMENDMENT_STATUS_COLORS: Record<string, string> = {
  Passed: 'bg-green-500/10 text-green-500 border-green-500/20',
  Rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  'Under Review': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  Drafting: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};
