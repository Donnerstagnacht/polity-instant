import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ALL_CONTENT_TYPES,
  type DateRangeFilter,
  type EngagementFilter,
  type TimelineSortOption,
} from '@/features/timeline/hooks/useTimelineFilters';
import { type ContentType } from '@/features/timeline/constants/content-type-config';

export function useSearchURL() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters
  const queryParam = searchParams.get('q') || '';
  const typesParam = searchParams.get('types') || '';
  const rangeParam = (searchParams.get('range') || 'all') as DateRangeFilter;
  const topicsParam = searchParams.get('topics') || '';
  const engagementParam = (searchParams.get('engagement') || 'all') as EngagementFilter;
  const sortParam = (searchParams.get('sort') || 'recent') as TimelineSortOption;

  const parsedContentTypes = useMemo<ContentType[]>(() => {
    if (!typesParam) return [...ALL_CONTENT_TYPES];
    const parts = typesParam
      .split(',')
      .map(type => type.trim())
      .filter(Boolean);
    const validTypes = parts.filter(type => ALL_CONTENT_TYPES.includes(type as ContentType));
    return validTypes.length > 0 ? (validTypes as ContentType[]) : [...ALL_CONTENT_TYPES];
  }, [typesParam]);

  const parsedTopics = useMemo(() => {
    if (!topicsParam) return [] as string[];
    return topicsParam
      .split(',')
      .map(topic => topic.trim())
      .filter(Boolean);
  }, [topicsParam]);

  const parsedDateRange: DateRangeFilter =
    rangeParam === 'today' ||
    rangeParam === 'week' ||
    rangeParam === 'month' ||
    rangeParam === 'year'
      ? rangeParam
      : 'all';

  const parsedEngagement: EngagementFilter =
    engagementParam === 'popular' || engagementParam === 'rising' || engagementParam === 'discussed'
      ? engagementParam
      : 'all';

  const parsedSort: TimelineSortOption =
    sortParam === 'trending' || sortParam === 'engagement' ? sortParam : 'recent';

  // Local state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [contentTypes, setContentTypes] = useState<ContentType[]>(parsedContentTypes);
  const [dateRange, setDateRange] = useState<DateRangeFilter>(parsedDateRange);
  const [topics, setTopics] = useState<string[]>(parsedTopics);
  const [engagement, setEngagement] = useState<EngagementFilter>(parsedEngagement);
  const [sortBy, setSortBy] = useState<TimelineSortOption>(parsedSort);

  // Update URL when search parameters change
  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  // Type-ahead search: Update URL as user types (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      const allTypesSelected = contentTypes.length === ALL_CONTENT_TYPES.length;
      updateURL({
        q: searchQuery,
        types: allTypesSelected ? '' : contentTypes.join(','),
        range: dateRange !== 'all' ? dateRange : '',
        topics: topics.length > 0 ? topics.join(',') : '',
        engagement: engagement !== 'all' ? engagement : '',
        sort: sortBy !== 'recent' ? sortBy : '',
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, contentTypes, dateRange, topics, engagement, sortBy]);

  return {
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
  };
}
