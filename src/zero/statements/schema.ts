import { z } from 'zod';
import { timestampSchema } from '../shared/helpers';

// ============================================
// Statement Zod Schemas
// ============================================

const baseStatementSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  tag: z.string().nullable(),
  text: z.string().nullable(),
  visibility: z.string(),
  created_at: timestampSchema,
});

export const selectStatementSchema = baseStatementSchema;

export const createStatementSchema = baseStatementSchema
  .omit({ id: true, created_at: true, user_id: true })
  .extend({ id: z.string() });

export const updateStatementSchema = baseStatementSchema
  .pick({ tag: true, text: true, visibility: true })
  .partial()
  .extend({ id: z.string() });

export const deleteStatementSchema = z.object({ id: z.string() });

// ============================================
// Inferred Types
// ============================================

export type Statement = z.infer<typeof selectStatementSchema>;
