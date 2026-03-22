import { defineMutator } from '@rocicorp/zero'
import { z } from 'zod'
import { mutators } from '../mutators'
import { zql } from '../schema'
import { fireNotification } from '../server-notify'
import { eventTitle, userName, recomputeEventCounters, recomputeGroupCounters } from '../server-helpers'
import { DEFAULT_EVENT_ROLES } from '../rbac/constants'
import {
  eventCreateSchema,
  eventParticipantCreateSchema,
  eventParticipantDeleteSchema,
  eventParticipantUpdateSchema,
  eventUpdateSchema,
  eventCancelSchema,
  bookMeetingSchema,
  cancelMeetingBookingSchema,
} from './schema'
import {
  createEventPositionSchema,
  deleteEventPositionSchema,
} from '../positions/schema'

/** Server-only mutators — override the shared mutators with additional server-side logic (e.g. notifications). */
export const eventServerMutators = {
  create: defineMutator(eventCreateSchema, async ({ tx, ctx, args }) => {
    await mutators.events.create.fn({ tx, ctx, args })

    const now = Date.now()

    // Create default event roles (Organizer, Voter, Participant) with action rights
    const organizerRoleId = crypto.randomUUID()
    const roleIds: Record<string, string> = {}

    for (const roleDef of DEFAULT_EVENT_ROLES) {
      const roleId = roleDef.name === 'Organizer' ? organizerRoleId : crypto.randomUUID()
      roleIds[roleDef.name] = roleId

      await tx.mutate.role.insert({
        id: roleId,
        name: roleDef.name,
        description: roleDef.description,
        scope: 'event',
        event_id: args.id,
        group_id: null,
        amendment_id: null,
        blog_id: null,
        sort_order: 0,
        created_at: now,
      })

      for (const perm of roleDef.permissions) {
        await tx.mutate.action_right.insert({
          id: crypto.randomUUID(),
          resource: perm.resource,
          action: perm.action,
          role_id: roleId,
          event_id: args.id,
          group_id: null,
          amendment_id: null,
          blog_id: null,
          created_at: now,
        })
      }
    }

    const creatorParticipation = await tx.run(
      zql.event_participant.where('event_id', args.id).where('user_id', ctx.userID).one()
    )
    if (creatorParticipation) {
      await tx.mutate.event_participant.update({
        id: creatorParticipation.id,
        group_id: args.group_id ?? null,
        status: 'confirmed',
        role_id: organizerRoleId,
        visibility: args.visibility ?? 'public',
      })
    } else {
      await tx.mutate.event_participant.insert({
        id: crypto.randomUUID(),
        event_id: args.id,
        user_id: ctx.userID,
        group_id: args.group_id ?? null,
        status: 'confirmed',
        role_id: organizerRoleId,
        visibility: args.visibility ?? 'public',
        instance_date: null,
        created_at: now,
      })
    }

    // Auto-invite group members for General Assembly events
    if (args.event_type === 'general_assembly' && args.group_id) {
      const members = await tx.run(
        zql.group_membership.where('group_id', args.group_id).where('status', 'active')
      )
      for (const member of members) {
        if (member.user_id === ctx.userID) continue // skip creator (already added)
        await tx.mutate.event_participant.insert({
          id: crypto.randomUUID(),
          event_id: args.id,
          user_id: member.user_id,
          group_id: args.group_id,
          status: 'invited',
          role_id: null,
          visibility: args.visibility ?? 'public',
          created_at: now,
        })
      }
    }

    // Auto-invite specific users for OnInvite events
    if (args.event_type === 'on_invite' && args.invited_user_ids?.length) {
      for (const userId of args.invited_user_ids) {
        if (userId === ctx.userID) continue // skip creator (already added)
        await tx.mutate.event_participant.insert({
          id: crypto.randomUUID(),
          event_id: args.id,
          user_id: userId,
          group_id: args.group_id ?? null,
          status: 'invited',
          role_id: null,
          visibility: args.visibility ?? 'public',
          created_at: now,
        })
      }
    }

    await recomputeEventCounters(tx, args.id)

    if (args.group_id) {
      await recomputeGroupCounters(tx, args.group_id)
    }
  }),

  joinEvent: defineMutator(eventParticipantCreateSchema, async ({ tx, ctx, args }) => {
    await mutators.events.joinEvent.fn({ tx, ctx, args })

    await recomputeEventCounters(tx, args.event_id)

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

    await recomputeEventCounters(tx, args.event_id)

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

    await recomputeEventCounters(tx, participation.event_id)

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

    await recomputeEventCounters(tx, oldPart.event_id)

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

    // Read event before cancel to get group_id
    const ev = await tx.run(zql.event.where('id', args.id).one())

    await mutators.events.cancel.fn({ tx, ctx, args })

    if (ev?.group_id) {
      await recomputeGroupCounters(tx, ev.group_id)
    }

    fireNotification('notifyEventCancelled', {
      senderId: ctx.userID, eventId: args.id, eventTitle: eTitle, reason: args.cancel_reason,
    })
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

  // Meeting booking (meetings as events)
  bookMeeting: defineMutator(bookMeetingSchema, async ({ tx, ctx, args }) => {
    // Capacity check: count existing bookings for this instance
    const allParticipants = await tx.run(
      zql.event_participant.where('event_id', args.event_id)
    )
    const ev = await tx.run(zql.event.where('id', args.event_id).one())
    if (!ev || !ev.is_bookable) return

    const maxBookings = ev.max_bookings ?? 1
    // Count non-organizer participants for this specific instance
    const instanceBookings = allParticipants.filter(p => {
      // Skip the organizer (creator)
      if (p.user_id === ev.creator_id) return false
      if (args.instance_date === null || args.instance_date === undefined) {
        return p.instance_date === null || p.instance_date === undefined || p.instance_date === 0
      }
      return p.instance_date === args.instance_date
    })
    if (instanceBookings.length >= maxBookings) return

    await mutators.events.bookMeeting.fn({ tx, ctx, args })

    await recomputeEventCounters(tx, args.event_id)

    const [eTitle, uName] = await Promise.all([
      eventTitle(tx, args.event_id),
      userName(tx, ctx.userID),
    ])
    fireNotification('notifyMeetingBooked', {
      senderId: ctx.userID, senderName: uName, eventId: args.event_id, eventTitle: eTitle,
    })
  }),

  cancelMeetingBooking: defineMutator(cancelMeetingBookingSchema, async ({ tx, ctx, args }) => {
    await mutators.events.cancelMeetingBooking.fn({ tx, ctx, args })

    await recomputeEventCounters(tx, args.event_id)

    const [eTitle, uName] = await Promise.all([
      eventTitle(tx, args.event_id),
      userName(tx, ctx.userID),
    ])
    fireNotification('notifyMeetingCancelled', {
      senderId: ctx.userID, senderName: uName, eventId: args.event_id, eventTitle: eTitle,
    })
  }),
}
