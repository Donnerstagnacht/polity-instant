/**
 * Pure helper functions for amendment wiki page.
 */

import type { AmendmentFullRow } from '@/zero/amendments/queries';
import type { VoteValue } from '@/features/shared/ui/voting/VoteButtons';

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

type VotableAmendment = Pick<NonNullable<AmendmentFullRow>, 'upvotes' | 'downvotes' | 'support_votes'>;

type SupportVoteRow = NonNullable<NonNullable<AmendmentFullRow>['support_votes']>[number];

function normalizeVoteValue(vote: number | null | undefined): Exclude<VoteValue, 0> {
  return vote === -1 ? -1 : 1;
}

export function deriveVoteState(
  amendment: VotableAmendment,
  userId: string | undefined,
) {
  const supportVotes = amendment.support_votes ?? [];
  const hasSupportVotes = supportVotes.length > 0;

  const upvotes = hasSupportVotes
    ? supportVotes.filter(vote => normalizeVoteValue(vote.vote) === 1).length
    : amendment.upvotes || 0;
  const downvotes = hasSupportVotes
    ? supportVotes.filter(vote => normalizeVoteValue(vote.vote) === -1).length
    : amendment.downvotes || 0;
  const score = upvotes - downvotes;

  const userVote = userId
    ? supportVotes.find(vote => (vote.user?.id ?? vote.user_id) === userId)
    : undefined;
  const currentVoteValue: VoteValue = userVote ? normalizeVoteValue(userVote.vote) : 0;

  return {
    score,
    upvotes,
    downvotes,
    supporterCount: upvotes,
    userVote: userVote as SupportVoteRow | undefined,
    currentVoteValue,
    hasUpvoted: currentVoteValue === 1,
    hasDownvoted: currentVoteValue === -1,
  };
}

export const AMENDMENT_STATUS_COLORS: Record<string, string> = {
  passed: 'bg-green-500/10 text-green-500 border-green-500/20',
  rejected: 'bg-red-500/10 text-red-500 border-red-500/20',
  vote_internal: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  vote_event: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  suggest_internal: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  suggest_event: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  edit: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  view: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
};
