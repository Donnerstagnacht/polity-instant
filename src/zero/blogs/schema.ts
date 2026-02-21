import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema, jsonSchema } from '../shared/helpers'

// ============================================
// Blog Zod Schemas
// ============================================

const baseBlogSchema = z.object({
  id: z.string(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  content: jsonSchema.nullable(),
  date: z.string().nullable(),
  image_url: z.string().nullable(),
  is_public: z.boolean().nullable(),
  visibility: z.string(),
  like_count: z.number(),
  comment_count: z.number(),
  upvotes: z.number(),
  downvotes: z.number(),
  editing_mode: z.string().nullable(),
  discussions: jsonSchema.nullable(),
  group_id: z.string().nullable(),
  updated_at: timestampSchema,
  created_at: timestampSchema,
})

export const selectBlogSchema = baseBlogSchema

export const createBlogSchema = baseBlogSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })

export const updateBlogSchema = baseBlogSchema
  .pick({
    title: true,
    description: true,
    content: true,
    image_url: true,
    is_public: true,
    visibility: true,
    editing_mode: true,
    discussions: true,
    upvotes: true,
    downvotes: true,
  })
  .partial()
  .extend({ id: z.string() })

export const deleteBlogSchema = z.object({ id: z.string() })

// ============================================
// BlogBlogger Zod Schemas
// ============================================

const baseBlogBloggerSchema = z.object({
  id: z.string(),
  blog_id: z.string(),
  user_id: z.string(),
  role_id: z.string().nullable(),
  status: z.string().nullable(),
  visibility: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectBlogBloggerSchema = baseBlogBloggerSchema

export const createBlogBloggerSchema = baseBlogBloggerSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const updateBlogBloggerSchema = baseBlogBloggerSchema
  .pick({ role_id: true, status: true, visibility: true })
  .partial()
  .extend({ id: z.string() })

export const deleteBlogBloggerSchema = z.object({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type Blog = z.infer<typeof selectBlogSchema>
export type BlogBlogger = z.infer<typeof selectBlogBloggerSchema>
