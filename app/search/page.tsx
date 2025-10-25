'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { PageWrapper } from '@/components/layout/page-wrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import db from '../../db';
import {
  Users,
  FileText,
  BookOpen,
  Scale,
  Search as SearchIcon,
  Filter,
  Calendar,
  MapPin,
  Hash,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { BlogSearchCard } from '@/features/search/ui/BlogSearchCard';
import { AmendmentSearchCard } from '@/features/search/ui/AmendmentSearchCard';
import { GroupSearchCard } from '@/features/search/ui/GroupSearchCard';
import { StatementSearchCard } from '@/features/search/ui/StatementSearchCard';
import { GRADIENTS } from '@/features/user/state/gradientColors';

type SearchType = 'all' | 'users' | 'groups' | 'statements' | 'blogs' | 'amendments' | 'events';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters
  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as SearchType;
  const sortParam = searchParams.get('sort') || 'relevance';
  const publicOnlyParam = searchParams.get('public') === 'true';
  const hashtagParam = searchParams.get('hashtag') || '';

  // Local state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [searchType, setSearchType] = useState<SearchType>(typeParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [publicOnly, setPublicOnly] = useState(publicOnlyParam);
  const [hashtagFilter, setHashtagFilter] = useState(hashtagParam);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from InstantDB
  const { data, isLoading } = db.useQuery({
    profiles: {
      user: {
        hashtags: {}, // Load hashtags for users
      },
    },
    groups: {
      owner: {},
      hashtags: {},
    },
    statements: {
      user: {},
    },
    blogs: {
      user: {},
      hashtags: {},
    },
    amendments: {
      user: {},
      hashtags: {},
    },
    events: {
      organizer: {
        profile: {},
      },
      group: {},
      participants: {},
      hashtags: {},
    },
  });

  // Update URL when search parameters change
  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    router.push(`/search?${params.toString()}`);
  };

  // Type-ahead search: Update URL as user types (with debouncing)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL({
        q: searchQuery,
        type: searchType,
        sort: sortBy,
        public: publicOnly ? 'true' : '',
        hashtag: hashtagFilter,
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchType, sortBy, publicOnly, hashtagFilter]);

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
    updateURL({
      q: searchQuery,
      type,
      sort: sortBy,
      public: publicOnly ? 'true' : '',
      hashtag: hashtagFilter,
    });
  };

  // Filter by hashtag
  const matchesHashtag = (item: any) => {
    if (!hashtagFilter) return true;
    if (!item.hashtags || item.hashtags.length === 0) return false;

    // Remove # symbol if present at the start
    const cleanFilter = hashtagFilter.startsWith('#')
      ? hashtagFilter.substring(1).toLowerCase()
      : hashtagFilter.toLowerCase();

    // Check if any hashtag matches
    return item.hashtags.some((h: any) => {
      if (!h || !h.tag) return false;
      return h.tag.toLowerCase() === cleanFilter || h.tag.toLowerCase().includes(cleanFilter);
    });
  };

  // Filter and search logic
  const filterByQuery = (text: string) => {
    if (!queryParam) return true; // If no query, don't filter by text
    return text.toLowerCase().includes(queryParam.toLowerCase());
  };

  const filteredUsers =
    data?.profiles?.filter((profile: any) => {
      if (!filterByQuery(profile.name || '')) return false;
      // Check hashtags from the linked user
      if (hashtagFilter && profile.user?.hashtags) {
        if (!matchesHashtag({ hashtags: profile.user.hashtags })) return false;
      }
      return true;
    }) || [];

  const filteredGroups =
    data?.groups?.filter((group: any) => {
      if (!filterByQuery(group.name || '')) return false;
      if (publicOnly && !group.isPublic) return false;
      if (!matchesHashtag(group)) return false;
      return true;
    }) || [];

  const filteredStatements =
    data?.statements?.filter((statement: any) => {
      if (!filterByQuery(statement.text || '')) return false;
      if (statement.tag && !filterByQuery(statement.tag)) return false;
      return true;
    }) || [];

  const filteredBlogs =
    data?.blogs?.filter((blog: any) => {
      if (!filterByQuery(blog.title || '')) return false;
      if (!matchesHashtag(blog)) return false;
      return true;
    }) || [];

  const filteredAmendments =
    data?.amendments?.filter((amendment: any) => {
      if (!filterByQuery(amendment.title || '')) return false;
      if (amendment.subtitle && !filterByQuery(amendment.subtitle)) return false;
      if (!matchesHashtag(amendment)) return false;
      return true;
    }) || [];

  const filteredEvents =
    data?.events?.filter((event: any) => {
      if (!filterByQuery(event.title || '')) return false;
      if (event.description && !filterByQuery(event.description)) return false;
      if (event.location && !filterByQuery(event.location)) return false;
      if (publicOnly && !event.isPublic) return false;
      if (!matchesHashtag(event)) return false;
      return true;
    }) || [];

  // Sort results
  const sortResults = (items: any[]) => {
    if (sortBy === 'date') {
      return [...items].sort((a, b) => {
        const dateA = a.createdAt || a.date || a.joinedAt || new Date(0);
        const dateB = b.createdAt || b.date || b.joinedAt || new Date(0);
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      });
    }
    if (sortBy === 'name' || sortBy === 'title') {
      return [...items].sort((a, b) => {
        const nameA = a.name || a.title || '';
        const nameB = b.name || b.title || '';
        return nameA.localeCompare(nameB);
      });
    }
    return items;
  };

  const allResults = {
    users: sortResults(filteredUsers),
    groups: sortResults(filteredGroups),
    statements: sortResults(filteredStatements),
    blogs: sortResults(filteredBlogs),
    amendments: sortResults(filteredAmendments),
    events: sortResults(filteredEvents),
  };

  const totalResults =
    allResults.users.length +
    allResults.groups.length +
    allResults.statements.length +
    allResults.blogs.length +
    allResults.amendments.length +
    allResults.events.length;

  // Create unified mosaic of all results with type information
  const mosaicResults = [
    ...allResults.users.map((item: any) => ({ ...item, _type: 'user' as const })),
    ...allResults.groups.map((item: any) => ({ ...item, _type: 'group' as const })),
    ...allResults.statements.map((item: any) => ({ ...item, _type: 'statement' as const })),
    ...allResults.blogs.map((item: any) => ({ ...item, _type: 'blog' as const })),
    ...allResults.amendments.map((item: any) => ({ ...item, _type: 'amendment' as const })),
    ...allResults.events.map((item: any) => ({ ...item, _type: 'event' as const })),
  ];

  return (
    <PageWrapper className="container mx-auto p-8">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Search</h1>
        <p className="text-muted-foreground">
          Find users, groups, statements, blogs, and amendments
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 space-y-4">
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

        {/* Filters */}
        {showFilters && (
          <Card>
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

      {/* Tabs for different search types */}
      <Tabs value={searchType} onValueChange={value => handleTypeChange(value as SearchType)}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users ({allResults.users.length})
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />
            Groups ({allResults.groups.length})
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="mr-2 h-4 w-4" />
            Events ({allResults.events.length})
          </TabsTrigger>
          <TabsTrigger value="statements">
            <FileText className="mr-2 h-4 w-4" />
            Statements ({allResults.statements.length})
          </TabsTrigger>
          <TabsTrigger value="blogs">
            <BookOpen className="mr-2 h-4 w-4" />
            Blogs ({allResults.blogs.length})
          </TabsTrigger>
          <TabsTrigger value="amendments">
            <Scale className="mr-2 h-4 w-4" />
            Amendments ({allResults.amendments.length})
          </TabsTrigger>
        </TabsList>

        {/* All Results - Unified Mosaic */}
        <TabsContent value="all">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : totalResults === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No results found. Try adjusting your search.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {mosaicResults.map((item: any, index: number) => (
                <UnifiedResultCard
                  key={`${item._type}-${item.id}-${index}`}
                  item={item}
                  index={index}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : allResults.users.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No users found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allResults.users.map((user: any) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Groups Tab */}
        <TabsContent value="groups">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : allResults.groups.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No groups found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allResults.groups.map((group: any) => (
                <GroupSearchCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : allResults.events.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No events found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allResults.events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Statements Tab */}
        <TabsContent value="statements">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : allResults.statements.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No statements found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allResults.statements.map((statement: any) => (
                <StatementSearchCard key={statement.id} statement={statement} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Blogs Tab */}
        <TabsContent value="blogs">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : allResults.blogs.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No blogs found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {allResults.blogs.map((blog: any, index: number) => (
                <BlogSearchCard
                  key={blog.id}
                  blog={blog}
                  gradientClass={GRADIENTS[index % GRADIENTS.length]}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Amendments Tab */}
        <TabsContent value="amendments">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : allResults.amendments.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No amendments found.</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {allResults.amendments.map((amendment: any) => (
                <AmendmentSearchCard key={amendment.id} amendment={amendment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

// Unified Result Card for Mosaic Display
function UnifiedResultCard({ item, index }: { item: any; index?: number }) {
  // Use the reusable card components based on type
  switch (item._type) {
    case 'blog':
      return (
        <BlogSearchCard blog={item} gradientClass={GRADIENTS[(index || 0) % GRADIENTS.length]} />
      );

    case 'amendment':
      return <AmendmentSearchCard amendment={item} />;

    case 'group':
      return <GroupSearchCard group={item} />;

    case 'user':
      return <UserCard user={item} index={index} />;

    case 'statement':
      return <StatementSearchCard statement={item} />;

    case 'event':
      return <EventCard event={item} />;

    default:
      return null;
  }
}

// Result Card Components (for individual tabs)
function UserCard({ user, index }: { user: any; index?: number }) {
  // Use user.user.id (the actual user ID) instead of user.id (the profile ID)
  const userId = user.user?.id || user.id;

  // Get avatar from various possible sources
  const avatar = user.avatarFile?.url || user.avatar || user.imageURL || '';

  // Get gradient class for this user card
  const gradientClass = GRADIENTS[(index || 0) % GRADIENTS.length];

  return (
    <a href={`/user/${userId}`} className="block">
      <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg">
        {/* Gradient Header */}
        <div className={`relative h-24 ${gradientClass}`}>
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20" />
        </div>

        <CardHeader className="pb-3 pt-4">
          <div className="mb-3 flex items-start gap-3">
            {/* Avatar next to name */}
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border-2 border-background shadow-md">
              {avatar ? (
                <img
                  src={avatar}
                  alt={user.name || 'User'}
                  className="h-full w-full object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white">
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name and handle */}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg leading-tight">{user.name || 'Unknown User'}</CardTitle>
              {user.handle && <CardDescription className="mt-0.5">@{user.handle}</CardDescription>}
            </div>

            {/* Badge */}
            <Badge variant="secondary" className="flex-shrink-0 text-xs">
              <Users className="mr-1 h-3 w-3" />
              User
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {user.bio && <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>}
          {user.contactLocation && (
            <p className="mt-2 text-xs text-muted-foreground">{user.contactLocation}</p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

function EventCard({ event }: { event: any }) {
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

  return (
    <a href={`/event/${event.id}`} className="block">
      <Card className="cursor-pointer transition-colors hover:bg-accent">
        {event.imageURL && (
          <div className="aspect-video w-full overflow-hidden">
            <img src={event.imageURL} alt={event.title} className="h-full w-full object-cover" />
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
          {event.group && (
            <p className="text-xs text-muted-foreground">Organized by {event.group.name}</p>
          )}
        </CardContent>
      </Card>
    </a>
  );
}

export default function SearchPage() {
  return (
    <AuthGuard requireAuth={true}>
      <Suspense fallback={<div className="container mx-auto p-8">Loading search...</div>}>
        <SearchContent />
      </Suspense>
    </AuthGuard>
  );
}
