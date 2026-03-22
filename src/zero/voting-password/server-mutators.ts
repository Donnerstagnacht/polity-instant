import { defineMutator } from '@rocicorp/zero'
import { zql } from '../schema'
import { setVotingPasswordSchema, verifyVotingPasswordSchema } from './schema'

// ── Hashing helpers (Web Crypto PBKDF2 — no external dependency) ───

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)))
  const saltStr = btoa(String.fromCharCode(...salt))
  return `${saltStr}:${hash}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltStr, expectedHash] = stored.split(':')
  if (!saltStr || !expectedHash) return false
  const encoder = new TextEncoder()
  const salt = Uint8Array.from(atob(saltStr), c => c.charCodeAt(0))
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
    keyMaterial,
    256
  )
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)))
  return hash === expectedHash
}

/**
 * Server-only mutators for voting password.
 * The server replaces the placeholder hash with a real PBKDF2 hash.
 */
export const votingPasswordServerMutators = {
  setVotingPassword: defineMutator(setVotingPasswordSchema, async ({ tx, ctx: { userID }, args }) => {
    const passwordHash = await hashPassword(args.password)
    const now = Date.now()

    const existing = await tx.run(
      zql.voting_password.where('user_id', userID).one()
    )

    if (existing) {
      await tx.mutate.voting_password.update({
        id: existing.id,
        password_hash: passwordHash,
        updated_at: now,
      })
    } else {
      await tx.mutate.voting_password.insert({
        id: crypto.randomUUID(),
        user_id: userID,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      })
    }
  }),

  // Verify a voting password — throws if invalid. No data mutation.
  verifyVotingPassword: defineMutator(verifyVotingPasswordSchema, async ({ tx, ctx: { userID }, args }) => {
    const record = await tx.run(
      zql.voting_password.where('user_id', userID).one()
    )
    if (!record) {
      throw new Error('No voting password set. Please set your voting PIN first.')
    }
    const isValid = await verifyPassword(args.password, record.password_hash)
    if (!isValid) {
      throw new Error('Invalid voting password.')
    }
  }),
}
