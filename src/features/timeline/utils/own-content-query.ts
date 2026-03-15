/**
 * Own content query utilities for Explore mode
 * Queries content created by or managed by the user
 */

import type { ContentItem } from '../logic/content-reasons';

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
  const filters: { authorId: string; createdAfter?: Date; excludeStatus?: string } = {
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
  const filters: { organizerId: string; createdAfter?: Date } = {
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
  amendment: { id: string; groupId?: string; topics?: string[]; commentCount?: number; voteCount?: number; createdAt?: string },
  userId: string
): ContentItem {
  const commentCount = amendment.commentCount || 0;
  const voteCount = amendment.voteCount || 0;
  return {
    id: amendment.id,
    type: 'amendment',
    authorId: userId,
    groupId: amendment.groupId,
    topics: amendment.topics,
    engagementScore: commentCount + voteCount,
    isUserContent: true,
    createdAt: amendment.createdAt ? new Date(amendment.createdAt) : undefined,
  };
}

/**
 * Transform user event to ContentItem
 */
export function transformEventToContentItem(
  event: { id: string; groupId?: string; topics?: string[]; participantCount?: number; createdAt?: string },
  userId: string
): ContentItem {
  return {
    id: event.id,
    type: 'event',
    authorId: userId,
    groupId: event.groupId,
    topics: event.topics,
    engagementScore: event.participantCount || 0,
    isUserContent: true,
    createdAt: event.createdAt ? new Date(event.createdAt) : undefined,
  };
}

/**
 * Transform user admin group to ContentItem
 */
export function transformGroupToContentItem(
  group: { id: string; topics?: string[]; memberCount?: number; createdAt?: string },
  userId: string
): ContentItem {
  return {
    id: group.id,
    type: 'group',
    authorId: userId,
    topics: group.topics,
    engagementScore: group.memberCount || 0,
    isUserContent: true,
    createdAt: group.createdAt ? new Date(group.createdAt) : undefined,
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
