import { useQuery } from '@rocicorp/zero/react'
import { queries } from '../queries'

/**
 * Reactive state hook for common cross-domain data.
 * Returns query-derived state — no mutations.
 *
 * All queries are conditional — only fire when their required args are provided.
 */
export function useCommonState(args: {
  // Entity-based queries
  entity_id?: string
  entity_type?: string
  user_id?: string
  group_id?: string
  amendment_id?: string
  event_id?: string
  blog_id?: string
  // User subscription queries
  subscriberId?: string
  subscriberIdForTimeline?: string
  subscriberUserId?: string
  // Timeline queries
  timelineEntityIds?: string[]
  timelineContentTypes?: string[]
  timelineContentLimit?: number
} = {}) {
  // ── Entity-based queries ───────────────────────────────────────────
  const hasEntityFilter = !!(args.user_id || args.group_id || args.amendment_id || args.event_id || args.blog_id)

  const [subscribers, subscribersResult] = useQuery(
    hasEntityFilter
      ? queries.common.subscribers({
          user_id: args.user_id,
          group_id: args.group_id,
          amendment_id: args.amendment_id,
          event_id: args.event_id,
          blog_id: args.blog_id,
        })
      : undefined
  )

  const [hashtags, hashtagsResult] = useQuery(
    hasEntityFilter
      ? queries.common.hashtags({
          group_id: args.group_id,
          user_id: args.user_id,
          blog_id: args.blog_id,
          amendment_id: args.amendment_id,
          event_id: args.event_id,
        })
      : undefined
  )

  const hasLinkFilter = !!(args.group_id || args.user_id)
  const [links, linksResult] = useQuery(
    hasLinkFilter
      ? queries.common.links({
          group_id: args.group_id,
          user_id: args.user_id,
        })
      : undefined
  )

  const hasTimelineEntityFilter = !!(args.entity_type && args.entity_id)
  const [timeline, timelineResult] = useQuery(
    hasTimelineEntityFilter
      ? queries.common.timelineByEntity({
          entity_type: args.entity_type!,
          entity_id: args.entity_id!,
        })
      : undefined
  )

  const [reactions, reactionsResult] = useQuery(
    hasTimelineEntityFilter
      ? queries.common.reactions({
          entity_type: args.entity_type!,
          entity_id: args.entity_id!,
        })
      : undefined
  )

  // ── User subscription queries ──────────────────────────────────────
  const [userSubscriptions, userSubsResult] = useQuery(
    args.subscriberId
      ? queries.common.userSubscriptions({ subscriber_id: args.subscriberId })
      : undefined
  )

  const [userSubscriptionsForTimeline, userSubsTimelineResult] = useQuery(
    args.subscriberIdForTimeline
      ? queries.common.userSubscriptionsForTimeline({ subscriber_id: args.subscriberIdForTimeline })
      : undefined
  )

  const [userSubscribers, userSubscribersResult] = useQuery(
    args.subscriberUserId
      ? queries.common.userSubscribers({ user_id: args.subscriberUserId })
      : undefined
  )

  // ── Timeline queries ───────────────────────────────────────────────
  const hasTimelineEntityIds = !!(args.timelineEntityIds && args.timelineEntityIds.length > 0)
  const [timelineByEntityIds, timelineByEntityIdsResult] = useQuery(
    hasTimelineEntityIds
      ? queries.common.timelineEventsByEntityIds({ entity_ids: args.timelineEntityIds! })
      : undefined
  )

  const hasTimelineContentTypes = !!(args.timelineContentTypes && args.timelineContentTypes.length > 0)
  const [timelineByContentTypes, timelineByContentTypesResult] = useQuery(
    hasTimelineContentTypes
      ? queries.common.timelineEventsByContentTypes({
          content_types: args.timelineContentTypes!,
          limit: args.timelineContentLimit ?? 50,
        })
      : undefined
  )

  const isLoading =
    (hasEntityFilter && subscribersResult.type === 'unknown') ||
    (hasEntityFilter && hashtagsResult.type === 'unknown') ||
    (hasLinkFilter && linksResult.type === 'unknown') ||
    (hasTimelineEntityFilter && timelineResult.type === 'unknown') ||
    (hasTimelineEntityFilter && reactionsResult.type === 'unknown') ||
    (!!args.subscriberId && userSubsResult.type === 'unknown') ||
    (!!args.subscriberIdForTimeline && userSubsTimelineResult.type === 'unknown') ||
    (!!args.subscriberUserId && userSubscribersResult.type === 'unknown') ||
    (hasTimelineEntityIds && timelineByEntityIdsResult.type === 'unknown') ||
    (hasTimelineContentTypes && timelineByContentTypesResult.type === 'unknown')

  return {
    subscribers,
    hashtags,
    links,
    timeline,
    reactions,
    userSubscriptions,
    userSubscriptionsForTimeline,
    userSubscribers,
    timelineByEntityIds,
    timelineByContentTypes,
    isLoading,
  }
}
