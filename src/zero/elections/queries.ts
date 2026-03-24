import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const electionQueries = {
  // Election by agenda item with full details
  byAgendaItem: defineQuery(
    z.object({ agenda_item_id: z.string() }),
    ({ args: { agenda_item_id } }) =>
      zql.election
        .where('agenda_item_id', agenda_item_id)
        .related('position', q => q.related('group'))
        .related('candidates', q => q.orderBy('order_index', 'asc').related('user'))
        .related('electors', q => q.related('user'))
        .related('indicative_participations', q => q.related('elector').related('selections', q2 => q2.related('candidate')))
        .related('indicative_selections', q => q.related('candidate'))
        .related('final_participations', q => q.related('elector').related('selections', q2 => q2.related('candidate')))
        .related('final_selections', q => q.related('candidate'))
  ),

  // Single election by ID with full details
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.election
        .where('id', id)
        .related('agenda_item')
        .related('position')
        .related('candidates', q => q.orderBy('order_index', 'asc').related('user'))
        .related('electors', q => q.related('user'))
        .related('indicative_participations', q => q.related('elector').related('selections', q2 => q2.related('candidate')))
        .related('indicative_selections', q => q.related('candidate'))
        .related('final_participations', q => q.related('elector').related('selections', q2 => q2.related('candidate')))
        .related('final_selections', q => q.related('candidate'))
        .one()
  ),

  // Candidates for an election
  candidatesByElection: defineQuery(
    z.object({ election_id: z.string() }),
    ({ args: { election_id } }) =>
      zql.election_candidate
        .where('election_id', election_id)
        .orderBy('order_index', 'asc')
        .related('user')
        .related('indicative_selections')
        .related('final_selections')
  ),

  // Electors for an election
  electorsByElection: defineQuery(
    z.object({ election_id: z.string() }),
    ({ args: { election_id } }) =>
      zql.elector
        .where('election_id', election_id)
        .related('user')
  ),

  // Indicative results — selections grouped by candidate
  indicativeResults: defineQuery(
    z.object({ election_id: z.string() }),
    ({ args: { election_id } }) =>
      zql.indicative_candidate_selection
        .where('election_id', election_id)
        .related('candidate')
        .related('participation')
  ),

  // Final results — selections grouped by candidate
  finalResults: defineQuery(
    z.object({ election_id: z.string() }),
    ({ args: { election_id } }) =>
      zql.final_candidate_selection
        .where('election_id', election_id)
        .related('candidate')
        .related('participation')
  ),

  // Check if user has participated in indicative phase
  userIndicativeParticipation: defineQuery(
    z.object({ election_id: z.string(), elector_id: z.string() }),
    ({ args: { election_id, elector_id } }) =>
      zql.indicative_elector_participation
        .where('election_id', election_id)
        .where('elector_id', elector_id)
        .related('selections', q => q.related('candidate'))
        .one()
  ),

  // Check if user has participated in final phase
  userFinalParticipation: defineQuery(
    z.object({ election_id: z.string(), elector_id: z.string() }),
    ({ args: { election_id, elector_id } }) =>
      zql.final_elector_participation
        .where('election_id', election_id)
        .where('elector_id', elector_id)
        .related('selections', q => q.related('candidate'))
        .one()
  ),

  // Elections with full details (for decision terminal/listing)
  electionsWithDetails: defineQuery(
    z.object({}),
    () =>
      zql.election
        .related('candidates', q => q.related('user'))
        .related('agenda_item', q => q.related('event'))
        .related('position')
        .related('electors')
        .related('indicative_selections', q => q.related('candidate'))
        .related('final_selections', q => q.related('candidate'))
  ),

  // Elections for search (position+group, candidates, agenda_item+event)
  electionsForSearch: defineQuery(
    z.object({}),
    () =>
      zql.election
        .related('position', q => q.related('group'))
        .related('candidates')
        .related('agenda_item', q => q.related('event'))
  ),

  // Pending elections
  pendingElections: defineQuery(
    z.object({}),
    () =>
      zql.election
        .where('status', 'pending')
        .related('position', q => q.related('group'))
  ),

  // User's elector record for an election
  userElector: defineQuery(
    z.object({ election_id: z.string(), user_id: z.string() }),
    ({ args: { election_id, user_id } }) =>
      zql.elector
        .where('election_id', election_id)
        .where('user_id', user_id)
        .one()
  ),
}

// ── Query Row Types ─────────────────────────────────────────────────
export type ElectionByAgendaItemRow = QueryRowType<typeof electionQueries.byAgendaItem>
export type ElectionByIdRow = QueryRowType<typeof electionQueries.byId>
export type CandidatesByElectionRow = QueryRowType<typeof electionQueries.candidatesByElection>
export type ElectorsByElectionRow = QueryRowType<typeof electionQueries.electorsByElection>
export type IndicativeResultRow = QueryRowType<typeof electionQueries.indicativeResults>
export type FinalResultRow = QueryRowType<typeof electionQueries.finalResults>
export type UserIndicativeParticipationRow = QueryRowType<typeof electionQueries.userIndicativeParticipation>
export type UserFinalParticipationRow = QueryRowType<typeof electionQueries.userFinalParticipation>
export type ElectionWithDetailsRow = QueryRowType<typeof electionQueries.electionsWithDetails>
export type ElectionForSearchRow = QueryRowType<typeof electionQueries.electionsForSearch>
export type UserElectorRow = QueryRowType<typeof electionQueries.userElector>
