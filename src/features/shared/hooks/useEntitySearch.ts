import { useMemo } from 'react';

/**
 * Resolves a nested field path like "group.name" from an object.
 */
function resolveField(obj: any, path: string): string {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current == null) return '';
    current = current[part];
  }
  return typeof current === 'string' ? current : '';
}

interface UseEntitySearchOptions<T> {
  items: T[];
  searchQuery: string;
  searchFields: string[];
}

/**
 * Generic entity search hook. Filters items by matching a search query
 * against one or more fields (supports nested paths like "group.name").
 */
export function useEntitySearch<T>({
  items,
  searchQuery,
  searchFields,
}: UseEntitySearchOptions<T>): T[] {
  return useMemo(() => {
    const trimmed = searchQuery.trim().toLowerCase();
    if (!trimmed) return items;

    return items.filter(item =>
      searchFields.some(field => resolveField(item, field).toLowerCase().includes(trimmed))
    );
  }, [items, searchQuery, searchFields]);
}
