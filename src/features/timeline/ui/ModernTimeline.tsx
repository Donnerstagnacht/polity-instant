'use client';

import { useState, useMemo, useCallback } from 'react';
import { Rss } from 'lucide-react';
import { Button } from '@/features/shared/ui/ui/button';
import { cn } from '@/features/shared/utils/utils';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useAuth } from '@/providers/auth-provider';

// Existing components
import { MasonryGrid } from './MasonryGrid';
import { TimelineHeader } from './TimelineHeader';
import { TimelineFilterPanel } from './TimelineFilterPanel';

// Hooks
import { useTimelineMode } from '../hooks/useTimelineMode';
import { useTimelineFilters, type TimelineSortOption } from '../hooks/useTimelineFilters';
import { useSubscribedTimeline, type TimelineItem } from '../hooks/useSubscribedTimeline';
import { useSubscriptionTimeline } from '../hooks/useSubscriptionTimeline';
import { useDecisionTerminal } from '@/features/decision-terminal/hooks/useDecisionTerminal';

// Decision Terminal
import { DecisionTerminal } from '@/features/decision-terminal/ui/DecisionTerminal';
import { DynamicTimelineCard, type CardType } from './LazyCardComponents';

interface ModernTimelineProps {
  className?: string;
  userId?: string;
  groupId?: string;
}

/**
 * ModernTimeline - Pinterest/Instagram-style discovery timeline
 *
 * Two modes:
 * - Following: Content from user's subscriptions
 * - Decisions: Bloomberg-style decision terminal
 */
