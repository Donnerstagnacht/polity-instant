import { defineMutator } from '@rocicorp/zero'
import { z } from 'zod'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { eventTitle, userName } from '../server-helpers'
import {
  eventParticipantCreateSchema,
  eventParticipantDeleteSchema,
  eventParticipantUpdateSchema,
  eventUpdateSchema,
  eventCancelSchema,
} from './schema'
import {
  createEventPositionSchema,
  deleteEventPositionSchema,
} from '../positions/schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const eventServerMutators = {
  joinEvent: defineMutator(eventParticipantCreateSchema, async ({ tx, ctx, args }) => {
    await mutators.events.joinEvent.fn({ tx, ctx, args })

    if (args.status === 'requested' && args.event_id) {
      const [eTitle, uName] = await Promise.all([
        eventTitle(tx, args.event_id),
        userName(tx, ctx.userID),
      ])
      fireNotification('notifyParticipationRequest', {
        senderId: ctx.userID, senderName: uName, eventId: args.event_id, eventTitle: eTitle,
      })
    }
  }),

  inviteParticipant: defineMutator(eventParticipantCreateSchema, async ({ tx, ctx, args }) => {
    await mutators.events.inviteParticipant.fn({ tx, ctx, args })

    if (args.user_id && args.event_id) {
      const eTitle = await eventTitle(tx, args.event_id)
      fireNotification('notifyEventInvite', {
        senderId: ctx.userID, recipientId: args.user_id, eventId: args.event_id, eventTitle: eTitle,
      })
    }
  }),

  leaveEvent: defineMutator(eventParticipantDeleteSchema, async ({ tx, ctx, args }) => {
    const participation = await tx.run(zql.event_participant.where('id', args.id).one())

    await mutators.events.leaveEvent.fn({ tx, ctx, args })

    if (!participation) return

    const eId = participation.event_id
    const partUserId = participation.user_id
    const status = participation.status
    const isSelf = ctx.userID === partUserId

    const [eTitle, uName] = await Promise.all([
      eventTitle(tx, eId),
      userName(tx, partUserId),
    ])

    if (isSelf) {
      if (status === 'requested') {
        fireNotification('notifyEventRequestWithdrawn', {
          senderId: ctx.userID, senderName: uName, eventId: eId, eventTitle: eTitle,
        })
      } else if (status === 'invited') {
        fireNotification('notifyEventInvitationDeclined', {
          senderId: ctx.userID, senderName: uName, eventId: eId, eventTitle: eTitle,
        })
      } else {
        fireNotification('notifyParticipationWithdrawn', {
          senderId: ctx.userID, senderName: uName, eventId: eId, eventTitle: eTitle,
        })
      }
    } else {
      if (status === 'requested') {
        fireNotification('notifyParticipationRejected', {
          senderId: ctx.userID, recipientId: partUserId, eventId: eId, eventTitle: eTitle,
        })
      } else {
        fireNotification('notifyParticipationRemoved', {
          senderId: ctx.userID, recipientId: partUserId, eventId: eId, eventTitle: eTitle,
        })
      }
    }
  }),

  updateParticipant: defineMutator(eventParticipantUpdateSchema, async ({ tx, ctx, args }) => {
    const oldPart = await tx.run(zql.event_participant.where('id', args.id).one())

    await mutators.events.updateParticipant.fn({ tx, ctx, args })

    if (!oldPart) return

    const eId = oldPart.event_id
    const partUserId = oldPart.user_id
    const oldStatus = oldPart.status
    const newStatus = args.status
    const isSelf = ctx.userID === partUserId

    const eTitle = await eventTitle(tx, eId)

    if (newStatus === 'member' && (oldStatus === 'requested' || oldStatus === 'invited')) {
      if (isSelf) {
        const uName = await userName(tx, ctx.userID)
        fireNotification('notifyEventInvitationAccepted', {
          senderId: ctx.userID, senderName: uName, eventId: eId, eventTitle: eTitle,
        })
      } else {
        fireNotification('notifyParticipationApproved', {
          senderId: ctx.userID, recipientId: partUserId, eventId: eId, eventTitle: eTitle,
        })
      }
    }

    if (args.role_id !== undefined && args.role_id !== oldPart.role_id) {
      fireNotification('notifyOrganizerPromoted', {
        senderId: ctx.userID, recipientId: partUserId, eventId: eId, eventTitle: eTitle,
      })
    }
  }),

  update: defineMutator(eventUpdateSchema, async ({ tx, ctx, args }) => {
    await mutators.events.update.fn({ tx, ctx, args })

    const eTitle = await eventTitle(tx, args.id)
    fireNotification('notifyScheduleChanged', {
      senderId: ctx.userID, eventId: args.id, eventTitle: eTitle,
    })
  }),

  cancel: defineMutator(eventCancelSchema, async ({ tx, ctx, args }) => {
    const eTitle = await eventTitle(tx, args.id)

    await mutators.events.cancel.fn({ tx, ctx, args })

    fireNotification('notifyEventCancelled', {
      senderId: ctx.userID, eventId: args.id, eventTitle: eTitle, reason: args.cancel_reason,
    })
  }),

  finalizeAgendaItem: defineMutator(z.object({ id: z.string(), status: z.string(), end_time: z.number().optional() }), async ({ tx, ctx, args }) => {
    const session = await tx.run(zql.event_voting_session.where('id', args.id).one())

    await mutators.events.finalizeAgendaItem.fn({ tx, ctx, args })

    if (!session) return

    const eventId = session.event_id
    const eTitle = await eventTitle(tx, eventId)

    if (args.status === 'voting') {
      fireNotification('notifyVotingPhaseStarted', {
        senderId: ctx.userID, eventId, eventTitle: eTitle, sessionId: args.id,
      })
    } else if (args.status === 'completed') {
      fireNotification('notifyVotingCompleted', {
        senderId: ctx.userID, eventId, eventTitle: eTitle, sessionId: args.id,
      })
    }
  }),

  // Event position overrides
  createPosition: defineMutator(createEventPositionSchema, async ({ tx, ctx, args }) => {
    await mutators.events.createPosition.fn({ tx, ctx, args })

    if (args.event_id) {
      fireNotification('notifyEventPositionCreated', {
        senderId: ctx.userID, eventId: args.event_id, positionId: args.id, positionTitle: args.title,
      })
    }
  }),

  deletePosition: defineMutator(deleteEventPositionSchema, async ({ tx, ctx, args }) => {
    const pos = await tx.run(zql.event_position.where('id', args.id).one())

    await mutators.events.deletePosition.fn({ tx, ctx, args })

    if (pos?.event_id) {
      fireNotification('notifyEventPositionDeleted', {
        senderId: ctx.userID, eventId: pos.event_id, positionId: args.id, positionTitle: pos.title,
      })
    }
  }),
}
