import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search as SearchIcon, Filter, X } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';

interface SearchHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeTopics: string[];
  onTopicRemove: (topic: string) => void;
  totalResults: number;
  queryParam: string;
}

export function SearchHeader({
  searchQuery,
  setSearchQuery,
  showFilters,
  setShowFilters,
  activeTopics,
  onTopicRemove,
  totalResults,
  queryParam,
}: SearchHeaderProps) {
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">{t('features.search.title')}</h1>
        <p className="text-muted-foreground">{t('features.search.description')}</p>
      </div>

      {/* Search Bar - Fixed/Sticky */}
      <div className="sticky top-0 z-10 mb-6 space-y-4 bg-background pb-4 pt-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('features.search.placeholderDetailed')}
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
        {activeTopics.length > 0 && !showFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {t('features.search.filters.title')}:
            </span>
            {activeTopics.map(topic => (
              <Badge
                key={topic}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onTopicRemove(topic)}
              >
                {topic}
                <button
                  className="ml-2 hover:text-destructive"
                  onClick={e => {
                    e.stopPropagation();
                    onTopicRemove(topic);
                  }}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Results Summary */}
      {(queryParam || activeTopics.length > 0) && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {queryParam &&
              t('features.search.results.showingFor', { count: totalResults, query: queryParam })}
            {queryParam && activeTopics.length > 0 && ' '}
            {activeTopics.length > 0 &&
              `${t('features.search.filters.title')}: ${activeTopics.join(', ')}`}
          </p>
        </div>
      )}
    </>
  );
}
