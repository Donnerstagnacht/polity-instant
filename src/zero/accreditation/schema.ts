import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

const baseAccreditationSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  agenda_item_id: z.string(),
  user_id: z.string(),
  confirmed_at: nullableTimestampSchema,
  created_at: timestampSchema,
})

export const selectAccreditationSchema = baseAccreditationSchema

export const createAccreditationSchema = z.object({
  event_id: z.string(),
  agenda_item_id: z.string(),
  password: z.string().min(4).max(4),
})

export const deleteAccreditationSchema = z.object({ id: z.string() })

export type Accreditation = z.infer<typeof selectAccreditationSchema>
