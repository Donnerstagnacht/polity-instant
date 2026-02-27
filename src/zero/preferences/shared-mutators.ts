import { defineMutator } from '@rocicorp/zero'
import { createUserPreferenceSchema, updateUserPreferenceSchema } from './schema'

export const preferenceSharedMutators = {
  create: defineMutator(
    createUserPreferenceSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.user_preference.insert({
        ...args,
        user_id: userID,
        created_at: now,
        updated_at: now,
      })
    }
  ),

  update: defineMutator(
    updateUserPreferenceSchema,
    async ({ tx, args }) => {
      const { id, ...fields } = args
      await tx.mutate.user_preference.update({
        id,
        ...fields,
        updated_at: Date.now(),
      })
    }
  ),
}
