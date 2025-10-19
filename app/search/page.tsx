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
import { Users, FileText, BookOpen, Scale, Search as SearchIcon, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

type SearchType = 'all' | 'users' | 'groups' | 'statements' | 'blogs' | 'amendments';

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL parameters
  const queryParam = searchParams.get('q') || '';
  const typeParam = (searchParams.get('type') || 'all') as SearchType;
  const sortParam = searchParams.get('sort') || 'relevance';
  const publicOnlyParam = searchParams.get('public') === 'true';

  // Local state
  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [searchType, setSearchType] = useState<SearchType>(typeParam);
  const [sortBy, setSortBy] = useState(sortParam);
  const [publicOnly, setPublicOnly] = useState(publicOnlyParam);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch data from InstantDB
  const { data, isLoading } = db.useQuery({
    profiles: {
      user: {},
    },
    groups: {
      owner: {},
    },
    statements: {
      user: {},
    },
    blogs: {
      user: {},
    },
    amendments: {
      user: {},
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
      });
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery, searchType, sortBy, publicOnly]);

  const handleTypeChange = (type: SearchType) => {
    setSearchType(type);
    updateURL({
      q: searchQuery,
      type,
      sort: sortBy,
      public: publicOnly ? 'true' : '',
    });
  };

  // Filter and search logic
  const filterByQuery = (text: string) => {
    if (!queryParam) return true;
    return text.toLowerCase().includes(queryParam.toLowerCase());
  };

  const filteredUsers =
    data?.profiles?.filter((profile: any) => {
      if (!filterByQuery(profile.name || '')) return false;
      return true;
    }) || [];

  const filteredGroups =
    data?.groups?.filter((group: any) => {
      if (!filterByQuery(group.name || '')) return false;
      if (publicOnly && !group.isPublic) return false;
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
      return true;
    }) || [];

  const filteredAmendments =
    data?.amendments?.filter((amendment: any) => {
      if (!filterByQuery(amendment.title || '')) return false;
      if (amendment.subtitle && !filterByQuery(amendment.subtitle)) return false;
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
  };

  const totalResults =
    allResults.users.length +
    allResults.groups.length +
    allResults.statements.length +
    allResults.blogs.length +
    allResults.amendments.length;

  // Create unified mosaic of all results with type information
  const mosaicResults = [
    ...allResults.users.map((item: any) => ({ ...item, _type: 'user' as const })),
    ...allResults.groups.map((item: any) => ({ ...item, _type: 'group' as const })),
    ...allResults.statements.map((item: any) => ({ ...item, _type: 'statement' as const })),
    ...allResults.blogs.map((item: any) => ({ ...item, _type: 'blog' as const })),
    ...allResults.amendments.map((item: any) => ({ ...item, _type: 'amendment' as const })),
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Summary */}
      {queryParam && (
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{queryParam}"
          </p>
        </div>
      )}

      {/* Tabs for different search types */}
      <Tabs value={searchType} onValueChange={value => handleTypeChange(value as SearchType)}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users ({allResults.users.length})
          </TabsTrigger>
          <TabsTrigger value="groups">
            <Users className="mr-2 h-4 w-4" />
            Groups ({allResults.groups.length})
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
                <UnifiedResultCard key={`${item._type}-${item.id}-${index}`} item={item} />
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
                <GroupCard key={group.id} group={group} />
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
            <div className="grid gap-4">
              {allResults.statements.map((statement: any) => (
                <StatementCard key={statement.id} statement={statement} />
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
            <div className="grid gap-4 md:grid-cols-2">
              {allResults.blogs.map((blog: any) => (
                <BlogCard key={blog.id} blog={blog} />
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
                <AmendmentCard key={amendment.id} amendment={amendment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </PageWrapper>
  );
}

// Unified Result Card for Mosaic Display
function UnifiedResultCard({ item }: { item: any }) {
  const getTypeBadge = () => {
    const badges: Record<
      string,
      { label: string; icon: any; variant: 'default' | 'secondary' | 'outline' }
    > = {
      user: { label: 'User', icon: Users, variant: 'default' },
      group: { label: 'Group', icon: Users, variant: 'secondary' },
      statement: { label: 'Statement', icon: FileText, variant: 'outline' },
      blog: { label: 'Blog', icon: BookOpen, variant: 'default' },
      amendment: { label: 'Amendment', icon: Scale, variant: 'secondary' },
    };
    return badges[item._type] || badges.user;
  };

  const typeBadge = getTypeBadge();
  const TypeIcon = typeBadge.icon;

  // Render based on type
  switch (item._type) {
    case 'user':
      return (
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={typeBadge.variant} className="text-xs">
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeBadge.label}
              </Badge>
            </div>
            <CardTitle className="text-lg">{item.name || 'Unknown User'}</CardTitle>
            {item.handle && <CardDescription>@{item.handle}</CardDescription>}
          </CardHeader>
          <CardContent>
            {item.bio && <p className="line-clamp-2 text-sm text-muted-foreground">{item.bio}</p>}
            {item.contactLocation && (
              <p className="mt-2 text-xs text-muted-foreground">{item.contactLocation}</p>
            )}
          </CardContent>
        </Card>
      );

    case 'group':
      return (
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={typeBadge.variant} className="text-xs">
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeBadge.label}
              </Badge>
              {item.isPublic && (
                <Badge variant="outline" className="text-xs">
                  Public
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg">{item.name}</CardTitle>
            <CardDescription>
              {item.memberCount || 0} member{item.memberCount !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          {item.description && (
            <CardContent>
              <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          )}
        </Card>
      );

    case 'statement':
      return (
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="mb-2">
              <Badge variant={typeBadge.variant} className="text-xs">
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeBadge.label}
              </Badge>
            </div>
            <CardTitle className="line-clamp-3 text-base font-normal">{item.text}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{item.tag}</Badge>
          </CardContent>
        </Card>
      );

    case 'blog':
      return (
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="mb-2">
              <Badge variant={typeBadge.variant} className="text-xs">
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeBadge.label}
              </Badge>
            </div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            <CardDescription>{item.date}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>❤️ {item.likes || 0} likes</span>
              <span>💬 {item.comments || 0} comments</span>
            </div>
          </CardContent>
        </Card>
      );

    case 'amendment': {
      const statusColors: Record<string, string> = {
        Passed: 'bg-green-500/10 text-green-500',
        Rejected: 'bg-red-500/10 text-red-500',
        'Under Review': 'bg-yellow-500/10 text-yellow-500',
        Drafting: 'bg-blue-500/10 text-blue-500',
      };
      return (
        <Card className="cursor-pointer transition-colors hover:bg-accent">
          <CardHeader>
            <div className="mb-2 flex items-center justify-between">
              <Badge variant={typeBadge.variant} className="text-xs">
                <TypeIcon className="mr-1 h-3 w-3" />
                {typeBadge.label}
              </Badge>
              <Badge className={statusColors[item.status] || ''}>{item.status}</Badge>
            </div>
            <CardTitle className="text-lg">{item.title}</CardTitle>
            {item.subtitle && <CardDescription>{item.subtitle}</CardDescription>}
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{item.date}</span>
              <span>{item.supporters || 0} supporters</span>
            </div>
          </CardContent>
        </Card>
      );
    }

    default:
      return null;
  }
}

// Result Card Components (for individual tabs)
function UserCard({ user }: { user: any }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent">
      <CardHeader>
        <div className="mb-2">
          <Badge variant="default" className="text-xs">
            <Users className="mr-1 h-3 w-3" />
            User
          </Badge>
        </div>
        <CardTitle className="text-lg">{user.name || 'Unknown User'}</CardTitle>
        {user.handle && <CardDescription>@{user.handle}</CardDescription>}
      </CardHeader>
      <CardContent>
        {user.bio && <p className="line-clamp-2 text-sm text-muted-foreground">{user.bio}</p>}
        {user.contactLocation && (
          <p className="mt-2 text-xs text-muted-foreground">{user.contactLocation}</p>
        )}
      </CardContent>
    </Card>
  );
}

function GroupCard({ group }: { group: any }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            <Users className="mr-1 h-3 w-3" />
            Group
          </Badge>
          {group.isPublic && (
            <Badge variant="outline" className="text-xs">
              Public
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{group.name}</CardTitle>
        <CardDescription>
          {group.memberCount || 0} member{group.memberCount !== 1 ? 's' : ''}
        </CardDescription>
      </CardHeader>
      {group.description && (
        <CardContent>
          <p className="line-clamp-2 text-sm text-muted-foreground">{group.description}</p>
        </CardContent>
      )}
    </Card>
  );
}

function StatementCard({ statement }: { statement: any }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent">
      <CardHeader>
        <div className="mb-2">
          <Badge variant="outline" className="text-xs">
            <FileText className="mr-1 h-3 w-3" />
            Statement
          </Badge>
        </div>
        <CardTitle className="line-clamp-3 text-base font-normal">{statement.text}</CardTitle>
      </CardHeader>
      <CardContent>
        <Badge variant="outline">{statement.tag}</Badge>
      </CardContent>
    </Card>
  );
}

function BlogCard({ blog }: { blog: any }) {
  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent">
      <CardHeader>
        <div className="mb-2">
          <Badge variant="default" className="text-xs">
            <BookOpen className="mr-1 h-3 w-3" />
            Blog
          </Badge>
        </div>
        <CardTitle className="text-lg">{blog.title}</CardTitle>
        <CardDescription>{blog.date}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>❤️ {blog.likes || 0} likes</span>
          <span>💬 {blog.comments || 0} comments</span>
        </div>
      </CardContent>
    </Card>
  );
}

function AmendmentCard({ amendment }: { amendment: any }) {
  const statusColors: Record<string, string> = {
    Passed: 'bg-green-500/10 text-green-500',
    Rejected: 'bg-red-500/10 text-red-500',
    'Under Review': 'bg-yellow-500/10 text-yellow-500',
    Drafting: 'bg-blue-500/10 text-blue-500',
  };

  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent">
      <CardHeader>
        <div className="mb-2 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            <Scale className="mr-1 h-3 w-3" />
            Amendment
          </Badge>
          <Badge className={statusColors[amendment.status] || ''}>{amendment.status}</Badge>
        </div>
        <CardTitle className="text-lg">{amendment.title}</CardTitle>
        {amendment.subtitle && <CardDescription>{amendment.subtitle}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{amendment.date}</span>
          <span>{amendment.supporters || 0} supporters</span>
        </div>
      </CardContent>
    </Card>
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
