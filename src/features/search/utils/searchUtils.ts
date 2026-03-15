import { SearchType } from '../types/search.types';
import { extractHashtags } from '@/zero/common/hashtagHelpers';

type HashtagJunction = ReadonlyArray<{ hashtag?: { id: string; tag: string } | null }>;

interface HashtagEntity {
  hashtags?: { id: string; tag: string }[];
  user_hashtags?: HashtagJunction;
  group_hashtags?: HashtagJunction;
  amendment_hashtags?: HashtagJunction;
  event_hashtags?: HashtagJunction;
  blog_hashtags?: HashtagJunction;
  statement_hashtags?: HashtagJunction;
}

interface UserLike {
  first_name?: string | null;
  last_name?: string | null;
  name?: string | null;
  handle?: string | null;
  avatar?: string | null;
  avatarUrl?: string | null;
  imageURL?: string | null;
  avatarFile?: { url?: string | null } | null;
  bio?: string | null;
  location?: string | null;
  contactLocation?: string | null;
}

interface SortableItem {
  created_at?: string | number | Date | null;
  date?: string | number | Date | null;
  joined_at?: string | number | Date | null;
  name?: string | null;
  title?: string | null;
}

/**
 * Match against hashtags on an item.
 * Accepts either extracted { id, tag }[] or junction rows with nested .hashtag.
 */
export const matchesHashtag = (item: HashtagEntity, hashtagFilter: string) => {
  if (!hashtagFilter) return true;

  // Support both extracted { id, tag }[] and junction rows
  const tags: { id: string; tag: string }[] = item.hashtags
    ? item.hashtags
    : extractHashtags(
        item.user_hashtags ||
          item.group_hashtags ||
          item.amendment_hashtags ||
          item.event_hashtags ||
          item.blog_hashtags
      );

  if (!tags || tags.length === 0) return false;

  // Remove # symbol if present at the start
  const cleanFilter = hashtagFilter.startsWith('#')
    ? hashtagFilter.substring(1).toLowerCase()
    : hashtagFilter.toLowerCase();

  // Check if hashtags match the filter
  return tags.some(h => {
    if (!h || !h.tag) return false;
    return h.tag.toLowerCase() === cleanFilter || h.tag.toLowerCase().includes(cleanFilter);
  });
};

export const filterByQuery = (text: string | null | undefined, queryParam: string) => {
  if (!queryParam) return true; // If no query, don't filter by text
  if (text == null) return false;
  return String(text).toLowerCase().includes(queryParam.toLowerCase());
};

export const getUserDisplayName = (user: UserLike | null | undefined): string => {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  return fullName || String(user?.name ?? user?.handle ?? '');
};

export const getUserAvatar = (user: UserLike | null | undefined): string => {
  return String(user?.avatar ?? user?.avatarUrl ?? user?.imageURL ?? user?.avatarFile?.url ?? '');
};

export const matchesUserQuery = (user: UserLike | null | undefined, queryParam: string) => {
  if (!queryParam) return true;

  const displayName = getUserDisplayName(user);
  return [
    displayName,
    user?.handle,
    user?.bio,
    user?.location,
    user?.contactLocation,
  ].some(value => filterByQuery(value, queryParam));
};

export const sortResults = <T extends SortableItem>(items: readonly T[], sortBy: string): T[] => {
  if (sortBy === 'date') {
    return [...items].sort((a, b) => {
      const dateA = (a.created_at ?? a.date ?? a.joined_at ?? new Date(0)) as string | number | Date;
      const dateB = (b.created_at ?? b.date ?? b.joined_at ?? new Date(0)) as string | number | Date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }
  if (sortBy === 'name' || sortBy === 'title') {
    return [...items].sort((a, b) => {
      const nameA = String(a.name || a.title || '');
      const nameB = String(b.name || b.title || '');
      return nameA.localeCompare(nameB);
    });
  }
  return [...items];
};
