'use client';

/**
 * Hook for fetching subscribed timeline content
 * Returns content from groups, events, and users the current user follows
 */

import { useMemo, useCallback, useState } from 'react';
import { db } from 'db/db';

export interface TimelineItem {
  id: string;
  entityId?: string;
  type:
    | 'group'
    | 'event'
    | 'amendment'
    | 'blog'
    | 'statement'
    | 'video'
    | 'image'
    | 'election'
    | 'vote'
    | 'todo'
    | 'action'
    | 'user';
  eventType?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  authorId?: string;
  authorName?: string;
  authorAvatar?: string;
  groupId?: string;
  groupName?: string;
  eventId?: string;
  eventName?: string;
  startDate?: Date;
  endDate?: Date;
  location?: string;
  city?: string;
  postcode?: string;
  attendeeCount?: number;
  electionsCount?: number;
  amendmentsCount?: number;
  memberCount?: number;
  eventCount?: number;
  amendmentCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  status?: string;
  stats?: {
    reactions?: number;
    comments?: number;
    views?: number;
    members?: number;
  };
  tags?: string[];
  collaboratorCount?: number;
  supportingGroupsCount?: number;
  changeRequestCount?: number;
  commentCount?: number;
  groupCount?: number;
  // Agenda item links for vote/election cards navigation
  agendaEventId?: string;
  agendaItemId?: string;
}

export interface UseSubscribedTimelineOptions {
  userId: string;
  userEmail?: string;
  /** Number of items per page */
  pageSize?: number;
  /** Content types to include */
  contentTypes?: TimelineItem['type'][];
  /** Sort order */
  sortBy?: 'recent' | 'popular' | 'trending';
}

