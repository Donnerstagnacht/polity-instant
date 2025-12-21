import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SearchFiltersProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
  publicOnly: boolean;
  setPublicOnly: (publicOnly: boolean) => void;
  hashtagFilter: string;
  setHashtagFilter: (hashtag: string) => void;
}

export function SearchFilters({
  sortBy,
  setSortBy,
  publicOnly,
  setPublicOnly,
  hashtagFilter,
  setHashtagFilter,
}: SearchFiltersProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
        <CardDescription>Refine your search results</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sort">Sort By</Label>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger id="sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="name">Name/Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="public-only" checked={publicOnly} onCheckedChange={setPublicOnly} />
            <Label htmlFor="public-only" className="cursor-pointer">
              Public groups only
            </Label>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="hashtag-filter">Filter by Hashtag</Label>
          <Input
            id="hashtag-filter"
            placeholder="Enter hashtag to filter..."
            value={hashtagFilter}
            onChange={e => setHashtagFilter(e.target.value)}
          />
          {hashtagFilter && (
            <p className="text-xs text-muted-foreground">Filtering by: #{hashtagFilter}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
