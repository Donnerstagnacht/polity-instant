import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const agendaQueries = {
  // All agenda items for an event
  byEvent: defineQuery(
    z.object({ event_id: z.string() }),
    ({ args: { event_id } }) =>
      zql.agenda_item
        .where('event_id', event_id)
        .orderBy('order_index', 'asc')
  ),

  // Agenda items by multiple event IDs with relations
  byEventIds: defineQuery(
    z.object({ event_ids: z.array(z.string()) }),
    ({ args: { event_ids } }) =>
      zql.agenda_item
        .where('event_id', 'IN', event_ids)
        .related('event')
        .related('election')
        .related('amendment')
  ),

  // Single agenda item by ID
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.agenda_item.where('id', id).one()
  ),

  // Speaker list for an agenda item
  speakerList: defineQuery(
    z.object({ agenda_item_id: z.string() }),
    ({ args: { agenda_item_id } }) =>
      zql.speaker_list
        .where('agenda_item_id', agenda_item_id)
        .orderBy('order_index', 'asc')
  ),

  // Elections for an agenda item
  elections: defineQuery(
    z.object({ agenda_item_id: z.string() }),
    ({ args: { agenda_item_id } }) =>
      zql.election
        .where('agenda_item_id', agenda_item_id)
        .orderBy('created_at', 'desc')
  ),

  // All elections with full details (candidates, votes+candidate, agenda_item+event, position)
  electionsWithDetails: defineQuery(
    z.object({}),
    () =>
      zql.election
        .related('candidates')
        .related('votes', q => q.related('candidate'))
        .related('agenda_item', q => q.related('event'))
        .related('position')
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

  // Candidates for an election
  candidates: defineQuery(
    z.object({ election_id: z.string() }),
    ({ args: { election_id } }) =>
      zql.election_candidate
        .where('election_id', election_id)
        .orderBy('order_index', 'asc')
  ),

  // Votes for an election
  votes: defineQuery(
    z.object({ election_id: z.string() }),
    ({ args: { election_id } }) =>
      zql.election_vote
        .where('election_id', election_id)
  ),

  pendingElections: defineQuery(
    z.object({}),
    () =>
      zql.election
        .where('status', 'pending')
        .related('position', q => q.related('group'))
  ),
}
