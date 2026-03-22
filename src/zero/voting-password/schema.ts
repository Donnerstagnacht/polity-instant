import { z } from 'zod'
import { timestampSchema } from '../shared/helpers'

const baseVotingPasswordSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  password_hash: z.string(),
  created_at: timestampSchema,
  updated_at: timestampSchema,
})

export const selectVotingPasswordSchema = baseVotingPasswordSchema

// Client sends plain password; server hashes it
export const setVotingPasswordSchema = z.object({
  password: z.string().min(4).max(4).regex(/^\d{4}$/, 'Must be a 4-digit PIN'),
})

export const verifyVotingPasswordSchema = z.object({
  password: z.string().min(4).max(4),
})

export type VotingPassword = z.infer<typeof selectVotingPasswordSchema>
