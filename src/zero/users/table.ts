import { table, string, number, boolean } from '@rocicorp/zero'

export const user = table('user')
  .columns({
    id: string(),
    email: string().optional(),
    handle: string().optional(),
    first_name: string().optional(),
    last_name: string().optional(),
    bio: string().optional(),
    about: string().optional(),
    avatar: string().optional(),
    x: string().optional(),
    youtube: string().optional(),
    linkedin: string().optional(),
    website: string().optional(),
    location: string().optional(),
    visibility: string(),
    subscriber_count: number(),
    amendment_count: number(),
    group_count: number(),
    tutorial_step: number().optional(),
    assistant_introduction: boolean().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const file = table('file')
  .columns({
    id: string(),
    path: string().optional(),
    url: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')
