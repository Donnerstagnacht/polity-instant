/**
 * Synthesizes a ChangeRequestTimelineRow-compatible object from an agenda item's
 * own vote, so it can appear as the final item in the CR timeline list.
 *
 * Returns `null` if no vote is provided.
 */

interface AgendaVoteInput {
  id: string;
  agenda_item_id?: string | null;
  amendment_id?: string | null;
  title?: string | null;
  description?: string | null;
  status?: string | null;
  majority_type?: string | null;
  closing_type?: string | null;
  closing_duration_seconds?: number | null;
  closing_end_time?: number | null;
  visibility: string;
  created_at: number;
  updated_at: number;
  choices?: readonly {
    id: string;
    vote_id: string;
    label?: string | null;
    order_index?: number | null;
    created_at: number;
    indicative_decisions?: readonly unknown[];
    final_decisions?: readonly unknown[];
  }[];
  voters?: readonly {
    id: string;
    vote_id: string;
    user_id: string;
    created_at: number;
    user?: unknown;
  }[];
  indicative_participations?: readonly unknown[];
  indicative_decisions?: readonly unknown[];
  final_participations?: readonly unknown[];
  final_decisions?: readonly unknown[];
}

function mapVoteStatusToTimelineStatus(voteStatus: string | null | undefined): string {
  if (voteStatus === 'closed') return 'completed';
  if (voteStatus === 'indicative' || voteStatus === 'final_vote' || voteStatus === 'final')
    return 'voting';
  return 'pending';
}

export function buildFinalVoteFromAgendaVote(
  vote: AgendaVoteInput | null | undefined,
  orderIndex: number
) {
  if (!vote) return null;

  return {
    id: `agenda-vote-final-${vote.id}`,
    agenda_item_id: vote.agenda_item_id ?? '',
    change_request_id: null,
    vote_id: vote.id,
    order_index: orderIndex,
    is_final_vote: true,
    status: mapVoteStatusToTimelineStatus(vote.status),
    created_at: vote.created_at,
    updated_at: vote.updated_at,
    change_request: null,
    vote: {
      id: vote.id,
      agenda_item_id: vote.agenda_item_id ?? null,
      amendment_id: vote.amendment_id ?? null,
      title: vote.title ?? null,
      description: vote.description ?? null,
      status: vote.status ?? null,
      majority_type: vote.majority_type ?? null,
      closing_type: vote.closing_type ?? null,
      closing_duration_seconds: vote.closing_duration_seconds ?? null,
      closing_end_time: vote.closing_end_time ?? null,
      visibility: vote.visibility,
      created_at: vote.created_at,
      updated_at: vote.updated_at,
      choices: vote.choices ?? [],
      voters: vote.voters ?? [],
      indicative_participations: vote.indicative_participations ?? [],
      indicative_decisions: vote.indicative_decisions ?? [],
      final_participations: vote.final_participations ?? [],
      final_decisions: vote.final_decisions ?? [],
    },
  };
}

export type SynthesizedFinalVoteItem = NonNullable<ReturnType<typeof buildFinalVoteFromAgendaVote>>;
