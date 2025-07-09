import { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import type { TabSearchState } from '../types/user.types';

export function useUserWikiContentSearch() {
  const search = useSearch({
    from: '/user/$id/',
  });

  const [searchTerms, setSearchTerms] = useState<TabSearchState>({
    blogs: search.blogs ?? '',
    groups: search.groups ?? '',
    amendments: search.amendments ?? '',
  });

  // Update URL when searchTerms change
  const updateUrlSearch = (tab: keyof TabSearchState, value: string) => {
    const newSearch = { ...search, [tab]: value || undefined };
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}?${Object.entries(newSearch)
        .filter(([, v]) => v)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
        .join('&')}${window.location.hash}`
    );
  };

  // Handle search input changes
  const handleSearchChange = (tab: keyof TabSearchState, value: string) => {
    setSearchTerms(prev => ({
      ...prev,
      [tab]: value,
    }));
    updateUrlSearch(tab, value);
  };

  return { searchTerms, handleSearchChange };
}
