/**
 * Content scoring algorithm for Explore mode
 * Ranks content by relevance, trending factor, and quality signals
 */

import type { ContentItem, UserContext } from './content-reasons';

export interface ScoredContent<T = ContentItem> {
  content: T;
  score: number;
  scoreBreakdown: ScoreBreakdown;
}

export interface ScoreBreakdown {
  trending: number;
  topicRelevance: number;
  freshness: number;
  quality: number;
  userContent: number;
}

/**
 * Scoring weights (add up to 100 for easy understanding)
 */
export interface ScoringWeights {
  trending: number;
  topicRelevance: number;
  freshness: number;
  quality: number;
  userContent: number;
}

const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  trending: 35, // Trending factor is highest weight
  topicRelevance: 25, // Topic match is important
  freshness: 20, // Recent content gets priority
  quality: 15, // Quality signals matter
  userContent: 5, // Small boost for user's own content
} as const;

/**
 * Calculate trending score based on engagement velocity
 * Returns 0-1 normalized score
 */
function calculateTrendingScore(content: ContentItem): number {
  const velocity = content.recentEngagementVelocity || 0;

  // Logarithmic scale to prevent outliers from dominating
  // velocity of 100 = score of 1.0
  if (velocity <= 0) return 0;
  return Math.min(1, Math.log10(velocity + 1) / 2);
}

/**
 * Calculate topic relevance based on matching followed topics
 * Returns 0-1 normalized score
 */
function calculateTopicRelevance(content: ContentItem, userContext: UserContext): number {
  if (!content.topics || content.topics.length === 0) {
    return 0;
  }

  if (userContext.followedTopics.length === 0) {
    return 0;
  }

  const matchingTopics = content.topics.filter(topic => userContext.followedTopics.includes(topic));

  // Score based on how many topics match (more matches = higher score)
  const matchRatio = matchingTopics.length / content.topics.length;
  const followRatio = matchingTopics.length / userContext.followedTopics.length;

  // Combine both ratios
  return (matchRatio + followRatio) / 2;
}

/**
 * Calculate freshness score based on content age
 * Returns 0-1 normalized score (1 = just created, 0 = old)
 */
function calculateFreshnessScore(content: ContentItem): number {
  if (!content.createdAt) {
    return 0.5; // Default to middle if no date
  }

  const now = new Date();
  const ageMs = now.getTime() - new Date(content.createdAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);

  // Exponential decay: half-life of 24 hours
  // Content loses half its freshness score every 24 hours
  return Math.pow(0.5, ageHours / 24);
}

/**
 * Calculate quality score based on engagement signals
 * Returns 0-1 normalized score
 */
function calculateQualityScore(content: ContentItem): number {
  const engagement = content.engagementScore || 0;

  // Logarithmic scale for engagement
  // engagement of 1000 = score of 1.0
  if (engagement <= 0) return 0;
  return Math.min(1, Math.log10(engagement + 1) / 3);
}

/**
 * Calculate user content boost
 * Returns 1 if user's content, 0 otherwise
 */
function calculateUserContentScore(content: ContentItem, userContext: UserContext): number {
  return content.authorId === userContext.userId || content.isUserContent ? 1 : 0;
}

/**
 * Score a single content item
 */
export function scoreContent(content: ContentItem, userContext: UserContext): ScoredContent {
  const breakdown: ScoreBreakdown = {
    trending: calculateTrendingScore(content) * DEFAULT_SCORING_WEIGHTS.trending,
    topicRelevance:
      calculateTopicRelevance(content, userContext) * DEFAULT_SCORING_WEIGHTS.topicRelevance,
    freshness: calculateFreshnessScore(content) * DEFAULT_SCORING_WEIGHTS.freshness,
    quality: calculateQualityScore(content) * DEFAULT_SCORING_WEIGHTS.quality,
    userContent:
      calculateUserContentScore(content, userContext) * DEFAULT_SCORING_WEIGHTS.userContent,
  };

  const score =
    breakdown.trending +
    breakdown.topicRelevance +
    breakdown.freshness +
    breakdown.quality +
    breakdown.userContent;

  return {
    content,
    score,
    scoreBreakdown: breakdown,
  };
}

/**
 * Score and sort multiple content items
 * Returns items sorted by score (highest first)
 */
export function scoreAndSortContent(
  contents: ContentItem[],
  userContext: UserContext
): ScoredContent[] {
  return contents
    .map(content => scoreContent(content, userContext))
    .sort((a, b) => b.score - a.score);
}

/**
 * Get top N scored content items
 */
export function getTopScoredContent(
  contents: ContentItem[],
  userContext: UserContext,
  limit: number = 20
): ScoredContent[] {
  const scored = scoreAndSortContent(contents, userContext);
  return scored.slice(0, limit);
}

/**
 * Separate user content from public content in scored results
 */
export function separateScoredContent(
  scoredContents: ScoredContent[],
  userContext: UserContext
): {
  userContent: ScoredContent[];
  publicContent: ScoredContent[];
} {
  const userContent: ScoredContent[] = [];
  const publicContent: ScoredContent[] = [];

  for (const scored of scoredContents) {
    if (scored.content.authorId === userContext.userId || scored.content.isUserContent) {
      userContent.push(scored);
    } else {
      publicContent.push(scored);
    }
  }

  return { userContent, publicContent };
}

/**
 * Apply diversity penalty to prevent too many items of the same type
 */
export function applyDiversityPenalty(scoredContents: ScoredContent[]): ScoredContent[] {
  const typeCounts: Record<string, number> = {};
  const diversityPenalty = 0.9; // Each subsequent item of same type gets 10% less score

  return scoredContents
    .map(scored => {
      const type = scored.content.type;
      const count = typeCounts[type] || 0;
      typeCounts[type] = count + 1;

      // Apply penalty for repeated types
      const penalty = Math.pow(diversityPenalty, count);

      return {
        ...scored,
        score: scored.score * penalty,
      };
    })
    .sort((a, b) => b.score - a.score);
}
