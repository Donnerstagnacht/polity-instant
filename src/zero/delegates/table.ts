import { table, string, number } from '@rocicorp/zero'

export const eventDelegate = table('event_delegate')
  .columns({
    id: string(),
    event_id: string(),
    user_id: string(),
    group_id: string().optional(),
    status: string().optional(),
    seat_count: number(),
    created_at: number(),
  })
  .primaryKey('id')

export const groupDelegateAllocation = table('group_delegate_allocation')
  .columns({
    id: string(),
    event_id: string(),
    group_id: string().optional(),
    allocated_seats: number(),
    created_at: number(),
  })
  .primaryKey('id')
