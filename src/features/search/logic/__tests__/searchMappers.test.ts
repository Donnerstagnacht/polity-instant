import { describe, it, expect } from 'vitest';
import { toTags, toDate, mapMosaicToContentItems } from '../searchMappers';

describe('searchMappers', () => {
  describe('toTags', () => {
    it('should return empty array for undefined', () => {
      expect(toTags(undefined)).toEqual([]);
    });

    it('should extract tag strings from hashtag objects', () => {
      const hashtags = [{ tag: 'politics' }, { tag: 'climate' }];
      expect(toTags(hashtags)).toEqual(['politics', 'climate']);
    });

    it('should filter out null or undefined tags', () => {
      const hashtags = [{ tag: 'politics' }, { tag: null }, { tag: undefined }];
      expect(toTags(hashtags)).toEqual(['politics']);
    });
  });

  describe('toDate', () => {
    it('should return current date for null/undefined', () => {
      const result = toDate(null);
      expect(result).toBeInstanceOf(Date);
    });

    it('should parse ISO string to Date', () => {
      const result = toDate('2024-06-01T00:00:00Z');
      expect(result.getFullYear()).toBe(2024);
    });

    it('should return Date input as-is', () => {
      const d = new Date('2024-01-01');
      expect(toDate(d)).toBe(d);
    });
  });

  describe('mapMosaicToContentItems — hashtag extraction', () => {
    const emptyAgendaMap = new Map();

    it('should map searchableUsers payload into user cards with full name and avatar', () => {
      const items = [{
        _type: 'user' as const,
        id: 'u-1',
        first_name: 'Ada',
        last_name: 'Lovelace',
        handle: 'ada',
        bio: 'Computing pioneer',
        avatar: 'https://example.com/ada.png',
        location: 'London',
        created_at: 1717200000000,
        group_count: 3,
        amendment_count: 5,
        user_hashtags: [
          { hashtag: { tag: 'math' } },
        ],
      }];

      const result = mapMosaicToContentItems(items, emptyAgendaMap);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'u-1',
        type: 'user',
        title: 'Ada Lovelace',
        authorName: 'Ada Lovelace',
        authorAvatar: 'https://example.com/ada.png',
        handle: 'ada',
        description: 'Computing pioneer',
        location: 'London',
        groupCount: 3,
        amendmentCount: 5,
        tags: ['math'],
      });
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should extract tags from group_hashtags junctions', () => {
      const items = [{
        _type: 'group' as const,
        id: 'g1',
        name: 'Test Group',
        group_hashtags: [
          { hashtag: { tag: 'politics' } },
          { hashtag: { tag: 'education' } },
        ],
      }];
      const result = mapMosaicToContentItems(items, emptyAgendaMap);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toEqual(['politics', 'education']);
    });

    it('should extract tags from event_hashtags junctions', () => {
      const items = [{
        _type: 'event' as const,
        id: 'e1',
        title: 'Test Event',
        event_hashtags: [
          { hashtag: { tag: 'summit' } },
        ],
      }];
      const result = mapMosaicToContentItems(items, emptyAgendaMap);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toEqual(['summit']);
    });

    it('should extract tags from amendment_hashtags junctions', () => {
      const items = [{
        _type: 'amendment' as const,
        id: 'a1',
        title: 'Test Amendment',
        amendment_hashtags: [
          { hashtag: { tag: 'reform' } },
          { hashtag: { tag: 'climate' } },
        ],
      }];
      const result = mapMosaicToContentItems(items, emptyAgendaMap);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toEqual(['reform', 'climate']);
    });

    it('should extract tags from blog_hashtags junctions', () => {
      const items = [{
        _type: 'blog' as const,
        id: 'b1',
        title: 'Test Blog',
        blog_hashtags: [
          { hashtag: { tag: 'opinion' } },
        ],
      }];
      const result = mapMosaicToContentItems(items, emptyAgendaMap);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toEqual(['opinion']);
    });

    it('should preserve a group-owned blog route context', () => {
      const items = [{
        _type: 'blog' as const,
        id: 'b-group',
        title: 'Group Blog',
        group_id: 'g-1',
        bloggers: [
          {
            status: 'owner',
            user_id: 'u-1',
            user: { id: 'u-1', name: 'Owner' },
          },
        ],
      }];

      const result = mapMosaicToContentItems(items, emptyAgendaMap);

      expect(result).toHaveLength(1);
      expect(result[0].groupId).toBe('g-1');
      expect(result[0].authorId).toBe('u-1');
    });

    it('should preserve a user-owned blog route context', () => {
      const items = [{
        _type: 'blog' as const,
        id: 'b-user',
        title: 'User Blog',
        bloggers: [
          {
            status: 'owner',
            user_id: 'u-2',
            user: { id: 'u-2', name: 'Owner' },
          },
        ],
      }];

      const result = mapMosaicToContentItems(items, emptyAgendaMap);

      expect(result).toHaveLength(1);
      expect(result[0].groupId).toBeUndefined();
      expect(result[0].authorId).toBe('u-2');
    });

    it('should support the searchableBlogs snake_case payload', () => {
      const items = [{
        _type: 'blog' as const,
        id: 'b-snake',
        title: 'Snake Blog',
        created_at: 1717200000000,
        image_url: 'https://example.com/cover.png',
        comment_count: 4,
        support_votes: [{ id: 'v-1' }],
        bloggers: [
          {
            status: 'owner',
            user_id: 'u-3',
            user: { id: 'u-3', name: 'Snake Owner', avatar: 'https://example.com/avatar.png' },
          },
        ],
      }];

      const result = mapMosaicToContentItems(items, emptyAgendaMap);

      expect(result).toHaveLength(1);
      expect(result[0].authorId).toBe('u-3');
      expect(result[0].authorAvatar).toBe('https://example.com/avatar.png');
      expect(result[0].commentCount).toBe(4);
      expect(result[0].stats?.reactions).toBe(1);
    });

    it('should return empty tags when no junctions exist', () => {
      const items = [{
        _type: 'group' as const,
        id: 'g1',
        name: 'No Tags Group',
      }];
      const result = mapMosaicToContentItems(items, emptyAgendaMap);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toEqual([]);
    });

    it('should filter out null hashtags from junctions', () => {
      const items = [{
        _type: 'group' as const,
        id: 'g1',
        name: 'Partial Tags',
        group_hashtags: [
          { hashtag: { tag: 'valid' } },
          { hashtag: null },
          { hashtag: { tag: null } },
        ],
      }];
      const result = mapMosaicToContentItems(items, emptyAgendaMap);
      expect(result[0].tags).toEqual(['valid']);
    });

    it('should return empty array for empty input', () => {
      expect(mapMosaicToContentItems([], emptyAgendaMap)).toEqual([]);
    });

    it('should return empty array for null input', () => {
      expect(mapMosaicToContentItems(null as any, emptyAgendaMap)).toEqual([]);
    });
  });
});
