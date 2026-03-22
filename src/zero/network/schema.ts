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
// Group Workflow Schemas
// ============================================

const groupWorkflowBaseSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  status: z.string().nullable(),
  created_by_id: z.string(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const groupWorkflowSelectSchema = groupWorkflowBaseSchema

export const createGroupWorkflowSchema = groupWorkflowBaseSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })

export const updateGroupWorkflowSchema = groupWorkflowBaseSchema
  .pick({ name: true, description: true, status: true })
  .partial()
  .extend({ id: z.string() })

export const deleteGroupWorkflowSchema = z.object({ id: z.string() })

// ============================================
// Group Workflow Step Schemas
// ============================================

const groupWorkflowStepBaseSchema = z.object({
  id: z.string(),
  workflow_id: z.string(),
  group_id: z.string(),
  order_index: z.number(),
  label: z.string().nullable(),
  created_at: timestampSchema,
})

export const groupWorkflowStepSelectSchema = groupWorkflowStepBaseSchema

export const createGroupWorkflowStepSchema = groupWorkflowStepBaseSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateGroupWorkflowStepSchema = groupWorkflowStepBaseSchema
  .pick({ group_id: true, order_index: true, label: true })
  .partial()
  .extend({ id: z.string() })

export const deleteGroupWorkflowStepSchema = z.object({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type Follow = z.infer<typeof followSelectSchema>
export type GroupRelationship = z.infer<typeof groupRelationshipSelectSchema>
export type Subscriber = z.infer<typeof selectSubscriberSchema>
export type GroupWorkflow = z.infer<typeof groupWorkflowSelectSchema>
export type GroupWorkflowStep = z.infer<typeof groupWorkflowStepSelectSchema>
