'use client';

import { use, useState, useMemo } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { useAuthStore } from '@/features/auth/auth';
import { db, tx } from '../../../../db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ScrollableTabsList } from '@/components/ui/scrollable-tabs';
import { Trash2, Search, User, Users, Scale, Calendar, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SubscriptionsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<
    'all' | 'users' | 'groups' | 'amendments' | 'events' | 'blogs'
  >('all');

  // Only allow users to view their own subscriptions page
  const canView = authUser?.id === resolvedParams.id;

  // Query for subscriptions (users, groups, amendments, events, blogs)
  const { data: subscriptionsData } = db.useQuery(
    canView
      ? {
          subscribers: {
            $: {
              where: {
                'subscriber.id': resolvedParams.id,
              },
            },
            user: {},
            group: {},
            amendment: {},
            event: {
              organizer: {},
            },
            blog: {},
          },
        }
      : { subscribers: {} }
  );

  // Query for subscribers (users subscribed to this user)
  const { data: subscribersData } = db.useQuery(
    canView
      ? {
          subscribers: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            subscriber: {},
          },
        }
      : { subscribers: {} }
  );

  const allSubscriptions = subscriptionsData?.subscribers || [];
  const subscribers = subscribersData?.subscribers || [];

  // Filter subscriptions based on type and search query
  const filteredSubscriptions = useMemo(() => {
    let filtered: any[] = allSubscriptions;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((sub: any) => {
        switch (filterType) {
          case 'users':
            return !!sub.user;
          case 'groups':
            return !!sub.group;
          case 'amendments':
            return !!sub.amendment;
          case 'events':
            return !!sub.event;
          case 'blogs':
            return !!sub.blog;
          default:
            return true;
        }
      });
    }

    // Filter by search query
    if (!searchQuery.trim()) return filtered;

    const query = searchQuery.toLowerCase();
    return filtered.filter((sub: any) => {
      if (sub.user) {
        const name = sub.user.name?.toLowerCase() || '';
        const handle = sub.user.handle?.toLowerCase() || '';
        return name.includes(query) || handle.includes(query);
      } else if (sub.group) {
        const name = sub.group.name?.toLowerCase() || '';
        const description = sub.group.description?.toLowerCase() || '';
        return name.includes(query) || description.includes(query);
      } else if (sub.amendment) {
        const title = sub.amendment.title?.toLowerCase() || '';
        const subtitle = sub.amendment.subtitle?.toLowerCase() || '';
        return title.includes(query) || subtitle.includes(query);
      } else if (sub.event) {
        const title = sub.event.title?.toLowerCase() || '';
        const description = sub.event.description?.toLowerCase() || '';
        return title.includes(query) || description.includes(query);
      } else if (sub.blog) {
        const title = sub.blog.title?.toLowerCase() || '';
        return title.includes(query);
      }
      return false;
    });
  }, [allSubscriptions, searchQuery, filterType]);

  // Calculate counts for each type
  const subscriptionCounts = useMemo(() => {
    return {
      all: allSubscriptions.length,
      users: allSubscriptions.filter((sub: any) => !!sub.user).length,
      groups: allSubscriptions.filter((sub: any) => !!sub.group).length,
      amendments: allSubscriptions.filter((sub: any) => !!sub.amendment).length,
      events: allSubscriptions.filter((sub: any) => !!sub.event).length,
      blogs: allSubscriptions.filter((sub: any) => !!sub.blog).length,
    };
  }, [allSubscriptions]);

  // Filter subscribers based on search query
  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers;

    const query = searchQuery.toLowerCase();
    return subscribers.filter((sub: any) => {
      const name = sub.subscriber?.name?.toLowerCase() || '';
      const handle = sub.subscriber?.handle?.toLowerCase() || '';
      return name.includes(query) || handle.includes(query);
    });
  }, [subscribers, searchQuery]);

  const handleUnsubscribe = async (subscriptionId: string) => {
    try {
      await db.transact([tx.subscribers[subscriptionId].delete()]);
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
    }
  };

  const handleRemoveSubscriber = async (subscriptionId: string) => {
    try {
      await db.transact([tx.subscribers[subscriptionId].delete()]);
    } catch (error) {
      console.error('Failed to remove subscriber:', error);
    }
  };

  const navigateToUser = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const navigateToGroup = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const navigateToAmendment = (amendmentId: string) => {
    router.push(`/amendment/${amendmentId}`);
  };

  const navigateToEvent = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const navigateToBlog = (blogId: string) => {
    router.push(`/blog/${blogId}`);
  };

  if (!canView) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You can only view your own subscriptions.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto max-w-6xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Subscriptions</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage who you're subscribed to and who's subscribed to you
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subscriptions and subscribers..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="subscriptions" className="w-full">
          <ScrollableTabsList>
            <TabsTrigger value="subscriptions">
              My Subscriptions ({filteredSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="subscribers">
              My Subscribers ({filteredSubscribers.length})
            </TabsTrigger>
          </ScrollableTabsList>

          <TabsContent value="subscriptions" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Subscriptions</CardTitle>
                <CardDescription>
                  You will receive updates from these users, groups, amendments, events, and blogs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter Tabs */}
                <div className="mb-4">
                  <Tabs
                    value={filterType}
                    onValueChange={value => setFilterType(value as any)}
                    className="w-full"
                  >
                    <ScrollableTabsList>
                      <TabsTrigger value="all">All ({subscriptionCounts.all})</TabsTrigger>
                      <TabsTrigger value="users">
                        <User className="mr-1 h-3 w-3" />
                        Users ({subscriptionCounts.users})
                      </TabsTrigger>
                      <TabsTrigger value="groups">
                        <Users className="mr-1 h-3 w-3" />
                        Groups ({subscriptionCounts.groups})
                      </TabsTrigger>
                      <TabsTrigger value="amendments">
                        <Scale className="mr-1 h-3 w-3" />
                        Amendments ({subscriptionCounts.amendments})
                      </TabsTrigger>
                      <TabsTrigger value="events">
                        <Calendar className="mr-1 h-3 w-3" />
                        Events ({subscriptionCounts.events})
                      </TabsTrigger>
                      <TabsTrigger value="blogs">
                        <BookOpen className="mr-1 h-3 w-3" />
                        Blogs ({subscriptionCounts.blogs})
                      </TabsTrigger>
                    </ScrollableTabsList>
                  </Tabs>
                </div>

                {filteredSubscriptions.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    {allSubscriptions.length === 0
                      ? "You haven't subscribed to anyone yet"
                      : 'No subscriptions match your search'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscriptions.map((subscription: any) => {
                        const isUser = !!subscription.user;
                        const isGroup = !!subscription.group;
                        const isAmendment = !!subscription.amendment;
                        const isEvent = !!subscription.event;
                        const isBlog = !!subscription.blog;

                        if (isUser) {
                          const targetUser = subscription.user;
                          const userName = targetUser?.name || 'Unknown User';
                          const userAvatar = targetUser?.avatar || '';
                          const userHandle = targetUser?.handle || '';

                          return (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                <Badge variant="secondary" className="gap-1">
                                  <User className="h-3 w-3" />
                                  User
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    className="h-10 w-10 cursor-pointer"
                                    onClick={() => navigateToUser(targetUser.id)}
                                  >
                                    <AvatarImage src={userAvatar} alt={userName} />
                                    <AvatarFallback>
                                      {userName
                                        .split(' ')
                                        .map((n: string) => n[0])
                                        .join('')
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div
                                    className="cursor-pointer hover:underline"
                                    onClick={() => navigateToUser(targetUser.id)}
                                  >
                                    <div className="font-medium">{userName}</div>
                                    {userHandle && (
                                      <div className="text-sm text-muted-foreground">
                                        @{userHandle}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnsubscribe(subscription.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-2">Unsubscribe</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        } else if (isGroup) {
                          const targetGroup = subscription.group;
                          const groupName = targetGroup?.name || 'Unknown Group';
                          const groupDescription = targetGroup?.description || '';

                          return (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                <Badge variant="secondary" className="gap-1">
                                  <Users className="h-3 w-3" />
                                  Group
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div
                                  className="cursor-pointer hover:underline"
                                  onClick={() => navigateToGroup(targetGroup.id)}
                                >
                                  <div className="font-medium">{groupName}</div>
                                  {groupDescription && (
                                    <div className="line-clamp-1 text-sm text-muted-foreground">
                                      {groupDescription}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnsubscribe(subscription.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-2">Unsubscribe</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        } else if (isAmendment) {
                          const targetAmendment = subscription.amendment;
                          const amendmentTitle = targetAmendment?.title || 'Unknown Amendment';
                          const amendmentSubtitle = targetAmendment?.subtitle || '';

                          return (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                <Badge variant="secondary" className="gap-1">
                                  <Scale className="h-3 w-3" />
                                  Amendment
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div
                                  className="cursor-pointer hover:underline"
                                  onClick={() => navigateToAmendment(targetAmendment.id)}
                                >
                                  <div className="font-medium">{amendmentTitle}</div>
                                  {amendmentSubtitle && (
                                    <div className="line-clamp-1 text-sm text-muted-foreground">
                                      {amendmentSubtitle}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnsubscribe(subscription.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-2">Unsubscribe</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        } else if (isEvent) {
                          const targetEvent = subscription.event;
                          const eventTitle = targetEvent?.title || 'Unknown Event';
                          const eventDate = targetEvent?.startDate
                            ? new Date(targetEvent.startDate).toLocaleDateString()
                            : '';

                          return (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                <Badge variant="secondary" className="gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Event
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div
                                  className="cursor-pointer hover:underline"
                                  onClick={() => navigateToEvent(targetEvent.id)}
                                >
                                  <div className="font-medium">{eventTitle}</div>
                                  {eventDate && (
                                    <div className="text-sm text-muted-foreground">{eventDate}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnsubscribe(subscription.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-2">Unsubscribe</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        } else if (isBlog) {
                          const targetBlog = subscription.blog;
                          const blogTitle = targetBlog?.title || 'Unknown Blog';
                          const blogDate = targetBlog?.date
                            ? new Date(targetBlog.date).toLocaleDateString()
                            : '';

                          return (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                <Badge variant="secondary" className="gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  Blog
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div
                                  className="cursor-pointer hover:underline"
                                  onClick={() => navigateToBlog(targetBlog.id)}
                                >
                                  <div className="font-medium">{blogTitle}</div>
                                  {blogDate && (
                                    <div className="text-sm text-muted-foreground">{blogDate}</div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnsubscribe(subscription.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-2">Unsubscribe</span>
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        }

                        return null;
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscribers" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Subscribers</CardTitle>
                <CardDescription>People who are subscribed to your updates</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredSubscribers.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    {subscribers.length === 0
                      ? "You don't have any subscribers yet"
                      : 'No subscribers match your search'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.map((subscription: any) => {
                        const subscriberUser = subscription.subscriber;
                        const userName = subscriberUser?.name || 'Unknown User';
                        const userAvatar = subscriberUser?.avatar || '';
                        const userHandle = subscriberUser?.handle || '';

                        if (!subscriberUser) return null;

                        return (
                          <TableRow key={subscription.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar
                                  className="h-10 w-10 cursor-pointer"
                                  onClick={() => navigateToUser(subscriberUser.id)}
                                >
                                  <AvatarImage src={userAvatar} alt={userName} />
                                  <AvatarFallback>
                                    {userName
                                      .split(' ')
                                      .map((n: string) => n[0])
                                      .join('')
                                      .toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div
                                  className="cursor-pointer hover:underline"
                                  onClick={() => navigateToUser(subscriberUser.id)}
                                >
                                  <div className="font-medium">{userName}</div>
                                  {userHandle && (
                                    <div className="text-sm text-muted-foreground">
                                      @{userHandle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell
                              className="cursor-pointer hover:underline"
                              onClick={() => navigateToUser(subscriberUser.id)}
                            >
                              {userName}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSubscriber(subscription.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Remove</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
