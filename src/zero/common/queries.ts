import { defineQuery, type QueryRowType } from '@rocicorp/zero'
import { z } from 'zod'
import { zql } from '../schema'

export const commonQueries = {
  // Subscribers for an entity
  subscribers: defineQuery(
    z.object({
      user_id: z.string().optional(),
      group_id: z.string().optional(),
      amendment_id: z.string().optional(),
      event_id: z.string().optional(),
      blog_id: z.string().optional(),
    }),
    ({ args }) => {
      let q = zql.subscriber
      if (args.user_id) q = q.where('user_id', args.user_id)
      if (args.group_id) q = q.where('group_id', args.group_id)
      if (args.amendment_id) q = q.where('amendment_id', args.amendment_id)
      if (args.event_id) q = q.where('event_id', args.event_id)
      if (args.blog_id) q = q.where('blog_id', args.blog_id)
      return q.orderBy('created_at', 'desc')
    }
  ),

  // Subscribers for a user with related user objects
  subscribersForUser: defineQuery(
    z.object({ userId: z.string() }),
    ({ args: { userId } }) =>
      zql.subscriber
        .where('user_id', userId)
        .related('subscriber_user')
        .related('user')
        .orderBy('created_at', 'desc')
  ),

  // All canonical hashtags (for typeahead)
  allHashtags: defineQuery(
    z.object({}),
    () => zql.hashtag.orderBy('tag', 'asc')
  ),

  // Hashtags for a user (via junction)
  userHashtags: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.user_hashtag
        .where('user_id', user_id)
        .related('hashtag')
        .orderBy('created_at', 'desc')
  ),

  // Hashtags for a group (via junction)
  groupHashtags: defineQuery(
    z.object({ group_id: z.string() }),
    ({ args: { group_id } }) =>
      zql.group_hashtag
        .where('group_id', group_id)
        .related('hashtag')
        .orderBy('created_at', 'desc')
  ),

  // Hashtags for an amendment (via junction)
  amendmentHashtags: defineQuery(
    z.object({ amendment_id: z.string() }),
    ({ args: { amendment_id } }) =>
      zql.amendment_hashtag
        .where('amendment_id', amendment_id)
        .related('hashtag')
        .orderBy('created_at', 'desc')
  ),

  // Hashtags for an event (via junction)
  eventHashtags: defineQuery(
    z.object({ event_id: z.string() }),
    ({ args: { event_id } }) =>
      zql.event_hashtag
        .where('event_id', event_id)
        .related('hashtag')
        .orderBy('created_at', 'desc')
  ),

  // Hashtags for a blog (via junction)
  blogHashtags: defineQuery(
    z.object({ blog_id: z.string() }),
    ({ args: { blog_id } }) =>
      zql.blog_hashtag
        .where('blog_id', blog_id)
        .related('hashtag')
        .orderBy('created_at', 'desc')
  ),

  // Hashtags for a statement (via junction)
  statementHashtags: defineQuery(
    z.object({ statement_id: z.string() }),
    ({ args: { statement_id } }) =>
      zql.statement_hashtag
        .where('statement_id', statement_id)
        .related('hashtag')
        .orderBy('created_at', 'desc')
  ),

  // Links for a group or user
  links: defineQuery(
    z.object({
      group_id: z.string().optional(),
      user_id: z.string().optional(),
    }),
    ({ args }) => {
      let q = zql.link
      if (args.group_id) q = q.where('group_id', args.group_id)
      if (args.user_id) q = q.where('user_id', args.user_id)
      return q.orderBy('created_at', 'desc')
    }
  ),

  // Timeline events for a specific entity
  timelineByEntity: defineQuery(
    z.object({ entity_type: z.string(), entity_id: z.string() }),
    ({ args: { entity_type, entity_id } }) =>
      zql.timeline_event
        .where('entity_type', entity_type)
        .where('entity_id', entity_id)
        .orderBy('created_at', 'desc')
  ),

  // Reactions for an entity
  reactions: defineQuery(
    z.object({ entity_id: z.string(), entity_type: z.string() }),
    ({ args: { entity_id, entity_type } }) =>
      zql.reaction
        .where('entity_id', entity_id)
        .where('entity_type', entity_type)
        .orderBy('created_at', 'desc')
  ),

  // User subscriptions with basic related entities
  userSubscriptions: defineQuery(
    z.object({ subscriber_id: z.string() }),
    ({ args: { subscriber_id } }) =>
      zql.subscriber
        .where('subscriber_id', subscriber_id)
        .related('user')
        .related('group')
        .related('amendment')
        .related('event', q => q.related('creator'))
        .related('blog')
  ),

  // User subscriptions with deep related entities for timeline
  userSubscriptionsForTimeline: defineQuery(
    z.object({ subscriber_id: z.string() }),
    ({ args: { subscriber_id } }) =>
      zql.subscriber
        .where('subscriber_id', subscriber_id)
        .related('user')
        .related('group', q => q.related('group_hashtags', q => q.related('hashtag')).related('events').related('amendments'))
        .related('amendment')
        .related('event', q => q.related('creator'))
        .related('blog')
  ),

  // Entity subscribers (users subscribed to a user/entity)
  userSubscribers: defineQuery(
    z.object({ user_id: z.string() }),
    ({ args: { user_id } }) =>
      zql.subscriber
        .where('user_id', user_id)
        .related('subscriber_user')
  ),

  // Timeline events by entity IDs with deep relations
  timelineEventsByEntityIds: defineQuery(
    z.object({ entity_ids: z.array(z.string()) }),
    ({ args: { entity_ids } }) =>
      zql.timeline_event
        .where('entity_id', 'IN', entity_ids)
        .related('actor')
        .related('user', q => q.related('user_hashtags', q => q.related('hashtag')).related('group_memberships').related('amendment_collaborations'))
        .related('group')
        .related('amendment', q =>
          q.related('documents')
            .related('amendment_hashtags', q => q.related('hashtag'))
            .related('collaborators')
            .related('support_votes')
            .related('change_requests')
        )
        .related('event', q =>
          q.related('creator')
            .related('event_hashtags', q => q.related('hashtag'))
            .related('participants')
            .related('voting_sessions', q => q.related('agenda_item').related('votes'))
            .related('event_positions', q => q.related('holders'))
            .related('scheduled_elections')
            .related('agenda_items', q => q.related('election').related('amendment'))
        )
        .related('blog', q => q.related('blog_hashtags', q => q.related('hashtag')))
        .related('todo', q => q.related('group').related('creator'))
        .related('statement', q => q.related('user'))
        .related('election', q => q.related('agenda_item', q => q.related('event')))
        .related('amendment_vote')
  ),

  // Timeline events by content types with basic relations
  timelineEventsByContentTypes: defineQuery(
    z.object({ content_types: z.array(z.string()), limit: z.number() }),
    ({ args: { content_types, limit } }) =>
      zql.timeline_event
        .where('content_type', 'IN', content_types)
        .related('actor')
        .related('group')
        .related('event')
        .limit(limit)
  ),
}

export type LinkRow = QueryRowType<typeof commonQueries.links>
export type TimelineEventByEntityRow = QueryRowType<typeof commonQueries.timelineByEntity>
export type TimelineEventsByEntityIdsRow = QueryRowType<typeof commonQueries.timelineEventsByEntityIds>
export type ReactionRow = QueryRowType<typeof commonQueries.reactions>
export type SubscriberRow = QueryRowType<typeof commonQueries.subscribers>
export type UserSubscriptionRow = QueryRowType<typeof commonQueries.userSubscriptions>
export type TimelineEventsByContentTypeRow = QueryRowType<typeof commonQueries.timelineEventsByContentTypes>
