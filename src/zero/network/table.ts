import { table, string, number } from '@rocicorp/zero'

export const follow = table('follow')
  .columns({
    id: string(),
    follower_id: string(),
    followee_id: string(),
    created_at: number(),
  })
  .primaryKey('id')

export const groupRelationship = table('group_relationship')
  .columns({
    id: string(),
    group_id: string(),
    related_group_id: string(),
    relationship_type: string().optional(),
    with_right: string().optional(),
    status: string().optional(),
    initiator_group_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const subscriber = table('subscriber')
  .columns({
    id: string(),
    subscriber_id: string(),
    user_id: string().optional(),
    group_id: string().optional(),
    amendment_id: string().optional(),
    event_id: string().optional(),
    blog_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')
