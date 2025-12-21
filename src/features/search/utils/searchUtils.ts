import { SearchType } from '../types/search.types';

export const matchesHashtag = (item: any, hashtagFilter: string) => {
  if (!hashtagFilter) return true;
  if (!item.hashtags || item.hashtags.length === 0) return false;

  // Remove # symbol if present at the start
  const cleanFilter = hashtagFilter.startsWith('#')
    ? hashtagFilter.substring(1).toLowerCase()
    : hashtagFilter.toLowerCase();

  // Check if any hashtag matches
  return item.hashtags.some((h: any) => {
    if (!h || !h.tag) return false;
    return h.tag.toLowerCase() === cleanFilter || h.tag.toLowerCase().includes(cleanFilter);
  });
};

export const filterByQuery = (text: string, queryParam: string) => {
  if (!queryParam) return true; // If no query, don't filter by text
  return text.toLowerCase().includes(queryParam.toLowerCase());
};

export const sortResults = (items: any[], sortBy: string) => {
  if (sortBy === 'date') {
    return [...items].sort((a, b) => {
      const dateA = a.createdAt || a.date || a.joinedAt || new Date(0);
      const dateB = b.createdAt || b.date || b.joinedAt || new Date(0);
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }
  if (sortBy === 'name' || sortBy === 'title') {
    return [...items].sort((a, b) => {
      const nameA = a.name || a.title || '';
      const nameB = b.name || b.title || '';
      return nameA.localeCompare(nameB);
    });
  }
  return items;
};
