import { SearchType } from '../types/search.types';
import { extractHashtags } from '@/zero/common/hashtagHelpers';

/**
 * Match against hashtags on an item.
 * Accepts either extracted { id, tag }[] or junction rows with nested .hashtag.
 */
export const matchesHashtag = (item: Record<string, unknown>, hashtagFilter: string) => {
  if (!hashtagFilter) return true;

  // Support both extracted { id, tag }[] and junction rows
  const tags: { id: string; tag: string }[] = item.hashtags
    ? (item.hashtags as { id: string; tag: string }[])
    : extractHashtags(
        (item.user_hashtags ||
          item.group_hashtags ||
          item.amendment_hashtags ||
          item.event_hashtags ||
          item.blog_hashtags) as ReadonlyArray<{ hashtag?: { id: string; tag: string } | null }> | undefined
      );

  if (!tags || tags.length === 0) return false;

  // Remove # symbol if present at the start
  const cleanFilter = hashtagFilter.startsWith('#')
    ? hashtagFilter.substring(1).toLowerCase()
    : hashtagFilter.toLowerCase();

  // Check if any hashtag matches
  return tags.some(h => {
    if (!h || !h.tag) return false;
    return h.tag.toLowerCase() === cleanFilter || h.tag.toLowerCase().includes(cleanFilter);
  });
};

export const filterByQuery = (text: unknown, queryParam: string) => {
  if (!queryParam) return true; // If no query, don't filter by text
  if (text == null) return false;
  return String(text).toLowerCase().includes(queryParam.toLowerCase());
};

export const getUserDisplayName = (user: Record<string, unknown> | null | undefined): string => {
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  return fullName || String(user?.name ?? user?.handle ?? '');
};

export const getUserAvatar = (user: Record<string, unknown> | null | undefined): string => {
  return String(user?.avatar ?? user?.avatarUrl ?? user?.imageURL ?? (user?.avatarFile as Record<string, unknown> | undefined)?.url ?? '');
};

export const matchesUserQuery = (user: Record<string, unknown> | null | undefined, queryParam: string) => {
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

export const sortResults = <T extends Record<string, unknown>>(items: readonly T[], sortBy: string): T[] => {
  if (sortBy === 'date') {
    return [...items].sort((a, b) => {
      const dateA = (a.createdAt ?? a.date ?? a.joinedAt ?? new Date(0)) as string | number | Date;
      const dateB = (b.createdAt ?? b.date ?? b.joinedAt ?? new Date(0)) as string | number | Date;
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
