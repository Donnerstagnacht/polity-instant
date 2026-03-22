import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { eventTitle, recomputeEventCounters } from '../server-helpers'
import { createElectionSchema, updateElectionSchema } from './schema'

/** Server-only mutators — override shared mutators with additional server-side logic. */
export const electionServerMutators = {
  createElection: defineMutator(createElectionSchema, async ({ tx, ctx, args }) => {
    await mutators.elections.createElection.fn({ tx, ctx, args })

    if (args.agenda_item_id) {
      const agendaItem = await tx.run(zql.agenda_item.where('id', args.agenda_item_id).one())
      if (agendaItem?.event_id) {
        await recomputeEventCounters(tx, agendaItem.event_id)
      }
    }
  }),

  updateElection: defineMutator(updateElectionSchema, async ({ tx, ctx, args }) => {
    const oldElection = await tx.run(zql.election.where('id', args.id).one())

    await mutators.elections.updateElection.fn({ tx, ctx, args })

    if (oldElection?.agenda_item_id) {
      const agendaItem = await tx.run(zql.agenda_item.where('id', oldElection.agenda_item_id).one())
      if (agendaItem?.event_id) {
        await recomputeEventCounters(tx, agendaItem.event_id)
      }
    }

    if (args.status === 'closed' && oldElection?.agenda_item_id) {
      const ai = await tx.run(zql.agenda_item.where('id', oldElection.agenda_item_id).one())
      if (ai?.event_id) {
        fireNotification('notifyElectionResult', {
          senderId: ctx.userID,
          eventId: ai.event_id,
          electionId: args.id,
        })
      }
    }
  }),
}
