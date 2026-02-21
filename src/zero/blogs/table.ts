import { table, string, number, boolean, json } from '@rocicorp/zero'

export const blog = table('blog')
  .columns({
    id: string(),
    title: string().optional(),
    description: string().optional(),
    content: json().optional(),
    date: string().optional(),
    image_url: string().optional(),
    is_public: boolean().optional(),
    visibility: string(),
    like_count: number(),
    comment_count: number(),
    upvotes: number(),
    downvotes: number(),
    editing_mode: string().optional(),
    discussions: json().optional(),
    group_id: string().optional(),
    updated_at: number(),
    created_at: number(),
  })
  .primaryKey('id')

export const blogBlogger = table('blog_blogger')
  .columns({
    id: string(),
    blog_id: string(),
    user_id: string(),
    role_id: string().optional(),
    status: string().optional(),
    visibility: string().optional(),
    created_at: number(),
  })
  .primaryKey('id')


