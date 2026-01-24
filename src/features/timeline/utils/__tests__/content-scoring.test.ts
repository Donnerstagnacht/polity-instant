import { describe, it, expect } from 'vitest';
import {
  scoreContent,
  scoreAndSortContent,
  getTopScoredContent,
  type ScoredContent,
} from '../content-scoring';
import type { ContentItem, UserContext } from '../content-reasons';

describe('content-scoring', () => {
  // Helper to create mock content
  const createMockContent = (overrides?: Partial<ContentItem>): ContentItem => ({
    id: 'test-id-1',
    type: 'amendment',
    createdAt: new Date(),
    topics: ['climate'],
    engagementScore: 100,
    recentEngagementVelocity: 50,
    ...overrides,
  });

  // Helper to create mock user context
  const createMockUserContext = (overrides?: Partial<UserContext>): UserContext => ({
    userId: 'user-1',
    followedTopics: ['climate', 'transport'],
    subscribedGroupIds: [],
    recentInteractions: [],
    ...overrides,
  });

  describe('scoreContent', () => {
    it('should return a ScoredContent object with score and breakdown', () => {
      const content = createMockContent();
      const userContext = createMockUserContext();

      const result = scoreContent(content, userContext);

      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('scoreBreakdown');
      expect(typeof result.score).toBe('number');
    });

    it('should score trending content higher', () => {
      const userContext = createMockUserContext();

      const trendingContent = createMockContent({
        id: 'trending',
        recentEngagementVelocity: 500,
      });
      const nonTrendingContent = createMockContent({
        id: 'non-trending',
        recentEngagementVelocity: 0,
      });

      const trendingScore = scoreContent(trendingContent, userContext);
      const nonTrendingScore = scoreContent(nonTrendingContent, userContext);

      expect(trendingScore.scoreBreakdown.trending).toBeGreaterThan(
        nonTrendingScore.scoreBreakdown.trending
      );
    });

    it('should score fresh content higher', () => {
      const userContext = createMockUserContext();

      const freshContent = createMockContent({
        id: 'fresh',
        createdAt: new Date(),
      });
      const oldContent = createMockContent({
        id: 'old',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      });

      const freshScore = scoreContent(freshContent, userContext);
      const oldScore = scoreContent(oldContent, userContext);

      expect(freshScore.scoreBreakdown.freshness).toBeGreaterThan(
        oldScore.scoreBreakdown.freshness
      );
    });

    it('should boost user own content', () => {
      const content = createMockContent({
        authorId: 'user-1',
      });
      const userContext = createMockUserContext({
        userId: 'user-1',
      });

      const result = scoreContent(content, userContext);

      expect(result.scoreBreakdown.userContent).toBeGreaterThan(0);
    });

    it('should not boost content from other users', () => {
      const content = createMockContent({
        authorId: 'other-user',
      });
      const userContext = createMockUserContext({
        userId: 'user-1',
      });

      const result = scoreContent(content, userContext);

      expect(result.scoreBreakdown.userContent).toBe(0);
    });

    it('should score matching topics higher', () => {
      const userContext = createMockUserContext({
        followedTopics: ['climate', 'transport'],
      });

      const matchingContent = createMockContent({
        id: 'matching',
        topics: ['climate'],
      });
      const nonMatchingContent = createMockContent({
        id: 'non-matching',
        topics: ['housing'],
      });

      const matchingScore = scoreContent(matchingContent, userContext);
      const nonMatchingScore = scoreContent(nonMatchingContent, userContext);

      expect(matchingScore.scoreBreakdown.topicRelevance).toBeGreaterThan(
        nonMatchingScore.scoreBreakdown.topicRelevance
      );
    });
  });

  describe('scoreAndSortContent', () => {
    it('should return content sorted by score (highest first)', () => {
      const userContext = createMockUserContext();

      const contents = [
        createMockContent({ id: '1', recentEngagementVelocity: 10 }),
        createMockContent({ id: '2', recentEngagementVelocity: 500 }),
        createMockContent({ id: '3', recentEngagementVelocity: 100 }),
      ];

      const result = scoreAndSortContent(contents, userContext);

      // Highest trending should be first
      expect(result[0].content.id).toBe('2');
      expect(result[0].score).toBeGreaterThanOrEqual(result[1].score);
      expect(result[1].score).toBeGreaterThanOrEqual(result[2].score);
    });

    it('should handle empty array', () => {
      const userContext = createMockUserContext();
      const result = scoreAndSortContent([], userContext);

      expect(result).toEqual([]);
    });

    it('should handle single item', () => {
      const userContext = createMockUserContext();
      const contents = [createMockContent()];

      const result = scoreAndSortContent(contents, userContext);

      expect(result).toHaveLength(1);
    });
  });

  describe('getTopScoredContent', () => {
    it('should return top N items', () => {
      const userContext = createMockUserContext();

      const contents = [
        createMockContent({ id: '1', recentEngagementVelocity: 10 }),
        createMockContent({ id: '2', recentEngagementVelocity: 500 }),
        createMockContent({ id: '3', recentEngagementVelocity: 100 }),
        createMockContent({ id: '4', recentEngagementVelocity: 200 }),
        createMockContent({ id: '5', recentEngagementVelocity: 50 }),
      ];

      const result = getTopScoredContent(contents, userContext, 3);

      expect(result).toHaveLength(3);
      // Top 3 should be the highest scoring ones
      expect(result[0].content.id).toBe('2'); // Highest
    });

    it('should return all items if N is greater than array length', () => {
      const userContext = createMockUserContext();
      const contents = [createMockContent(), createMockContent()];

      const result = getTopScoredContent(contents, userContext, 10);

      expect(result).toHaveLength(2);
    });
  });
});
