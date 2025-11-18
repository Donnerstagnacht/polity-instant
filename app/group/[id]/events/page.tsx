'use client';

import { use, useState, useEffect } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import db from '../../../../db';
import { Calendar, MapPin, Users, Search as SearchIcon, Filter, Hash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { HashtagDisplay } from '@/components/ui/hashtag-display';
import { useNavigation } from '@/navigation/state/useNavigation';

export default function GroupEventsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { currentPrimaryRoute } = useNavigation();

  // Set current route to 'group' when this page is loaded
  useEffect(() => {
    // The useNavigation hook will automatically detect we're on a /group/ route
    // and set the appropriate secondary navigation
  }, [currentPrimaryRoute]);

  // Local state for search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [publicOnly, setPublicOnly] = useState(false);
  const [hashtagFilter, setHashtagFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch group and events data from InstantDB
  const { data, isLoading } = db.useQuery({
    groups: {
      $: { where: { id: resolvedParams.id } },
      events: {
        organizer: {},
        participants: {},
        hashtags: {},
      },
    },
  });

  const group = data?.groups?.[0];
  const events = group?.events || [];

  // Filter by hashtag
  const matchesHashtag = (event: any) => {
    if (!hashtagFilter) return true;
    if (!event.hashtags || event.hashtags.length === 0) return false;

    const cleanFilter = hashtagFilter.startsWith('#')
      ? hashtagFilter.substring(1).toLowerCase()
      : hashtagFilter.toLowerCase();

    return event.hashtags.some((h: any) => {
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
  const filteredEvents = events.filter((event: any) => {
    if (!filterByQuery(event.title || '')) return false;
    if (event.description && !filterByQuery(event.description)) return false;
    if (event.location && !filterByQuery(event.location)) return false;
    if (publicOnly && !event.isPublic) return false;
    if (!matchesHashtag(event)) return false;
    return true;
  });

  // Sort by date (upcoming first)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime();
    const dateB = new Date(b.startDate).getTime();
    return dateA - dateB;
  });

  const formatEventDate = (date: string | number) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatEventTime = (date: string | number) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-8">
          <div className="py-12 text-center">Loading events...</div>
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
          <h1 className="mb-2 text-3xl font-bold">{group.name} - Events</h1>
          <p className="text-muted-foreground">
            {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search events..."
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

          {/* Filters */}
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your search results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch id="public-only" checked={publicOnly} onCheckedChange={setPublicOnly} />
                  <Label htmlFor="public-only" className="cursor-pointer">
                    Public events only
                  </Label>
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

        {/* Events List */}
        {sortedEvents.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            {events.length === 0
              ? 'No events found for this group.'
              : 'No events match your search criteria.'}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedEvents.map((event: any) => (
              <a href={`/event/${event.id}`} key={event.id} className="block">
                <Card className="cursor-pointer transition-colors hover:bg-accent">
                  {event.imageURL && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={event.imageURL}
                        alt={event.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="mb-2 flex items-center justify-between">
                      <Badge variant="default" className="text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        Event
                      </Badge>
                      {event.isPublic && (
                        <Badge variant="outline" className="text-xs">
                          Public
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>
                      {formatEventDate(event.startDate)} at {formatEventTime(event.startDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {event.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {event.description}
                      </p>
                    )}
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.participants?.length || 0} participants</span>
                    </div>
                    {event.hashtags && event.hashtags.length > 0 && (
                      <div className="pt-2">
                        <HashtagDisplay hashtags={event.hashtags.slice(0, 3)} />
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
