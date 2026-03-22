import { table, string, number } from '@rocicorp/zero'

export const votingPassword = table('voting_password')
  .columns({
    id: string(),
    user_id: string(),
    password_hash: string(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')
