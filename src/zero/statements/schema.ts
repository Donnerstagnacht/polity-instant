import { z } from 'zod';
import { timestampSchema } from '../shared/helpers';

// ============================================
// Statement Zod Schemas
// ============================================

const baseStatementSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  group_id: z.string().nullable(),
  text: z.string().nullable(),
  image_url: z.string().nullable(),
  video_url: z.string().nullable(),
  visibility: z.string(),
  upvotes: z.number(),
  downvotes: z.number(),
  comment_count: z.number(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
});

export const selectStatementSchema = baseStatementSchema;

export const createStatementSchema = baseStatementSchema
  .omit({ id: true, created_at: true, updated_at: true, user_id: true, upvotes: true, downvotes: true, comment_count: true })
  .extend({
    id: z.string(),
    text: z.string().max(280).nullable(),
  });

export const updateStatementSchema = z.object({
  id: z.string(),
  text: z.string().max(280).nullable().optional(),
  image_url: z.string().nullable().optional(),
  video_url: z.string().nullable().optional(),
  visibility: z.string().optional(),
  group_id: z.string().nullable().optional(),
  comment_count: z.number().optional(),
});

export const deleteStatementSchema = z.object({ id: z.string() });

// ============================================
// Statement Survey Zod Schemas
// ============================================

const baseSurveySchema = z.object({
  id: z.string(),
  statement_id: z.string(),
  question: z.string(),
  ends_at: timestampSchema,
  created_at: timestampSchema,
});

export const selectStatementSurveySchema = baseSurveySchema;

export const createStatementSurveySchema = baseSurveySchema
  .omit({ created_at: true })
  .extend({ ends_at: z.number() });

export const deleteStatementSurveySchema = z.object({ id: z.string() });

const baseSurveyOptionSchema = z.object({
  id: z.string(),
  survey_id: z.string(),
  label: z.string(),
  vote_count: z.number(),
  position: z.number(),
  created_at: timestampSchema,
});

export const selectStatementSurveyOptionSchema = baseSurveyOptionSchema;

export const createStatementSurveyOptionSchema = baseSurveyOptionSchema
  .omit({ created_at: true, vote_count: true });

export const deleteStatementSurveyOptionSchema = z.object({ id: z.string() });

const baseSurveyVoteSchema = z.object({
  id: z.string(),
  option_id: z.string(),
  user_id: z.string(),
  created_at: timestampSchema,
});

export const selectStatementSurveyVoteSchema = baseSurveyVoteSchema;

export const createStatementSurveyVoteSchema = baseSurveyVoteSchema
  .omit({ created_at: true, user_id: true });

export const deleteStatementSurveyVoteSchema = z.object({ id: z.string() });

// ============================================
// Inferred Types
// ============================================

export type Statement = z.infer<typeof selectStatementSchema>;
export type StatementSurvey = z.infer<typeof selectStatementSurveySchema>;
export type StatementSurveyOption = z.infer<typeof selectStatementSurveyOptionSchema>;
export type StatementSurveyVote = z.infer<typeof selectStatementSurveyVoteSchema>;
