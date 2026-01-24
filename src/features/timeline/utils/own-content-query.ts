/**
 * Own content query utilities for Explore mode
 * Queries content created by or managed by the user
 */

import type { ContentItem } from './content-reasons';

export interface OwnContentQueryOptions {
  /** User ID to query content for */
  userId: string;
  /** Maximum number of items per category */
  limitPerCategory?: number;
  /** Maximum age in days */
  maxAgeDays?: number;
  /** Include drafts */
  includeDrafts?: boolean;
}

export interface OwnContentResult {
  /** Amendments user has authored */
  amendments: ContentItem[];
  /** Events user is organizing */
  events: ContentItem[];
  /** Groups user is admin of */
  groups: ContentItem[];
  /** Videos/images user has uploaded */
  media: ContentItem[];
  /** Statements user has posted */
  statements: ContentItem[];
  /** Blogs user has written */
  blogs: ContentItem[];
  /** Total count of all items */
  totalCount: number;
}

/**
 * Default options for own content query
 */
export const DEFAULT_OWN_CONTENT_OPTIONS: Partial<OwnContentQueryOptions> = {
  limitPerCategory: 10,
  maxAgeDays: 90,
  includeDrafts: false,
};

/**
 * Build filter criteria for user's own amendments
 */
export function buildAmendmentFilters(userId: string, options: OwnContentQueryOptions) {
  const filters: Record<string, unknown> = {
    authorId: userId,
  };

  if (options.maxAgeDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.maxAgeDays);
    filters.createdAfter = cutoffDate;
  }

  if (!options.includeDrafts) {
    filters.excludeStatus = 'draft';
  }

  return filters;
}

/**
 * Build filter criteria for user's organized events
 */
export function buildEventFilters(userId: string, options: OwnContentQueryOptions) {
  const filters: Record<string, unknown> = {
    organizerId: userId,
  };

  if (options.maxAgeDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - options.maxAgeDays);
    filters.createdAfter = cutoffDate;
  }

  return filters;
}

/**
 * Build filter criteria for groups user admins
 */
export function buildAdminGroupFilters(userId: string) {
  return {
    adminId: userId,
  };
}

/**
 * Transform user amendment to ContentItem
 */
export function transformAmendmentToContentItem(
  amendment: Record<string, unknown>,
  userId: string
): ContentItem {
  const commentCount = (amendment.commentCount as number) || 0;
  const voteCount = (amendment.voteCount as number) || 0;
  return {
    id: amendment.id as string,
    type: 'amendment',
    authorId: userId,
    groupId: amendment.groupId as string | undefined,
    topics: amendment.topics as string[] | undefined,
    engagementScore: commentCount + voteCount,
    isUserContent: true,
    createdAt: amendment.createdAt ? new Date(amendment.createdAt as string) : undefined,
  };
}

/**
 * Transform user event to ContentItem
 */
export function transformEventToContentItem(
  event: Record<string, unknown>,
  userId: string
): ContentItem {
  return {
    id: event.id as string,
    type: 'event',
    authorId: userId,
    groupId: event.groupId as string | undefined,
    topics: event.topics as string[] | undefined,
    engagementScore: (event.participantCount || 0) as number,
    isUserContent: true,
    createdAt: event.createdAt ? new Date(event.createdAt as string) : undefined,
  };
}

/**
 * Transform user admin group to ContentItem
 */
export function transformGroupToContentItem(
  group: Record<string, unknown>,
  userId: string
): ContentItem {
  return {
    id: group.id as string,
    type: 'group',
    authorId: userId,
    topics: group.topics as string[] | undefined,
    engagementScore: (group.memberCount || 0) as number,
    isUserContent: true,
    createdAt: group.createdAt ? new Date(group.createdAt as string) : undefined,
  };
}

/**
 * Combine all own content into a single list
 * Sorted by creation date (most recent first)
 */
export function combineOwnContent(result: OwnContentResult): ContentItem[] {
  const allItems = [
    ...result.amendments,
    ...result.events,
    ...result.groups,
    ...result.media,
    ...result.statements,
    ...result.blogs,
  ];

  // Sort by creation date
  return allItems.sort((a, b) => {
    const dateA = a.createdAt?.getTime() || 0;
    const dateB = b.createdAt?.getTime() || 0;
    return dateB - dateA;
  });
}

/**
 * Get engagement summary for user's content
 */
export function getOwnContentStats(result: OwnContentResult): {
  totalItems: number;
  totalEngagement: number;
  topPerforming: ContentItem | null;
} {
  const allItems = combineOwnContent(result);
  const totalEngagement = allItems.reduce((sum, item) => sum + (item.engagementScore || 0), 0);

  let topPerforming: ContentItem | null = null;
  let maxEngagement = 0;

  for (const item of allItems) {
    if ((item.engagementScore || 0) > maxEngagement) {
      maxEngagement = item.engagementScore || 0;
      topPerforming = item;
    }
  }

  return {
    totalItems: allItems.length,
    totalEngagement,
    topPerforming,
  };
}
