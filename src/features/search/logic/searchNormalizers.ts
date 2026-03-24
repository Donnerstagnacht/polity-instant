export function normalizeAmendmentStatus(status?: string) {
  if (!status) return 'view';
  const normalized = status.toLowerCase();
  if (
    normalized === 'edit' ||
    normalized === 'suggest_internal' ||
    normalized === 'vote_internal' ||
    normalized === 'view' ||
    normalized === 'suggest_event' ||
    normalized === 'vote_event' ||
    normalized === 'passed' ||
    normalized === 'rejected'
  ) {
    return normalized as
      | 'edit'
      | 'suggest_internal'
      | 'vote_internal'
      | 'view'
      | 'suggest_event'
      | 'vote_event'
      | 'passed'
      | 'rejected';
  }
  return 'view';
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
