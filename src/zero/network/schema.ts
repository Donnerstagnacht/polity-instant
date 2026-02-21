import { z } from 'zod'
import { timestampSchema } from '../shared/helpers'

// ============================================
// Follow Schemas
// ============================================

const followBaseSchema = z.object({
  id: z.string(),
  follower_id: z.string(),
  followee_id: z.string(),
  created_at: timestampSchema,
})

export const followSelectSchema = followBaseSchema
export const followCreateSchema = followBaseSchema
  .omit({ id: true, created_at: true, follower_id: true })
  .extend({ id: z.string() })
export const followDeleteSchema = z.object({ id: z.string() })

// ============================================
// Group Relationship Schemas
// ============================================

const groupRelationshipBaseSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  related_group_id: z.string(),
  relationship_type: z.string().nullable(),
  with_right: z.string().nullable(),
  status: z.string().nullable(),
  initiator_group_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const groupRelationshipSelectSchema = groupRelationshipBaseSchema

export const createGroupRelationshipSchema = groupRelationshipBaseSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateGroupRelationshipSchema = groupRelationshipBaseSchema
  .pick({ relationship_type: true, with_right: true, status: true })
  .partial()
  .extend({ id: z.string() })

export const deleteGroupRelationshipSchema = z.object({ id: z.string() })

// ============================================
// Subscriber Schemas
// ============================================

const baseSubscriberSchema = z.object({
  id: z.string(),
  subscriber_id: z.string(),
  user_id: z.string().nullable(),
  group_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  event_id: z.string().nullable(),
  blog_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectSubscriberSchema = baseSubscriberSchema

export const createSubscriberSchema = baseSubscriberSchema
  .omit({ id: true, created_at: true, subscriber_id: true })
  .extend({ id: z.string() })

export const deleteSubscriberSchema = z.object({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type Follow = z.infer<typeof followSelectSchema>
export type GroupRelationship = z.infer<typeof groupRelationshipSelectSchema>
export type Subscriber = z.infer<typeof selectSubscriberSchema>
