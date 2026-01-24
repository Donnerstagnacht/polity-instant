'use client';

import { useMemo } from 'react';
import db from '../../../../db/db';

export function useSubscriptionTimeline() {
  // Use InstantDB's native auth hook instead of zustand store
  const { user: authUser } = db.useAuth();

  // Don't query if user is not authenticated
  const shouldQuery = !!authUser?.id;

  // Fetch all subscriptions for the current user
  const subscriptionsWhere = useMemo(() => {
    if (!authUser?.id) return null;
    if (!authUser.email) {
      return { 'subscriber.id': authUser.id };
    }
    return {
      or: [{ 'subscriber.id': authUser.id }, { 'subscriber.email': authUser.email }],
    };
  }, [authUser?.id, authUser?.email]);

  const { data: subscriptionsData, isLoading: subscriptionsLoading } = db.useQuery(
    shouldQuery && subscriptionsWhere
      ? {
          subscribers: {
            $: {
              where: subscriptionsWhere,
            },
            user: {},
            group: { hashtags: {}, events: {}, amendments: {} },
            amendment: {},
            event: { organizer: {} },
            blog: {}, // Blogs don't have a direct user link - they use blogBloggers junction table
          },
        }
      : null
  );

  const subscribedEventIds = useMemo(() => {
    if (!subscriptionsData?.subscribers) return [] as string[];
    return subscriptionsData.subscribers
      .filter((sub): sub is typeof sub & { event: NonNullable<typeof sub.event> } => !!sub.event)
      .map(sub => sub.event.id);
  }, [subscriptionsData]);

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
      conditions.push({ 'actor.id': { in: subscribedEntityIds.users } });
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
            user: { hashtags: {}, memberships: {}, collaborations: {} },
            group: {},
            amendment: {
              document: {},
              hashtags: {},
              amendmentRoleCollaborators: {},
              groupSupporters: {},
              changeRequests: {},
            },
            event: {
              organizer: {},
              hashtags: {},
              participants: {},
              votingSessions: { election: {}, amendment: {} },
              targetedAmendments: {},
              eventPositions: { election: {} },
              scheduledElections: {},
              agendaItems: { election: {}, amendmentVote: {} },
            },
            blog: { hashtags: {}, comments: {} }, // Blogs don't have a direct user link - they use blogBloggers junction table
            todo: { group: {}, creator: {} },
            statement: { user: {} },
            // Link to elections and votes for agenda item navigation
            election: { agendaItem: { event: {} } },
            amendmentVote: { agendaItem: { event: {} } },
          },
        }
      : null
  );

  const timelineEventIds = useMemo(() => {
    if (!timelineData?.timelineEvents) return [] as string[];
    const ids = timelineData.timelineEvents
      .map((event: any) => event?.event?.id)
      .filter((id: string | undefined): id is string => Boolean(id));
    return Array.from(new Set(ids));
  }, [timelineData?.timelineEvents]);

  const agendaEventIds = useMemo(
    () => Array.from(new Set([...subscribedEventIds, ...timelineEventIds])),
    [subscribedEventIds, timelineEventIds]
  );

  const { data: agendaItemsData, isLoading: agendaItemsLoading } = db.useQuery(
    agendaEventIds.length > 0
      ? {
          agendaItems: {
            $: {
              where: { 'event.id': { in: agendaEventIds } },
            },
            event: {},
            election: {},
            amendmentVote: {},
          },
        }
      : null
  );

  const agendaItemsByEventId = useMemo(() => {
    const map = new Map<string, Array<{ election?: unknown; amendmentVote?: unknown }>>();
    for (const item of agendaItemsData?.agendaItems ?? []) {
      const eventId = (item as any).event?.id as string | undefined;
      if (!eventId) continue;
      const list = map.get(eventId) ?? [];
      list.push(item as any);
      map.set(eventId, list);
    }
    return map;
  }, [agendaItemsData]);

  // Sort timeline events by date (most recent first)
  const sortedEvents = useMemo(() => {
    if (!timelineData?.timelineEvents) return [];

    return [...timelineData.timelineEvents].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [timelineData]);

  return {
    events: sortedEvents,
    isLoading: shouldQuery ? subscriptionsLoading || timelineLoading || agendaItemsLoading : false,
    subscribedEntityIds,
    agendaItemsByEventId,
  };
}
