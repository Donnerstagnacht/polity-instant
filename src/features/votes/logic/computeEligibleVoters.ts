/**
 * Pure functions for computing eligible voters from event participants.
 */

export interface EligibleVoter {
  id: string;
  name?: string;
  hasVoted: boolean;
}

export function computeEligibleVoters(
  participants: any[],
  votedUserIds: Set<string>,
): EligibleVoter[] {
  const voters: EligibleVoter[] = [];

  for (const participant of participants) {
    const hasVotingRight = participant.role?.action_rights?.some(
      (ar: any) => ar.action === 'active_voting' && ar.resource === 'events',
    );

    if (hasVotingRight && participant.user) {
      voters.push({
        id: participant.user.id,
        name: participant.user.name,
        hasVoted: votedUserIds.has(participant.user.id),
      });
    }
  }

  return voters;
}
