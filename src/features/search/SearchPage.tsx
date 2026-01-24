import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { useSearchURL } from './hooks/useSearchURL';
import { useSearchData } from './hooks/useSearchData';
import { useSearchFilters } from './hooks/useSearchFilters';
import { SearchHeader } from './ui/SearchHeader';
import { MasonryGrid } from '@/features/timeline/ui/MasonryGrid';
import { TimelineFilterPanel } from '@/features/timeline/ui/TimelineFilterPanel';
import { DynamicTimelineCard, type CardType } from '@/features/timeline/ui/LazyCardComponents';
import { ALL_CONTENT_TYPES } from '@/features/timeline/hooks/useTimelineFilters';
import { type ContentType } from '@/features/timeline/constants/content-type-config';

export function SearchPage() {
  const { t } = useTranslation();
  const {
    searchQuery,
    setSearchQuery,
    contentTypes,
    setContentTypes,
    dateRange,
    setDateRange,
    topics,
    setTopics,
    engagement,
    setEngagement,
    sortBy,
    setSortBy,
  } = useSearchURL();

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useSearchData();

  const agendaItemsByEventId = useMemo(() => {
    const map = new Map<string, Array<{ election?: unknown; amendmentVote?: unknown }>>();
    for (const item of data?.agendaItems ?? []) {
      const eventId = (item as any).event?.id as string | undefined;
      if (!eventId) continue;
      const list = map.get(eventId) ?? [];
      list.push(item as any);
      map.set(eventId, list);
    }
    return map;
  }, [data?.agendaItems]);

  const { mosaicResults } = useSearchFilters(data, {
    query: searchQuery,
    sortBy,
    topics,
  });

  const toggleContentType = useCallback(
    (type: ContentType) => {
      setContentTypes(prev =>
        prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type]
      );
    },
    [setContentTypes]
  );

  const toggleTopic = useCallback(
    (topic: string) => {
      setTopics(prev =>
        prev.includes(topic) ? prev.filter(item => item !== topic) : [...prev, topic]
      );
    },
    [setTopics]
  );

  const resetFilters = useCallback(() => {
    setContentTypes([...ALL_CONTENT_TYPES]);
    setDateRange('all');
    setTopics([]);
    setEngagement('all');
    setSortBy('recent');
  }, [setContentTypes, setDateRange, setTopics, setEngagement, setSortBy]);

  const hasActiveFilters = useMemo(() => {
    return (
      contentTypes.length !== ALL_CONTENT_TYPES.length ||
      dateRange !== 'all' ||
      topics.length > 0 ||
      engagement !== 'all' ||
      searchQuery.length > 0
    );
  }, [contentTypes.length, dateRange, engagement, searchQuery.length, topics.length]);

  const getDateCutoff = useCallback((): Date | null => {
    const now = new Date();
    switch (dateRange) {
      case 'today':
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      case 'all':
      default:
        return null;
    }
  }, [dateRange]);

  type SearchContentItem = {
    id: string;
    type: ContentType;
    title: string;
    description?: string;
    imageUrl?: string;
    videoUrl?: string;
    authorId?: string;
    authorName?: string;
    authorAvatar?: string;
    handle?: string;
    subtitle?: string;
    groupId?: string;
    groupName?: string;
    eventId?: string;
    eventName?: string;
    startDate?: Date;
    endDate?: Date;
    location?: string;
    city?: string;
    postcode?: string;
    createdAt: Date;
    updatedAt?: Date;
    status?: string;
    dueDate?: Date;
    isCompleted?: boolean;
    assigneeCount?: number;
    tags?: string[];
    memberCount?: number;
    eventCount?: number;
    attendeeCount?: number;
    electionsCount?: number;
    amendmentsCount?: number;
    groupCount?: number;
    amendmentCount?: number;
    collaboratorCount?: number;
    supportingGroupsCount?: number;
    changeRequestCount?: number;
    commentCount?: number;
    votingType?: string;
    phase?: string;
    result?: string;
    candidates?: any[];
    totalCandidates?: number;
    stats?: {
      reactions?: number;
      comments?: number;
      views?: number;
      members?: number;
    };
  };

  const toTags = (hashtags?: Array<{ tag?: string | null }>) => {
    if (!hashtags) return [] as string[];
    return hashtags.map(tag => tag?.tag).filter((tag): tag is string => Boolean(tag));
  };

  const toDate = (value?: string | Date | null) => {
    if (!value) return new Date();
    return value instanceof Date ? value : new Date(value);
  };

  const contentItems = useMemo<SearchContentItem[]>(() => {
    if (!mosaicResults || mosaicResults.length === 0) return [];

    return mosaicResults.reduce<SearchContentItem[]>((acc, item: any) => {
      switch (item._type) {
        case 'group':
          acc.push({
            id: item.id,
            type: 'group',
            title: item.name,
            description: item.description,
            createdAt: toDate(item.createdAt),
            tags: toTags(item.hashtags),
            groupId: item.id,
            groupName: item.name,
            memberCount: item.memberCount ?? item.memberships?.length,
            eventCount: item.events?.length,
            amendmentCount: item.amendments?.length,
            stats: {
              members: item.memberCount ?? item.memberships?.length,
            },
          });
          break;
        case 'event':
          acc.push({
            id: item.id,
            type: 'event',
            title: item.title,
            description: item.description,
            createdAt: toDate(item.createdAt || item.startDate),
            startDate: item.startDate ? new Date(item.startDate) : undefined,
            endDate: item.endDate ? new Date(item.endDate) : undefined,
            location: item.location || item.locationName,
            city: item.city,
            postcode: item.postalCode,
            attendeeCount: item.participants?.length,
            electionsCount:
              item.eventPositions?.filter((position: any) => Boolean(position?.election)).length ??
              item.scheduledElections?.length ??
              agendaItemsByEventId
                .get(item.id)
                ?.filter((agendaItem: any) => Boolean(agendaItem?.election)).length ??
              item.votingSessions?.filter((session: any) => Boolean(session?.election)).length,
            amendmentsCount: item.targetedAmendments?.length,
            tags: toTags(item.hashtags),
            groupId: item.group?.id,
            groupName: item.group?.name,
            stats: {
              members: item.participants?.length,
            },
          });
          break;
        case 'amendment':
          acc.push({
            id: item.id,
            type: 'amendment',
            title: item.title,
            description: item.subtitle || item.description,
            createdAt: toDate(item.createdAt),
            tags: toTags(item.hashtags),
            status: item.workflowStatus || item.status,
            groupId: item.groups?.[0]?.id,
            groupName: item.groups?.[0]?.name,
            collaboratorCount: item.amendmentRoleCollaborators?.length,
            supportingGroupsCount: item.groupSupporters?.length,
            changeRequestCount: item.changeRequests?.length,
            stats: {
              reactions: item.votes?.length,
              comments: item.comments?.length,
            },
          });
          break;
        case 'blog':
          const blogAuthor = (item.blogRoleBloggers || [])
            .map((relation: any) => relation?.user)
            .find(Boolean);
          acc.push({
            id: item.id,
            type: 'blog',
            title: item.title,
            description: item.description,
            imageUrl: item.imageURL || item.imageUrl,
            createdAt: toDate(item.createdAt),
            tags: toTags(item.hashtags),
            authorId: blogAuthor?.id,
            authorName: blogAuthor?.name,
            authorAvatar: blogAuthor?.avatarUrl,
            commentCount: item.comments?.length,
            stats: {
              reactions: item.votes?.length,
              comments: item.comments?.length,
            },
          });
          break;
        case 'statement':
          acc.push({
            id: item.id,
            type: 'statement',
            title: item.text,
            description: item.text,
            createdAt: toDate(item.createdAt),
            tags: toTags(item.hashtags),
            authorId: item.user?.id,
            authorName: item.user?.name,
            authorAvatar: item.user?.avatarUrl,
            groupName: item.tag || item.type,
            stats: {
              comments: item.comments?.length,
              reactions: item.reactions?.length,
            },
          });
          break;
        case 'todo':
          acc.push({
            id: item.id,
            type: 'todo',
            title: item.title,
            description: item.description,
            createdAt: toDate(item.createdAt),
            updatedAt: item.updatedAt ? toDate(item.updatedAt) : undefined,
            dueDate: item.dueDate ? toDate(item.dueDate) : undefined,
            isCompleted: item.status === 'completed',
            groupId: item.group?.id,
            groupName: item.group?.name,
            authorId: item.creator?.id,
            authorName: item.creator?.name,
            authorAvatar: item.creator?.avatarUrl,
            assigneeCount: item.assignments?.length,
            tags: Array.isArray(item.tags) ? item.tags : [],
          });
          break;
        case 'user':
          acc.push({
            id: item.id,
            type: 'user',
            title: item.name || '',
            description: item.bio,
            createdAt: toDate(item.createdAt || item.joinedAt),
            tags: toTags(item.hashtags),
            authorId: item.id,
            authorName: item.name,
            authorAvatar: item.imageURL || item.avatarUrl,
            handle: item.handle,
            subtitle: item.subtitle,
            location: item.contactLocation,
            groupCount: item.memberships?.length,
            amendmentCount: item.collaborations?.length,
          });
          break;
        case 'election':
          acc.push({
            id: item.id,
            type: 'election',
            title: item.title || '',
            description: item.description,
            createdAt: toDate(item.createdAt),
            updatedAt: item.updatedAt ? toDate(item.updatedAt) : undefined,
            status: item.status,
            groupId: item.position?.group?.id,
            groupName: item.position?.group?.name,
            startDate: item.votingStartTime ? toDate(item.votingStartTime) : undefined,
            endDate: item.votingEndTime ? toDate(item.votingEndTime) : undefined,
            candidates: item.candidates || [],
            totalCandidates: item.candidates?.length || 0,
          });
          break;
        case 'vote':
          acc.push({
            id: item.id,
            type: 'vote',
            title: item.event?.title || item.votingType || 'Vote',
            description: item.targetEntityType
              ? `${item.votingType} - ${item.targetEntityType}`
              : undefined,
            createdAt: toDate(item.createdAt),
            eventId: item.event?.id,
            eventName: item.event?.title,
            status: item.phase,
            votingType: item.votingType,
            phase: item.phase,
            result: item.result,
            stats: {
              reactions: item.votes?.filter((v: any) => v.vote === 'accept')?.length || 0,
              comments: item.votes?.filter((v: any) => v.vote === 'reject')?.length || 0,
            },
          });
          break;
        case 'video':
          acc.push({
            id: item.id,
            type: 'video',
            title: item.title || '',
            description: item.description,
            imageUrl: item.videoThumbnailURL || item.imageURL,
            videoUrl: item.videoURL,
            createdAt: toDate(item.createdAt),
            authorId: item.actor?.id,
            authorName: item.actor?.name,
            authorAvatar: item.actor?.avatarUrl,
            groupId: item.group?.id,
            groupName: item.group?.name,
            stats: {
              views: item.views,
              reactions: item.likes,
            },
          });
          break;
        case 'image':
          acc.push({
            id: item.id,
            type: 'image',
            title: item.title || '',
            description: item.description,
            imageUrl: item.imageURL,
            createdAt: toDate(item.createdAt),
            authorId: item.actor?.id,
            authorName: item.actor?.name,
            authorAvatar: item.actor?.avatarUrl,
            groupId: item.group?.id,
            groupName: item.group?.name,
            location: item.location,
            stats: {
              reactions: item.likes,
              comments: item.comments,
            },
          });
          break;
        default:
          break;
      }

      return acc;
    }, []);
  }, [agendaItemsByEventId, mosaicResults]);

  const getCreatedAt = useCallback((item: SearchContentItem) => {
    return item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
  }, []);

  const getEngagementScore = useCallback((item: SearchContentItem) => {
    const stats = item.stats;
    return (
      (stats?.reactions ?? 0) + (stats?.comments ?? 0) + (stats?.views ?? 0) + (stats?.members ?? 0)
    );
  }, []);

  const filteredItems = useMemo(() => {
    let items = [...contentItems];

    if (contentTypes.length === 0) {
      return [] as SearchContentItem[];
    }

    items = items.filter(item => contentTypes.includes(item.type));

    const cutoff = getDateCutoff();
    if (cutoff) {
      items = items.filter(item => getCreatedAt(item) >= cutoff);
    }

    if (topics.length > 0) {
      items = items.filter(item => {
        const tags = item.tags ?? [];
        return tags.some(tag => topics.includes(tag));
      });
    }

    if (engagement !== 'all') {
      items = items.filter(item => {
        const score = getEngagementScore(item);
        const createdAt = getCreatedAt(item);
        switch (engagement) {
          case 'popular':
            return score > 0;
          case 'rising':
            return score > 0 && createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          case 'discussed':
            return (item.stats?.comments ?? 0) > 0;
          default:
            return true;
        }
      });
    }

    switch (sortBy) {
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
  }, [
    contentItems,
    contentTypes,
    engagement,
    getCreatedAt,
    getDateCutoff,
    getEngagementScore,
    sortBy,
    topics,
  ]);

  const availableTopics = useMemo(() => {
    const topicSet = new Set<string>();
    for (const item of contentItems) {
      for (const tag of item.tags ?? []) {
        topicSet.add(tag);
      }
    }
    return Array.from(topicSet).slice(0, 20);
  }, [contentItems]);

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

  const renderTimelineCard = useCallback(
    (item: SearchContentItem) => {
      let cardType: CardType | null = item.type;
      let cardProps: Record<string, unknown> | null = null;

      switch (item.type) {
        case 'group':
          cardProps = {
            group: {
              id: item.groupId ?? item.id,
              name: item.title,
              description: item.description,
              memberCount: item.memberCount ?? item.stats?.members,
              eventCount: item.eventCount,
              amendmentCount: item.amendmentCount,
              topics: item.tags,
              isFollowing: false,
            },
          };
          break;
        case 'event':
          cardProps = {
            event: {
              id: item.eventId ?? item.id,
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
              isAttending: false,
            },
          };
          break;
        case 'amendment':
          cardProps = {
            amendment: {
              id: item.id,
              title: item.title,
              description: item.description,
              status: normalizeAmendmentStatus(item.status),
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
              id: item.id,
              title: item.title,
              excerpt: item.description,
              coverImageUrl: item.imageUrl,
              authorName: item.authorName,
              authorAvatar: item.authorAvatar,
              publishedAt: item.createdAt,
              hashtags: (item.tags ?? []).map(tag => ({ id: tag, tag })),
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
              authorTitle: item.groupName,
              authorAvatar: item.authorAvatar,
              commentCount: item.stats?.comments,
            },
          };
          break;
        case 'todo':
          cardProps = {
            todo: {
              id: item.id,
              title: item.title,
              description: item.description,
              isCompleted: item.isCompleted,
              dueDate: item.dueDate,
              assigneeCount: item.assigneeCount,
              groupName: item.groupName,
              groupId: item.groupId,
            },
          };
          break;
        case 'user':
          cardProps = {
            user: {
              id: item.id,
              name: item.title,
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
        case 'vote':
          {
            const supportCount = item.stats?.reactions ?? 0;
            const opposeCount = item.stats?.comments ?? 0;
            const totalVotes = supportCount + opposeCount;
            const supportPercentage =
              totalVotes > 0 ? Math.round((supportCount / totalVotes) * 100) : 0;

            cardProps = {
              vote: {
                id: item.id,
                amendmentId: item.id,
                amendmentTitle: item.title,
                question: item.description,
                status: normalizeVoteStatus(item.status),
                endTime: item.endDate ?? item.updatedAt ?? item.createdAt,
                supportPercentage,
                supportCount,
                opposeCount,
              },
            };
          }
          break;
        case 'election':
          cardProps = {
            election: {
              id: item.id,
              title: item.title,
              positionName: item.title,
              groupId: item.groupId,
              groupName: item.groupName,
              status: normalizeElectionStatus(item.status),
              candidates: item.candidates || [],
              totalCandidates: item.totalCandidates || 0,
              votingEndDate: item.endDate,
            },
          };
          break;
        case 'video':
          cardProps = {
            video: {
              id: item.id,
              title: item.title,
              thumbnailUrl: item.imageUrl,
              views: item.stats?.views,
              likes: item.stats?.reactions,
              authorName: item.authorName,
              authorAvatar: item.authorAvatar,
              sourceName: item.groupName,
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
              location: item.location,
              likes: item.stats?.reactions,
              comments: item.stats?.comments,
              authorName: item.authorName,
              authorAvatar: item.authorAvatar,
              sourceName: item.groupName,
            },
          };
          break;
        case 'action':
          cardProps = {
            action: {
              id: item.id,
              type: 'user_joined_group' as const,
              actors: [
                {
                  id: item.authorId || item.id,
                  name:
                    item.authorName ||
                    t('common.labels.unknownUser', { defaultValue: 'Unknown User' }),
                  avatarUrl: item.authorAvatar,
                },
              ],
              sourceEntity: item.authorId
                ? {
                    id: item.authorId,
                    type: 'user' as const,
                    name:
                      item.authorName ||
                      t('common.labels.unknownUser', { defaultValue: 'Unknown User' }),
                    url: `/user/${item.authorId}`,
                  }
                : undefined,
              timestamp: item.createdAt,
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
    [normalizeAmendmentStatus, normalizeVoteStatus, normalizeElectionStatus, t]
  );

  return (
    <>
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeTopics={topics}
        onTopicRemove={toggleTopic}
        totalResults={filteredItems.length}
        queryParam={searchQuery}
      />

      {showFilters && (
        <TimelineFilterPanel
          open={showFilters}
          onClose={() => setShowFilters(false)}
          contentTypes={contentTypes}
          onContentTypesChange={setContentTypes}
          onContentTypeToggle={toggleContentType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          topics={topics}
          availableTopics={availableTopics}
          onTopicToggle={toggleTopic}
          engagement={engagement}
          onEngagementChange={setEngagement}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {isLoading && contentItems.length === 0 ? (
        <MasonryGrid
          items={[]}
          renderItem={renderTimelineCard}
          keyExtractor={item => item.id}
          isLoading={true}
        />
      ) : (
        <MasonryGrid
          items={filteredItems}
          renderItem={renderTimelineCard}
          keyExtractor={item => item.id}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
