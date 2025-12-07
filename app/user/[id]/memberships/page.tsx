'use client';

import { use, useState, useMemo } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { useAuthStore } from '@/features/auth/auth';
import { db, tx } from '../../../../db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Trash2, Search, Users, Check, X, Calendar, FileEdit, BookOpen } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  notifyMembershipWithdrawn,
  notifyParticipationWithdrawn,
  notifyCollaborationWithdrawn,
} from '@/utils/notification-helpers';

export default function MembershipsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Only allow users to view their own memberships page
  const canView = authUser?.id === resolvedParams.id;

  // Query for all memberships, participations, and collaborations
  const { data } = db.useQuery(
    (canView
      ? {
          groupMemberships: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            group: {
              owner: {},
            },
            role: {},
          },
          eventParticipants: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            event: {},
            role: {},
          },
          amendmentRoleCollaborators: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            amendment: {},
            role: {},
          },
          blogRoleBloggers: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            blog: {},
            role: {},
          },
        }
      : null) as any
  ) as any;

  const memberships = data?.groupMemberships || [];
  const participations = data?.eventParticipants || [];
  const collaborations = data?.amendmentRoleCollaborators || [];
  const blogRelations = data?.blogRoleBloggers || [];

  // Filter memberships based on search query
  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return memberships;

    const query = searchQuery.toLowerCase();
    return memberships.filter((membership: any) => {
      const groupName = membership.group?.name?.toLowerCase() || '';
      const groupDescription = membership.group?.description?.toLowerCase() || '';
      const role = membership.role?.name?.toLowerCase() || '';
      const status = membership.status?.toLowerCase() || '';
      return (
        groupName.includes(query) ||
        groupDescription.includes(query) ||
        role.includes(query) ||
        status.includes(query)
      );
    });
  }, [memberships, searchQuery]);

  // Filter participations
  const filteredParticipations = useMemo(() => {
    if (!searchQuery.trim()) return participations;

    const query = searchQuery.toLowerCase();
    return participations.filter((participation: any) => {
      const eventTitle = participation.event?.title?.toLowerCase() || '';
      const status = participation.status?.toLowerCase() || '';
      return eventTitle.includes(query) || status.includes(query);
    });
  }, [participations, searchQuery]);

  // Filter collaborations
  const filteredCollaborations = useMemo(() => {
    if (!searchQuery.trim()) return collaborations;

    const query = searchQuery.toLowerCase();
    return collaborations.filter((collaboration: any) => {
      const amendmentTitle = collaboration.amendment?.title?.toLowerCase() || '';
      const status = collaboration.status?.toLowerCase() || '';
      return amendmentTitle.includes(query) || status.includes(query);
    });
  }, [collaborations, searchQuery]);

  // Filter blog relations
  const filteredBlogRelations = useMemo(() => {
    if (!searchQuery.trim()) return blogRelations;

    const query = searchQuery.toLowerCase();
    return blogRelations.filter((relation: any) => {
      const blogTitle = relation.blog?.title?.toLowerCase() || '';
      const role = relation.role?.name?.toLowerCase() || '';
      const status = relation.status?.toLowerCase() || '';
      return blogTitle.includes(query) || role.includes(query) || status.includes(query);
    });
  }, [blogRelations, searchQuery]);

  // Separate memberships by status
  const invitedMemberships = useMemo(
    () => filteredMemberships.filter((m: any) => m.status === 'invited'),
    [filteredMemberships]
  );
  const activeMemberships = useMemo(
    () => filteredMemberships.filter((m: any) => m.status === 'member' || m.status === 'admin'),
    [filteredMemberships]
  );
  const requestedMemberships = useMemo(
    () => filteredMemberships.filter((m: any) => m.status === 'requested'),
    [filteredMemberships]
  );

  // Separate participations by status
  const invitedParticipations = useMemo(
    () => filteredParticipations.filter((p: any) => p.status === 'invited'),
    [filteredParticipations]
  );
  const activeParticipations = useMemo(
    () => filteredParticipations.filter((p: any) => p.status === 'member' || p.status === 'admin'),
    [filteredParticipations]
  );
  const requestedParticipations = useMemo(
    () => filteredParticipations.filter((p: any) => p.status === 'requested'),
    [filteredParticipations]
  );

  // Separate collaborations by status
  const invitedCollaborations = useMemo(
    () => filteredCollaborations.filter((c: any) => c.status === 'invited'),
    [filteredCollaborations]
  );
  const activeCollaborations = useMemo(
    () =>
      filteredCollaborations.filter((c: any) => c.status === 'member' || c.role === 'Applicant'),
    [filteredCollaborations]
  );
  const requestedCollaborations = useMemo(
    () => filteredCollaborations.filter((c: any) => c.status === 'requested'),
    [filteredCollaborations]
  );

  // Separate blog relations by status
  const invitedBlogRelations = useMemo(
    () => filteredBlogRelations.filter((b: any) => b.status === 'invited'),
    [filteredBlogRelations]
  );
  const activeBlogRelations = useMemo(
    () => filteredBlogRelations.filter((b: any) => b.status === 'writer' || b.status === 'owner'),
    [filteredBlogRelations]
  );
  const requestedBlogRelations = useMemo(
    () => filteredBlogRelations.filter((b: any) => b.status === 'requested'),
    [filteredBlogRelations]
  );

  const handleLeaveMembership = async (membershipId: string) => {
    try {
      const membership = memberships.find((m: any) => m.id === membershipId);
      if (!membership) return;

      const transactions = [tx.groupMemberships[membershipId].delete()];

      // Send notification to the group
      if (authUser?.name && membership.group) {
        const notificationTxs = notifyMembershipWithdrawn({
          senderId: authUser.id,
          senderName: authUser.name,
          groupId: membership.group.id,
          groupName: membership.group.name || 'Unknown Group',
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
    } catch (error) {
      console.error('Failed to leave group:', error);
    }
  };

  const handleAcceptInvitation = async (membershipId: string) => {
    try {
      await db.transact([
        tx.groupMemberships[membershipId].update({
          status: 'member',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept invitation:', error);
    }
  };

  const handleDeclineInvitation = async (membershipId: string) => {
    try {
      await db.transact([tx.groupMemberships[membershipId].delete()]);
    } catch (error) {
      console.error('Failed to decline invitation:', error);
    }
  };

  const handleWithdrawRequest = async (membershipId: string) => {
    try {
      await db.transact([tx.groupMemberships[membershipId].delete()]);
    } catch (error) {
      console.error('Failed to withdraw request:', error);
    }
  };

  // Event participation handlers
  const handleLeaveEvent = async (participationId: string) => {
    try {
      const participation = participations.find((p: any) => p.id === participationId);
      if (!participation) return;

      const transactions = [tx.eventParticipants[participationId].delete()];

      // Send notification to the event
      if (authUser?.name && participation.event) {
        const notificationTxs = notifyParticipationWithdrawn({
          senderId: authUser.id,
          senderName: authUser.name,
          eventId: participation.event.id,
          eventTitle: participation.event.title || 'Unknown Event',
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
    } catch (error) {
      console.error('Failed to leave event:', error);
    }
  };

  const handleAcceptEventInvitation = async (participationId: string) => {
    try {
      await db.transact([
        tx.eventParticipants[participationId].update({
          status: 'member',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept event invitation:', error);
    }
  };

  const handleDeclineEventInvitation = async (participationId: string) => {
    try {
      await db.transact([tx.eventParticipants[participationId].delete()]);
    } catch (error) {
      console.error('Failed to decline event invitation:', error);
    }
  };

  const handleWithdrawEventRequest = async (participationId: string) => {
    try {
      await db.transact([tx.eventParticipants[participationId].delete()]);
    } catch (error) {
      console.error('Failed to withdraw event request:', error);
    }
  };

  // Amendment collaboration handlers
  const handleLeaveCollaboration = async (collaborationId: string) => {
    try {
      const collaboration = collaborations.find((c: any) => c.id === collaborationId);
      if (!collaboration) return;

      const transactions = [tx.amendmentRoleCollaborators[collaborationId].delete()];

      // Send notification to the amendment
      if (authUser?.name && collaboration.amendment) {
        const notificationTxs = notifyCollaborationWithdrawn({
          senderId: authUser.id,
          senderName: authUser.name,
          amendmentId: collaboration.amendment.id,
          amendmentTitle: collaboration.amendment.title || 'Unknown Amendment',
        });
        transactions.push(...notificationTxs);
      }

      await db.transact(transactions);
    } catch (error) {
      console.error('Failed to leave collaboration:', error);
    }
  };

  const handleAcceptCollaborationInvitation = async (collaborationId: string) => {
    try {
      await db.transact([
        tx.amendmentRoleCollaborators[collaborationId].update({
          status: 'member',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept collaboration invitation:', error);
    }
  };

  const handleDeclineCollaborationInvitation = async (collaborationId: string) => {
    try {
      await db.transact([tx.amendmentRoleCollaborators[collaborationId].delete()]);
    } catch (error) {
      console.error('Failed to decline collaboration invitation:', error);
    }
  };

  const handleWithdrawCollaborationRequest = async (collaborationId: string) => {
    try {
      await db.transact([tx.amendmentRoleCollaborators[collaborationId].delete()]);
    } catch (error) {
      console.error('Failed to withdraw collaboration request:', error);
    }
  };

  const navigateToGroup = (groupId: string) => {
    router.push(`/group/${groupId}`);
  };

  const navigateToEvent = (eventId: string) => {
    router.push(`/event/${eventId}`);
  };

  const navigateToAmendment = (amendmentId: string) => {
    router.push(`/amendment/${amendmentId}`);
  };

  const navigateToBlog = (blogId: string) => {
    router.push(`/blog/${blogId}`);
  };

  // Blog handlers
  const handleLeaveBlog = async (blogRelationId: string) => {
    try {
      await db.transact([tx.blogRoleBloggers[blogRelationId].delete()]);
    } catch (error) {
      console.error('Failed to leave blog:', error);
    }
  };

  const handleAcceptBlogInvitation = async (blogRelationId: string) => {
    try {
      await db.transact([
        tx.blogRoleBloggers[blogRelationId].update({
          status: 'writer',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept blog invitation:', error);
    }
  };

  const handleDeclineBlogInvitation = async (blogRelationId: string) => {
    try {
      await db.transact([tx.blogRoleBloggers[blogRelationId].delete()]);
    } catch (error) {
      console.error('Failed to decline blog invitation:', error);
    }
  };

  const handleWithdrawBlogRequest = async (blogRelationId: string) => {
    try {
      await db.transact([tx.blogRoleBloggers[blogRelationId].delete()]);
    } catch (error) {
      console.error('Failed to withdraw blog request:', error);
    }
  };

  if (!canView) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You can only view your own memberships.</CardDescription>
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
          <h1 className="text-3xl font-bold">My Memberships & Participation</h1>
          <p className="mt-2 text-muted-foreground">
            View and manage your group memberships, event participations, and amendment
            collaborations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, role, or status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs defaultValue="groups" className="space-y-4">
          <TabsList>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups ({filteredMemberships.length})
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Events ({filteredParticipations.length})
            </TabsTrigger>
            <TabsTrigger value="amendments" className="flex items-center gap-2">
              <FileEdit className="h-4 w-4" />
              Amendments ({filteredCollaborations.length})
            </TabsTrigger>
            <TabsTrigger value="blogs" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Blogs ({filteredBlogRelations.length})
            </TabsTrigger>
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups">
            {/* Pending Invitations */}
            {invitedMemberships.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending Invitations ({invitedMemberships.length})
                  </CardTitle>
                  <CardDescription>Group invitations you've received</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Invited</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitedMemberships.map((membership: any) => {
                        const group = membership.group;
                        const groupName = group?.name || 'Unknown Group';
                        const createdAt = membership.createdAt
                          ? new Date(membership.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={membership.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToGroup(group.id)}
                              >
                                <div className="font-medium">{groupName}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAcceptInvitation(membership.id)}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeclineInvitation(membership.id)}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Decline
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Active Memberships */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Memberships ({activeMemberships.length})
                </CardTitle>
                <CardDescription>Groups you're currently a member of</CardDescription>
              </CardHeader>
              <CardContent>
                {activeMemberships.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No active memberships found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMemberships.map((membership: any) => {
                        const group = membership.group;
                        const groupName = group?.name || 'Unknown Group';
                        const groupDescription = group?.description || '';
                        const role = membership.role?.name || 'Member';
                        const createdAt = membership.createdAt
                          ? new Date(membership.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={membership.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToGroup(group.id)}
                              >
                                <div className="font-medium">{groupName}</div>
                                {groupDescription && (
                                  <div className="line-clamp-1 text-sm text-muted-foreground">
                                    {groupDescription}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLeaveMembership(membership.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Leave</span>
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

            {/* Pending Requests */}
            {requestedMemberships.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending Requests ({requestedMemberships.length})
                  </CardTitle>
                  <CardDescription>Your pending requests to join groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestedMemberships.map((membership: any) => {
                        const group = membership.group;
                        const groupName = group?.name || 'Unknown Group';
                        const createdAt = membership.createdAt
                          ? new Date(membership.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={membership.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToGroup(group.id)}
                              >
                                <div className="font-medium">{groupName}</div>
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdrawRequest(membership.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Withdraw Request</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            {/* Pending Invitations */}
            {invitedParticipations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Pending Invitations ({invitedParticipations.length})
                  </CardTitle>
                  <CardDescription>Event invitations you've received</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Invited</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitedParticipations.map((participation: any) => {
                        const event = participation.event;
                        const eventTitle = event?.title || 'Unknown Event';
                        const role = participation.role?.name || 'Participant';
                        const createdAt = participation.createdAt
                          ? new Date(participation.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={participation.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToEvent(event.id)}
                              >
                                <div className="font-medium">{eventTitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAcceptEventInvitation(participation.id)}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeclineEventInvitation(participation.id)}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Decline
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Active Participations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Active Participations ({activeParticipations.length})
                </CardTitle>
                <CardDescription>Events you're currently participating in</CardDescription>
              </CardHeader>
              <CardContent>
                {activeParticipations.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No active participations found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeParticipations.map((participation: any) => {
                        const event = participation.event;
                        const eventTitle = event?.title || 'Unknown Event';
                        const eventDescription = event?.description || '';
                        const role = participation.role?.name || 'Participant';
                        const createdAt = participation.createdAt
                          ? new Date(participation.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={participation.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToEvent(event.id)}
                              >
                                <div className="font-medium">{eventTitle}</div>
                                {eventDescription && (
                                  <div className="line-clamp-1 text-sm text-muted-foreground">
                                    {eventDescription}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLeaveEvent(participation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Leave</span>
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

            {/* Pending Requests */}
            {requestedParticipations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Pending Requests ({requestedParticipations.length})
                  </CardTitle>
                  <CardDescription>Your pending requests to join events</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestedParticipations.map((participation: any) => {
                        const event = participation.event;
                        const eventTitle = event?.title || 'Unknown Event';
                        const role = participation.role?.name || 'Participant';
                        const createdAt = participation.createdAt
                          ? new Date(participation.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={participation.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToEvent(event.id)}
                              >
                                <div className="font-medium">{eventTitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdrawEventRequest(participation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Withdraw Request</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Amendments Tab */}
          <TabsContent value="amendments">
            {/* Pending Invitations */}
            {invitedCollaborations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileEdit className="h-5 w-5" />
                    Pending Invitations ({invitedCollaborations.length})
                  </CardTitle>
                  <CardDescription>
                    Amendment collaboration invitations you've received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amendment</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Invited</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitedCollaborations.map((collaboration: any) => {
                        const amendment = collaboration.amendment;
                        const amendmentTitle = amendment?.title || 'Unknown Amendment';
                        const role = collaboration.role?.name || 'Collaborator';
                        const createdAt = collaboration.createdAt
                          ? new Date(collaboration.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={collaboration.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToAmendment(amendment.id)}
                              >
                                <div className="font-medium">{amendmentTitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() =>
                                    handleAcceptCollaborationInvitation(collaboration.id)
                                  }
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    handleDeclineCollaborationInvitation(collaboration.id)
                                  }
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Decline
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Active Collaborations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5" />
                  Active Collaborations ({activeCollaborations.length})
                </CardTitle>
                <CardDescription>Amendments you're currently collaborating on</CardDescription>
              </CardHeader>
              <CardContent>
                {activeCollaborations.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No active collaborations found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amendment</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeCollaborations.map((collaboration: any) => {
                        const amendment = collaboration.amendment;
                        const amendmentTitle = amendment?.title || 'Unknown Amendment';
                        const amendmentDescription = amendment?.description || '';
                        const role = collaboration.role?.name || 'Collaborator';
                        const createdAt = collaboration.createdAt
                          ? new Date(collaboration.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={collaboration.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToAmendment(amendment.id)}
                              >
                                <div className="font-medium">{amendmentTitle}</div>
                                {amendmentDescription && (
                                  <div className="line-clamp-1 text-sm text-muted-foreground">
                                    {amendmentDescription}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLeaveCollaboration(collaboration.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Leave</span>
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

            {/* Pending Requests */}
            {requestedCollaborations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileEdit className="h-5 w-5" />
                    Pending Requests ({requestedCollaborations.length})
                  </CardTitle>
                  <CardDescription>
                    Your pending requests to collaborate on amendments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amendment</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestedCollaborations.map((collaboration: any) => {
                        const amendment = collaboration.amendment;
                        const amendmentTitle = amendment?.title || 'Unknown Amendment';
                        const role = collaboration.role?.name || 'Collaborator';
                        const createdAt = collaboration.createdAt
                          ? new Date(collaboration.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={collaboration.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToAmendment(amendment.id)}
                              >
                                <div className="font-medium">{amendmentTitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdrawCollaborationRequest(collaboration.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Withdraw Request</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Blogs Tab */}
          <TabsContent value="blogs">
            {/* Pending Invitations */}
            {invitedBlogRelations.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Pending Invitations ({invitedBlogRelations.length})
                  </CardTitle>
                  <CardDescription>Blog invitations you've received</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blog</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Invited</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invitedBlogRelations.map((relation: any) => {
                        const blog = relation.blog;
                        const blogTitle = blog?.title || 'Unknown Blog';
                        const role = relation.role?.name || 'Writer';
                        const createdAt = relation.createdAt
                          ? new Date(relation.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={relation.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToBlog(blog.id)}
                              >
                                <div className="font-medium">{blogTitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleAcceptBlogInvitation(relation.id)}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeclineBlogInvitation(relation.id)}
                                >
                                  <X className="mr-1 h-4 w-4" />
                                  Decline
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Active Blog Relations */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Active Blogs ({activeBlogRelations.length})
                </CardTitle>
                <CardDescription>Blogs you're currently writing for</CardDescription>
              </CardHeader>
              <CardContent>
                {activeBlogRelations.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No active blog relations found
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blog</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBlogRelations.map((relation: any) => {
                        const blog = relation.blog;
                        const blogTitle = blog?.title || 'Unknown Blog';
                        const blogDescription = blog?.description || '';
                        const role = relation.role?.name || 'Writer';
                        const createdAt = relation.createdAt
                          ? new Date(relation.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={relation.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToBlog(blog.id)}
                              >
                                <div className="font-medium">{blogTitle}</div>
                                {blogDescription && (
                                  <div className="line-clamp-1 text-sm text-muted-foreground">
                                    {blogDescription}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleLeaveBlog(relation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Leave</span>
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

            {/* Pending Requests */}
            {requestedBlogRelations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Pending Requests ({requestedBlogRelations.length})
                  </CardTitle>
                  <CardDescription>Your pending requests to write for blogs</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Blog</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {requestedBlogRelations.map((relation: any) => {
                        const blog = relation.blog;
                        const blogTitle = blog?.title || 'Unknown Blog';
                        const role = relation.role?.name || 'Writer';
                        const createdAt = relation.createdAt
                          ? new Date(relation.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={relation.id}>
                            <TableCell>
                              <div
                                className="cursor-pointer hover:underline"
                                onClick={() => navigateToBlog(blog.id)}
                              >
                                <div className="font-medium">{blogTitle}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{role}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleWithdrawBlogRequest(relation.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="ml-2">Withdraw Request</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
