'use client';

/**
 * Hook for fetching Explore mode content
 * Returns public content the user hasn't subscribed to, with discovery reasons
 */

import { useMemo, useCallback, useState } from 'react';
import { db } from 'db/db';
import {
  type ContentItem,
  getContentReasons,
  filterByReasonStrength,
} from '../utils/content-reasons';
import {
  scoreAndSortContent,
  applyDiversityPenalty,
  type ScoringWeights,
} from '../utils/content-scoring';

export interface ExploreItem {
  id: string;
  type: ContentItem['type'];
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
  startDate?: Date;
  endDate?: Date;
  location?: string;
  attendeeCount?: number;
  memberCount?: number;
  createdAt: Date;
  updatedAt?: Date;
  status?: string;
  reason: string;
  reasonCategory:
    | 'trending'
    | 'popular_topic'
    | 'similar_groups'
    | 'your_content'
    | 'new_group'
    | 'recommended';
  score: number;
  stats?: {
    reactions?: number;
    comments?: number;
    views?: number;
    members?: number;
  };
  tags?: string[];
}

export interface UseExploreTimelineOptions {
  userId: string;
  /** User's subscribed group IDs (to exclude) */
  subscribedGroupIds: string[];
  /** User's topics of interest */
  userTopics?: string[];
  /** Number of items per page */
  pageSize?: number;
  /** Custom scoring weights */
  scoringWeights?: Partial<ScoringWeights>;
  /** Minimum reason strength (0-1) */
  minReasonStrength?: number;
}

export interface UseExploreTimelineResult {
  items: ExploreItem[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  /** Trending topics in explore content */
  trendingTopics: string[];
}

// Mock data generator for development
function generateMockExploreItems(
  subscribedGroupIds: string[],
  userTopics: string[]
): ExploreItem[] {
  const mockGroups: ExploreItem[] = [
    {
      id: 'explore-group-1',
      type: 'group',
      title: 'Digital Rights Alliance',
      description: 'Advocating for privacy and digital rights in the modern age',
      groupId: 'explore-group-1',
      groupName: 'Digital Rights Alliance',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      reason: 'Trending in your area',
      reasonCategory: 'trending',
      score: 85,
      stats: { members: 1250, reactions: 342, comments: 89 },
      tags: ['privacy', 'technology', 'rights'],
    },
    {
      id: 'explore-group-2',
      type: 'group',
      title: 'Sustainable Transport Initiative',
      description: 'Promoting eco-friendly transportation solutions in urban areas',
      groupId: 'explore-group-2',
      groupName: 'Sustainable Transport Initiative',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
      reason: 'Popular in Environment',
      reasonCategory: 'popular_topic',
      score: 72,
      stats: { members: 890, reactions: 215, comments: 67 },
      tags: ['environment', 'transport', 'urban'],
    },
    {
      id: 'explore-group-3',
      type: 'group',
      title: 'Youth Political Engagement',
      description: 'Connecting young people with local politics and decision-making',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1),
      reason: 'New group',
      reasonCategory: 'new_group',
      score: 65,
      stats: { members: 156, reactions: 45, comments: 23 },
      tags: ['youth', 'politics', 'engagement'],
    },
  ];

