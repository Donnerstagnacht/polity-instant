import { defineMutator } from '@rocicorp/zero'
import { setVotingPasswordSchema, verifyVotingPasswordSchema } from './schema'
import { zql } from '../schema'

export const votingPasswordSharedMutators = {
  // Set/update voting password (server will hash the plain PIN)
  setVotingPassword: defineMutator(
    setVotingPasswordSchema,
    async ({ tx, ctx: { userID }, args }) => {
      // On client-side we store a placeholder — the server-mutator
      // will hash it properly
      const now = Date.now()
      const existing = await tx.run(
        zql.voting_password.where('user_id', userID).one()
      )

      if (existing) {
        await tx.mutate.voting_password.update({
          id: existing.id,
          password_hash: '***', // placeholder; server replaces
          updated_at: now,
        })
      } else {
        await tx.mutate.voting_password.insert({
          id: crypto.randomUUID(),
          user_id: userID,
          password_hash: '***', // placeholder; server replaces
          created_at: now,
          updated_at: now,
        })
      }
    }
  ),

  // Client-side no-op for verifyVotingPassword — server does the real check
  verifyVotingPassword: defineMutator(
    verifyVotingPasswordSchema,
    async () => {
      // No-op on client; server replaces with actual verification
    }
  ),
}
