import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { SearchType } from '../types/search.types';

export function useSearchURL() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters
  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as SearchType;
  const sortParam = searchParams.get('sort') || 'relevance';
  const publicOnlyParam = searchParams.get('public') === 'true';
  const hashtagParam = searchParams.get('hashtag') || '';

  // Local state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [searchType, setSearchType] = useState<SearchType>(typeParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [publicOnly, setPublicOnly] = useState(publicOnlyParam);
  const [hashtagFilter, setHashtagFilter] = useState(hashtagParam);

  // Update URL when search parameters change
  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  // Type-ahead search: Update URL as user types (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({
        q: searchQuery,
        type: searchType,
        sort: sortBy,
        public: publicOnly ? 'true' : '',
        hashtag: hashtagFilter,
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchType, sortBy, publicOnly, hashtagFilter]);

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
    updateURL({
      q: searchQuery,
      type,
      sort: sortBy,
      public: publicOnly ? 'true' : '',
      hashtag: hashtagFilter,
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    sortBy,
    setSortBy,
    publicOnly,
    setPublicOnly,
    hashtagFilter,
    setHashtagFilter,
    handleTypeChange,
  };
}
