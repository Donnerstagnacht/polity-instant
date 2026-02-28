import { useCallback } from 'react';
import { useTranslation } from '@/features/shared/hooks/use-translation';
import { useSearchPage } from './hooks/useSearchPage';
import { SearchHeader } from './ui/SearchHeader';
import { MasonryGrid } from '@/features/timeline/ui/MasonryGrid';
import { TimelineFilterPanel } from '@/features/timeline/ui/TimelineFilterPanel';
import { DynamicTimelineCard } from '@/features/timeline/ui/LazyCardComponents';
import type { SearchContentItem } from './types/search.types';

export function SearchPage() {
  const { t } = useTranslation();
  const {
    searchQuery,
    setSearchQuery,
    contentTypes,
    setContentTypes,
    dateRange,
    setDateRange,
    topics,
    engagement,
    setEngagement,
    showFilters,
    setShowFilters,
    isLoading,
    contentItems,
    filteredItems,
    availableTopics,
    hasActiveFilters,
    toggleContentType,
    toggleTopic,
    resetFilters,
    buildCardProps,
  } = useSearchPage();

  const renderTimelineCard = useCallback(
    (item: SearchContentItem) => {
      const { cardType, cardProps } = buildCardProps(item, t);
      if (!cardType || !cardProps) return null;
      return <DynamicTimelineCard cardType={cardType} cardProps={cardProps} />;
    },
    [buildCardProps, t],
  );

  return (
    <div>
      <SearchHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        activeTopics={topics}
        onTopicRemove={toggleTopic}
        totalResults={filteredItems.length}
        queryParam={searchQuery}
      />

      {showFilters && (
        <TimelineFilterPanel
          open={showFilters}
          onClose={() => setShowFilters(false)}
          contentTypes={contentTypes}
          onContentTypesChange={setContentTypes}
          onContentTypeToggle={toggleContentType}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          topics={topics}
          availableTopics={availableTopics}
          onTopicToggle={toggleTopic}
          engagement={engagement}
          onEngagementChange={setEngagement}
          onResetFilters={resetFilters}
          hasActiveFilters={hasActiveFilters}
        />
      )}

      {isLoading && contentItems.length === 0 ? (
        <MasonryGrid
          items={[]}
          renderItem={renderTimelineCard}
          keyExtractor={item => item.id}
          isLoading={true}
        />
      ) : (
        <MasonryGrid
          items={filteredItems}
          renderItem={renderTimelineCard}
          keyExtractor={item => item.id}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
