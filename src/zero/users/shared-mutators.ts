import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import {
  userUpdateSchema,
} from './schema'
import {
  followCreateSchema,
  followDeleteSchema,
} from '../network/schema'

/** Shared mutators — run on both client and server. Server mutators may override these. */
export const userSharedMutators = {
  updateProfile: defineMutator(userUpdateSchema, async ({ tx, ctx: { userID }, args }) => {
    if (userID === 'anon') {
      throw new Error('Authentication required to update profile')
    }
    await tx.mutate.user.update({ ...args, id: userID, updated_at: Date.now() })
  }),

  follow: defineMutator(followCreateSchema, async ({ tx, ctx: { userID }, args }) => {
    const now = Date.now()
    await tx.mutate.follow.insert({
      ...args,
      follower_id: userID,
      created_at: now,
    })
  }),

  unfollow: defineMutator(followDeleteSchema, async ({ tx, args }) => {
    await tx.mutate.follow.delete({ id: args.id })
  }),
}
