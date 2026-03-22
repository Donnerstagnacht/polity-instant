import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { recomputeEventCounters } from '../server-helpers'
import { createVoteSchema, updateVoteSchema } from './schema'

/** Server-only mutators — override shared mutators with additional server-side logic. */
export const voteServerMutators = {
  createVote: defineMutator(createVoteSchema, async ({ tx, ctx, args }) => {
    await mutators.votes.createVote.fn({ tx, ctx, args })

    if (args.agenda_item_id) {
      const agendaItem = await tx.run(zql.agenda_item.where('id', args.agenda_item_id).one())
      if (agendaItem?.event_id) {
        await recomputeEventCounters(tx, agendaItem.event_id)
      }
    }
  }),

  updateVote: defineMutator(updateVoteSchema, async ({ tx, ctx, args }) => {
    const oldVote = await tx.run(zql.vote.where('id', args.id).one())

    await mutators.votes.updateVote.fn({ tx, ctx, args })

    if (oldVote?.agenda_item_id) {
      const agendaItem = await tx.run(zql.agenda_item.where('id', oldVote.agenda_item_id).one())
      if (agendaItem?.event_id) {
        await recomputeEventCounters(tx, agendaItem.event_id)
      }
    }
  }),
}
