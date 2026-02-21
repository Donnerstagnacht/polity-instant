/**
 * Content reason utilities for Explore mode
 * Generates human-readable reasons explaining why content appears in the Explore feed
 */

import type { ReasonCategory } from '../ui/cards/ReasonTooltip';

export interface ContentReasonData {
  category: ReasonCategory;
  context?: string;
  priority: number; // Higher = more relevant reason to show
}

export interface ContentItem {
  id: string;
  type:
    | 'group'
    | 'event'
    | 'amendment'
    | 'vote'
    | 'election'
    | 'video'
    | 'image'
    | 'statement'
    | 'todo'
    | 'blog';
  authorId?: string;
  groupId?: string;
  topics?: string[];
  engagementScore?: number;
  isUserContent?: boolean;
  recentEngagementVelocity?: number;
  createdAt?: Date;
}

export interface UserContext {
  userId: string;
  subscribedGroupIds: string[];
  followedTopics: string[];
  recentInteractions: Array<{ entityId: string; type: string }>;
}

/**
 * Reason priority values (higher = more likely to be shown)
 */
const REASON_PRIORITY = {
  your_content: 100,
  trending: 80,
  popular_topic: 60,
  similar_groups: 40,
} as const;

/**
 * Determine why a piece of content appears in the Explore feed
 * Returns the most relevant reason to display
 */
export function getContentReason(
  content: ContentItem,
  userContext: UserContext
): ContentReasonData {
  const reasons: ContentReasonData[] = [];

  // Check if this is user's own content (highest priority)
  if (content.isUserContent || content.authorId === userContext.userId) {
    reasons.push({
      category: 'your_content',
      priority: REASON_PRIORITY.your_content,
    });
  }

  // Check if content is trending (high engagement velocity)
  if (content.recentEngagementVelocity && content.recentEngagementVelocity > 10) {
    reasons.push({
      category: 'trending',
      priority: REASON_PRIORITY.trending,
    });
  }

  // Check if content matches followed topics
  if (content.topics && content.topics.length > 0) {
    const matchingTopics = content.topics.filter(topic =>
      userContext.followedTopics.includes(topic)
    );

    if (matchingTopics.length > 0) {
      reasons.push({
        category: 'popular_topic',
        context: matchingTopics[0], // Show first matching topic
        priority: REASON_PRIORITY.popular_topic + matchingTopics.length * 5,
      });
    }
  }

  // Check if content is from a group similar to subscribed groups
  if (content.groupId && !userContext.subscribedGroupIds.includes(content.groupId)) {
    // In real implementation, we'd check group similarity
    // For now, assume any content from an unsubscribed group is "similar"
    reasons.push({
      category: 'similar_groups',
      priority: REASON_PRIORITY.similar_groups,
    });
  }

  // Sort by priority and return the highest
  reasons.sort((a, b) => b.priority - a.priority);

  // Default reason if no specific match
  if (reasons.length === 0) {
    return {
      category: 'trending',
      priority: 0,
    };
  }

  return reasons[0];
}

/**
 * Generate a localized reason string from reason data
 */
export function formatReasonString(reason: ContentReasonData): string {
  switch (reason.category) {
    case 'your_content':
      return 'Your content';
    case 'trending':
      return 'Trending now';
    case 'popular_topic':
      return reason.context ? `Popular in ${reason.context}` : 'Popular topic';
    case 'similar_groups':
      return 'Similar to groups you follow';
    default:
      return 'Recommended for you';
  }
}

/**
 * Batch calculate reasons for multiple content items
 */
export function getContentReasons(
  contents: ContentItem[],
  userContext: UserContext
): Map<string, ContentReasonData> {
  const reasons = new Map<string, ContentReasonData>();

  for (const content of contents) {
    reasons.set(content.id, getContentReason(content, userContext));
  }

  return reasons;
}

/**
 * Filter content to only show items with strong reasons
 * Used to ensure Explore feed quality
 */
export function filterByReasonStrength(
  contents: ContentItem[],
  userContext: UserContext,
  minPriority: number = 30
): ContentItem[] {
  return contents.filter(content => {
    const reason = getContentReason(content, userContext);
    return reason.priority >= minPriority;
  });
}
