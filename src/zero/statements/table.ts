import { table, string, number } from '@rocicorp/zero'

export const statement = table('statement')
  .columns({
    id: string(),
    user_id: string(),
    tag: string().optional(),
    text: string().optional(),
    visibility: string(),
    created_at: number(),
  })
  .primaryKey('id')
