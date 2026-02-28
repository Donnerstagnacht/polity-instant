import { table, string, number, json } from '@rocicorp/zero'

export const thread = table('thread')
  .columns({
    id: string(),
    document_id: string().optional(),
    amendment_id: string().optional(),
    statement_id: string().optional(),
    user_id: string(),
    content: string().optional(),
    status: string(),
    resolved_at: number().optional(),
    upvotes: number(),
    downvotes: number(),
    position: json().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const comment = table('comment')
  .columns({
    id: string(),
    thread_id: string(),
    user_id: string(),
    parent_id: string().optional(),
    content: string().optional(),
    upvotes: number(),
    downvotes: number(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')