  const mockEvents: ExploreItem[] = [
    {
      id: 'explore-event-1',
      type: 'event',
      title: 'Town Hall: Climate Action Plan 2025',
      description: 'Public discussion on the municipal climate action strategy',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 60 * 2),
      location: 'City Hall',
      createdAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      reason: 'Trending now',
      reasonCategory: 'trending',
      score: 92,
      stats: { reactions: 523, comments: 156 },
      tags: ['climate', 'townhall', 'policy'],
    },
    {
      id: 'explore-event-2',
      type: 'event',
      title: 'Community Budget Workshop',
      description: 'Learn how to participate in participatory budgeting',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12 + 1000 * 60 * 60 * 3),
      location: 'Civic Center',
      createdAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      reason: 'Similar to groups you follow',
      reasonCategory: 'similar_groups',
      score: 68,
      stats: { reactions: 89, comments: 34 },
      tags: ['budget', 'community', 'workshop'],
    },
  ];

  const mockAmendments: ExploreItem[] = [
    {
      id: 'explore-amendment-1',
      type: 'amendment',
      title: 'Renewable Energy Mandate for Public Buildings',
      description: 'Proposal to require 50% renewable energy for all government buildings by 2028',
      authorName: 'Sarah Chen',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      reason: 'Trending in Policy',
      reasonCategory: 'trending',
      score: 88,
      stats: { reactions: 234, comments: 78 },
      tags: ['energy', 'policy', 'sustainability'],
    },
    {
      id: 'explore-amendment-2',
      type: 'amendment',
      title: 'Affordable Housing Zoning Reform',
      description: 'Changes to zoning laws to increase affordable housing development',
      authorName: 'Marcus Johnson',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
      reason: 'Popular this week',
      reasonCategory: 'popular_topic',
      score: 76,
      stats: { reactions: 178, comments: 92 },
      tags: ['housing', 'zoning', 'urban'],
    },
  ];

  // Filter out subscribed groups
  const filteredGroups = mockGroups.filter(g => !subscribedGroupIds.includes(g.id));

  // Boost items that match user topics
  const allItems = [...filteredGroups, ...mockEvents, ...mockAmendments];

  return allItems.map(item => {
    const matchingTopics = item.tags?.filter(t =>
      userTopics.some(ut => ut.toLowerCase() === t.toLowerCase())
    );
    if (matchingTopics && matchingTopics.length > 0) {
      return {
        ...item,
        score: item.score + matchingTopics.length * 5,
        reason: `Matches your interest in ${matchingTopics[0]}`,
        reasonCategory: 'popular_topic' as const,
      };
    }
    return item;
  });
}

/**
 * Fetch explore/discovery content
 */
export function useExploreTimeline(options: UseExploreTimelineOptions): UseExploreTimelineResult {
  const {
    userId,
    subscribedGroupIds,
    userTopics = [],
    pageSize = 20,
    minReasonStrength = 0.3,
  } = options;

  const [page, setPage] = useState(0);

  // Query public groups (not subscribed)
  const { data: publicGroupsData, isLoading: groupsLoading } = db.useQuery({
    groups: {
      $: {
        limit: 50,
      },
    },
  });

  // Generate mock data for now (can be replaced with real queries)
  const exploreItems = useMemo(() => {
    // Use mock data for development
    const mockItems = generateMockExploreItems(subscribedGroupIds, userTopics);

    // If we have real public groups data, we could transform it here
    // For now, prioritize mock data to show the UI
    if (publicGroupsData?.groups && publicGroupsData.groups.length > 0) {
      const realGroups: ExploreItem[] = publicGroupsData.groups
        .filter(g => !subscribedGroupIds.includes(g.id))
        .slice(0, 5)
        .map((g, index) => ({
          id: g.id,
          type: 'group' as const,
          title: g.name || 'Unnamed Group',
          description: (g as Record<string, unknown>).description as string | undefined,
          groupId: g.id,
          groupName: g.name || 'Unnamed Group',
          createdAt: new Date(),
          reason: index === 0 ? 'Trending in your area' : 'Discover new groups',
          reasonCategory: (index === 0 ? 'trending' : 'new_group') as ExploreItem['reasonCategory'],
          score: 70 - index * 5,
          stats: { members: Math.floor(Math.random() * 500) + 50 },
        }));

      // Combine real and mock data, but deduplicate by ID
      const seenIds = new Set<string>();
      const combined = [...realGroups, ...mockItems];
      return combined.filter(item => {
        if (seenIds.has(item.id)) {
          return false;
        }
        seenIds.add(item.id);
        return true;
      });
    }

    return mockItems;
  }, [publicGroupsData, subscribedGroupIds, userTopics]);

  // Sort by score
  const sortedItems = useMemo(() => {
    return [...exploreItems].sort((a, b) => b.score - a.score);
  }, [exploreItems]);

  // Extract trending topics
  const trendingTopics = useMemo(() => {
    const topicCounts = new Map<string, number>();

    for (const item of exploreItems) {
      for (const tag of item.tags || []) {
        topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1);
      }
    }

    return Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([topic]) => topic);
  }, [exploreItems]);

  // Paginate
  const paginatedItems = useMemo(() => {
    return sortedItems.slice(0, (page + 1) * pageSize);
  }, [sortedItems, page, pageSize]);

  const loadMore = useCallback(() => {
    if (paginatedItems.length < sortedItems.length) {
      setPage(p => p + 1);
    }
  }, [paginatedItems.length, sortedItems.length]);

  const refresh = useCallback(() => {
    setPage(0);
  }, []);

  return {
    items: paginatedItems,
    isLoading: groupsLoading,
    error: null,
    hasMore: paginatedItems.length < sortedItems.length,
    loadMore,
    refresh,
    trendingTopics,
  };
}
