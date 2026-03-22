import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

/**
 * Reactive state hook for vote data.
 * Returns query-derived state — no mutations.
 */
export function useVoteState(options: {
  agendaItemId?: string
  voteId?: string
  voterId?: string
  includeVotesWithDetails?: boolean
} = {}) {
  const { agendaItemId, voteId, voterId, includeVotesWithDetails } = options

  // ── Votes with full details (opt-in) ──────────────────────────────
  const [votesDetailed, votesDetailedResult] = useQuery(
    includeVotesWithDetails ? queries.votes.votesWithDetails({}) : undefined
  )

  // ── Vote by agenda item ────────────────────────────────────────────
  const [votesByAgendaItem, votesByAgendaItemResult] = useQuery(
    agendaItemId ? queries.votes.byAgendaItem({ agenda_item_id: agendaItemId }) : undefined
  )

  // ── Single vote by ID ─────────────────────────────────────────────
  const [voteById, voteByIdResult] = useQuery(
    voteId ? queries.votes.byId({ id: voteId }) : undefined
  )

  const resolvedVoteId = voteId ?? voteById?.id ?? votesByAgendaItem?.[0]?.id

  // ── Choices for the vote ──────────────────────────────────────────
  const [choices, choicesResult] = useQuery(
    resolvedVoteId ? queries.votes.choicesByVote({ vote_id: resolvedVoteId }) : undefined
  )

  // ── User's indicative participation ───────────────────────────────
  const [userIndicativeParticipation, userIndicativeResult] = useQuery(
    resolvedVoteId && voterId
      ? queries.votes.userIndicativeParticipation({ vote_id: resolvedVoteId, voter_id: voterId })
      : undefined
  )

  // ── User's final participation ────────────────────────────────────
  const [userFinalParticipation, userFinalResult] = useQuery(
    resolvedVoteId && voterId
      ? queries.votes.userFinalParticipation({ vote_id: resolvedVoteId, voter_id: voterId })
      : undefined
  )

  const voteEntity = useMemo(
    () => voteById ?? votesByAgendaItem?.[0] ?? null,
    [voteById, votesByAgendaItem]
  )

  const resolvedChoices = useMemo(
    () => choices ?? voteEntity?.choices ?? [],
    [choices, voteEntity]
  )

  const isLoading =
    (includeVotesWithDetails ? votesDetailedResult.type === 'unknown' : false) ||
    (agendaItemId ? votesByAgendaItemResult.type === 'unknown' : false) ||
    (voteId ? voteByIdResult.type === 'unknown' : false) ||
    (resolvedVoteId ? choicesResult.type === 'unknown' : false) ||
    (resolvedVoteId && voterId ? userIndicativeResult.type === 'unknown' : false) ||
    (resolvedVoteId && voterId ? userFinalResult.type === 'unknown' : false)

  return {
    vote: voteEntity,
    votesWithDetails: votesDetailed ?? [],
    votesByAgendaItem: votesByAgendaItem ?? [],
    choices: resolvedChoices,
    userIndicativeParticipation: userIndicativeParticipation ?? null,
    userFinalParticipation: userFinalParticipation ?? null,
    isLoading,
  }
}
