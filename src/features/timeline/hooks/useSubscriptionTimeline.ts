'use client';

import { useMemo } from 'react';
import db from '../../../../db/db';

export function useSubscriptionTimeline() {
  // Use InstantDB's native auth hook instead of zustand store
  const { user: authUser } = db.useAuth();

  // Don't query if user is not authenticated
  const shouldQuery = !!authUser?.id;

  // Fetch all subscriptions for the current user
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = db.useQuery(
    shouldQuery
      ? {
          subscribers: {
            $: {
              where: {
                'subscriber.id': authUser.id,
              },
            },
            user: {},
            group: {},
            amendment: {},
            event: { organizer: {} },
            blog: {}, // Blogs don't have a direct user link - they use blogBloggers junction table
          },
        }
      : null
  );

  // Get all entity IDs we're subscribed to
  const subscribedEntityIds = useMemo(() => {
    if (!subscriptionsData?.subscribers) return null;

    return {
      users: subscriptionsData.subscribers
        .filter((sub): sub is typeof sub & { user: NonNullable<typeof sub.user> } => !!sub.user)
        .map(sub => sub.user.id),
      groups: subscriptionsData.subscribers
        .filter((sub): sub is typeof sub & { group: NonNullable<typeof sub.group> } => !!sub.group)
        .map(sub => sub.group.id),
      amendments: subscriptionsData.subscribers
        .filter(
          (sub): sub is typeof sub & { amendment: NonNullable<typeof sub.amendment> } =>
            !!sub.amendment
        )
        .map(sub => sub.amendment.id),
      events: subscriptionsData.subscribers
        .filter((sub): sub is typeof sub & { event: NonNullable<typeof sub.event> } => !!sub.event)
        .map(sub => sub.event.id),
      blogs: subscriptionsData.subscribers
        .filter((sub): sub is typeof sub & { blog: NonNullable<typeof sub.blog> } => !!sub.blog)
        .map(sub => sub.blog.id),
    };
  }, [subscriptionsData]);

  // Build the where clause for timeline events
  const whereClause = useMemo(() => {
    if (!subscribedEntityIds) return null;

    const conditions = [];

    if (subscribedEntityIds.users.length > 0) {
      conditions.push({ 'user.id': { in: subscribedEntityIds.users } });
    }
    if (subscribedEntityIds.groups.length > 0) {
      conditions.push({ 'group.id': { in: subscribedEntityIds.groups } });
    }
    if (subscribedEntityIds.amendments.length > 0) {
      conditions.push({ 'amendment.id': { in: subscribedEntityIds.amendments } });
    }
    if (subscribedEntityIds.events.length > 0) {
      conditions.push({ 'event.id': { in: subscribedEntityIds.events } });
    }
    if (subscribedEntityIds.blogs.length > 0) {
      conditions.push({ 'blog.id': { in: subscribedEntityIds.blogs } });
    }

    return conditions.length > 0 ? { or: conditions } : null;
  }, [subscribedEntityIds]);

  // Fetch timeline events for subscribed entities
  const { data: timelineData, isLoading: timelineLoading } = db.useQuery(
    whereClause
      ? {
          timelineEvents: {
            $: {
              where: whereClause,
            },
            actor: {},
            user: {},
            group: {},
            amendment: { document: {} },
            event: { organizer: {} },
            blog: {}, // Blogs don't have a direct user link - they use blogBloggers junction table
          },
        }
      : null
  );

  // Sort timeline events by date (most recent first)
  const sortedEvents = useMemo(() => {
    if (!timelineData?.timelineEvents) return [];

    return [...timelineData.timelineEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [timelineData]);

  return {
    events: sortedEvents,
    isLoading: shouldQuery ? subscriptionsLoading || timelineLoading : false,
    subscribedEntityIds,
  };
}
