import { describe, it, expect } from 'vitest';
import { extractHashtags, extractHashtagTags } from '../hashtagHelpers';

describe('hashtagHelpers', () => {
  describe('extractHashtags', () => {
    it('should return empty array for null input', () => {
      expect(extractHashtags(null)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      expect(extractHashtags(undefined)).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      expect(extractHashtags([])).toEqual([]);
    });

    it('should extract hashtags from valid junction rows', () => {
      const junctions = [
        { hashtag: { id: 'h1', tag: 'politics' } },
        { hashtag: { id: 'h2', tag: 'climate' } },
      ];
      expect(extractHashtags(junctions)).toEqual([
        { id: 'h1', tag: 'politics' },
        { id: 'h2', tag: 'climate' },
      ]);
    });

    it('should filter out junction rows with null hashtag', () => {
      const junctions = [
        { hashtag: { id: 'h1', tag: 'politics' } },
        { hashtag: null },
        { hashtag: { id: 'h3', tag: 'education' } },
      ];
      expect(extractHashtags(junctions)).toEqual([
        { id: 'h1', tag: 'politics' },
        { id: 'h3', tag: 'education' },
      ]);
    });

    it('should filter out junction rows with undefined hashtag', () => {
      const junctions = [
        { hashtag: undefined },
        { hashtag: { id: 'h2', tag: 'health' } },
      ];
      expect(extractHashtags(junctions)).toEqual([
        { id: 'h2', tag: 'health' },
      ]);
    });

    it('should handle single junction row', () => {
      const junctions = [{ hashtag: { id: 'h1', tag: 'economy' } }];
      expect(extractHashtags(junctions)).toEqual([
        { id: 'h1', tag: 'economy' },
      ]);
    });

    it('should handle all null hashtags returning empty array', () => {
      const junctions = [{ hashtag: null }, { hashtag: null }];
      expect(extractHashtags(junctions)).toEqual([]);
    });
  });

  describe('extractHashtagTags', () => {
    it('should return empty array for null input', () => {
      expect(extractHashtagTags(null)).toEqual([]);
    });

    it('should return empty array for undefined input', () => {
      expect(extractHashtagTags(undefined)).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      expect(extractHashtagTags([])).toEqual([]);
    });

    it('should extract tag strings from junction rows', () => {
      const junctions = [
        { hashtag: { tag: 'politics' } },
        { hashtag: { tag: 'climate' } },
      ];
      expect(extractHashtagTags(junctions)).toEqual(['politics', 'climate']);
    });

    it('should filter out null tags', () => {
      const junctions = [
        { hashtag: { tag: 'politics' } },
        { hashtag: { tag: null } },
        { hashtag: { tag: 'education' } },
      ];
      expect(extractHashtagTags(junctions)).toEqual(['politics', 'education']);
    });

    it('should filter out null hashtags', () => {
      const junctions = [
        { hashtag: null },
        { hashtag: { tag: 'health' } },
      ];
      expect(extractHashtagTags(junctions)).toEqual(['health']);
    });

    it('should filter out undefined hashtags', () => {
      const junctions = [
        { hashtag: undefined },
        { hashtag: { tag: 'transport' } },
      ];
      expect(extractHashtagTags(junctions)).toEqual(['transport']);
    });

    it('should return empty array when all tags are null', () => {
      const junctions = [
        { hashtag: { tag: null } },
        { hashtag: { tag: null } },
      ];
      expect(extractHashtagTags(junctions)).toEqual([]);
    });
  });
});
