'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, Hash, Search as SearchIcon } from 'lucide-react';
import type { AmendmentFilters } from '../hooks/useAmendmentFilters';

interface AmendmentSearchAndFiltersProps {
  filters: AmendmentFilters;
  showFilters: boolean;
  hasActiveFilters: boolean;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onHashtagChange: (value: string) => void;
  onToggleFilters: () => void;
  onClearStatusFilter: () => void;
  onClearHashtagFilter: () => void;
}

export function AmendmentSearchAndFilters({
  filters,
  showFilters,
  hasActiveFilters,
  onSearchChange,
  onStatusChange,
  onHashtagChange,
  onToggleFilters,
  onClearStatusFilter,
  onClearHashtagFilter,
}: AmendmentSearchAndFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search amendments..."
            value={filters.searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={onToggleFilters}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && !showFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.statusFilter !== 'all' && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={onClearStatusFilter}
            >
              Status: {filters.statusFilter}
              <button
                className="ml-2 hover:text-destructive"
                onClick={e => {
                  e.stopPropagation();
                  onClearStatusFilter();
                }}
              >
                ×
              </button>
            </Badge>
          )}
          {filters.hashtagFilter && (
            <Badge
              variant="secondary"
              className="cursor-pointer"
              onClick={onClearHashtagFilter}
            >
              <Hash className="mr-1 h-3 w-3" />
              {filters.hashtagFilter.replace(/^#/, '')}
              <button
                className="ml-2 hover:text-destructive"
                onClick={e => {
                  e.stopPropagation();
                  onClearHashtagFilter();
                }}
              >
                ×
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Refine your search results</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="status-filter">Filter by Status</Label>
              <Select value={filters.statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger id="status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hashtag-filter">Filter by Hashtag</Label>
              <Input
                id="hashtag-filter"
                placeholder="Enter hashtag to filter..."
                value={filters.hashtagFilter}
                onChange={e => onHashtagChange(e.target.value)}
              />
              {filters.hashtagFilter && (
                <p className="text-xs text-muted-foreground">
                  Filtering by: #{filters.hashtagFilter}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
