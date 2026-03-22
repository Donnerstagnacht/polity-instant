/**
 * Helper functions for voting phase management.
 */

import type { ActionType, ResourceType } from '@/zero/rbac/types';

export type VotingPhase = 'indication' | 'final_vote' | 'closed';

interface AgendaItemLike {
  voting_phase?: string | null;
}

interface PermissionsLike {
  can: (action: ActionType, resource: ResourceType) => boolean;
}

/**
 * Extract the current voting phase from an agenda item.
 */
export function getVotingPhase(agendaItem: AgendaItemLike): VotingPhase {
  const phase = agendaItem.voting_phase;
  if (phase === 'final_vote' || phase === 'closed') return phase;
  return 'indication';
}

/**
 * Check whether a user is allowed to vote in the current phase.
 */
export function canUserVote(permissions: PermissionsLike, phase: VotingPhase): boolean {
  if (phase === 'closed') return false;
  return permissions.can('active_voting', 'events');
}

/**
 * Check whether a user is allowed to stand as a candidate in an election.
 */
export function canUserBeCandidate(permissions: PermissionsLike): boolean {
  return permissions.can('passive_voting', 'events');
}

/**
 * Format a result sentence for display.
 *
 * For votes: "The motion was <passed|rejected> with <share>% of votes."
 * For elections: "For the election of <position>, <winner> won with <share>% of votes."
 */
export function formatVoteResultSentence(
  type: 'vote' | 'election',
  result: 'passed' | 'rejected' | 'tie',
  winnerName?: string,
  positionName?: string,
  voteSharePercent?: number,
): string {
  if (type === 'election') {
    if (result === 'tie') {
      return positionName
        ? `The election for ${positionName} ended in a tie.`
        : 'The election ended in a tie.';
    }
    if (!winnerName) {
      return positionName
        ? `The election for ${positionName} did not produce a winner.`
        : 'The election did not produce a winner.';
    }
    const share = voteSharePercent !== undefined ? ` with ${voteSharePercent}% of votes` : '';
    return positionName
      ? `For the election of ${positionName}, ${winnerName} won${share}.`
      : `${winnerName} won the election${share}.`;
  }

  // vote type
  if (result === 'tie') return 'The vote ended in a tie.';
  const shareStr = voteSharePercent !== undefined ? ` with ${voteSharePercent}% of votes` : '';
  return result === 'passed'
    ? `The motion was accepted${shareStr}.`
    : `The motion was rejected${shareStr}.`;
}

/**
 * Determine an appropriate badge variant for a voting phase.
 */
export function getPhaseVariant(phase: VotingPhase): 'secondary' | 'default' | 'outline' {
  switch (phase) {
    case 'indication':
      return 'secondary';
    case 'final_vote':
      return 'default';
    case 'closed':
      return 'outline';
  }
}
