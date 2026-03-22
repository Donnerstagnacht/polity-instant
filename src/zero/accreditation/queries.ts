import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const accreditationQueries = {
  // All accreditations for an event
  accreditationsByEvent: defineQuery(
    z.object({ event_id: z.string() }),
    ({ args: { event_id } }) =>
      zql.accreditation
        .where('event_id', event_id)
        .related('user')
  ),

  // User's accreditation for an event
  userAccreditation: defineQuery(
    z.object({ event_id: z.string(), user_id: z.string() }),
    ({ args: { event_id, user_id } }) =>
      zql.accreditation
        .where('event_id', event_id)
        .where('user_id', user_id)
        .one()
  ),

  // All accreditations for an agenda item
  accreditationsByAgendaItem: defineQuery(
    z.object({ agenda_item_id: z.string() }),
    ({ args: { agenda_item_id } }) =>
      zql.accreditation
        .where('agenda_item_id', agenda_item_id)
        .related('user')
  ),
}
