import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema, jsonSchema } from '../shared/helpers'

// ============================================
// Thread Schemas
// ============================================

const baseThreadSchema = z.object({
  id: z.string(),
  document_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  statement_id: z.string().nullable(),
  blog_id: z.string().nullable(),
  user_id: z.string(),
  content: z.string().nullable(),
  status: z.string(),
  resolved_at: nullableTimestampSchema,
  upvotes: z.number(),
  downvotes: z.number(),
  position: jsonSchema.nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectThreadSchema = baseThreadSchema

export const createThreadSchema = baseThreadSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })

export const updateThreadSchema = baseThreadSchema
  .pick({ content: true, status: true, upvotes: true, downvotes: true })
  .partial()
  .extend({ id: z.string() })

// ============================================
// Comment Schemas
// ============================================

const baseCommentSchema = z.object({
  id: z.string(),
  thread_id: z.string(),
  user_id: z.string(),
  parent_id: z.string().nullable(),
  content: z.string().nullable(),
  upvotes: z.number(),
  downvotes: z.number(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectCommentSchema = baseCommentSchema

export const createCommentSchema = baseCommentSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })

export const updateCommentSchema = baseCommentSchema
  .pick({ content: true, upvotes: true, downvotes: true })
  .partial()
  .extend({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type Thread = z.infer<typeof selectThreadSchema>
export type Comment = z.infer<typeof selectCommentSchema>
