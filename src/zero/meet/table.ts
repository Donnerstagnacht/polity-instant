import { table, string, number, boolean } from '@rocicorp/zero'

export const meetingSlot = table('meeting_slot')
  .columns({
    id: string(),
    event_id: string(),
    user_id: string(),
    title: string().optional(),
    description: string().optional(),
    start_time: number().optional(),
    end_time: number().optional(),
    duration: number().optional(),
    is_available: boolean(),
    max_bookings: number(),
    booking_count: number(),
    meeting_type: string().optional(),
    video_call_url: string().optional(),
    location: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const meetingBooking = table('meeting_booking')
  .columns({
    id: string(),
    slot_id: string(),
    user_id: string(),
    status: string().optional(),
    message: string().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')
