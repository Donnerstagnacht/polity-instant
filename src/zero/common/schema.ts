import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema, jsonSchema } from '../shared/helpers'

// ============================================
// Hashtag Zod Schemas
// ============================================

const baseHashtagSchema = z.object({
  id: z.string(),
  tag: z.string(),
  created_at: timestampSchema,
})

export const selectHashtagSchema = baseHashtagSchema

export const createHashtagSchema = z.object({
  id: z.string(),
  tag: z.string(),
})

export const deleteHashtagSchema = z.object({ id: z.string() })

// ============================================
// Junction Table Zod Schemas
// ============================================

export const createUserHashtagSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  hashtag_id: z.string(),
})

export const createGroupHashtagSchema = z.object({
  id: z.string(),
  group_id: z.string(),
  hashtag_id: z.string(),
})

export const createAmendmentHashtagSchema = z.object({
  id: z.string(),
  amendment_id: z.string(),
  hashtag_id: z.string(),
})

export const createEventHashtagSchema = z.object({
  id: z.string(),
  event_id: z.string(),
  hashtag_id: z.string(),
})

export const createBlogHashtagSchema = z.object({
  id: z.string(),
  blog_id: z.string(),
  hashtag_id: z.string(),
})

export const createStatementHashtagSchema = z.object({
  id: z.string(),
  statement_id: z.string(),
  hashtag_id: z.string(),
})

export const deleteJunctionHashtagSchema = z.object({ id: z.string() })

// ============================================
// Link Zod Schemas
// ============================================

const baseLinkSchema = z.object({
  id: z.string(),
  label: z.string().nullable(),
  url: z.string().nullable(),
  user_id: z.string().nullable(),
  group_id: z.string().nullable(),
  meeting_slot_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectLinkSchema = baseLinkSchema

export const createLinkSchema = baseLinkSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const deleteLinkSchema = z.object({ id: z.string() })

// ============================================
// TimelineEvent Zod Schemas
// ============================================

const baseTimelineEventSchema = z.object({
  id: z.string(),
  event_type: z.string().nullable(),
  entity_type: z.string().nullable(),
  entity_id: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  metadata: jsonSchema.nullable(),
  image_url: z.string().nullable(),
  video_url: z.string().nullable(),
  video_thumbnail_url: z.string().nullable(),
  content_type: z.string().nullable(),
  tags: jsonSchema.nullable(),
  stats: jsonSchema.nullable(),
  vote_status: z.string().nullable(),
  election_status: z.string().nullable(),
  ends_at: nullableTimestampSchema,
  user_id: z.string().nullable(),
  group_id: z.string().nullable(),
  amendment_id: z.string().nullable(),
  event_id: z.string().nullable(),
  todo_id: z.string().nullable(),
  blog_id: z.string().nullable(),
  statement_id: z.string().nullable(),
  actor_id: z.string().nullable(),
  election_id: z.string().nullable(),
  amendment_vote_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectTimelineEventSchema = baseTimelineEventSchema

export const createTimelineEventSchema = baseTimelineEventSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Reaction Zod Schemas
// ============================================

const baseReactionSchema = z.object({
  id: z.string(),
  entity_id: z.string().nullable(),
  entity_type: z.string().nullable(),
  reaction_type: z.string().nullable(),
  user_id: z.string(),
  timeline_event_id: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectReactionSchema = baseReactionSchema

export const createReactionSchema = baseReactionSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

export const deleteReactionSchema = z.object({ id: z.string() })

// ============================================
// Inferred Types
// ============================================

export type Hashtag = z.infer<typeof selectHashtagSchema>
export type UserHashtag = z.infer<typeof createUserHashtagSchema>
export type GroupHashtag = z.infer<typeof createGroupHashtagSchema>
export type AmendmentHashtag = z.infer<typeof createAmendmentHashtagSchema>
export type EventHashtag = z.infer<typeof createEventHashtagSchema>
export type BlogHashtag = z.infer<typeof createBlogHashtagSchema>
export type StatementHashtag = z.infer<typeof createStatementHashtagSchema>
export type Link = z.infer<typeof selectLinkSchema>
export type TimelineEvent = z.infer<typeof selectTimelineEventSchema>
export type Reaction = z.infer<typeof selectReactionSchema>
