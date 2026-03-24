import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ── user ──────────────────────────────────────────────────────────────
const userBaseSchema = z.object({
  id: z.string(),
  email: z.string().nullable(),
  handle: z.string().nullable(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  bio: z.string().nullable(),
  about: z.string().nullable(),
  avatar: z.string().nullable(),
  x: z.string().nullable(),
  youtube: z.string().nullable(),
  linkedin: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  visibility: z.string(),
  subscriber_count: z.number(),
  amendment_count: z.number(),
  group_count: z.number(),
  tutorial_step: z.number().nullable(),
  assistant_introduction: z.boolean().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const userSelectSchema = userBaseSchema
export const userCreateSchema = userBaseSchema
  .omit({ id: true, created_at: true, updated_at: true, subscriber_count: true, amendment_count: true, group_count: true })
  .extend({ id: z.string() })
export const userUpdateSchema = userBaseSchema
  .pick({
    first_name: true,
    last_name: true,
    bio: true,
    about: true,
    avatar: true,
    handle: true,
    x: true,
    youtube: true,
    linkedin: true,
    website: true,
    location: true,
    visibility: true,
    tutorial_step: true,
    assistant_introduction: true,
  })
  .partial()
  .extend({ id: z.string().optional() })
export const userDeleteSchema = z.object({ id: z.string() })
export type User = z.infer<typeof userSelectSchema>

// ── file ──────────────────────────────────────────────────────────────
const fileBaseSchema = z.object({
  id: z.string(),
  path: z.string().nullable(),
  url: z.string().nullable(),
  created_at: timestampSchema,
})

export const fileSelectSchema = fileBaseSchema
export type File = z.infer<typeof fileSelectSchema>
