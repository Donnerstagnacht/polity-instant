import { defineQuery, type QueryRowType } from '@rocicorp/zero'
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
        .related('event')
        .related('creator')
        .related('election', q => q.related('position'))
        .related('amendment')
        .related('votes')
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
        .related('votes')
  ),

  // Single agenda item by ID
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.agenda_item.where('id', id).one()
  ),

  // Agenda items for a specific amendment (to find the agenda item for CR voting timeline)
  byAmendmentId: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.agenda_item
        .where('amendment_id', amendment_id)
        .related('event')
  ),

  // Speaker list for an agenda item
  speakerList: defineQuery(
    z.object({ agenda_item_id: z.string() }),
    ({ args: { agenda_item_id } }) =>
      zql.speaker_list
        .where('agenda_item_id', agenda_item_id)
        .orderBy('order_index', 'asc')
  ),

  // Change request timeline for an agenda item (CR voting during events)
  changeRequestTimeline: defineQuery(
    z.object({ agenda_item_id: z.string() }),
    ({ args: { agenda_item_id } }) =>
      zql.agenda_item_change_request
        .where('agenda_item_id', agenda_item_id)
        .orderBy('order_index', 'asc')
        .related('change_request', q => q.related('user'))
        .related('vote', q =>
          q
            .related('choices', cq => cq.orderBy('order_index', 'asc'))
            .related('voters', vq => vq.related('user'))
            .related('indicative_participations', ip =>
              ip.related('decisions', dq => dq.related('choice'))
            )
            .related('indicative_decisions', dq => dq.related('choice'))
            .related('final_participations', fp =>
              fp.related('decisions', dq => dq.related('choice'))
            )
            .related('final_decisions', dq => dq.related('choice'))
        )
  ),
}

// ── Query Row Types ─────────────────────────────────────────────────
export type AgendaItemByEventRow = QueryRowType<typeof agendaQueries.byEvent>
export type AgendaItemByEventIdsRow = QueryRowType<typeof agendaQueries.byEventIds>
export type AgendaItemByIdRow = QueryRowType<typeof agendaQueries.byId>
export type AgendaItemByAmendmentRow = QueryRowType<typeof agendaQueries.byAmendmentId>
export type SpeakerListRow = QueryRowType<typeof agendaQueries.speakerList>
export type ChangeRequestTimelineRow = QueryRowType<typeof agendaQueries.changeRequestTimeline>
