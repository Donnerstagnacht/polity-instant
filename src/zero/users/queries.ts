import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const userQueries = {
  current: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) => zql.user.where('id', userID).one()
  ),

  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) => zql.user.where('id', id).one()
  ),

  byHandle: defineQuery(
    z.object({ handle: z.string() }),
    ({ args: { handle } }) => zql.user.where('handle', handle).one()
  ),

  search: defineQuery(
    z.object({ query: z.string() }),
    ({ args: { query } }) =>
      zql.user
        .where('handle', 'ILIKE', `%${query}%`)
        .orderBy('handle', 'asc')
  ),

  publicUsers: defineQuery(
    z.object({}),
    () => zql.user.where('visibility', 'public')
  ),

  followers: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.follow
        .where('followee_id', userId)
        .orderBy('created_at', 'desc')
  ),

  following: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.follow
        .where('follower_id', userId)
        .orderBy('created_at', 'desc')
  ),

  fullProfile: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.user
        .where('id', id)
        .related('stats')
        .related('statements')
        .related('group_memberships', q =>
          q.related('group', q =>
            q.related('events').related('amendments').related('hashtags')
          ).related('role')
        )
        .related('blogger_relations', q =>
          q.related('blog', q => q.related('hashtags'))
            .related('role', q => q.related('action_rights'))
        )
        .related('hashtags')
        .related('amendment_collaborations', q =>
          q.related('amendment', q => q.related('group').related('hashtags'))
        )
  ),

  allUsers: defineQuery(
    z.object({}),
    () => zql.user
  ),

  byIds: defineQuery(
    z.object({ ids: z.array(z.string()) }),
    ({ args: { ids } }) => zql.user.where('id', 'IN', ids)
  ),

  withGroupMemberships: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.user
        .where('id', id)
        .related('group_memberships', q => q.related('group'))
  ),

  searchableUsers: defineQuery(
    z.object({}),
    () =>
      zql.user
        .where('visibility', 'IN', ['public', 'authenticated'])
        .related('hashtags')
        .related('group_memberships')
        .related('amendment_collaborations')
  ),
}
