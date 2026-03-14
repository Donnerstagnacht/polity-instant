import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const documentQueries = {
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.document.where('id', id).one()
  ),

  versions: defineQuery(
    z.object({ document_id: z.string() }),
    ({ args: { document_id } }) =>
      zql.document_version
        .where('document_id', document_id)
        .related('author')
        .orderBy('version_number', 'desc')
  ),

  collaborators: defineQuery(
    z.object({ document_id: z.string() }),
    ({ args: { document_id } }) =>
      zql.document_collaborator
        .where('document_id', document_id)
        .related('user')
        .orderBy('created_at', 'desc')
  ),

  threads: defineQuery(
    z.object({ document_id: z.string() }),
    ({ args: { document_id } }) =>
      zql.thread
        .where('document_id', document_id)
        .orderBy('created_at', 'desc')
  ),

  comments: defineQuery(
    z.object({ thread_id: z.string() }),
    ({ args: { thread_id } }) =>
      zql.comment
        .where('thread_id', thread_id)
        .orderBy('created_at', 'asc')
  ),
}

// ── Query Row Types ─────────────────────────────────────────────────
export type DocumentVersionRow = QueryRowType<typeof documentQueries.versions>;
export type DocumentCollaboratorRow = QueryRowType<typeof documentQueries.collaborators>;
