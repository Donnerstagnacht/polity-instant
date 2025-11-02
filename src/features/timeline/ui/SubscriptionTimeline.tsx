'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Rss, Calendar, Users, Scale, BookOpen, User } from 'lucide-react';
import { TimelineEventCard } from './TimelineEventCard';
import { useSubscriptionTimeline } from '../hooks/useSubscriptionTimeline';

export function SubscriptionTimeline() {
  const { events, isLoading } = useSubscriptionTimeline();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredEvents =
    filterType === 'all' ? events : events.filter(e => e.entityType === filterType);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Your Timeline
          </CardTitle>
          <CardDescription>Loading updates from your subscriptions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-4">
                  <div className="h-12 w-12 rounded-full bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                    <div className="h-4 w-2/3 rounded bg-muted" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Rss className="h-5 w-5" />
            Your Timeline
          </CardTitle>
          <CardDescription>
            Subscribe to users, groups, amendments, events, or blogs to see updates here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center space-y-4 py-8 text-center">
            <div className="rounded-full bg-muted p-4">
              <Rss className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                Your timeline is empty. Start following content to see updates.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/search">Discover Content</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Rss className="h-5 w-5" />
                Your Timeline
              </CardTitle>
              <CardDescription>
                {filteredEvents.length} update{filteredEvents.length !== 1 ? 's' : ''} from your
                subscriptions
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter Tabs */}
      <Tabs value={filterType} onValueChange={setFilterType}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="all" className="gap-2">
            All
            <Badge variant="secondary">{events.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="amendment" className="gap-2">
            <Scale className="h-4 w-4" />
            Amendments
            <Badge variant="secondary">
              {events.filter(e => e.entityType === 'amendment').length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="event" className="gap-2">
            <Calendar className="h-4 w-4" />
            Events
            <Badge variant="secondary">{events.filter(e => e.entityType === 'event').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="group" className="gap-2">
            <Users className="h-4 w-4" />
            Groups
            <Badge variant="secondary">{events.filter(e => e.entityType === 'group').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="blog" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Blogs
            <Badge variant="secondary">{events.filter(e => e.entityType === 'blog').length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="user" className="gap-2">
            <User className="h-4 w-4" />
            Users
            <Badge variant="secondary">{events.filter(e => e.entityType === 'user').length}</Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filterType} className="mt-6">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-sm text-muted-foreground">No {filterType} updates to show</p>
              </CardContent>
            </Card>
          ) : (
            // Symmetric grid layout matching search results
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event, index) => (
                <TimelineEventCard key={event.id} event={event as any} index={index} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