export interface UseSubscribedTimelineResult {
  items: TimelineItem[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  /** Group IDs user is subscribed to */
  subscribedGroupIds: string[];
}

/**
 * Fetch timeline content from subscribed groups and events
 */
export function useSubscribedTimeline(
  options: UseSubscribedTimelineOptions
): UseSubscribedTimelineResult {
  const { userId, userEmail, pageSize = 20, sortBy = 'recent' } = options;
  const [page, setPage] = useState(0);

  const userWhere = useMemo(() => {
    if (!userId) return null;
    if (!userEmail) {
      return { 'user.id': userId };
    }
    return {
      or: [{ 'user.id': userId }, { 'user.email': userEmail }],
    };
  }, [userId, userEmail]);

  // Query user's group memberships
  const { data: membershipData, isLoading: membershipLoading } = db.useQuery(
    userWhere
      ? {
          groupMemberships: {
            $: {
              where: userWhere,
            },
            group: { hashtags: {}, events: {}, amendments: {} },
          },
        }
      : null
  );

  // Query user's event participations
  const { data: participationData, isLoading: participationLoading } = db.useQuery(
    userWhere
      ? {
          eventParticipants: {
            $: {
              where: userWhere,
            },
            event: {
              hashtags: {},
              participants: {},
              votingSessions: { election: {}, amendment: {} },
              targetedAmendments: {},
              eventPositions: { election: {} },
              scheduledElections: {},
              agendaItems: { election: {}, amendmentVote: {} },
            },
          },
        }
      : null
  );

  const participatedEventIds = useMemo(() => {
    if (!participationData?.eventParticipants) return [] as string[];
    return participationData.eventParticipants.filter(p => p.event).map(p => p.event!.id);
  }, [participationData]);

  const { data: agendaItemsData } = db.useQuery(
    participatedEventIds.length > 0
      ? {
          agendaItems: {
            $: {
              where: { 'event.id': { in: participatedEventIds } },
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

  // Get subscribed group IDs
  const subscribedGroupIds = useMemo(() => {
    if (!membershipData?.groupMemberships) return [];
    return membershipData.groupMemberships.filter(m => m.group).map(m => m.group!.id);
  }, [membershipData]);

  // Transform memberships to timeline items
  const groupItems = useMemo((): TimelineItem[] => {
    if (!membershipData?.groupMemberships) return [];

    return membershipData.groupMemberships
      .filter(m => m.group)
      .map(m => ({
        id: m.group!.id,
        type: 'group' as const,
        title: m.group!.name || 'Unnamed Group',
        description: (m.group as Record<string, unknown>).description as string | undefined,
        imageUrl:
          ((m.group as Record<string, unknown>).imageURL as string | undefined) ||
          ((m.group as Record<string, unknown>).imageUrl as string | undefined),
        groupId: m.group!.id,
        groupName: m.group!.name || 'Unnamed Group',
        memberCount: (m.group as Record<string, unknown>).memberCount as number | undefined,
        eventCount: (m.group as Record<string, unknown>).events
          ? ((m.group as Record<string, unknown>).events as unknown[]).length
          : undefined,
        amendmentCount: (m.group as Record<string, unknown>).amendments
          ? ((m.group as Record<string, unknown>).amendments as unknown[]).length
          : undefined,
        createdAt: new Date(
          ((m.group as Record<string, unknown>).createdAt as string) || Date.now()
        ),
        status: (m.group as Record<string, unknown>).status as string | undefined,
        tags: ((m.group as Record<string, unknown>).hashtags as Array<{ tag?: string | null }>)
          ?.map(tag => tag?.tag)
          .filter((tag): tag is string => Boolean(tag)),
      }));
  }, [membershipData]);

  // Transform events to timeline items
  const eventItems = useMemo((): TimelineItem[] => {
    if (!participationData?.eventParticipants) return [];

    return participationData.eventParticipants
      .filter(p => p.event)
      .map(p => ({
        id: p.event!.id,
        type: 'event' as const,
        title: p.event!.title || 'Unnamed Event',
        description: (p.event as Record<string, unknown>).description as string | undefined,
        imageUrl:
          ((p.event as Record<string, unknown>).imageURL as string | undefined) ||
          ((p.event as Record<string, unknown>).imageUrl as string | undefined),
        eventId: p.event!.id,
        eventName: p.event!.title || 'Unnamed Event',
        groupId: (p.event as Record<string, unknown>).groupId as string | undefined,
        startDate: new Date(
          ((p.event as Record<string, unknown>).startDate as string) || Date.now()
        ),
        endDate: (p.event as Record<string, unknown>).endDate
          ? new Date((p.event as Record<string, unknown>).endDate as string)
          : undefined,
        location:
          ((p.event as Record<string, unknown>).locationName as string | undefined) ||
          ((p.event as Record<string, unknown>).location as string | undefined) ||
          ((p.event as Record<string, unknown>).city as string | undefined),
        city: (p.event as Record<string, unknown>).city as string | undefined,
        postcode: (p.event as Record<string, unknown>).postalCode as string | undefined,
        attendeeCount: (p.event as Record<string, unknown>).participants
          ? ((p.event as Record<string, unknown>).participants as unknown[]).length
          : undefined,
        electionsCount:
          (
            (p.event as Record<string, unknown>).eventPositions as
              | Array<{ election?: unknown }>
              | undefined
          )?.filter(position => Boolean(position?.election)).length ??
          ((p.event as Record<string, unknown>).scheduledElections as unknown[] | undefined)
            ?.length ??
          agendaItemsByEventId.get(p.event!.id)?.filter(item => Boolean(item?.election)).length ??
          (
            (p.event as Record<string, unknown>).votingSessions as
              | Array<{ election?: unknown }>
              | undefined
          )?.filter(session => Boolean(session?.election)).length,
        amendmentsCount: (p.event as Record<string, unknown>).targetedAmendments
          ? ((p.event as Record<string, unknown>).targetedAmendments as unknown[]).length
          : undefined,
        createdAt: new Date(
          ((p.event as Record<string, unknown>).createdAt as string) || Date.now()
        ),
        status: (p.event as Record<string, unknown>).status as string | undefined,
        tags: ((p.event as Record<string, unknown>).hashtags as Array<{ tag?: string | null }>)
          ?.map(tag => tag?.tag)
          .filter((tag): tag is string => Boolean(tag)),
      }));
  }, [participationData]);

  // Combine and sort items (with deduplication)
  const allItems = useMemo(() => {
    const combined = [...groupItems, ...eventItems];

    // Deduplicate by ID to prevent React key warnings
    const seenIds = new Set<string>();
    const deduped = combined.filter(item => {
      if (seenIds.has(item.id)) {
        return false;
      }
      seenIds.add(item.id);
      return true;
    });

    // Sort based on sortBy option
    switch (sortBy) {
      case 'popular':
        return deduped.sort((a, b) => {
          const aScore = (a.stats?.reactions || 0) + (a.stats?.comments || 0);
          const bScore = (b.stats?.reactions || 0) + (b.stats?.comments || 0);
          return bScore - aScore;
        });
      case 'trending':
        // For trending, prefer recent items with high engagement
        return deduped.sort((a, b) => {
          const aAge = Date.now() - a.createdAt.getTime();
          const bAge = Date.now() - b.createdAt.getTime();
          const aScore = (a.stats?.reactions || 0) / Math.max(aAge / 3600000, 1);
          const bScore = (b.stats?.reactions || 0) / Math.max(bAge / 3600000, 1);
          return bScore - aScore;
        });
      case 'recent':
      default:
        return deduped.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
  }, [groupItems, eventItems, sortBy]);

  // Paginate items
  const paginatedItems = useMemo(() => {
    return allItems.slice(0, (page + 1) * pageSize);
  }, [allItems, page, pageSize]);

  const loadMore = useCallback(() => {
    if (paginatedItems.length < allItems.length) {
      setPage(p => p + 1);
    }
  }, [paginatedItems.length, allItems.length]);

  const refresh = useCallback(() => {
    setPage(0);
  }, []);

  return {
    items: paginatedItems,
    isLoading: membershipLoading || participationLoading,
    error: null,
    hasMore: paginatedItems.length < allItems.length,
    loadMore,
    refresh,
    subscribedGroupIds,
  };
}
