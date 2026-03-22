import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const voteQueries = {
  // Votes with full details (for decision terminal/listing)
  votesWithDetails: defineQuery(
    z.object({}),
    () =>
      zql.vote
        .related('agenda_item', q => q.related('event'))
        .related('amendment')
        .related('choices', q => q.orderBy('order_index', 'asc'))
        .related('voters')
        .related('indicative_decisions', q => q.related('choice'))
        .related('final_decisions', q => q.related('choice'))
  ),

  // Votes for multiple agenda items with full details
  byAgendaItems: defineQuery(
    z.object({ agenda_item_ids: z.array(z.string()) }),
    ({ args: { agenda_item_ids } }) =>
      zql.vote
        .where('agenda_item_id', 'IN', agenda_item_ids)
        .related('amendment')
        .related('choices', q => q.orderBy('order_index', 'asc'))
        .related('voters', q => q.related('user'))
        .related('indicative_participations', q => q.related('voter').related('decisions', q2 => q2.related('choice')))
        .related('indicative_decisions', q => q.related('choice'))
        .related('final_participations', q => q.related('voter').related('decisions', q2 => q2.related('choice')))
        .related('final_decisions', q => q.related('choice'))
  ),

  // Vote by agenda item with full details
  byAgendaItem: defineQuery(
    z.object({ agenda_item_id: z.string() }),
    ({ args: { agenda_item_id } }) =>
      zql.vote
        .where('agenda_item_id', agenda_item_id)
        .related('amendment')
        .related('choices', q => q.orderBy('order_index', 'asc'))
        .related('voters', q => q.related('user'))
        .related('indicative_participations', q => q.related('voter').related('decisions', q2 => q2.related('choice')))
        .related('indicative_decisions', q => q.related('choice'))
        .related('final_participations', q => q.related('voter').related('decisions', q2 => q2.related('choice')))
        .related('final_decisions', q => q.related('choice'))
  ),

  // Single vote by ID with full details
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.vote
        .where('id', id)
        .related('agenda_item')
        .related('amendment')
        .related('choices', q => q.orderBy('order_index', 'asc'))
        .related('voters', q => q.related('user'))
        .related('indicative_participations', q => q.related('voter').related('decisions', q2 => q2.related('choice')))
        .related('indicative_decisions', q => q.related('choice'))
        .related('final_participations', q => q.related('voter').related('decisions', q2 => q2.related('choice')))
        .related('final_decisions', q => q.related('choice'))
        .one()
  ),

  // Choices for a vote
  choicesByVote: defineQuery(
    z.object({ vote_id: z.string() }),
    ({ args: { vote_id } }) =>
      zql.vote_choice
        .where('vote_id', vote_id)
        .orderBy('order_index', 'asc')
        .related('indicative_decisions')
        .related('final_decisions')
  ),

  // Indicative results — decisions grouped by choice
  indicativeResults: defineQuery(
    z.object({ vote_id: z.string() }),
    ({ args: { vote_id } }) =>
      zql.indicative_choice_decision
        .where('vote_id', vote_id)
        .related('choice')
        .related('participation')
  ),

  // Final results — decisions grouped by choice
  finalResults: defineQuery(
    z.object({ vote_id: z.string() }),
    ({ args: { vote_id } }) =>
      zql.final_choice_decision
        .where('vote_id', vote_id)
        .related('choice')
        .related('participation')
  ),

  // Check if user has participated in indicative phase
  userIndicativeParticipation: defineQuery(
    z.object({ vote_id: z.string(), voter_id: z.string() }),
    ({ args: { vote_id, voter_id } }) =>
      zql.indicative_voter_participation
        .where('vote_id', vote_id)
        .where('voter_id', voter_id)
        .related('decisions', q => q.related('choice'))
        .one()
  ),

  // Check if user has participated in final phase
  userFinalParticipation: defineQuery(
    z.object({ vote_id: z.string(), voter_id: z.string() }),
    ({ args: { vote_id, voter_id } }) =>
      zql.final_voter_participation
        .where('vote_id', vote_id)
        .where('voter_id', voter_id)
        .related('decisions', q => q.related('choice'))
        .one()
  ),

  // User's voter record for a vote
  userVoter: defineQuery(
    z.object({ vote_id: z.string(), user_id: z.string() }),
    ({ args: { vote_id, user_id } }) =>
      zql.voter
        .where('vote_id', vote_id)
        .where('user_id', user_id)
        .one()
  ),
}

// ── Query Row Types ─────────────────────────────────────────────────
export type VoteWithDetailsRow = QueryRowType<typeof voteQueries.votesWithDetails>
export type VotesByAgendaItemsRow = QueryRowType<typeof voteQueries.byAgendaItems>
export type VoteByAgendaItemRow = QueryRowType<typeof voteQueries.byAgendaItem>
export type VoteByIdRow = QueryRowType<typeof voteQueries.byId>
export type ChoicesByVoteRow = QueryRowType<typeof voteQueries.choicesByVote>
export type IndicativeDecisionResultRow = QueryRowType<typeof voteQueries.indicativeResults>
export type FinalDecisionResultRow = QueryRowType<typeof voteQueries.finalResults>
export type UserIndicativeVoterParticipationRow = QueryRowType<typeof voteQueries.userIndicativeParticipation>
export type UserFinalVoterParticipationRow = QueryRowType<typeof voteQueries.userFinalParticipation>
export type UserVoterRow = QueryRowType<typeof voteQueries.userVoter>
