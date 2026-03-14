import { describe, it, expect } from 'vitest';
import {
  matchesHashtag,
  filterByQuery,
  getUserAvatar,
  getUserDisplayName,
  matchesUserQuery,
  sortResults,
} from '../searchUtils';

describe('searchUtils', () => {
  describe('matchesHashtag', () => {
    it('should return true when no filter is provided', () => {
      expect(matchesHashtag({}, '')).toBe(true);
    });

    // ── Pre-extracted { id, tag }[] format ─────────────────────────
    it('should match against pre-extracted hashtags (exact)', () => {
      const item = {
        hashtags: [
          { id: 'h1', tag: 'politics' },
          { id: 'h2', tag: 'climate' },
        ],
      };
      expect(matchesHashtag(item, 'politics')).toBe(true);
    });

    it('should not match when no tags match the filter', () => {
      const item = {
        hashtags: [{ id: 'h1', tag: 'politics' }],
      };
      expect(matchesHashtag(item, 'sports')).toBe(false);
    });

    it('should be case-insensitive', () => {
      const item = {
        hashtags: [{ id: 'h1', tag: 'Politics' }],
      };
      expect(matchesHashtag(item, 'politics')).toBe(true);
      expect(matchesHashtag(item, 'POLITICS')).toBe(true);
    });

    it('should strip # prefix from filter', () => {
      const item = {
        hashtags: [{ id: 'h1', tag: 'climate' }],
      };
      expect(matchesHashtag(item, '#climate')).toBe(true);
    });

    it('should support partial matching', () => {
      const item = {
        hashtags: [{ id: 'h1', tag: 'sustainability' }],
      };
      expect(matchesHashtag(item, 'sustain')).toBe(true);
    });

    it('should return false for empty hashtags array', () => {
      expect(matchesHashtag({ hashtags: [] }, 'test')).toBe(false);
    });

    // ── Junction row format via user_hashtags ──────────────────────
    it('should match against user_hashtags junction rows', () => {
      const item = {
        user_hashtags: [
          { hashtag: { id: 'h1', tag: 'democracy' } },
        ],
      };
      expect(matchesHashtag(item, 'democracy')).toBe(true);
    });

    it('should match against group_hashtags junction rows', () => {
      const item = {
        group_hashtags: [
          { hashtag: { id: 'h1', tag: 'environment' } },
        ],
      };
      expect(matchesHashtag(item, 'environment')).toBe(true);
    });

    it('should match against amendment_hashtags junction rows', () => {
      const item = {
        amendment_hashtags: [
          { hashtag: { id: 'h1', tag: 'reform' } },
        ],
      };
      expect(matchesHashtag(item, 'reform')).toBe(true);
    });

    it('should match against event_hashtags junction rows', () => {
      const item = {
        event_hashtags: [
          { hashtag: { id: 'h1', tag: 'summit' } },
        ],
      };
      expect(matchesHashtag(item, 'summit')).toBe(true);
    });

    it('should match against blog_hashtags junction rows', () => {
      const item = {
        blog_hashtags: [
          { hashtag: { id: 'h1', tag: 'opinion' } },
        ],
      };
      expect(matchesHashtag(item, 'opinion')).toBe(true);
    });

    it('should return false when item has no hashtags or junction rows', () => {
      expect(matchesHashtag({}, 'test')).toBe(false);
    });

    it('should handle junction rows with null hashtag', () => {
      const item = {
        user_hashtags: [{ hashtag: null }],
      };
      expect(matchesHashtag(item, 'test')).toBe(false);
    });

    it('should prefer pre-extracted hashtags over junction rows', () => {
      const item = {
        hashtags: [{ id: 'h1', tag: 'extracted' }],
        user_hashtags: [{ hashtag: { id: 'h2', tag: 'junction' } }],
      };
      // When item.hashtags exists, junction rows are ignored
      expect(matchesHashtag(item, 'extracted')).toBe(true);
      expect(matchesHashtag(item, 'junction')).toBe(false);
    });
  });

  describe('filterByQuery', () => {
    it('should return true when no query is provided', () => {
      expect(filterByQuery('some text', '')).toBe(true);
    });

    it('should match text case-insensitively', () => {
      expect(filterByQuery('Hello World', 'hello')).toBe(true);
      expect(filterByQuery('Hello World', 'WORLD')).toBe(true);
    });

    it('should return false when text does not match', () => {
      expect(filterByQuery('Hello World', 'xyz')).toBe(false);
    });
  });

  describe('user helpers', () => {
    it('should build a display name from first and last name', () => {
      expect(getUserDisplayName({ first_name: 'Ada', last_name: 'Lovelace' })).toBe('Ada Lovelace');
    });

    it('should fall back to handle when no name exists', () => {
      expect(getUserDisplayName({ handle: 'ada' })).toBe('ada');
    });

    it('should pick the canonical avatar field first', () => {
      expect(
        getUserAvatar({
          avatar: 'https://example.com/avatar.png',
          imageURL: 'https://example.com/fallback.png',
        }),
      ).toBe('https://example.com/avatar.png');
    });

    it('should match users by handle, bio, and location', () => {
      const user = {
        first_name: 'Ada',
        last_name: 'Lovelace',
        handle: 'analytical-engine',
        bio: 'Computing pioneer',
        location: 'London',
      };

      expect(matchesUserQuery(user, 'analytical')).toBe(true);
      expect(matchesUserQuery(user, 'pioneer')).toBe(true);
      expect(matchesUserQuery(user, 'london')).toBe(true);
      expect(matchesUserQuery(user, 'nonexistent')).toBe(false);
    });
  });

  describe('sortResults', () => {
    it('should sort by date descending', () => {
      const items = [
        { id: '1', createdAt: new Date('2024-01-01') },
        { id: '2', createdAt: new Date('2024-06-01') },
        { id: '3', createdAt: new Date('2024-03-01') },
      ];
      const sorted = sortResults(items, 'date');
      expect(sorted[0].id).toBe('2');
      expect(sorted[1].id).toBe('3');
      expect(sorted[2].id).toBe('1');
    });

    it('should sort by name alphabetically', () => {
      const items = [
        { name: 'Charlie' },
        { name: 'Alice' },
        { name: 'Bob' },
      ];
      const sorted = sortResults(items, 'name');
      expect(sorted[0].name).toBe('Alice');
      expect(sorted[1].name).toBe('Bob');
      expect(sorted[2].name).toBe('Charlie');
    });

    it('should return unsorted for unknown sort key', () => {
      const items = [{ id: '1' }, { id: '2' }];
      const sorted = sortResults(items, 'unknown');
      expect(sorted).toEqual(items);
    });
  });
});
