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

    it('should extract tags from group_hashtags junctions', () => {
      const items = [{
        _type: 'group',
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
        _type: 'event',
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
        _type: 'amendment',
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
        _type: 'blog',
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

    it('should return empty tags when no junctions exist', () => {
      const items = [{
        _type: 'group',
        id: 'g1',
        name: 'No Tags Group',
      }];
      const result = mapMosaicToContentItems(items, emptyAgendaMap);
      expect(result).toHaveLength(1);
      expect(result[0].tags).toEqual([]);
    });

    it('should filter out null hashtags from junctions', () => {
      const items = [{
        _type: 'group',
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
