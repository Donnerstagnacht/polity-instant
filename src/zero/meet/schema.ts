import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ============================================
// Meeting Slot Schemas
// ============================================

const meetingSlotBaseSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  user_id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  start_time: nullableTimestampSchema,
  end_time: nullableTimestampSchema,
  duration: z.number().nullable(),
  is_available: z.boolean(),
  max_bookings: z.number(),
  booking_count: z.number(),
  meeting_type: z.string().nullable(),
  video_call_url: z.string().nullable(),
  location: z.string().nullable(),
  created_at: timestampSchema,
})

export const meetingSlotSelectSchema = meetingSlotBaseSchema

export const createMeetingSlotSchema = meetingSlotBaseSchema
  .omit({ id: true, created_at: true, user_id: true, booking_count: true })
  .extend({ id: z.string(), start_time: z.number(), end_time: z.number() })

export const updateMeetingSlotSchema = z.object({
  id: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  start_time: z.number().optional(),
  end_time: z.number().optional(),
  duration: z.number().optional(),
  is_available: z.boolean().optional(),
  max_bookings: z.number().optional(),
  booking_count: z.number().optional(),
  meeting_type: z.string().optional(),
  video_call_url: z.string().optional(),
  location: z.string().optional(),
})

export const deleteMeetingSlotSchema = z.object({ id: z.string() })

// ============================================
// Meeting Booking Schemas
// ============================================

const meetingBookingBaseSchema = z.object({
  id: z.string(),
  slot_id: z.string(),
  user_id: z.string(),
  status: z.string().nullable(),
  message: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const meetingBookingSelectSchema = meetingBookingBaseSchema

export const createMeetingBookingSchema = meetingBookingBaseSchema
  .omit({ id: true, created_at: true, updated_at: true, user_id: true })
  .extend({ id: z.string() })

export const deleteMeetingBookingSchema = z.object({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type MeetingSlot = z.infer<typeof meetingSlotSelectSchema>
export type MeetingBooking = z.infer<typeof meetingBookingSelectSchema>
