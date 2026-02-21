import { table, string, number, boolean, json } from '@rocicorp/zero'

export const amendment = table('amendment')
  .columns({
    id: string(),
    code: string().optional(),
    title: string().optional(),
    status: string().optional(),
    workflow_status: string().optional(),
    reason: string().optional(),
    category: string().optional(),
    preamble: string().optional(),
    created_by_id: string(),
    group_id: string().optional(),
    event_id: string().optional(),
    clone_source_id: string().optional(),
    supporters: number(),
    supporters_required: number().optional(),
    supporters_percentage: number().optional(),
    upvotes: number(),
    downvotes: number(),
    tags: json().optional(),
    visibility: string(),
    is_public: boolean(),
    editing_mode: string().optional(),
    discussions: json().optional(),
    x: string().optional(),
    youtube: string().optional(),
    linkedin: string().optional(),
    website: string().optional(),
    created_at: number(),
    updated_at: number(),
  })
  .primaryKey('id')

export const amendmentCollaborator = table('amendment_collaborator')
  .columns({
    id: string(),
    amendment_id: string(),
    user_id: string(),
    role_id: string().optional(),
    status: string().optional(),
    visibility: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const amendmentPath = table('amendment_path')
  .columns({
    id: string(),
    amendment_id: string(),
    title: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const amendmentPathSegment = table('amendment_path_segment')
  .columns({
    id: string(),
    path_id: string(),
    group_id: string().optional(),
    event_id: string().optional(),
    order_index: number().optional(),
    status: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')

export const supportConfirmation = table('support_confirmation')
  .columns({
    id: string(),
    amendment_id: string(),
    group_id: string().optional(),
    event_id: string().optional(),
    confirmed_by_id: string(),
    status: string().optional(),
    confirmed_at: number().optional(),
    created_at: number(),
  })
  .primaryKey('id')
