import { table, string, number } from '@rocicorp/zero'

export const position = table('position')
  .columns({
    id: string(),
    title: string().optional(),
    description: string().optional(),
    term: string().optional(),
    first_term_start: number().optional(),
    scheduled_revote_date: number().optional(),
    group_id: string(),
    event_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const positionHolderHistory = table('position_holder_history')
  .columns({
    id: string(),
    position_id: string(),
    user_id: string(),
    start_date: number().optional(),
    end_date: number().optional(),
    reason: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const eventPosition = table('event_position')
  .columns({
    id: string(),
    event_id: string(),
    title: string().optional(),
    description: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const eventPositionHolder = table('event_position_holder')
  .columns({
    id: string(),
    position_id: string(),
    user_id: string(),
    group_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')
