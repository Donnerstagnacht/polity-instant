/**
 * Creates mock ChangeRequestTimelineRow-compatible objects from CR summaries.
 * Used to display change requests in the timeline card style before vote_event is initialized.
 */

export interface CRSummary {
  id: string;
  crId?: string;
  title: string;
  description: string;
  status: string; // 'open' | 'approved' | 'accepted' | 'rejected' | 'declined'
  type?: string;
  text?: string;
  newText?: string;
  properties?: Record<string, string>;
  newProperties?: Record<string, string>;
  justification?: string;
}

function isAcceptedStatus(status: string) {
  return status === 'approved' || status === 'accepted';
}

function isRejectedStatus(status: string) {
  return status === 'declined' || status === 'rejected';
}

function mapCRStatusToTimelineStatus(status: string): string {
  if (isAcceptedStatus(status) || isRejectedStatus(status)) return 'completed';
  return 'pending';
}

function createMockVote(itemId: string) {
  return {
    id: `mock-vote-${itemId}`,
    status: 'pending' as const,
    majority_type: 'simple' as const,
    visibility: null,
    choices: [
      {
        id: `mock-choice-yes-${itemId}`,
        vote_id: `mock-vote-${itemId}`,
        label: 'yes',
        order_index: 0,
      },
      {
        id: `mock-choice-no-${itemId}`,
        vote_id: `mock-vote-${itemId}`,
        label: 'no',
        order_index: 1,
      },
      {
        id: `mock-choice-abstain-${itemId}`,
        vote_id: `mock-vote-${itemId}`,
        label: 'abstain',
        order_index: 2,
      },
    ],
    voters: [] as never[],
    indicative_participations: [] as never[],
    indicative_decisions: [] as never[],
    final_participations: [] as never[],
    final_decisions: [] as never[],
  };
}

/**
 * Build an array of mock timeline items from CR summaries,
 * compatible with ChangeRequestTimelineRow for rendering in ChangeRequestTimelineCard.
 * Appends a Final Vote item at the end.
 */
export function createMockCRTimelineItems(crSummaries: CRSummary[]) {
  const items = crSummaries.map((cr, index) => ({
    id: `mock-cr-${cr.id}`,
    agenda_item_id: 'mock-agenda',
    change_request_id: cr.id,
    vote_id: `mock-vote-${cr.id}`,
    order_index: index,
    is_final_vote: false,
    status: mapCRStatusToTimelineStatus(cr.status),
    change_request: {
      id: cr.id,
      amendment_id: null,
      user_id: null,
      title: cr.title || cr.crId || `CR-${index + 1}`,
      description: cr.description || null,
      status: cr.status || null,
      votes_for: 0,
      votes_against: 0,
      votes_abstain: 0,
      voting_status: null,
      voting_deadline: null,
      created_at: null,
      updated_at: null,
      user: null,
    },
    vote: createMockVote(cr.id),
    // Store original status for tab filtering
    _originalStatus: cr.status,
  }));

  // Add final vote item
  const finalVoteId = 'mock-final-vote';
  items.push({
    id: finalVoteId,
    agenda_item_id: 'mock-agenda',
    change_request_id: null as never,
    vote_id: `mock-vote-${finalVoteId}`,
    order_index: crSummaries.length,
    is_final_vote: true,
    status: 'pending',
    change_request: null as never,
    vote: createMockVote(finalVoteId),
    _originalStatus: 'open',
  });

  return items;
}

export type MockCRTimelineItem = ReturnType<typeof createMockCRTimelineItems>[number];

/**
 * Determine the tab filter status for a timeline item.
 * Works for both real ChangeRequestTimelineRow and mock items.
 */
export function getCRFilterStatus(
  item: { status?: string | null; is_final_vote?: boolean; _originalStatus?: string },
  getVoteResultFn?: (item: never) => string
): 'open' | 'accepted' | 'rejected' {
  // Mock items carry the original CR status
  if (item._originalStatus) {
    if (isAcceptedStatus(item._originalStatus)) return 'accepted';
    if (isRejectedStatus(item._originalStatus)) return 'rejected';
    return 'open';
  }

  // Real timeline items
  if (item.status === 'completed' && getVoteResultFn) {
    const result = getVoteResultFn(item as never);
    if (result === 'passed') return 'accepted';
    if (result === 'rejected') return 'rejected';
  }

  if (item.status === 'completed') return 'accepted'; // fallback for completed without result fn
  return 'open';
}
