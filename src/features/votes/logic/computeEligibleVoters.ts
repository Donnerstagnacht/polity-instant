/**
 * Pure functions for computing eligible voters from event participants.
 */

export interface EligibleVoter {
  id: string;
  name?: string;
  hasVoted: boolean;
}

interface Participant {
  role?: {
    action_rights?: readonly { action: string | null; resource: string | null }[];
  } | null;
  user?: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    name?: string | null;
  } | null;
}

export function computeEligibleVoters(
  participants: readonly Participant[],
  votedUserIds: Set<string>,
): EligibleVoter[] {
  const voters: EligibleVoter[] = [];

  for (const participant of participants) {
    const hasVotingRight = participant.role?.action_rights?.some(
      (ar) => ar.action === 'active_voting' && ar.resource === 'events',
    );

    if (hasVotingRight && participant.user) {
      voters.push({
        id: participant.user.id,
        name: (participant.user.name ?? `${participant.user.first_name ?? ''} ${participant.user.last_name ?? ''}`.trim()) || undefined,
        hasVoted: votedUserIds.has(participant.user.id),
      });
    }
  }

  return voters;
}
