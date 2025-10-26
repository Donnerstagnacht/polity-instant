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
import { Trash2, Search, Users, Check, X, Calendar, FileEdit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function MembershipsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { user: authUser } = useAuthStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // Only allow users to view their own memberships page
  const canView = authUser?.id === resolvedParams.id;

  // Query for all memberships, participations, and collaborations
  const { data } = db.useQuery(
    canView
      ? {
          groupMemberships: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            group: {
              owner: {
                profile: {},
              },
            },
          },
          eventParticipants: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            event: {},
          },
          amendmentCollaborators: {
            $: {
              where: {
                'user.id': resolvedParams.id,
              },
            },
            amendment: {},
          },
        }
      : { groupMemberships: {}, eventParticipants: {}, amendmentCollaborators: {} }
  );

  const memberships = data?.groupMemberships || [];
  const participations = data?.eventParticipants || [];
  const collaborations = data?.amendmentCollaborators || [];

  // Filter memberships based on search query
  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return memberships;

    const query = searchQuery.toLowerCase();
    return memberships.filter((membership: any) => {
      const groupName = membership.group?.name?.toLowerCase() || '';
      const groupDescription = membership.group?.description?.toLowerCase() || '';
      const role = membership.role?.toLowerCase() || '';
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

  const handleLeaveMembership = async (membershipId: string) => {
    try {
      await db.transact([tx.groupMemberships[membershipId].delete()]);
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
      await db.transact([tx.eventParticipants[participationId].delete()]);
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
      await db.transact([tx.amendmentCollaborators[collaborationId].delete()]);
    } catch (error) {
      console.error('Failed to leave collaboration:', error);
    }
  };

  const handleAcceptCollaborationInvitation = async (collaborationId: string) => {
    try {
      await db.transact([
        tx.amendmentCollaborators[collaborationId].update({
          status: 'member',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept collaboration invitation:', error);
    }
  };

  const handleDeclineCollaborationInvitation = async (collaborationId: string) => {
    try {
      await db.transact([tx.amendmentCollaborators[collaborationId].delete()]);
    } catch (error) {
      console.error('Failed to decline collaboration invitation:', error);
    }
  };

  const handleWithdrawCollaborationRequest = async (collaborationId: string) => {
    try {
      await db.transact([tx.amendmentCollaborators[collaborationId].delete()]);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'member':
        return <Badge variant="default">Member</Badge>;
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      case 'requested':
        return <Badge variant="secondary">Pending Request</Badge>;
      case 'invited':
        return <Badge variant="outline">Invited</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
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
          </TabsList>

          {/* Groups Tab */}
          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Your Group Memberships
                </CardTitle>
                <CardDescription>
                  Groups you're a member of, have requested to join, or been invited to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredMemberships.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    {memberships.length === 0
                      ? "You don't have any group memberships yet"
                      : 'No memberships match your search'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Group</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMemberships.map((membership: any) => {
                        const group = membership.group;
                        const groupName = group?.name || 'Unknown Group';
                        const groupDescription = group?.description || '';
                        const status = membership.status || 'member';
                        const role = membership.role || 'member';
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
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {status === 'invited' && (
                                  <>
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
                                  </>
                                )}
                                {status === 'requested' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleWithdrawRequest(membership.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-2">Withdraw Request</span>
                                  </Button>
                                )}
                                {(status === 'member' || status === 'admin') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLeaveMembership(membership.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-2">Leave</span>
                                  </Button>
                                )}
                              </div>
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

          {/* Events Tab */}
          <TabsContent value="events">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Your Event Participations
                </CardTitle>
                <CardDescription>
                  Events you're participating in, have requested to join, or been invited to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredParticipations.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    {participations.length === 0
                      ? "You're not participating in any events yet"
                      : 'No participations match your search'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredParticipations.map((participation: any) => {
                        const event = participation.event;
                        const eventTitle = event?.title || 'Unknown Event';
                        const eventDescription = event?.description || '';
                        const status = participation.status || 'member';
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
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {status === 'invited' && (
                                  <>
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
                                  </>
                                )}
                                {status === 'requested' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleWithdrawEventRequest(participation.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-2">Withdraw Request</span>
                                  </Button>
                                )}
                                {(status === 'member' || status === 'admin') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLeaveEvent(participation.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-2">Leave</span>
                                  </Button>
                                )}
                              </div>
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

          {/* Amendments Tab */}
          <TabsContent value="amendments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5" />
                  Your Amendment Collaborations
                </CardTitle>
                <CardDescription>
                  Amendments you're collaborating on, have requested to join, or been invited to
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredCollaborations.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    {collaborations.length === 0
                      ? "You're not collaborating on any amendments yet"
                      : 'No collaborations match your search'}
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Amendment</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCollaborations.map((collaboration: any) => {
                        const amendment = collaboration.amendment;
                        const amendmentTitle = amendment?.title || 'Unknown Amendment';
                        const amendmentDescription = amendment?.description || '';
                        const status = collaboration.status || 'member';
                        const role = collaboration.role || 'collaborator';
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
                            <TableCell>{getStatusBadge(status)}</TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {status === 'invited' && (
                                  <>
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
                                  </>
                                )}
                                {status === 'requested' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleWithdrawCollaborationRequest(collaboration.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-2">Withdraw Request</span>
                                  </Button>
                                )}
                                {(status === 'member' || status === 'admin') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleLeaveCollaboration(collaboration.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    <span className="ml-2">Leave</span>
                                  </Button>
                                )}
                              </div>
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
