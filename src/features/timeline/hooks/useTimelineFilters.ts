'use client';

import { useState, useCallback, useMemo } from 'react';
import { ContentType } from '../constants/content-type-config';

/**
 * Date range filter options
 */
export type DateRangeFilter = 'all' | 'today' | 'week' | 'month' | 'year';

/**
 * Sort options for timeline
 */
export type TimelineSortOption = 'recent' | 'trending' | 'engagement';

/**
 * Engagement level filter
 */
export type EngagementFilter = 'all' | 'popular' | 'rising' | 'discussed';

/**
 * Timeline filter state
 */
export interface TimelineFilters {
  /** Selected content types to show (empty = none) */
  contentTypes: ContentType[];
  /** Date range filter */
  dateRange: DateRangeFilter;
  /** Topic/tag filters */
  topics: string[];
  /** Engagement level filter */
  engagement: EngagementFilter;
  /** Sort option */
  sortBy: TimelineSortOption;
  /** Search query */
  searchQuery: string;
}

/**
 * All available content types for filtering
 */
export const ALL_CONTENT_TYPES: ContentType[] = [
  'group',
  'event',
  'amendment',
  'vote',
  'election',
  'video',
  'image',
  'statement',
  'todo',
  'blog',
  'action',
  'user',
];

/**
 * Default filter state
 */
const DEFAULT_FILTERS: TimelineFilters = {
  contentTypes: [...ALL_CONTENT_TYPES],
  dateRange: 'all',
  topics: [],
  engagement: 'all',
  sortBy: 'recent',
  searchQuery: '',
};

/**
 * Hook to manage timeline filters and sorting
 *
 * @returns Object with filter state and functions to update filters
 *
 * @example
 * ```tsx
 * const {
 *   filters,
 *   setContentTypes,
 *   toggleContentType,
 *   setDateRange,
 *   setSortBy,
 *   resetFilters,
 *   hasActiveFilters,
 * } = useTimelineFilters();
 *
 * return (
 *   <div>
 *     {ALL_CONTENT_TYPES.map(type => (
 *       <Checkbox
 *         key={type}
 *         checked={filters.contentTypes.includes(type)}
 *         onChange={() => toggleContentType(type)}
 *       />
 *     ))}
 *   </div>
 * );
 * ```
 */
export function useTimelineFilters(initialFilters?: Partial<TimelineFilters>) {
  const [filters, setFilters] = useState<TimelineFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  /**
   * Set content types to filter by
   */
  const setContentTypes = useCallback((contentTypes: ContentType[]) => {
    setFilters(prev => ({ ...prev, contentTypes }));
  }, []);

  /**
   * Toggle a single content type filter
   */
  const toggleContentType = useCallback((contentType: ContentType) => {
    setFilters(prev => {
      const exists = prev.contentTypes.includes(contentType);
      return {
        ...prev,
        contentTypes: exists
          ? prev.contentTypes.filter(t => t !== contentType)
          : [...prev.contentTypes, contentType],
      };
    });
  }, []);

  /**
   * Check if a content type is currently selected
   */
  const isContentTypeSelected = useCallback(
    (contentType: ContentType) => {
      return filters.contentTypes.includes(contentType);
    },
    [filters.contentTypes]
  );

  /**
   * Set date range filter
   */
  const setDateRange = useCallback((dateRange: DateRangeFilter) => {
    setFilters(prev => ({ ...prev, dateRange }));
  }, []);

  /**
   * Get date cutoff based on date range filter
   */
  const getDateCutoff = useCallback((): Date | null => {
    const now = new Date();
    switch (filters.dateRange) {
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
  }, [filters.dateRange]);

  /**
   * Set topics to filter by
   */
  const setTopics = useCallback((topics: string[]) => {
    setFilters(prev => ({ ...prev, topics }));
  }, []);

  /**
   * Toggle a single topic filter
   */
  const toggleTopic = useCallback((topic: string) => {
    setFilters(prev => {
      const exists = prev.topics.includes(topic);
      return {
        ...prev,
        topics: exists ? prev.topics.filter(t => t !== topic) : [...prev.topics, topic],
      };
    });
  }, []);

  /**
   * Set engagement level filter
   */
  const setEngagement = useCallback((engagement: EngagementFilter) => {
    setFilters(prev => ({ ...prev, engagement }));
  }, []);

  /**
   * Set sort option
   */
  const setSortBy = useCallback((sortBy: TimelineSortOption) => {
    setFilters(prev => ({ ...prev, sortBy }));
  }, []);

  /**
   * Set search query
   */
  const setSearchQuery = useCallback((searchQuery: string) => {
    setFilters(prev => ({ ...prev, searchQuery }));
  }, []);

  /**
   * Reset all filters to defaults
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  /**
   * Reset only content type filters
   */
  const resetContentTypes = useCallback(() => {
    setFilters(prev => ({ ...prev, contentTypes: [...ALL_CONTENT_TYPES] }));
  }, []);

  /**
   * Check if any filters are active (non-default)
   */
  const hasActiveFilters = useMemo(() => {
    return (
      filters.contentTypes.length !== ALL_CONTENT_TYPES.length ||
      filters.dateRange !== 'all' ||
      filters.topics.length > 0 ||
      filters.engagement !== 'all' ||
      filters.searchQuery.length > 0
    );
  }, [filters]);

  /**
   * Get the count of active filters
   */
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.contentTypes.length !== ALL_CONTENT_TYPES.length) count++;
    if (filters.dateRange !== 'all') count++;
    if (filters.topics.length > 0) count++;
    if (filters.engagement !== 'all') count++;
    if (filters.searchQuery.length > 0) count++;
    return count;
  }, [filters]);

  return {
    // State
    filters,

    // Content type filters
    setContentTypes,
    toggleContentType,
    isContentTypeSelected,
    resetContentTypes,

    // Date range
    setDateRange,
    getDateCutoff,

    // Topics
    setTopics,
    toggleTopic,

    // Engagement
    setEngagement,

    // Sort
    setSortBy,

    // Search
    setSearchQuery,

    // General
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  };
}

export default useTimelineFilters;
