import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const calendarSubscriptionQueries = {
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.calendar_subscription
        .where('user_id', userID)
        .related('target_group')
        .related('target_user')
  ),

  byUserAndGroup: defineQuery(
    z.object({ groupId: z.string() }),
    ({ ctx: { userID }, args: { groupId } }) =>
      zql.calendar_subscription
        .where('user_id', userID)
        .where('target_group_id', groupId)
  ),

  byUserAndUser: defineQuery(
    z.object({ targetUserId: z.string() }),
    ({ ctx: { userID }, args: { targetUserId } }) =>
      zql.calendar_subscription
        .where('user_id', userID)
        .where('target_user_id', targetUserId)
  ),
}
