import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const statementQueries = {
  // Statements by the current user
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.statement
        .where('user_id', userID)
        .related('user')
        .related('statement_hashtags', q => q.related('hashtag'))
        .related('support_votes')
        .related('surveys', q => q.related('options'))
        .orderBy('created_at', 'desc')
  ),

  // Statements belonging to a group
  byGroup: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.statement
        .where('group_id', group_id)
        .related('user')
        .related('statement_hashtags', q => q.related('hashtag'))
        .related('support_votes')
        .orderBy('created_at', 'desc')
  ),

  // Single statement by ID
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.statement.where('id', id).related('user').one()
  ),

  // Statement with full detail relations
  byIdWithDetails: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.statement
        .where('id', id)
        .related('user')
        .related('group')
        .related('statement_hashtags', q => q.related('hashtag'))
        .related('support_votes', q => q.related('user'))
        .related('surveys', q => q.related('options', q2 => q2.related('votes')))
        .related('threads', q =>
          q
            .related('user')
            .related('comments', q2 =>
              q2
                .related('user')
                .related('votes', q3 => q3.related('user'))
                .related('replies', q3 =>
                  q3
                    .related('user')
                    .related('votes', q4 => q4.related('user'))
                    .related('replies', q4 =>
                      q4
                        .related('user')
                        .related('votes', q5 => q5.related('user'))
                    )
                )
            )
            .related('votes', q2 => q2.related('user'))
        )
        .related('timeline_events')
        .one()
  ),

  // Statement with hashtags
  byIdWithHashtags: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.statement
        .where('id', id)
        .related('statement_hashtags', q => q.related('hashtag'))
        .one()
  ),

  // Statements by an arbitrary user ID
  byUserId: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.statement
        .where('user_id', user_id)
        .related('user')
        .related('statement_hashtags', q => q.related('hashtag'))
        .related('support_votes')
        .orderBy('created_at', 'desc')
  ),

  // Statements filtered by visibility
  byVisibility: defineQuery(
    z.object({ visibility: z.string() }),
    ({ args: { visibility } }) =>
      zql.statement
        .where('visibility', visibility)
        .related('user')
        .related('statement_hashtags', q => q.related('hashtag'))
        .related('support_votes')
        .orderBy('created_at', 'desc')
  ),
}

export type StatementByIdWithDetailsRow = QueryRowType<typeof statementQueries.byIdWithDetails>
export type StatementByGroupRow = QueryRowType<typeof statementQueries.byGroup>
export type StatementByUserRow = QueryRowType<typeof statementQueries.byUser>
