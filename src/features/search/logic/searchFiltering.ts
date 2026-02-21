import type { SearchContentItem } from '../types/search.types';
import type { ContentType } from '@/features/timeline/constants/content-type-config';
import type { DateRangeFilter, EngagementFilter, TimelineSortOption } from '@/features/timeline/hooks/useTimelineFilters';

export function getDateCutoff(dateRange: DateRangeFilter): Date | null {
  const now = new Date();
  switch (dateRange) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case 'month':
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    case 'year':
      return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    case 'all':
    default:
      return null;
  }
}

export function getCreatedAt(item: SearchContentItem): Date {
  return item.createdAt instanceof Date ? item.createdAt : new Date(item.createdAt);
}

export function getEngagementScore(item: SearchContentItem): number {
  const stats = item.stats;
  return (
    (stats?.reactions ?? 0) + (stats?.comments ?? 0) + (stats?.views ?? 0) + (stats?.members ?? 0)
  );
}

export function filterAndSortContentItems(
  contentItems: SearchContentItem[],
  options: {
    contentTypes: ContentType[];
    dateRange: DateRangeFilter;
    topics: string[];
    engagement: EngagementFilter;
    sortBy: TimelineSortOption;
  },
): SearchContentItem[] {
  let items = [...contentItems];

  if (options.contentTypes.length === 0) {
    return [];
  }

  items = items.filter(item => options.contentTypes.includes(item.type));

  const cutoff = getDateCutoff(options.dateRange);
  if (cutoff) {
    items = items.filter(item => getCreatedAt(item) >= cutoff);
  }

  if (options.topics.length > 0) {
    items = items.filter(item => {
      const tags = item.tags ?? [];
      return tags.some(tag => options.topics.includes(tag));
    });
  }

  if (options.engagement !== 'all') {
    items = items.filter(item => {
      const score = getEngagementScore(item);
      const createdAt = getCreatedAt(item);
      switch (options.engagement) {
        case 'popular':
          return score > 0;
        case 'rising':
          return score > 0 && createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        case 'discussed':
          return (item.stats?.comments ?? 0) > 0;
        default:
          return true;
      }
    });
  }

  switch (options.sortBy) {
    case 'engagement':
      items.sort((a, b) => getEngagementScore(b) - getEngagementScore(a));
      break;
    case 'trending':
      items.sort((a, b) => {
        const aAge = Math.max(Date.now() - getCreatedAt(a).getTime(), 1);
        const bAge = Math.max(Date.now() - getCreatedAt(b).getTime(), 1);
        const aScore = getEngagementScore(a) / (aAge / 3600000);
        const bScore = getEngagementScore(b) / (bAge / 3600000);
        return bScore - aScore;
      });
      break;
    case 'recent':
    default:
      items.sort((a, b) => getCreatedAt(b).getTime() - getCreatedAt(a).getTime());
      break;
  }

  return items;
}

export function collectAvailableTopics(contentItems: SearchContentItem[]): string[] {
  const topicSet = new Set<string>();
  for (const item of contentItems) {
    for (const tag of item.tags ?? []) {
      topicSet.add(tag);
    }
  }
  return Array.from(topicSet).slice(0, 20);
}

export function buildAgendaItemsByEventId(
  agendaItems: any[],
): Map<string, Array<{ election?: unknown; amendmentVote?: unknown }>> {
  const map = new Map<string, Array<{ election?: unknown; amendmentVote?: unknown }>>();
  for (const item of agendaItems ?? []) {
    const eventId = (item as any).event?.id as string | undefined;
    if (!eventId) continue;
    const list = map.get(eventId) ?? [];
    list.push(item as any);
    map.set(eventId, list);
  }
  return map;
}

export function hasActiveFilters(
  contentTypes: ContentType[],
  allContentTypesLength: number,
  dateRange: DateRangeFilter,
  topics: string[],
  engagement: EngagementFilter,
  searchQuery: string,
): boolean {
  return (
    contentTypes.length !== allContentTypesLength ||
    dateRange !== 'all' ||
    topics.length > 0 ||
    engagement !== 'all' ||
    searchQuery.length > 0
  );
}
