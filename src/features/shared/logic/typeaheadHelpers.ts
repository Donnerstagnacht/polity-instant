/**
 * Pure functions for typeahead search filtering, ranking, and result grouping.
 */

export type EntityType = 'user' | 'group' | 'amendment' | 'event' | 'election' | 'position';

export interface TypeaheadItem {
  id: string;
  entityType: EntityType;
  label: string;
  secondaryLabel?: string;
  avatar?: string | null;
  hashtags?: string[];
}

/**
 * Filter items by query against specified search keys.
 * Case-insensitive prefix/substring match.
 */
export function filterItems<T>(
  items: T[],
  query: string,
  searchKeys: (keyof T)[],
): T[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase().trim();
  return items.filter(item =>
    searchKeys.some(key => {
      const value = item[key];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      if (Array.isArray(value)) {
        return value.some(v => typeof v === 'string' && v.toLowerCase().includes(lowerQuery));
      }
      return false;
    }),
  );
}

/**
 * Return start/end match ranges for highlighting query within text.
 */
export function highlightMatch(
  text: string,
  query: string,
): { start: number; end: number }[] {
  if (!query.trim() || !text) return [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  const ranges: { start: number; end: number }[] = [];
  let idx = 0;
  while (idx < lowerText.length) {
    const found = lowerText.indexOf(lowerQuery, idx);
    if (found === -1) break;
    ranges.push({ start: found, end: found + lowerQuery.length });
    idx = found + 1;
  }
  return ranges;
}

/**
 * Group typeahead items by their entity type.
 */
export function groupResultsByType(
  items: TypeaheadItem[],
): Record<EntityType, TypeaheadItem[]> {
  const groups: Record<EntityType, TypeaheadItem[]> = {
    user: [],
    group: [],
    amendment: [],
    event: [],
    election: [],
    position: [],
  };
  for (const item of items) {
    groups[item.entityType].push(item);
  }
  return groups;
}

/**
 * Score-based sorting: name prefix match > name contains > hashtag match > others.
 */
export function sortByRelevance(
  items: TypeaheadItem[],
  query: string,
): TypeaheadItem[] {
  if (!query.trim()) return items;
  const lowerQuery = query.toLowerCase().trim();

  return [...items].sort((a, b) => {
    const scoreA = getRelevanceScore(a, lowerQuery);
    const scoreB = getRelevanceScore(b, lowerQuery);
    return scoreB - scoreA;
  });
}

function getRelevanceScore(item: TypeaheadItem, lowerQuery: string): number {
  let score = 0;
  const lowerLabel = item.label.toLowerCase();

  // Exact match
  if (lowerLabel === lowerQuery) score += 100;
  // Prefix match
  else if (lowerLabel.startsWith(lowerQuery)) score += 50;
  // Contains match
  else if (lowerLabel.includes(lowerQuery)) score += 25;

  // Secondary label match
  if (item.secondaryLabel) {
    const lowerSecondary = item.secondaryLabel.toLowerCase();
    if (lowerSecondary.startsWith(lowerQuery)) score += 15;
    else if (lowerSecondary.includes(lowerQuery)) score += 10;
  }

  // Hashtag match
  if (item.hashtags?.some(h => h.toLowerCase().includes(lowerQuery))) {
    score += 5;
  }

  return score;
}
