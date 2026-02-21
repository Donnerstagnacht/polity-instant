import { z } from 'zod'
import { timestampSchema, nullableTimestampSchema, jsonSchema } from '../shared/helpers'

// ============================================
// Document Zod Schemas
// ============================================

const baseDocumentSchema = z.object({
  id: z.string(),
  amendment_id: z.string().nullable(),
  content: jsonSchema.nullable(),
  editing_mode: z.string().nullable(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectDocumentSchema = baseDocumentSchema

export const createDocumentSchema = baseDocumentSchema
  .omit({ id: true, created_at: true, updated_at: true })
  .extend({ id: z.string() })

export const updateDocumentSchema = baseDocumentSchema
  .pick({ content: true, editing_mode: true })
  .partial()
  .extend({ id: z.string() })

export const deleteDocumentSchema = z.object({ id: z.string() })

// ============================================
// Document Version Schemas
// ============================================

const baseDocumentVersionSchema = z.object({
  id: z.string(),
  document_id: z.string(),
  amendment_id: z.string().nullable(),
  blog_id: z.string().nullable(),
  content: jsonSchema.nullable(),
  version_number: z.number().nullable(),
  change_summary: z.string().nullable(),
  author_id: z.string(),
  created_at: timestampSchema,
})

export const selectDocumentVersionSchema = baseDocumentVersionSchema

export const createDocumentVersionSchema = baseDocumentVersionSchema
  .omit({ id: true, created_at: true, author_id: true })
  .extend({ id: z.string() })

export const updateDocumentVersionSchema = baseDocumentVersionSchema
  .pick({ content: true, change_summary: true, version_number: true })
  .partial()
  .extend({ id: z.string() })

export const deleteDocumentVersionSchema = z.object({ id: z.string() })

// ============================================
// Document Collaborator Schemas
// ============================================

const baseDocumentCollaboratorSchema = z.object({
  id: z.string(),
  document_id: z.string(),
  user_id: z.string(),
  role_id: z.string().nullable(),
  status: z.string().nullable(),
  visibility: z.string().nullable(),
  created_at: timestampSchema,
})

export const selectDocumentCollaboratorSchema = baseDocumentCollaboratorSchema

export const createDocumentCollaboratorSchema = baseDocumentCollaboratorSchema
  .omit({ id: true, created_at: true })
  .extend({ id: z.string() })

// ============================================
// Document Cursor Schemas
// ============================================

const baseDocumentCursorSchema = z.object({
  id: z.string(),
  document_id: z.string(),
  user_id: z.string(),
  position: jsonSchema.nullable(),
  selection: jsonSchema.nullable(),
  color: z.string().nullable(),
  updated_at: timestampSchema,
})

export const selectDocumentCursorSchema = baseDocumentCursorSchema

// ============================================
// Inferred Types
// ============================================

export type Document = z.infer<typeof selectDocumentSchema>
export type DocumentVersion = z.infer<typeof selectDocumentVersionSchema>
export type DocumentCollaborator = z.infer<typeof selectDocumentCollaboratorSchema>
export type DocumentCursor = z.infer<typeof selectDocumentCursorSchema>
