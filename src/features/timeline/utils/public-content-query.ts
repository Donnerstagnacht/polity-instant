/**
 * Public content query utilities for Explore mode
 * Queries public groups, events, amendments that user hasn't subscribed to
 */

import type { ContentItem } from './content-reasons';

export interface PublicContentQueryOptions {
  /** User ID to exclude from results (for subscriptions) */
  userId: string;
  /** Group IDs user is already subscribed to (exclude from results) */
  subscribedGroupIds: string[];
  /** Maximum number of items to return */
  limit?: number;
  /** Content types to include */
  contentTypes?: Array<ContentItem['type']>;
  /** Minimum engagement score to include */
  minEngagement?: number;
  /** Maximum age in days */
  maxAgeDays?: number;
  /** Topic IDs to filter by */
  topicIds?: string[];
}

export interface PublicContentResult {
  items: ContentItem[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Default options for public content query
 */
export const DEFAULT_PUBLIC_QUERY_OPTIONS: Partial<PublicContentQueryOptions> = {
  limit: 50,
  maxAgeDays: 30,
  minEngagement: 5,
  contentTypes: ['group', 'event', 'amendment', 'blog', 'statement'],
};

/**
 * Build filter criteria for public content query
 * This returns InstantDB-compatible query filters
 */
export function buildPublicContentFilters(options: PublicContentQueryOptions) {
  const filters: Record<string, unknown> = {};

  // Exclude subscribed groups
  if (options.subscribedGroupIds.length > 0) {
    filters.excludeGroupIds = options.subscribedGroupIds;
  }

  // Filter by content types
  if (options.contentTypes && options.contentTypes.length > 0) {
    filters.contentTypes = options.contentTypes;
  }

  // Filter by minimum engagement
  if (options.minEngagement) {
    filters.minEngagement = options.minEngagement;
  }

  // Filter by max age
  if (options.maxAgeDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.maxAgeDays);
    filters.createdAfter = cutoffDate;
  }

  // Filter by topics
  if (options.topicIds && options.topicIds.length > 0) {
    filters.topicIds = options.topicIds;
  }

  return filters;
}

/**
 * Transform raw database results to ContentItem format
 * This is a utility for mapping query results
 */
export function transformToContentItem(
  rawItem: Record<string, unknown>,
  type: ContentItem['type']
): ContentItem {
  return {
    id: rawItem.id as string,
    type,
    authorId: rawItem.authorId as string | undefined,
    groupId: rawItem.groupId as string | undefined,
    topics: rawItem.topics as string[] | undefined,
    engagementScore: rawItem.engagementScore as number | undefined,
    isUserContent: false,
    recentEngagementVelocity: rawItem.recentEngagementVelocity as number | undefined,
    createdAt: rawItem.createdAt ? new Date(rawItem.createdAt as string) : undefined,
  };
}

/**
 * Calculate engagement score from various signals
 */
export function calculateEngagementScore(item: {
  reactions?: number;
  comments?: number;
  views?: number;
  shares?: number;
}): number {
  // Weighted scoring: shares > comments > reactions > views
  const weights = {
    shares: 5,
    comments: 3,
    reactions: 2,
    views: 0.01,
  };

  return (
    (item.shares || 0) * weights.shares +
    (item.comments || 0) * weights.comments +
    (item.reactions || 0) * weights.reactions +
    (item.views || 0) * weights.views
  );
}

/**
 * Calculate engagement velocity (engagement over time)
 */
export function calculateEngagementVelocity(
  currentEngagement: number,
  previousEngagement: number,
  hoursDiff: number
): number {
  if (hoursDiff <= 0) return 0;
  const diff = currentEngagement - previousEngagement;
  return diff / hoursDiff;
}

/**
 * Check if content should be included in public feed
 * Based on visibility and quality criteria
 */
export function isPublicContent(item: {
  isPublic?: boolean;
  visibility?: string;
  status?: string;
}): boolean {
  // Must be explicitly public or have public visibility
  if (item.isPublic === true) return true;
  if (item.visibility === 'public') return true;

  // Check status for amendments/events
  if (item.status) {
    const activeStatuses = ['published', 'active', 'viewing', 'passed'];
    return activeStatuses.includes(item.status);
  }

  return false;
}

/**
 * Exclude items user has already interacted with
 */
export function excludeInteractedItems(
  items: ContentItem[],
  interactedIds: Set<string>
): ContentItem[] {
  return items.filter(item => !interactedIds.has(item.id));
}
