import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema, jsonSchema, jsonStringArraySchema } from '../shared/helpers'

// ============================================
// Amendment Zod Schemas
// ============================================

const baseAmendmentSchema = z.object({
  id: z.string(),
  code: z.string().nullable(),
  title: z.string().nullable(),
  status: z.string().nullable(),
  workflow_status: z.string().nullable(),
  reason: z.string().nullable(),
  category: z.string().nullable(),
  preamble: z.string().nullable(),
  created_by_id: z.string(),
  group_id: z.string().nullable(),
  event_id: z.string().nullable(),
  clone_source_id: z.string().nullable(),
  document_id: z.string().nullable(),
  supporters: z.number(),
  supporters_required: z.number().nullable(),
  supporters_percentage: z.number().nullable(),
  upvotes: z.number(),
  downvotes: z.number(),
  tags: jsonStringArraySchema.nullable(),
  visibility: z.string(),
  is_public: z.boolean(),
  subscriber_count: z.number(),
  clone_count: z.number(),
  change_request_count: z.number(),
  editing_mode: z.string().nullable(),
  discussions: jsonSchema.nullable(),
  comment_count: z.number(),
  collaborator_count: z.number(),
  image_url: z.string().nullable(),
  x: z.string().nullable(),
  youtube: z.string().nullable(),
  linkedin: z.string().nullable(),
  website: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectAmendmentSchema = baseAmendmentSchema

export const createAmendmentSchema = baseAmendmentSchema
  .omit({ id: true, created_at: true, updated_at: true, created_by_id: true, supporters: true, supporters_required: true, supporters_percentage: true, upvotes: true, downvotes: true, subscriber_count: true, clone_count: true, change_request_count: true, comment_count: true, collaborator_count: true })
  .extend({ id: z.string() })

export const updateAmendmentSchema = baseAmendmentSchema
  .pick({
    title: true,
    status: true,
    workflow_status: true,
    reason: true,
    category: true,
    preamble: true,
    visibility: true,
    is_public: true,
    editing_mode: true,
    tags: true,
    event_id: true,
    group_id: true,
    x: true,
    youtube: true,
    linkedin: true,
    website: true,
    upvotes: true,
    downvotes: true,
    discussions: true,
    code: true,
    clone_source_id: true,
    document_id: true,
    image_url: true,
    supporters: true,
    supporters_required: true,
    supporters_percentage: true,
  })
  .partial()
  .extend({ id: z.string() })

export const deleteAmendmentSchema = z.object({ id: z.string() })

// ============================================
// Amendment Collaborator Schemas
// ============================================

const baseAmendmentCollaboratorSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  user_id: z.string(),
  role_id: z.string().nullable(),
  status: z.string().nullable(),
  visibility: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectAmendmentCollaboratorSchema = baseAmendmentCollaboratorSchema

export const createAmendmentCollaboratorSchema = baseAmendmentCollaboratorSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateAmendmentCollaboratorSchema = baseAmendmentCollaboratorSchema
  .pick({ role_id: true, status: true, visibility: true })
  .partial()
  .extend({ id: z.string() })

export const deleteAmendmentCollaboratorSchema = z.object({ id: z.string() })

// ============================================
// Amendment Path Schemas
// ============================================

const baseAmendmentPathSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  title: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectAmendmentPathSchema = baseAmendmentPathSchema

export const createAmendmentPathSchema = baseAmendmentPathSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const deleteAmendmentPathSchema = z.object({ id: z.string() })

// ============================================
// Amendment Path Segment Schemas
// ============================================

const baseAmendmentPathSegmentSchema = z.object({
  id: z.string(),
  path_id: z.string(),
  group_id: z.string().nullable(),
  event_id: z.string().nullable(),
  order_index: z.number().nullable(),
  status: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectAmendmentPathSegmentSchema = baseAmendmentPathSegmentSchema

export const createAmendmentPathSegmentSchema = baseAmendmentPathSegmentSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const deleteAmendmentPathSegmentSchema = z.object({ id: z.string() })

// ============================================
// Support Confirmation Schemas
// ============================================

const baseSupportConfirmationSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  group_id: z.string().nullable(),
  event_id: z.string().nullable(),
  confirmed_by_id: z.string(),
  status: z.string().nullable(),
  confirmed_at: nullableTimestampSchema,
  created_at: timestampSchema,
})

export const selectSupportConfirmationSchema = baseSupportConfirmationSchema

export const createSupportConfirmationSchema = baseSupportConfirmationSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateSupportConfirmationSchema = baseSupportConfirmationSchema
  .pick({ status: true, confirmed_at: true, confirmed_by_id: true })
  .partial()
  .extend({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type Amendment = z.infer<typeof selectAmendmentSchema>
export type AmendmentCollaborator = z.infer<typeof selectAmendmentCollaboratorSchema>
export type AmendmentPath = z.infer<typeof selectAmendmentPathSchema>
export type AmendmentPathSegment = z.infer<typeof selectAmendmentPathSegmentSchema>
export type SupportConfirmation = z.infer<typeof selectSupportConfirmationSchema>
