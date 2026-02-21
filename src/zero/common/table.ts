import { table, string, number, json } from '@rocicorp/zero'

export const hashtag = table('hashtag')
  .columns({
    id: string(),
    tag: string().optional(),
    category: string().optional(),
    color: string().optional(),
    bg_color: string().optional(),
    icon: string().optional(),
    description: string().optional(),
    post_count: number(),
    amendment_id: string().optional(),
    event_id: string().optional(),
    group_id: string().optional(),
    user_id: string().optional(),
    blog_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const link = table('link')
  .columns({
    id: string(),
    label: string().optional(),
    url: string().optional(),
    user_id: string().optional(),
    group_id: string().optional(),
    meeting_slot_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const timelineEvent = table('timeline_event')
  .columns({
    id: string(),
    event_type: string().optional(),
    entity_type: string().optional(),
    entity_id: string().optional(),
    title: string().optional(),
    description: string().optional(),
    metadata: json().optional(),
    image_url: string().optional(),
    video_url: string().optional(),
    video_thumbnail_url: string().optional(),
    content_type: string().optional(),
    tags: json().optional(),
    stats: json().optional(),
    vote_status: string().optional(),
    election_status: string().optional(),
    ends_at: number().optional(),
    user_id: string().optional(),
    group_id: string().optional(),
    amendment_id: string().optional(),
    event_id: string().optional(),
    todo_id: string().optional(),
    blog_id: string().optional(),
    statement_id: string().optional(),
    actor_id: string().optional(),
    election_id: string().optional(),
    amendment_vote_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const reaction = table('reaction')
  .columns({
    id: string(),
    entity_id: string().optional(),
    entity_type: string().optional(),
    reaction_type: string().optional(),
    user_id: string(),
    timeline_event_id: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')
