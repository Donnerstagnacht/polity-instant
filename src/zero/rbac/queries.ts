import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const rbacQueries = {
  /** Group memberships for a user with role→action_rights and group */
  membershipPermissions: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.group_membership
        .where('user_id', userId)
        .related('role', q => q.related('action_rights'))
        .related('group')
  ),

  /** Event participations for a user with role→action_rights and event */
  participantPermissions: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.event_participant
        .where('user_id', userId)
        .related('role', q => q.related('action_rights'))
        .related('event')
  ),

  /** Blog blogger relations for a user with role→action_rights and blog */
  bloggerPermissions: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.blog_blogger
        .where('user_id', userId)
        .related('role', q => q.related('action_rights'))
        .related('blog')
  ),
}
