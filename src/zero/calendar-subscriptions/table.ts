import { table, string, number, boolean } from '@rocicorp/zero'

export const calendarSubscription = table('calendar_subscription')
  .columns({
    id: string(),
    user_id: string(),
    target_type: string(),
    target_group_id: string().optional(),
    target_user_id: string().optional(),
    is_visible: boolean(),
    color: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')
