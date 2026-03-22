import { defineMutator } from '@rocicorp/zero'
import { createAccreditationSchema, deleteAccreditationSchema } from './schema'

export const accreditationSharedMutators = {
  // Confirm accreditation (server verifies voting password)
  confirmAccreditation: defineMutator(
    createAccreditationSchema,
    async ({ tx, ctx: { userID }, args }) => {
      const now = Date.now()
      await tx.mutate.accreditation.insert({
        id: crypto.randomUUID(),
        event_id: args.event_id,
        agenda_item_id: args.agenda_item_id,
        user_id: userID,
        confirmed_at: now,
        created_at: now,
      })
    }
  ),

  deleteAccreditation: defineMutator(
    deleteAccreditationSchema,
    async ({ tx, args }) => {
      await tx.mutate.accreditation.delete({ id: args.id })
    }
  ),
}
