import { describe, it, expect } from 'vitest';
import {
  getContentReason,
  formatReasonString,
  getContentReasons,
  filterByReasonStrength,
  type ContentItem,
  type UserContext,
} from '../content-reasons';

describe('content-reasons', () => {
  // Helper to create mock content
  const createMockContent = (overrides?: Partial<ContentItem>): ContentItem => ({
    id: 'test-id-1',
    type: 'amendment',
    ...overrides,
  });

  // Helper to create mock user context
  const createMockUserContext = (overrides?: Partial<UserContext>): UserContext => ({
    userId: 'user-1',
    subscribedGroupIds: [],
    followedTopics: [],
    recentInteractions: [],
    ...overrides,
  });

  describe('getContentReason', () => {
    it('should prioritize user own content', () => {
      const content = createMockContent({
        authorId: 'user-1',
        isUserContent: true,
      });
      const userContext = createMockUserContext({
        userId: 'user-1',
      });

      const reason = getContentReason(content, userContext);

      expect(reason.category).toBe('your_content');
    });

    it('should identify trending content', () => {
      const content = createMockContent({
        recentEngagementVelocity: 50,
      });
      const userContext = createMockUserContext();

      const reason = getContentReason(content, userContext);

      expect(reason.category).toBe('trending');
    });

    it('should identify content matching followed topics', () => {
      const content = createMockContent({
        topics: ['climate', 'transport'],
      });
      const userContext = createMockUserContext({
        followedTopics: ['climate'],
      });

      const reason = getContentReason(content, userContext);

      expect(reason.category).toBe('popular_topic');
      expect(reason.context).toBe('climate');
    });

    it('should identify similar groups', () => {
      const content = createMockContent({
        groupId: 'unsubscribed-group',
      });
      const userContext = createMockUserContext({
        subscribedGroupIds: ['other-group'],
      });

      const reason = getContentReason(content, userContext);

      expect(reason.category).toBe('similar_groups');
    });

    it('should return trending as default when no specific match', () => {
      const content = createMockContent();
      const userContext = createMockUserContext();

      const reason = getContentReason(content, userContext);

      expect(reason.category).toBe('trending');
    });

    it('should prioritize your_content over trending', () => {
      const content = createMockContent({
        authorId: 'user-1',
        recentEngagementVelocity: 100, // Also trending
      });
      const userContext = createMockUserContext({
        userId: 'user-1',
      });

      const reason = getContentReason(content, userContext);

      expect(reason.category).toBe('your_content');
    });
  });

  describe('formatReasonString', () => {
    it('should format your_content reason', () => {
      const result = formatReasonString({ category: 'your_content', priority: 100 });
      expect(result).toBe('Your content');
    });

    it('should format trending reason', () => {
      const result = formatReasonString({ category: 'trending', priority: 80 });
      expect(result).toBe('Trending now');
    });

    it('should format popular_topic with context', () => {
      const result = formatReasonString({
        category: 'popular_topic',
        context: 'Climate',
        priority: 60,
      });
      expect(result).toBe('Popular in Climate');
    });

    it('should format popular_topic without context', () => {
      const result = formatReasonString({ category: 'popular_topic', priority: 60 });
      expect(result).toBe('Popular topic');
    });

    it('should format similar_groups reason', () => {
      const result = formatReasonString({ category: 'similar_groups', priority: 40 });
      expect(result).toBe('Similar to groups you follow');
    });
  });

  describe('getContentReasons', () => {
    it('should return a Map of reasons for all content', () => {
      const contents = [
        createMockContent({ id: 'content-1' }),
        createMockContent({ id: 'content-2' }),
      ];
      const userContext = createMockUserContext();

      const reasons = getContentReasons(contents, userContext);

      expect(reasons.size).toBe(2);
      expect(reasons.has('content-1')).toBe(true);
      expect(reasons.has('content-2')).toBe(true);
    });

    it('should handle empty content array', () => {
      const userContext = createMockUserContext();
      const reasons = getContentReasons([], userContext);

      expect(reasons.size).toBe(0);
    });
  });

  describe('filterByReasonStrength', () => {
    it('should filter out content with weak reasons', () => {
      const contents = [
        createMockContent({ id: '1', isUserContent: true, authorId: 'user-1' }), // Strong reason
        createMockContent({ id: '2' }), // Weak reason (default trending)
      ];
      const userContext = createMockUserContext({ userId: 'user-1' });

      const filtered = filterByReasonStrength(contents, userContext, 50);

      // Only the user's own content should pass with priority 100
      expect(filtered.some(c => c.id === '1')).toBe(true);
    });

    it('should return all content if threshold is 0', () => {
      const contents = [createMockContent({ id: '1' }), createMockContent({ id: '2' })];
      const userContext = createMockUserContext();

      const filtered = filterByReasonStrength(contents, userContext, 0);

      expect(filtered).toHaveLength(2);
    });

    it('should handle empty content array', () => {
      const userContext = createMockUserContext();
      const filtered = filterByReasonStrength([], userContext, 50);

      expect(filtered).toEqual([]);
    });
  });
});
