import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema } from '../shared/helpers'

// ── group ─────────────────────────────────────────────────────────────
const groupBaseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  location: z.string().nullable(),
  is_public: z.boolean(),
  member_count: z.number(),
  x: z.string().nullable(),
  youtube: z.string().nullable(),
  linkedin: z.string().nullable(),
  website: z.string().nullable(),
  visibility: z.string(),
  owner_id: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const groupSelectSchema = groupBaseSchema
export const groupCreateSchema = groupBaseSchema
  .omit({ id: true, created_at: true, updated_at: true, member_count: true })
  .extend({ id: z.string() })
export const groupUpdateSchema = groupBaseSchema
  .pick({
    name: true,
    description: true,
    location: true,
    is_public: true,
    x: true,
    youtube: true,
    linkedin: true,
    website: true,
    visibility: true,
  })
  .partial()
  .extend({ id: z.string() })
export const groupDeleteSchema = z.object({ id: z.string() })
export type Group = z.infer<typeof groupSelectSchema>

// ── group_membership ──────────────────────────────────────────────────
const groupMembershipBaseSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  user_id: z.string(),
  status: z.string().nullable(),
  visibility: z.string(),
  role_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const groupMembershipSelectSchema = groupMembershipBaseSchema
export const groupMembershipCreateSchema = groupMembershipBaseSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string(), user_id: z.string().optional() })
export const groupMembershipUpdateSchema = groupMembershipBaseSchema
  .pick({ status: true, visibility: true, role_id: true })
  .partial()
  .extend({ id: z.string() })
export const groupMembershipDeleteSchema = z.object({ id: z.string() })
export type GroupMembership = z.infer<typeof groupMembershipSelectSchema>

// ── role ──────────────────────────────────────────────────────────────
const roleBaseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  scope: z.string().nullable(),
  group_id: z.string().nullable(),
  event_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  blog_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const roleSelectSchema = roleBaseSchema
export const roleCreateSchema = roleBaseSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })
export const roleDeleteSchema = z.object({ id: z.string() })
export type Role = z.infer<typeof roleSelectSchema>

// ── action_right ──────────────────────────────────────────────────────
const actionRightBaseSchema = z.object({
  id: z.string(),
  resource: z.string().nullable(),
  action: z.string().nullable(),
  role_id: z.string(),
  group_id: z.string().nullable(),
  event_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  blog_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const actionRightSelectSchema = actionRightBaseSchema
export const actionRightCreateSchema = actionRightBaseSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })
export const actionRightDeleteSchema = z.object({ id: z.string() })
export type ActionRight = z.infer<typeof actionRightSelectSchema>
