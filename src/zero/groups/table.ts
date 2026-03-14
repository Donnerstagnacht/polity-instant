import { table, string, number, boolean } from '@rocicorp/zero'

export const group = table('group')
  .columns({
    id: string(),
    name: string().optional(),
    description: string().optional(),
    location: string().optional(),
    image_url: string().optional(),
    is_public: boolean(),
    member_count: number(),
    subscriber_count: number(),
    event_count: number(),
    amendment_count: number(),
    document_count: number(),
    x: string().optional(),
    youtube: string().optional(),
    linkedin: string().optional(),
    website: string().optional(),
    visibility: string(),
    group_type: string(),
    owner_id: string().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const groupMembership = table('group_membership')
  .columns({
    id: string(),
    group_id: string(),
    user_id: string(),
    status: string().optional(),
    visibility: string(),
    role_id: string().optional(),
    source: string(),
    source_group_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const role = table('role')
  .columns({
    id: string(),
    name: string().optional(),
    description: string().optional(),
    scope: string().optional(),
    group_id: string().optional(),
    event_id: string().optional(),
    amendment_id: string().optional(),
    blog_id: string().optional(),
    sort_order: number(),
    created_at: number(),
  })
  .primaryKey('id')

export const actionRight = table('action_right')
  .columns({
    id: string(),
    resource: string().optional(),
    action: string().optional(),
    role_id: string(),
    group_id: string().optional(),
    event_id: string().optional(),
    amendment_id: string().optional(),
    blog_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')


