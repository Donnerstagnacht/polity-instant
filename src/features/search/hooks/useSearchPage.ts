import { useCallback, useMemo, useState } from 'react';
import { useSearchURL } from './useSearchURL';
import { useSearchData } from './useSearchData';
import { useSearchFilters } from './useSearchFilters';
import { mapMosaicToContentItems } from '../logic/searchMappers';
import {
  filterAndSortContentItems,
  collectAvailableTopics,
  buildAgendaItemsByEventId,
  hasActiveFilters as checkActiveFilters,
} from '../logic/searchFiltering';
import {
  normalizeAmendmentStatus,
  normalizeVoteStatus,
  normalizeElectionStatus,
} from '../logic/searchNormalizers';
import { ALL_CONTENT_TYPES } from '@/features/timeline/hooks/useTimelineFilters';
import type { ContentType } from '@/features/timeline/constants/content-type-config';
import type { SearchContentItem } from '../types/search.types';
import type { CardType } from '@/features/timeline/ui/LazyCardComponents';

export function useSearchPage() {
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

  const agendaItemsByEventId = useMemo(
    () => buildAgendaItemsByEventId(data?.agendaItems ?? []),
    [data?.agendaItems],
  );

  const { mosaicResults } = useSearchFilters(data, {
    query: searchQuery,
    sortBy,
    topics,
  });

  const toggleContentType = useCallback(
    (type: ContentType) => {
      setContentTypes(prev =>
        prev.includes(type) ? prev.filter(item => item !== type) : [...prev, type],
      );
    },
    [setContentTypes],
  );

  const toggleTopic = useCallback(
    (topic: string) => {
      setTopics(prev =>
        prev.includes(topic) ? prev.filter(item => item !== topic) : [...prev, topic],
      );
    },
    [setTopics],
  );

  const resetFilters = useCallback(() => {
    setContentTypes([...ALL_CONTENT_TYPES]);
    setDateRange('all');
    setTopics([]);
    setEngagement('all');
    setSortBy('recent');
  }, [setContentTypes, setDateRange, setTopics, setEngagement, setSortBy]);

  const contentItems = useMemo(
    () => mapMosaicToContentItems(mosaicResults, agendaItemsByEventId),
    [mosaicResults, agendaItemsByEventId],
  );

  const filteredItems = useMemo(
    () => filterAndSortContentItems(contentItems, { contentTypes, dateRange, topics, engagement, sortBy }),
    [contentItems, contentTypes, dateRange, topics, engagement, sortBy],
  );

  const availableTopics = useMemo(
    () => collectAvailableTopics(contentItems),
    [contentItems],
  );

  const hasActiveFiltersMemo = useMemo(
    () => checkActiveFilters(contentTypes, ALL_CONTENT_TYPES.length, dateRange, topics, engagement, searchQuery),
    [contentTypes, dateRange, topics, engagement, searchQuery],
  );

  const buildCardProps = useCallback(
    (item: SearchContentItem, t: (key: string, opts?: any) => string): { cardType: CardType | null; cardProps: Record<string, unknown> | null } => {
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
              authorAvatar: item.authorAvatar,
              imageUrl: item.imageUrl,
              videoUrl: item.videoUrl,
              groupName: item.groupName,
              groupAvatar: item.groupImageUrl,
              groupId: item.groupId,
              supportCount: item.upvotes ?? 0,
              opposeCount: item.downvotes ?? 0,
              commentCount: item.commentCount ?? item.stats?.comments,
              surveyQuestion: item.surveyQuestion,
              surveyOptions: item.surveyOptions,
              hashtags: (item.tags ?? []).map(tag => ({ id: tag, tag })),
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
        case 'vote': {
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
              agendaEventId: item.agendaEventId,
              agendaItemId: item.agendaItemId,
            },
          };
          break;
        }
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
              agendaEventId: item.agendaEventId,
              agendaItemId: item.agendaItemId,
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

      return { cardType, cardProps };
    },
    [],
  );

  return {
    // URL state
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

    // UI state
    showFilters,
    setShowFilters,

    // Data
    isLoading,
    contentItems,
    filteredItems,
    availableTopics,

    // Derived
    hasActiveFilters: hasActiveFiltersMemo,

    // Handlers
    toggleContentType,
    toggleTopic,
    resetFilters,
    buildCardProps,
  };
}
