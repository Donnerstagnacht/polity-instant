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
    createdAt: Date;
    updatedAt?: Date;
    status?: string;
    dueDate?: Date;
    isCompleted?: boolean;
    assigneeCount?: number;
    tags?: string[];
    memberCount?: number;
    attendeeCount?: number;
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
            tags: toTags(item.hashtags),
            groupId: item.group?.id,
            groupName: item.group?.name,
            attendeeCount: item.participants?.length,
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
            type: 'action',
            title: item.name,
            description: item.bio,
            createdAt: toDate(item.createdAt || item.joinedAt),
            tags: toTags(item.hashtags),
            authorId: item.id,
            authorName: item.name,
            authorAvatar: item.avatarUrl,
          });
          break;
        default:
          break;
      }

      return acc;
    }, []);
  }, [mosaicResults]);

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
              attendeeCount: item.attendeeCount,
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
    [normalizeAmendmentStatus, t]
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
