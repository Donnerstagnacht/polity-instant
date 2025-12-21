import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Filter, Hash } from 'lucide-react';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  hashtagFilter: string;
  setHashtagFilter: (hashtag: string) => void;
  totalResults: number;
  queryParam: string;
}

export function SearchHeader({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  hashtagFilter,
  setHashtagFilter,
  totalResults,
  queryParam,
}: SearchHeaderProps) {
  return (
    <>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Find users, groups, statements, blogs, and amendments
        </p>
      </div>

      {/* Search Bar - Fixed/Sticky */}
      <div className="sticky top-0 z-10 mb-6 space-y-4 bg-background pb-4 pt-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search for anything... (type-ahead enabled)"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Active Filters Display */}
        {hashtagFilter && !showFilters && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filter:</span>
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={() => setHashtagFilter('')}
            >
              <Hash className="mr-1 h-3 w-3" />
              {hashtagFilter.replace(/^#/, '')}
              <button
                className="ml-2 hover:text-destructive"
                onClick={e => {
                  e.stopPropagation();
                  setHashtagFilter('');
                }}
              >
                ×
              </button>
            </Badge>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {(queryParam || hashtagFilter) && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {queryParam &&
              `Found ${totalResults} result${totalResults !== 1 ? 's' : ''} for "${queryParam}"`}
            {queryParam && hashtagFilter && ' '}
            {hashtagFilter && `Filtering by hashtag: #${hashtagFilter.replace(/^#/, '')}`}
          </p>
        </div>
      )}
    </>
  );
}
