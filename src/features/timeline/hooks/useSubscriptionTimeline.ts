'use client';

import { useMemo } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { useAgendaState } from '@/zero/agendas/useAgendaState';
import { useCommonState } from '@/zero/common/useCommonState';

export function useSubscriptionTimeline() {
  const { user: authUser } = useAuth();
  // Don't query if user is not authenticated
  const shouldQuery = !!authUser?.id;

  // Fetch all subscriptions for the current user
  const { userSubscriptionsForTimeline: subscriptionRows } = useCommonState({
    subscriberIdForTimeline: shouldQuery ? authUser?.id : undefined,
  });
  const subscriptionsLoading = false;
  const subscriptionsData = { subscribers: subscriptionRows };

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

  // Fetch timeline events for subscribed entities
  // Build a flat list of entity IDs to query timeline events
  const timelineEntityIds = useMemo(() => {
    if (!subscribedEntityIds) return [];
    return [
      ...subscribedEntityIds.users,
      ...subscribedEntityIds.groups,
      ...subscribedEntityIds.amendments,
      ...subscribedEntityIds.events,
      ...subscribedEntityIds.blogs,
    ];
  }, [subscribedEntityIds]);

  const { timelineByEntityIds: timelineRows } = useCommonState({
    timelineEntityIds: timelineEntityIds.length > 0 ? timelineEntityIds : undefined,
  });
  const timelineLoading = false;
  const timelineData = { timelineEvents: timelineRows };

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

  const { agendaItems: agendaItemRows } = useAgendaState({
    eventIds: agendaEventIds.length > 0 ? agendaEventIds : undefined,
  });
  const agendaItemsLoading = false;
  const agendaItemsData = { agendaItems: agendaItemRows };

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
      (a, b) => (b.created_at ?? 0) - (a.created_at ?? 0)
    );
  }, [timelineData]);

  return {
    events: sortedEvents,
    isLoading: shouldQuery ? subscriptionsLoading || timelineLoading || agendaItemsLoading : false,
    subscribedEntityIds,
    agendaItemsByEventId,
  };
}
