import { defineMutator } from '@rocicorp/zero'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { eventTitle, recomputeEventCounters } from '../server-helpers'
import {
  deleteAgendaItemSchema,
  updateAgendaItemSchema,
  createSpeakerListSchema,
} from './schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const agendaServerMutators = {
  deleteAgendaItem: defineMutator(deleteAgendaItemSchema, async ({ tx, ctx, args }) => {
    const item = await tx.run(zql.agenda_item.where('id', args.id).one())

    await mutators.agendas.deleteAgendaItem.fn({ tx, ctx, args })

    if (item?.event_id) {
      await recomputeEventCounters(tx, item.event_id)
      const eTitle = await eventTitle(tx, item.event_id)
      fireNotification('notifyAgendaItemDeleted', {
        senderId: ctx.userID,
        eventId: item.event_id,
        agendaItemId: args.id,
        agendaItemTitle: item.title,
        eventTitle: eTitle,
      })
    }
  }),

  updateAgendaItem: defineMutator(updateAgendaItemSchema, async ({ tx, ctx, args }) => {
    const oldItem = await tx.run(zql.agenda_item.where('id', args.id).one())

    await mutators.agendas.updateAgendaItem.fn({ tx, ctx, args })

    if (!oldItem) return

    if (oldItem.event_id) {
      await recomputeEventCounters(tx, oldItem.event_id)
    }
    if (args.event_id && args.event_id !== oldItem.event_id) {
      await recomputeEventCounters(tx, args.event_id)
    }

    if (args.status === 'in-progress' && oldItem.status !== 'in-progress' && oldItem.event_id) {
      const eTitle = await eventTitle(tx, oldItem.event_id)
      fireNotification('notifyAgendaItemActivated', {
        senderId: ctx.userID,
        eventId: oldItem.event_id,
        eventTitle: eTitle,
        agendaItemId: args.id,
        agendaItemTitle: oldItem.title,
        agendaItemType: oldItem.type,
      })
    }

    if (args.event_id && args.event_id !== oldItem.event_id && oldItem.event_id) {
      const [sourceTitle, targetTitle] = await Promise.all([
        eventTitle(tx, oldItem.event_id),
        eventTitle(tx, args.event_id),
      ])
      fireNotification('notifyAgendaItemTransferred', {
        senderId: ctx.userID,
        agendaItemId: args.id,
        agendaItemTitle: oldItem.title,
        sourceEventTitle: sourceTitle,
        targetEventId: args.event_id,
        targetEventTitle: targetTitle,
      })
    }
  }),

  addSpeaker: defineMutator(createSpeakerListSchema, async ({ tx, ctx, args }) => {
    await mutators.agendas.addSpeaker.fn({ tx, ctx, args })

    if (args.agenda_item_id) {
      const ai = await tx.run(zql.agenda_item.where('id', args.agenda_item_id).one())
      if (ai?.event_id) {
        const eTitle = await eventTitle(tx, ai.event_id)
        fireNotification('notifySpeakerListJoined', {
          senderId: ctx.userID,
          eventId: ai.event_id,
          eventTitle: eTitle,
          agendaItemId: args.agenda_item_id,
        })
      }
    }
  }),
}
