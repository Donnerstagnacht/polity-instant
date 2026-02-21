export function normalizeAmendmentStatus(status?: string) {
  if (!status) return 'viewing';
  const normalized = status.toLowerCase();
  if (
    normalized === 'collaborative_editing' ||
    normalized === 'internal_suggesting' ||
    normalized === 'internal_voting' ||
    normalized === 'viewing' ||
    normalized === 'event_suggesting' ||
    normalized === 'event_voting' ||
    normalized === 'passed' ||
    normalized === 'rejected'
  ) {
    return normalized as
      | 'collaborative_editing'
      | 'internal_suggesting'
      | 'internal_voting'
      | 'viewing'
      | 'event_suggesting'
      | 'event_voting'
      | 'passed'
      | 'rejected';
  }
  return 'viewing';
}

export function normalizeVoteStatus(status?: string) {
  if (!status) return 'open';
  const normalized = status.toLowerCase();
  if (
    normalized === 'open' ||
    normalized === 'closing_soon' ||
    normalized === 'last_hour' ||
    normalized === 'final_minutes' ||
    normalized === 'passed' ||
    normalized === 'failed' ||
    normalized === 'tied'
  ) {
    return normalized as
      | 'open'
      | 'closing_soon'
      | 'last_hour'
      | 'final_minutes'
      | 'passed'
      | 'failed'
      | 'tied';
  }
  return 'open';
}

export function normalizeElectionStatus(status?: string) {
  if (!status) return 'voting_open';
  const normalized = status.toLowerCase();
  if (
    normalized === 'nominations_open' ||
    normalized === 'voting_open' ||
    normalized === 'closed' ||
    normalized === 'winner_announced'
  ) {
    return normalized as 'nominations_open' | 'voting_open' | 'closed' | 'winner_announced';
  }
  return 'voting_open';
}
