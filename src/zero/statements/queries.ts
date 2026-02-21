import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const statementQueries = {
  // Statements by the current user
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.statement
        .where('user_id', userID)
        .orderBy('created_at', 'desc')
  ),

  // Single statement by ID with author
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.statement.where('id', id).related('user').one()
  ),

  // Statements filtered by visibility
  byVisibility: defineQuery(
    z.object({ visibility: z.string() }),
    ({ args: { visibility } }) =>
      zql.statement
        .where('visibility', visibility)
        .orderBy('created_at', 'desc')
  ),

  // Search statements by tag
  search: defineQuery(
    z.object({ tag: z.string() }),
    ({ args: { tag } }) =>
      zql.statement
        .where('tag', tag)
        .orderBy('created_at', 'desc')
  ),
}
