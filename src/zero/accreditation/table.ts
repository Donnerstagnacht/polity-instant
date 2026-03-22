import { table, string, number } from '@rocicorp/zero'

export const accreditation = table('accreditation')
  .columns({
    id: string(),
    event_id: string(),
    agenda_item_id: string(),
    user_id: string(),
    confirmed_at: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')
