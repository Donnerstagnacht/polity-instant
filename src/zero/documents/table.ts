import { table, string, number, json } from '@rocicorp/zero'

export const document = table('document')
  .columns({
    id: string(),
    amendment_id: string().optional(),
    content: json().optional(),
    editing_mode: string().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const documentVersion = table('document_version')
  .columns({
    id: string(),
    document_id: string(),
    amendment_id: string().optional(),
    blog_id: string().optional(),
    content: json().optional(),
    version_number: number().optional(),
    change_summary: string().optional(),
    author_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const documentCollaborator = table('document_collaborator')
  .columns({
    id: string(),
    document_id: string(),
    user_id: string(),
    role_id: string().optional(),
    status: string().optional(),
    visibility: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const documentCursor = table('document_cursor')
  .columns({
    id: string(),
    document_id: string(),
    user_id: string(),
    position: json().optional(),
    selection: json().optional(),
    color: string().optional(),
    updated_at: number(),
  })
  .primaryKey('id')


