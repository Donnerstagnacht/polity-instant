import { defineMutator } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'
import {
  eventCreateSchema,
  eventUpdateSchema,
  eventCancelSchema,
  eventParticipantCreateSchema,
  eventParticipantUpdateSchema,
  eventParticipantDeleteSchema,
} from './schema'
import {
  eventVoteCreateSchema,
  eventVotingSessionCreateSchema,
  eventVotingSessionUpdateSchema,
} from '../votes/schema'
import {
  createEventPositionSchema,
  updateEventPositionSchema,
  deleteEventPositionSchema,
} from '../positions/schema'
import {
  createMeetingSlotSchema,
  updateMeetingSlotSchema,
  deleteMeetingSlotSchema,
  createMeetingBookingSchema,
  deleteMeetingBookingSchema,
} from '../meet/schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const eventSharedMutators = {
  create: defineMutator(eventCreateSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now()
    await tx.mutate.event.insert({
      ...args,
      creator_id: userID,
      participant_count: 0,
      delegate_count: 0,
      cancel_reason: '',
      cancelled_at: 0,
      cancelled_by_id: null,
      created_at: now,
      updated_at: now,
    } as Parameters<typeof tx.mutate.event.insert>[0])
  }),

  update: defineMutator(eventUpdateSchema, async ({ tx, args }) => {
    await tx.mutate.event.update({ ...args, updated_at: Date.now() })
  }),

  cancel: defineMutator(eventCancelSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now()
    await tx.mutate.event.update({
      id: args.id,
      status: 'cancelled',
      cancel_reason: args.cancel_reason,
      cancelled_at: now,
      cancelled_by_id: userID,
      updated_at: now,
    })
  }),

  joinEvent: defineMutator(eventParticipantCreateSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now()
    await tx.mutate.event_participant.insert({
      ...args,
      user_id: userID,
      created_at: now,
    })
  }),

  // Invite another user as participant (keeps provided user_id instead of ctx.userID)
  inviteParticipant: defineMutator(eventParticipantCreateSchema, async ({ tx, args }) => {
    const now = Date.now()
    await tx.mutate.event_participant.insert({
      ...args,
      user_id: args.user_id!,
      created_at: now,
    })
  }),

  leaveEvent: defineMutator(eventParticipantDeleteSchema, async ({ tx, args }) => {
    await tx.mutate.event_participant.delete({ id: args.id })
  }),

  finalizeAgendaItem: defineMutator(
    z.object({ id: z.string(), status: z.string(), end_time: z.number().optional() }),
    async ({ tx, args }) => {
      const update: Record<string, unknown> = {
        id: args.id,
        status: args.status,
      }
      if (args.end_time !== undefined) update.end_time = args.end_time
      await tx.mutate.event_voting_session.update(update as any)
    }
  ),

  castVote: defineMutator(eventVoteCreateSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now()
    await tx.mutate.event_vote.insert({
      ...args,
      user_id: userID,
      created_at: now,
    })
  }),

  startVotingSession: defineMutator(eventVotingSessionCreateSchema, async ({ tx, args }) => {
    const now = Date.now()
    await tx.mutate.event_voting_session.insert({
      ...args,
      status: 'active',
      start_time: now,
      end_time: 0,
      created_at: now,
    })
  }),

  endVotingSession: defineMutator(
    z.object({ id: z.string() }),
    async ({ tx, args }) => {
      await tx.mutate.event_voting_session.update({
        id: args.id,
        status: 'closed',
        end_time: Date.now(),
      })
    }
  ),

  finalizeDelegates: defineMutator(
    z.object({ eventId: z.string() }),
    async ({ tx, args }) => {
      await tx.mutate.event.update({
        id: args.eventId,
        delegate_distribution_status: 'finalized',
        delegate_finalized_at: Date.now(),
        updated_at: Date.now(),
      })
    }
  ),

  // Event Participant update
  updateParticipant: defineMutator(
    eventParticipantUpdateSchema,
    async ({ tx, args }) => {
      await tx.mutate.event_participant.update(args)
    }
  ),

  // Event Position mutators
  createPosition: defineMutator(
    createEventPositionSchema,
    async ({ tx, args }) => {
      const now = Date.now()
      await tx.mutate.event_position.insert({
        ...args,
        created_at: now,
      })
    }
  ),

  updatePosition: defineMutator(
    updateEventPositionSchema,
    async ({ tx, args }) => {
      await tx.mutate.event_position.update(args)
    }
  ),

  deletePosition: defineMutator(
    deleteEventPositionSchema,
    async ({ tx, args }) => {
      await tx.mutate.event_position.delete({ id: args.id })
    }
  ),

  // Meeting Slot mutators
  createMeetingSlot: defineMutator(
    createMeetingSlotSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.meeting_slot.insert({
        ...args,
        user_id: userID,
        booking_count: 0,
        created_at: now,
      })
    }
  ),

  updateMeetingSlot: defineMutator(
    updateMeetingSlotSchema,
    async ({ tx, args }) => {
      await tx.mutate.meeting_slot.update(args)
    }
  ),

  deleteMeetingSlot: defineMutator(
    deleteMeetingSlotSchema,
    async ({ tx, args }) => {
      await tx.mutate.meeting_slot.delete({ id: args.id })
    }
  ),

  // Meeting Booking mutators
  createMeetingBooking: defineMutator(
    createMeetingBookingSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.meeting_booking.insert({
        ...args,
        user_id: userID,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  deleteMeetingBooking: defineMutator(
    deleteMeetingBookingSchema,
    async ({ tx, args }) => {
      await tx.mutate.meeting_booking.delete({ id: args.id })
    }
  ),
}
