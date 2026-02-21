import { useState } from 'react';
import { useSearch } from '@tanstack/react-router';
import type { TabSearchState } from '../types/user.types';

export function useUserWikiContentSearch() {
  const searchParams = useSearch({ strict: false }) as Record<string, string>;

  const [searchTerms, setSearchTerms] = useState<TabSearchState>({
    blogs: searchParams.blogs ?? '',
    groups: searchParams.groups ?? '',
    amendments: searchParams.amendments ?? '',
  });

  // Update URL when searchTerms change
  const updateUrlSearch = (tab: keyof TabSearchState, value: string) => {
    const current = new URLSearchParams(
      Object.entries(searchParams).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])
    );
    if (value) {
      current.set(tab, value);
    } else {
      current.delete(tab);
    }
    const search = current.toString();
    const query = search ? `?${search}` : '';
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${query}${window.location.hash}`
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
