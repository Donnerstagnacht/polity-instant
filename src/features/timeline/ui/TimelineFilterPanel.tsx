'use client';

import { X, RotateCcw } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ContentType, CONTENT_TYPE_CONFIG } from '../constants/content-type-config';
import { DateRangeFilter, EngagementFilter, ALL_CONTENT_TYPES } from '../hooks/useTimelineFilters';

export interface TimelineFilterPanelProps {
  /** Whether the panel is open */
  open: boolean;
  /** Callback to close the panel */
  onClose: () => void;
  /** Selected content types */
  contentTypes: ContentType[];
  /** Callback when content type selection changes */
  onContentTypesChange: (types: ContentType[]) => void;
  /** Toggle a single content type */
  onContentTypeToggle: (type: ContentType) => void;
  /** Selected date range */
  dateRange: DateRangeFilter;
  /** Callback when date range changes */
  onDateRangeChange: (range: DateRangeFilter) => void;
  /** Selected topics */
  topics: string[];
  /** Available topics to choose from */
  availableTopics?: string[];
  /** Callback when topic is toggled */
  onTopicToggle: (topic: string) => void;
  /** Selected engagement filter */
  engagement: EngagementFilter;
  /** Callback when engagement changes */
  onEngagementChange: (engagement: EngagementFilter) => void;
  /** Callback to reset all filters */
  onResetFilters: () => void;
  /** Whether any filters are active */
  hasActiveFilters: boolean;
}

/**
 * Date range options
 */
const DATE_RANGE_OPTIONS: { value: DateRangeFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'features.timeline.period.all' },
  { value: 'today', labelKey: 'features.timeline.period.day' },
  { value: 'week', labelKey: 'features.timeline.period.week' },
  { value: 'month', labelKey: 'features.timeline.period.month' },
  { value: 'year', labelKey: 'features.timeline.period.year' },
];

/**
 * Engagement options
 */
const ENGAGEMENT_OPTIONS: { value: EngagementFilter; labelKey: string }[] = [
  { value: 'all', labelKey: 'features.timeline.filters.allActivity' },
  { value: 'popular', labelKey: 'features.timeline.filters.popular' },
  { value: 'rising', labelKey: 'features.timeline.filters.rising' },
  { value: 'discussed', labelKey: 'features.timeline.filters.discussed' },
];

/**
 * TimelineFilterPanel - Sidebar/sheet for timeline filters
 *
 * Features:
 * - Content type checkboxes with icons
 * - Date range filter buttons
 * - Topic pills (multi-select)
 * - Engagement level filter
 * - Clear all filters button
 */
export function TimelineFilterPanel({
  open,
  onClose,
  contentTypes,
  onContentTypesChange,
  onContentTypeToggle,
  dateRange,
  onDateRangeChange,
  topics,
  availableTopics = [],
  onTopicToggle,
  engagement,
  onEngagementChange,
  onResetFilters,
  hasActiveFilters,
}: TimelineFilterPanelProps) {
  const { t } = useTranslation();

  const handleSelectAllContentTypes = () => {
    onContentTypesChange([...ALL_CONTENT_TYPES]);
  };

  const handleDeselectAllContentTypes = () => {
    onContentTypesChange([]);
  };

  return (
    <Sheet open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <SheetContent className="w-[320px] overflow-y-auto sm:w-[400px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {t('features.timeline.filters.title', { defaultValue: 'Filters' })}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={onResetFilters} className="h-8 text-xs">
                <RotateCcw className="mr-1 h-3 w-3" />
                {t('features.timeline.filters.clearAll', { defaultValue: 'Clear all' })}
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {t('features.timeline.filters.description', {
              defaultValue: 'Customize what content appears in your timeline',
            })}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Content Types */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-sm font-medium">
                {t('features.timeline.filters.contentTypes', { defaultValue: 'Content Types' })}
              </h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllContentTypes}
                  className="h-6 px-2 text-xs"
                >
                  {t('features.timeline.filters.all', { defaultValue: 'All' })}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDeselectAllContentTypes}
                  className="h-6 px-2 text-xs"
                >
                  {t('features.timeline.filters.none', { defaultValue: 'None' })}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_CONTENT_TYPES.map(type => {
                const config = CONTENT_TYPE_CONFIG[type];
                const Icon = config.icon;
                const isSelected = contentTypes.includes(type);

                return (
                  <div
                    key={type}
                    className={cn(
                      'flex items-center gap-2 rounded-md border p-2 transition-colors',
                      isSelected
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-transparent bg-muted/50'
                    )}
                  >
                    <Checkbox
                      id={`filter-${type}`}
                      checked={isSelected}
                      onCheckedChange={() => onContentTypeToggle(type)}
                    />
                    <Label
                      htmlFor={`filter-${type}`}
                      className="flex cursor-pointer items-center gap-1.5 text-sm"
                    >
                      <Icon className={cn('h-4 w-4', config.accentColor)} />
                      {t(config.labelKey)}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div>
            <h4 className="mb-3 text-sm font-medium">
              {t('features.timeline.filters.dateRange', { defaultValue: 'Date Range' })}
            </h4>
            <div className="flex flex-wrap gap-2">
              {DATE_RANGE_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={dateRange === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onDateRangeChange(option.value)}
                  className="h-8"
                >
                  {t(option.labelKey)}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Engagement Level */}
          <div>
            <h4 className="mb-3 text-sm font-medium">
              {t('features.timeline.filters.engagement', { defaultValue: 'Engagement' })}
            </h4>
            <div className="flex flex-wrap gap-2">
              {ENGAGEMENT_OPTIONS.map(option => (
                <Button
                  key={option.value}
                  variant={engagement === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => onEngagementChange(option.value)}
                  className="h-8"
                >
                  {t(option.labelKey, { defaultValue: option.value })}
                </Button>
              ))}
            </div>
          </div>

          {/* Topics */}
          {availableTopics.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="mb-3 text-sm font-medium">
                  {t('features.timeline.filters.topics', { defaultValue: 'Topics' })}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {availableTopics.map(topic => {
                    const isSelected = topics.includes(topic);
                    return (
                      <Badge
                        key={topic}
                        variant={isSelected ? 'default' : 'outline'}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isSelected && 'bg-primary'
                        )}
                        onClick={() => onTopicToggle(topic)}
                      >
                        {topic}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer with apply/close */}
        <div className="mt-8 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            {t('common.actions.close', { defaultValue: 'Close' })}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default TimelineFilterPanel;
