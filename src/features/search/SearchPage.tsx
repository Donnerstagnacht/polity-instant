import { useState } from 'react';
import { useSearchURL } from './hooks/useSearchURL';
import { useSearchData } from './hooks/useSearchData';
import { useSearchFilters } from './hooks/useSearchFilters';
import { SearchHeader } from './ui/SearchHeader';
import { SearchFilters } from './ui/SearchFilters';
import { SearchTabs } from './ui/SearchTabs';

export function SearchPage() {
  const {
    searchQuery,
    setSearchQuery,
    searchType,
    sortBy,
    setSortBy,
    publicOnly,
    setPublicOnly,
    hashtagFilter,
    setHashtagFilter,
    handleTypeChange,
  } = useSearchURL();

  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading } = useSearchData();

  const { allResults, totalResults, mosaicResults } = useSearchFilters(data, {
    query: searchQuery,
    type: searchType,
    sortBy,
    publicOnly,
    hashtag: hashtagFilter,
  });

  return (
    <>
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        hashtagFilter={hashtagFilter}
        setHashtagFilter={setHashtagFilter}
        totalResults={totalResults}
        queryParam={searchQuery}
      />

      {showFilters && (
        <SearchFilters
          sortBy={sortBy}
          setSortBy={setSortBy}
          publicOnly={publicOnly}
          setPublicOnly={setPublicOnly}
          hashtagFilter={hashtagFilter}
          setHashtagFilter={setHashtagFilter}
        />
      )}

      <SearchTabs
        searchType={searchType}
        handleTypeChange={handleTypeChange}
        totalResults={totalResults}
        allResults={allResults}
        mosaicResults={mosaicResults}
        isLoading={isLoading}
      />
    </>
  );
}