export function ModernTimeline({ className, userId: userIdProp, groupId }: ModernTimelineProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = userIdProp || user?.id || '';

  const { mode, setMode } = useTimelineMode();
  const {
    filters,
    setSortBy,
    setContentTypes,
    toggleContentType,
    setDateRange,
    getDateCutoff,
    toggleTopic,
    setEngagement,
    resetFilters,
    activeFilterCount,
    hasActiveFilters,
  } = useTimelineFilters();
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Don't render if no user
  if (!userId) {
    return null;
  }

  // Following mode data
  const subscribedResult = useSubscribedTimeline({
    userId,
    userEmail: user?.email || undefined,
    pageSize: 20,
    sortBy: filters.sortBy === 'engagement' ? 'popular' : filters.sortBy,
  });

  const subscriptionTimeline = useSubscriptionTimeline();

  const subscriptionItems = useMemo(() => {
    if (!subscriptionTimeline.events.length) return [] as TimelineItem[];

    const getTags = (junctions?: readonly { hashtag?: { tag?: string | null } | null }[]) =>
      junctions?.map(j => j.hashtag?.tag).filter((tag): tag is string => Boolean(tag)) ?? [];
    const supportedTypes = new Set<TimelineItem['type']>([
      'group',
      'event',
      'amendment',
      'blog',
      'statement',
      'video',
      'image',
      'election',
      'vote',
      'todo',
      'action',
      'user',
    ]);

    const items = subscriptionTimeline.events.reduce<TimelineItem[]>((acc, event) => {
      const rawContentType = event.content_type || event.entity_type || undefined;
      const normalizedContentType = rawContentType === 'activity' ? 'action' : rawContentType;
      const contentType = normalizedContentType as TimelineItem['type'] | undefined;

      if (!contentType || !supportedTypes.has(contentType)) {
        return acc;
      }

      const createdAt = new Date(event.created_at);
      const stats = event.stats ? { reactions: event.stats.reactions, comments: event.stats.comments, views: event.stats.views, members: event.stats.members } as TimelineItem['stats'] : undefined;
      const amendmentTags = getTags(event.amendment?.amendment_hashtags);
      const blogTags = getTags(event.blog?.blog_hashtags);
      const userTags = getTags(event.user?.user_hashtags);
      const eventTags = getTags(event.event?.event_hashtags);
      const fallbackTags =
        amendmentTags.length > 0
          ? amendmentTags
          : blogTags.length > 0
            ? blogTags
            : userTags.length > 0
              ? userTags
              : eventTags.length > 0
                ? eventTags
                : undefined;
      const tags = event.tags ?? fallbackTags;
      const eventParticipants = event.event?.participants;
      // TODO: Removed with voting session migration
      const eventVotingSessions: never[] = [];
      const eventPositions = event.event?.event_positions;
      // TODO: Removed with voting session migration
      const scheduledElections: never[] = [];
      const eventEventId = event.event?.id;
      const agendaItems = eventEventId
        ? subscriptionTimeline.agendaItemsByEventId?.get(eventEventId)
        : undefined;

      // Extract agenda item links from election or amendment_vote_id relationships
      const linkedElection = event.election;
      const linkedAmendmentVoteId = event.amendment_vote_id;

      const agendaEventId =
        linkedElection?.agenda_item?.event?.id ||
        undefined;
      const agendaItemId =
        linkedElection?.agenda_item?.id ||
        undefined;

      acc.push({
        id: event.id,
        entityId: event.entity_id || undefined,
        type: contentType,
        eventType: event.event_type || undefined,
        title: event.title || '',
        description: event.description || undefined,
        imageUrl: event.image_url || event.video_thumbnail_url || undefined,
        videoUrl: event.video_url || undefined,
        authorId: event.actor?.id || undefined,
        authorAvatar:
          event.actor?.avatar ||
          event.user?.avatar ||
          undefined,
        groupId: event.group?.id || undefined,
        groupName: event.group?.name || undefined,
        eventId: event.event?.id || undefined,
        eventName: event.event?.title || undefined,
        startDate: event.event?.start_date ? new Date(event.event.start_date) : undefined,
        endDate: event.ends_at ? new Date(event.ends_at) : undefined,
        location:
          event.event?.location_name ||
          undefined,
        city: undefined,
        postcode: undefined,
        createdAt,
        status:
          contentType === 'vote'
            ? event.vote_status || undefined
            : contentType === 'election'
              ? event.election_status || undefined
              : undefined,
        stats,
        tags,
        attendeeCount: eventParticipants?.length,
        electionsCount:
          eventPositions?.filter(position => Boolean(position?.holders?.length)).length ||
          agendaItems?.length ||
          undefined,
        amendmentsCount:
          event.event?.agenda_items?.filter(item => Boolean(item?.amendment)).length ||
          undefined,
        eventCount: undefined,
        amendmentCount:
          event.user?.amendment_collaborations?.length,
        collaboratorCount: event.amendment?.collaborators?.length,
        supportingGroupsCount: event.amendment?.support_votes?.length,
        changeRequestCount: event.amendment?.change_requests?.length,
        commentCount: event.statement?.comment_count,
        groupCount: event.user?.group_memberships?.length,
        // Agenda item links for vote/election navigation
        agendaEventId,
        agendaItemId,
      });

      return acc;
    }, []);

    const seenIds = new Set<string>();
    return items.filter(item => {
      if (seenIds.has(item.id)) {
        return false;
      }
      seenIds.add(item.id);
      return true;
    });
  }, [subscriptionTimeline.events, subscriptionTimeline.agendaItemsByEventId]);

  // Current data - only Following mode
  const currentData = useMemo(() => {
    const useSubscriptionItems = subscriptionItems.length > 0;
    const mergedItems = useSubscriptionItems
      ? [...subscriptionItems, ...subscribedResult.items]
      : subscribedResult.items;
    const seenIds = new Set<string>();
    const dedupedItems = mergedItems.filter(item => {
      if (seenIds.has(item.id)) {
        return false;
      }
      seenIds.add(item.id);
      return true;
    });

    return {
      items: dedupedItems,
      isLoading: subscribedResult.isLoading || subscriptionTimeline.isLoading,
      refresh: subscribedResult.refresh,
      hasMore: subscribedResult.hasMore,
      loadMore: subscribedResult.loadMore,
    };
  }, [subscribedResult, subscriptionItems, subscriptionTimeline.isLoading]);

  const decisionTerminal = useDecisionTerminal({
    groupIds: groupId ? [groupId] : undefined,
  });

  const getCreatedAt = useCallback((item: TimelineItem) => {
    if (item.createdAt instanceof Date) {
      return item.createdAt;
    }
    return new Date(item.createdAt);
  }, []);

  const getEngagementScore = useCallback((item: TimelineItem) => {
    const stats = item.stats;
    return (
      (stats?.reactions ?? 0) + (stats?.comments ?? 0) + (stats?.views ?? 0) + (stats?.members ?? 0)
    );
  }, []);

  const filteredItems = useMemo(() => {
    let items = [...currentData.items];

    if (filters.contentTypes.length === 0) {
      return [] as TimelineItem[];
    }

    items = items.filter(item => filters.contentTypes.includes(item.type));

    const cutoff = getDateCutoff();
    if (cutoff) {
      items = items.filter(item => getCreatedAt(item) >= cutoff);
    }

    if (filters.topics.length > 0) {
      items = items.filter(item => {
        const tags = item.tags ?? [];
        return tags.some(tag => filters.topics.includes(tag));
      });
    }

    if (filters.engagement !== 'all') {
      items = items.filter(item => {
        const engagement = getEngagementScore(item);
        const createdAt = getCreatedAt(item);
        switch (filters.engagement) {
          case 'popular':
            return engagement > 0;
          case 'rising':
            return engagement > 0 && createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          case 'discussed':
            return (item.stats?.comments ?? 0) > 0;
          default:
            return true;
        }
      });
    }

    switch (filters.sortBy) {
      case 'engagement':
        items.sort((a, b) => getEngagementScore(b) - getEngagementScore(a));
        break;
      case 'trending':
        items.sort((a, b) => {
          const aAge = Math.max(Date.now() - getCreatedAt(a).getTime(), 1);
          const bAge = Math.max(Date.now() - getCreatedAt(b).getTime(), 1);
          const aScore = getEngagementScore(a) / (aAge / 3600000);
          const bScore = getEngagementScore(b) / (bAge / 3600000);
          return bScore - aScore;
        });
        break;
      case 'recent':
      default:
        items.sort((a, b) => getCreatedAt(b).getTime() - getCreatedAt(a).getTime());
        break;
    }

    return items;
  }, [currentData.items, filters, getCreatedAt, getDateCutoff, getEngagementScore]);

  const availableTopics = useMemo(() => {
    const topicSet = new Set<string>();
    for (const item of currentData.items) {
      for (const tag of item.tags ?? []) {
        topicSet.add(tag);
      }
    }
    return Array.from(topicSet).slice(0, 20);
  }, [currentData.items]);

  const normalizeVoteStatus = useCallback((status?: string) => {
    if (!status) return 'open';
    const normalized = status.toLowerCase();
    if (
      normalized === 'open' ||
      normalized === 'closing_soon' ||
      normalized === 'last_hour' ||
      normalized === 'final_minutes' ||
      normalized === 'passed' ||
      normalized === 'failed' ||
      normalized === 'tied'
    ) {
      return normalized as
        | 'open'
        | 'closing_soon'
        | 'last_hour'
        | 'final_minutes'
        | 'passed'
        | 'failed'
        | 'tied';
    }
    return 'open';
  }, []);

  const normalizeElectionStatus = useCallback((status?: string) => {
    if (!status) return 'voting_open';
    const normalized = status.toLowerCase();
    if (
      normalized === 'nominations_open' ||
      normalized === 'voting_open' ||
      normalized === 'closed' ||
      normalized === 'winner_announced'
    ) {
      return normalized as 'nominations_open' | 'voting_open' | 'closed' | 'winner_announced';
    }
    return 'voting_open';
  }, []);

  const normalizeAmendmentStatus = useCallback((status?: string) => {
    if (!status) return 'viewing';
    const normalized = status.toLowerCase();
    if (
      normalized === 'collaborative_editing' ||
      normalized === 'internal_suggesting' ||
      normalized === 'internal_voting' ||
      normalized === 'viewing' ||
      normalized === 'event_suggesting' ||
      normalized === 'event_voting' ||
      normalized === 'passed' ||
      normalized === 'rejected'
    ) {
      return normalized as
        | 'collaborative_editing'
        | 'internal_suggesting'
        | 'internal_voting'
        | 'viewing'
        | 'event_suggesting'
        | 'event_voting'
        | 'passed'
        | 'rejected';
    }
    return 'viewing';
  }, []);

  const normalizeActionType = useCallback((eventType?: string) => {
    switch (eventType) {
      case 'member_added':
        return 'user_joined_group' as const;
      case 'vote_started':
      case 'vote_opened':
        return 'vote_started' as const;
      case 'election_nominations_open':
      case 'election_voting_open':
        return 'election_started' as const;
      case 'created':
        return 'group_created' as const;
      case 'status_changed':
        return 'member_promoted' as const;
      default:
        return 'group_created' as const;
    }
  }, []);

  const renderTimelineCard = useCallback(
    (item: TimelineItem) => {
      const memberCount =
        'memberCount' in item
          ? item.memberCount
          : 'members' in (item.stats ?? {})
            ? item.stats?.members
            : undefined;
      const entityId = 'entityId' in item ? item.entityId : undefined;
      const eventId = 'eventId' in item ? item.eventId : undefined;
      const status = 'status' in item ? item.status : undefined;
      const updatedAt = 'updatedAt' in item ? item.updatedAt : undefined;

      let cardType: CardType | null = item.type;
      let cardProps: Record<string, unknown> | null = null;

      switch (item.type) {
        case 'group':
          cardProps = {
            group: {
              id: item.groupId ?? entityId ?? item.id,
              name: item.title,
              description: item.description,
              memberCount,
              topics: item.tags,
              eventCount: item.eventCount,
              amendmentCount: item.amendmentCount,
              isFollowing: mode === 'subscribed',
            },
          };
          break;
        case 'event':
          cardProps = {
            event: {
              id: eventId ?? entityId ?? item.id,
              title: item.title,
              description: item.description,
              startDate: item.startDate ?? item.createdAt,
              endDate: item.endDate,
              location: item.location,
              city: item.city,
              postcode: item.postcode,
              attendeeCount: item.attendeeCount,
              electionsCount: item.electionsCount,
              amendmentsCount: item.amendmentsCount,
              hashtags: (item.tags ?? []).map(tag => ({ id: tag, tag })),
              organizerName: item.groupName || item.authorName,
              isAttending: mode === 'subscribed',
            },
          };
          break;
        case 'amendment':
          cardProps = {
            amendment: {
              id: entityId ?? item.id,
              title: item.title,
              description: item.description,
              status: normalizeAmendmentStatus(status),
              groupName: item.groupName,
              collaboratorCount: item.collaboratorCount,
              supportingGroupsCount: item.supportingGroupsCount,
              changeRequestCount: item.changeRequestCount,
              hashtags: (item.tags ?? []).map(tag => ({ id: tag, tag })),
            },
          };
          break;
        case 'blog':
          cardProps = {
            blog: {
              id: entityId ?? item.id,
              title: item.title,
              excerpt: item.description,
              coverImageUrl: item.imageUrl,
              authorName: item.authorName,
              authorAvatar: item.authorAvatar,
              authorId: item.authorId,
              groupId: item.groupId,
              hashtags: (item.tags ?? []).map(tag => ({ id: tag, tag })),
              publishedAt: item.createdAt,
              commentCount: item.commentCount ?? item.stats?.comments,
            },
          };
          break;
        case 'statement':
          cardProps = {
            statement: {
              id: item.id,
              content: item.description || item.title,
              authorName: item.authorName || item.authorId || '',
              authorAvatar: item.authorAvatar,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl,
              groupName: item.groupName,
              groupId: item.groupId,
              supportCount: item.stats?.reactions,
              commentCount: item.commentCount ?? item.stats?.comments,
              hashtags: (item.tags ?? []).map(tag => ({ id: tag, tag })),
            },
          };
          break;
        case 'todo':
          cardProps = {
            todo: {
              id: entityId ?? item.id,
              title: item.title,
              description: item.description,
              groupId: item.groupId,
              groupName: item.groupName,
              status: item.status,
            },
          };
          break;
        case 'video':
          cardProps = {
            video: {
              id: item.id,
              title: item.title,
              thumbnailUrl: item.imageUrl,
              videoUrl: item.videoUrl,
              views: item.stats?.views,
              likes: item.stats?.reactions,
              authorName: item.authorName,
              authorAvatar: item.authorAvatar,
              sourceName: item.groupName,
              sourceType: item.groupId ? 'group' : undefined,
              sourceId: item.groupId,
            },
          };
          break;
        case 'image':
          if (!item.imageUrl) {
            cardType = null;
            break;
          }
          cardProps = {
            image: {
              id: item.id,
              imageUrl: item.imageUrl,
              caption: item.description,
              likes: item.stats?.reactions,
              comments: item.stats?.comments,
              authorName: item.authorName,
              authorAvatar: item.authorAvatar,
              sourceName: item.groupName,
              sourceType: item.groupId ? 'group' : undefined,
              sourceId: item.groupId,
            },
          };
          break;
        case 'vote':
          {
            const supportCount = item.stats?.reactions ?? 0;
            const opposeCount = item.stats?.comments ?? 0;
            const totalVotes = supportCount + opposeCount;
            const supportPercentage =
              totalVotes > 0 ? Math.round((supportCount / totalVotes) * 100) : 0;

            cardProps = {
              vote: {
                id: entityId ?? item.id,
                amendmentId: entityId ?? item.id,
                amendmentTitle: item.title,
                question: item.description,
                status: normalizeVoteStatus(status),
                endTime: item.endDate ?? updatedAt ?? item.createdAt,
                supportPercentage,
                supportCount,
                opposeCount,
                agendaEventId: item.agendaEventId,
                agendaItemId: item.agendaItemId,
              },
            };
          }
          break;
        case 'election':
          cardProps = {
            election: {
              id: entityId ?? item.id,
              title: item.title,
              positionName: item.title,
              groupId: item.groupId,
              groupName: item.groupName,
              status: normalizeElectionStatus(status),
              candidates: [],
              totalCandidates: 0,
              agendaEventId: item.agendaEventId,
              agendaItemId: item.agendaItemId,
            },
          };
          break;
        case 'action':
          cardProps = {
            action: {
              id: item.id,
              type: normalizeActionType('eventType' in item ? item.eventType : undefined),
              actors: [
                {
                  id: item.authorId || item.id,
                  name:
                    item.authorName ||
                    t('common.labels.unknownUser', { defaultValue: 'Unknown User' }),
                  avatarUrl: item.authorAvatar,
                },
              ],
              sourceEntity:
                item.groupId && item.groupName
                  ? {
                      id: item.groupId,
                      type: 'group',
                      name: item.groupName,
                      url: `/group/${item.groupId}`,
                    }
                  : undefined,
              timestamp: item.createdAt,
            },
          };
          break;
        case 'user':
          cardProps = {
            user: {
              id: item.authorId || item.id,
              name: item.authorName || item.title,
              handle: item.handle,
              bio: item.description,
              subtitle: item.subtitle,
              avatarUrl: item.authorAvatar,
              location: item.location,
              groupCount: item.groupCount,
              amendmentCount: item.amendmentCount,
              hashtags: (item.tags ?? []).map(tag => ({ id: tag, tag })),
            },
          };
          break;
        default:
          cardType = null;
      }

      if (!cardType || !cardProps) {
        return null;
      }

      return <DynamicTimelineCard cardType={cardType} cardProps={cardProps} />;
    },
    [
      mode,
      normalizeActionType,
      normalizeAmendmentStatus,
      normalizeElectionStatus,
      normalizeVoteStatus,
      t,
    ]
  );

  // Handle sort change
  const handleSortChange = useCallback(
    (sort: TimelineSortOption) => {
      setSortBy(sort);
    },
    [setSortBy]
  );

  // Decision Terminal mode
  if (mode === 'decisions') {
    return (
      <div className={cn('space-y-4', className)}>
        <TimelineHeader
          mode={mode}
          onModeChange={setMode}
          sortBy={filters.sortBy}
          onSortChange={handleSortChange}
        />
        <DecisionTerminal
          decisions={decisionTerminal.decisions}
          isLoading={decisionTerminal.isLoading}
        />
      </div>
    );
  }

  // Empty state for Following mode
  if (mode === 'subscribed' && !currentData.isLoading && filteredItems.length === 0) {
    return (
      <div className={cn('space-y-4', className)}>
        <TimelineHeader
          mode={mode}
          onModeChange={setMode}
          sortBy={filters.sortBy}
          onSortChange={handleSortChange}
          onFilterClick={() => setShowFilterPanel(!showFilterPanel)}
          activeFilterCount={activeFilterCount}
        />

        {showFilterPanel && (
          <TimelineFilterPanel
            open={showFilterPanel}
            onClose={() => setShowFilterPanel(false)}
            contentTypes={filters.contentTypes}
            onContentTypesChange={setContentTypes}
            onContentTypeToggle={toggleContentType}
            dateRange={filters.dateRange}
            onDateRangeChange={setDateRange}
            topics={filters.topics}
            availableTopics={availableTopics}
            onTopicToggle={toggleTopic}
            engagement={filters.engagement}
            onEngagementChange={setEngagement}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="bg-muted mb-4 rounded-full p-4">
            <Rss className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="mb-2 text-lg font-semibold">{t('features.timeline.empty.title')}</h3>
          <p className="text-muted-foreground mb-4">{t('features.timeline.emptyTimelineHint')}</p>
          <Button variant="outline" asChild>
            <a href="/search">{t('features.timeline.discoverContent')}</a>
          </Button>
        </div>
      </div>
    );
  }

  // Following mode with masonry grid
  return (
    <div className={cn('space-y-4', className)}>
      <TimelineHeader
        mode={mode}
        onModeChange={setMode}
        sortBy={filters.sortBy}
        onSortChange={handleSortChange}
        onFilterClick={() => setShowFilterPanel(!showFilterPanel)}
        activeFilterCount={activeFilterCount}
      />

      {showFilterPanel && (
        <TimelineFilterPanel
          open={showFilterPanel}
          onClose={() => setShowFilterPanel(false)}
          contentTypes={filters.contentTypes}
          onContentTypesChange={setContentTypes}
          onContentTypeToggle={toggleContentType}
          dateRange={filters.dateRange}
          onDateRangeChange={setDateRange}
          topics={filters.topics}
          availableTopics={availableTopics}
          onTopicToggle={toggleTopic}
          engagement={filters.engagement}
          onEngagementChange={setEngagement}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      <MasonryGrid
        items={filteredItems}
        renderItem={renderTimelineCard}
        keyExtractor={item => item.id}
        isLoading={currentData.isLoading}
        hasMore={currentData.hasMore}
        onLoadMore={currentData.loadMore}
      />
    </div>
  );
}
