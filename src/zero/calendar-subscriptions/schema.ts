import { z } from 'zod'
import { timestampSchema } from '../shared/helpers'

const calendarSubscriptionBaseSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  target_type: z.string(),
  target_group_id: z.string().nullable(),
  target_user_id: z.string().nullable(),
  is_visible: z.boolean(),
  color: z.string().nullable(),
  created_at: timestampSchema,
})

export const calendarSubscriptionSelectSchema = calendarSubscriptionBaseSchema
export const calendarSubscriptionCreateSchema = calendarSubscriptionBaseSchema
  .omit({ created_at: true, user_id: true })
  .extend({ id: z.string() })
export const calendarSubscriptionDeleteSchema = z.object({ id: z.string() })
export const calendarSubscriptionUpdateSchema = z.object({
  id: z.string(),
  is_visible: z.boolean().optional(),
  color: z.string().nullable().optional(),
})
export type CalendarSubscription = z.infer<typeof calendarSubscriptionSelectSchema>
