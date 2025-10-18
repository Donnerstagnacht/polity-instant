import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { TabSearchState } from '../types/user.types';

export function useUserWikiContentSearch() {
  const searchParams = useSearchParams();

  const [searchTerms, setSearchTerms] = useState<TabSearchState>({
    blogs: searchParams.get('blogs') ?? '',
    groups: searchParams.get('groups') ?? '',
    amendments: searchParams.get('amendments') ?? '',
  });

  // Update URL when searchTerms change
  const updateUrlSearch = (tab: keyof TabSearchState, value: string) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
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
