import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import { createAccreditationSchema } from './schema'
import { verifyPassword } from '../voting-password/server-mutators'

/**
 * Server-only mutators for accreditation.
 * Verifies the user's voting password before confirming accreditation.
 */
export const accreditationServerMutators = {
  confirmAccreditation: defineMutator(createAccreditationSchema, async ({ tx, ctx: { userID }, args }) => {
    // 1. Fetch user's voting password
    const votingPassword = await tx.run(
      zql.voting_password.where('user_id', userID).one()
    )
    if (!votingPassword) {
      throw new Error('No voting password set. Please set your voting PIN first.')
    }

    // 2. Verify password
    const isValid = await verifyPassword(args.password, votingPassword.password_hash)
    if (!isValid) {
      throw new Error('Invalid voting password.')
    }

    // 3. Check if already accredited
    const existing = await tx.run(
      zql.accreditation
        .where('event_id', args.event_id)
        .where('user_id', userID)
        .one()
    )
    if (existing) {
      throw new Error('Already accredited for this event.')
    }

    // 4. Create accreditation
    const now = Date.now()
    await tx.mutate.accreditation.insert({
      id: crypto.randomUUID(),
      event_id: args.event_id,
      agenda_item_id: args.agenda_item_id,
      user_id: userID,
      confirmed_at: now,
      created_at: now,
    })
  }),
}
