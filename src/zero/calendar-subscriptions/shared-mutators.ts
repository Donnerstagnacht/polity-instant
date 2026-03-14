import { defineMutator } from '@rocicorp/zero'
import {
  calendarSubscriptionCreateSchema,
  calendarSubscriptionUpdateSchema,
  calendarSubscriptionDeleteSchema,
} from './schema'

export const calendarSubscriptionSharedMutators = {
  subscribe: defineMutator(
    calendarSubscriptionCreateSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.calendar_subscription.insert({
        ...args,
        user_id: userID,
        created_at: now,
      })
    },
  ),

  update: defineMutator(
    calendarSubscriptionUpdateSchema,
    async ({ tx, args }) => {
      await tx.mutate.calendar_subscription.update(args)
    },
  ),

  unsubscribe: defineMutator(
    calendarSubscriptionDeleteSchema,
    async ({ tx, args }) => {
      await tx.mutate.calendar_subscription.delete({ id: args.id })
    },
  ),
}
