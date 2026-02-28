import { defineQuery } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const blogQueries = {
  // Blogs by the current user (as blogger)
  byUser: defineQuery(
    z.object({}),
    ({ ctx: { userID } }) =>
      zql.blog_blogger
        .where('user_id', userID)
        .related('blog')
        .orderBy('created_at', 'desc')
  ),

  // Blogs belonging to a group
  byGroup: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.blog
        .where('group_id', group_id)
        .orderBy('created_at', 'desc')
  ),

  // Single blog by ID
  byId: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.blog.where('id', id).one()
  ),

  // Blog with bloggers + user relations
  byIdWithBloggers: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.blog
        .where('id', id)
        .related('bloggers', q => q.related('user'))
        .one()
  ),

  // Blog with management data (bloggers+roles+action_rights)
  byIdWithManagement: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.blog
        .where('id', id)
        .related('bloggers', q => q.related('user').related('role'))
        .related('roles', q => q.where('scope', 'blog').related('action_rights'))
        .one()
  ),

  // Blog with full detail relations (for BlogDetail)
  byIdWithDetails: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.blog
        .where('id', id)
        .related('bloggers', q => q.related('user'))
        .related('blog_hashtags', q => q.related('hashtag'))
        .related('subscribers')
        .related('support_votes', q => q.related('user'))
        .one()
  ),

  // Blog with hashtags
  byIdWithHashtags: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.blog
        .where('id', id)
        .related('blog_hashtags', q => q.related('hashtag'))
        .one()
  ),

  // Blog for editor (with bloggers, roles, action_rights)
  byIdForEditor: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.blog
        .where('id', id)
        .related('bloggers', q =>
          q.related('user').related('role', q2 => q2.related('action_rights'))
        )
        .one()
  ),

  // All blog_blogger entries for a blog
  entries: defineQuery(
    z.object({ blog_id: z.string() }),
    ({ args: { blog_id } }) =>
      zql.blog_blogger
        .where('blog_id', blog_id)
        .orderBy('created_at', 'desc')
  ),

  // Single blog_blogger entry by ID
  entryById: defineQuery(
    z.object({ id: z.string() }),
    ({ args: { id } }) =>
      zql.blog_blogger.where('id', id).one()
  ),

  // Document versions for a blog
  versionsByBlogId: defineQuery(
    z.object({ blog_id: z.string() }),
    ({ args: { blog_id } }) =>
      zql.document_version
        .where('blog_id', blog_id)
        .related('author')
  ),

  // Subscribers for a blog
  subscribers: defineQuery(
    z.object({ blog_id: z.string() }),
    ({ args: { blog_id } }) =>
      zql.subscriber
        .where('blog_id', blog_id)
        .related('subscriber_user')
        .related('blog')
  ),

  // Blog thread with comments (one thread per blog via blog_id FK)
  blogThread: defineQuery(
    z.object({ blog_id: z.string() }),
    ({ args: { blog_id } }) =>
      zql.thread
        .where('blog_id', blog_id)
        .related('comments', q =>
          q.related('user')
            .related('votes', q2 => q2.related('user'))
            .related('parent')
            .related('replies', q2 =>
              q2.related('user').related('votes', q3 => q3.related('user'))
            )
        )
        .one()
  ),

  bloggersByUser: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.blog_blogger
        .where('user_id', user_id)
        .related('blog', q => q.related('blog_hashtags', q => q.related('hashtag')))
        .related('user')
        .related('role')
  ),

  byGroupWithHashtags: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.blog
        .where('group_id', group_id)
        .related('blog_hashtags', q => q.related('hashtag'))
  ),
}
