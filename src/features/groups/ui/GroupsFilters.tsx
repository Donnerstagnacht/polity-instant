import React from 'react';
import { useGroupsStore } from '@/global-state/groups.store';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const GroupsFilters: React.FC = () => {
  const { searchTerm, selectedTags, setSearchTerm, toggleTag, setSelectedTags, getAllTags } =
    useGroupsStore();

  const allTags = getAllTags();

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  const hasActiveFilters = searchTerm !== '' || selectedTags.length > 0;

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search groups by name, description, or tags..."
          className="pl-10"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tag Filters */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-foreground">Filter by tags:</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-3 text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-3 w-3" />
              Clear filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => {
            const isSelected = selectedTags.includes(tag);
            return (
              <Badge
                key={tag}
                variant={isSelected ? 'default' : 'outline'}
                className="cursor-pointer transition-opacity hover:opacity-80"
                onClick={() => toggleTag(tag)}
              >
                #{tag}
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="text-xs">
              Search: "{searchTerm}"
            </Badge>
          )}
          {selectedTags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
