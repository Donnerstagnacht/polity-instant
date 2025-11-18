'use client';

import { use, useState, useEffect } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../../db';
import { FileText, Search as SearchIcon, Filter, Hash, Calendar } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useNavigation } from '@/navigation/state/useNavigation';

export default function GroupAmendmentsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { currentPrimaryRoute } = useNavigation();

  // Set current route to 'group' when this page is loaded
  useEffect(() => {
    // The useNavigation hook will automatically detect we're on a /group/ route
    // and set the appropriate secondary navigation
  }, [currentPrimaryRoute]);

  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [hashtagFilter, setHashtagFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch group and amendments data from InstantDB
  const { data, isLoading } = db.useQuery({
    groups: {
      $: { where: { id: resolvedParams.id } },
      amendments: {
        user: {},
        hashtags: {},
      },
    },
  });

  const group = data?.groups?.[0];
  const amendments = group?.amendments || [];

  // Filter by hashtag
  const matchesHashtag = (amendment: any) => {
    if (!hashtagFilter) return true;
    if (!amendment.hashtags || amendment.hashtags.length === 0) return false;

    const cleanFilter = hashtagFilter.startsWith('#')
      ? hashtagFilter.substring(1).toLowerCase()
      : hashtagFilter.toLowerCase();

    return amendment.hashtags.some((h: any) => {
      if (!h || !h.tag) return false;
      return h.tag.toLowerCase() === cleanFilter || h.tag.toLowerCase().includes(cleanFilter);
    });
  };

  // Filter by search query
  const filterByQuery = (text: string) => {
    if (!searchQuery) return true;
    return text.toLowerCase().includes(searchQuery.toLowerCase());
  };

  // Apply all filters
  const filteredAmendments = amendments.filter((amendment: any) => {
    if (!filterByQuery(amendment.title || '')) return false;
    if (amendment.subtitle && !filterByQuery(amendment.subtitle)) return false;
    if (statusFilter !== 'all' && amendment.status !== statusFilter) return false;
    if (!matchesHashtag(amendment)) return false;
    return true;
  });

  // Sort by date (most recent first)
  const sortedAmendments = [...filteredAmendments].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-gray-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'approved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      case 'active':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading amendments...</div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  if (!group) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">
            <h1 className="mb-4 text-2xl font-bold">Group Not Found</h1>
            <p className="text-muted-foreground">
              The group you're looking for doesn't exist or has been removed.
            </p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-3xl font-bold">{group.name} - Amendments</h1>
          <p className="text-muted-foreground">
            {sortedAmendments.length} amendment{sortedAmendments.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search amendments..."
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
          {(statusFilter !== 'all' || hashtagFilter) && !showFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {statusFilter !== 'all' && (
                <Badge
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setStatusFilter('all')}
                >
                  Status: {statusFilter}
                  <button
                    className="ml-2 hover:text-destructive"
                    onClick={e => {
                      e.stopPropagation();
                      setStatusFilter('all');
                    }}
                  >
                    ×
                  </button>
                </Badge>
              )}
              {hashtagFilter && (
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
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                    value={hashtagFilter}
                    onChange={e => setHashtagFilter(e.target.value)}
                  />
                  {hashtagFilter && (
                    <p className="text-xs text-muted-foreground">Filtering by: #{hashtagFilter}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Amendments List */}
        {sortedAmendments.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {amendments.length === 0
              ? 'No amendments found for this group.'
              : 'No amendments match your search criteria.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedAmendments.map((amendment: any) => (
              <a href={`/amendment/${amendment.id}`} key={amendment.id} className="block">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="default" className="text-xs">
                        <FileText className="mr-1 h-3 w-3" />
                        Amendment
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(amendment.status)}`}>
                        {amendment.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{amendment.title}</CardTitle>
                    {amendment.subtitle && (
                      <CardDescription className="line-clamp-2">
                        {amendment.subtitle}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {amendment.code && (
                      <div className="font-mono text-sm text-muted-foreground">
                        Code: {amendment.code}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(amendment.date).toLocaleDateString()}</span>
                      </div>
                      {amendment.supporters !== undefined && (
                        <div className="flex items-center gap-1">
                          <span>{amendment.supporters} supporters</span>
                        </div>
                      )}
                    </div>
                    {amendment.user && (
                      <p className="text-xs text-muted-foreground">
                        By {amendment.user.name || 'Unknown'}
                      </p>
                    )}
                    {amendment.hashtags && amendment.hashtags.length > 0 && (
                      <div className="pt-2">
                        <HashtagDisplay hashtags={amendment.hashtags.slice(0, 3)} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        )}
      </PageWrapper>
    </AuthGuard>
  );
}
