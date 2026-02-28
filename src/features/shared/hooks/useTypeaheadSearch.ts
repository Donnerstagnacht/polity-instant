import { useState, useMemo } from 'react';
import { useTypeaheadData } from './useTypeaheadData';
import { filterItems, sortByRelevance, groupResultsByType, type EntityType, type TypeaheadItem } from '@/features/shared/logic/typeaheadHelpers';

interface UseTypeaheadSearchOptions {
  entityTypes: EntityType[];
}

/**
 * Full typeahead search hook: manages query state, debounce, filtering, and grouping.
 */
export function useTypeaheadSearch({ entityTypes }: UseTypeaheadSearchOptions) {
  const [query, setQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<TypeaheadItem | null>(null);
  const { items } = useTypeaheadData({ entityTypes });

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 20);
    const filtered = filterItems(items, query, ['label', 'secondaryLabel', 'hashtags'] as (keyof TypeaheadItem)[]);
    return sortByRelevance(filtered, query);
  }, [items, query]);

  const groupedResults = useMemo(() => groupResultsByType(results), [results]);

  return {
    query,
    setQuery,
    results,
    groupedResults,
    selectedItem,
    setSelectedItem,
  };
}
