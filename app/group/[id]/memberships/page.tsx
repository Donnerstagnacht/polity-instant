'use client';

import { use, useState, useMemo } from 'react';
import { AuthGuard } from '@/features/auth/AuthGuard';
import db, { tx, id } from '../../../../db';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Trash2, Search, Users, UserPlus, Shield, Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';
import { useToast } from '@/global-state/use-toast';

export default function GroupMembershipsManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  // Check if current user is admin
  const { isAdmin } = useGroupMembership(resolvedParams.id);

  // Query for all memberships
  const { data: membershipsData } = db.useQuery({
    groupMemberships: {
      $: {
        where: {
          'group.id': resolvedParams.id,
        },
      },
      user: {
        profile: {},
      },
    },
  });

  // Query for group details
  const { data: groupData } = db.useQuery({
    groups: {
      $: { where: { id: resolvedParams.id } },
    },
  });

  // Query all profiles for user search
  const { data: profilesData, isLoading: isLoadingProfiles } = db.useQuery({
    profiles: {
      $: {
        where: {
          isActive: true,
        },
      },
      user: {},
    },
  });

  const memberships = membershipsData?.groupMemberships || [];
  const group = groupData?.groups?.[0];

  // Get existing member IDs to exclude from invite search
  const existingMemberIds = memberships.map(m => m.user?.id).filter(Boolean) as string[];

  // Filter profiles for invite search
  const filteredProfiles = profilesData?.profiles?.filter(profile => {
    if (!profile.user?.id) return false;
    if (existingMemberIds.includes(profile.user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(query) ||
      profile.handle?.toLowerCase().includes(query) ||
      profile.contactEmail?.toLowerCase().includes(query)
    );
  });

  // Filter memberships based on search query
  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return memberships;

    const query = searchQuery.toLowerCase();
    return memberships.filter((membership: any) => {
      const userName = membership.user?.profile?.name?.toLowerCase() || '';
      const userHandle = membership.user?.profile?.handle?.toLowerCase() || '';
      const role = membership.role?.toLowerCase() || '';
      const status = membership.status?.toLowerCase() || '';
      return (
        userName.includes(query) ||
        userHandle.includes(query) ||
        role.includes(query) ||
        status.includes(query)
      );
    });
  }, [memberships, searchQuery]);

  // Separate by status
  const pendingRequests = useMemo(
    () => filteredMemberships.filter((m: any) => m.status === 'requested'),
    [filteredMemberships]
  );
  const activeMembers = useMemo(
    () =>
      filteredMemberships.filter(
        (m: any) => m.status === 'member' || m.status === 'admin' || m.role === 'admin'
      ),
    [filteredMemberships]
  );
  const pendingInvitations = useMemo(
    () => filteredMemberships.filter((m: any) => m.status === 'invited'),
    [filteredMemberships]
  );

  const handleRemoveMember = async (membershipId: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([tx.groupMemberships[membershipId].delete()]);
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleChangeRole = async (membershipId: string, newRole: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([
        tx.groupMemberships[membershipId].update({
          role: newRole,
        }),
      ]);
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const handleChangeStatus = async (membershipId: string, newStatus: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([
        tx.groupMemberships[membershipId].update({
          status: newStatus,
        }),
      ]);
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  const handleApproveRequest = async (membershipId: string) => {
    if (!isAdmin) return;
    await handleChangeStatus(membershipId, 'member');
  };

  const handleRejectRequest = async (membershipId: string) => {
    if (!isAdmin) return;
    await handleRemoveMember(membershipId);
  };

  const handlePromoteToAdmin = async (membershipId: string) => {
    if (!isAdmin) return;
    await handleChangeStatus(membershipId, 'admin');
  };

  const handleDemoteToMember = async (membershipId: string) => {
    if (!isAdmin) return;
    await handleChangeStatus(membershipId, 'member');
  };

  const handleWithdrawInvitation = async (membershipId: string) => {
    if (!isAdmin) return;
    await handleRemoveMember(membershipId);
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    setIsInviting(true);
    try {
      const inviteTransactions = selectedUsers.map(userId => {
        const membershipId = id();
        return tx.groupMemberships[membershipId]
          .create({
            role: 'member',
            status: 'invited',
            createdAt: Date.now(),
          })
          .link({ user: userId, group: resolvedParams.id });
      });

      await db.transact(inviteTransactions);

      toast({
        title: 'Success',
        description: `Invited ${selectedUsers.length} ${selectedUsers.length === 1 ? 'member' : 'members'}`,
      });

      // Reset state
      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite members:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite members. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  const navigateToUser = (userId: string) => {
    router.push(`/user/${userId}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'member':
        return <Badge variant="default">Member</Badge>;
      case 'admin':
        return (
          <Badge variant="destructive">
            <Shield className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        );
      case 'requested':
        return <Badge variant="secondary">Pending</Badge>;
      case 'invited':
        return <Badge variant="outline">Invited</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (!isAdmin) {
    return (
      <AuthGuard requireAuth={true}>
        <div className="container mx-auto max-w-4xl p-8">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Only group administrators can manage memberships.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <div className="container mx-auto max-w-7xl p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Manage Group Memberships</h1>
          <p className="mt-2 text-muted-foreground">
            {group?.name || 'Group'} - Manage members, requests, and invitations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search members by name, role, or status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Invite Members</DialogTitle>
                <DialogDescription>
                  Search and select users to invite to this group. They will receive an invitation
                  to join.
                </DialogDescription>
              </DialogHeader>

              <div className="py-4">
                {/* Search and selection UI */}
                <Command className="rounded-lg border">
                  <CommandInput
                    placeholder="Search by name, handle, or email..."
                    value={inviteSearchQuery}
                    onValueChange={setInviteSearchQuery}
                  />
                  <CommandList>
                    {isLoadingProfiles ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {filteredProfiles?.map(profile => {
                            if (!profile.user?.id) return null;
                            const userId = profile.user.id;
                            const isSelected = selectedUsers.includes(userId);
                            return (
                              <CommandItem
                                key={profile.id}
                                value={`${profile.name} ${profile.handle} ${profile.contactEmail}`}
                                onSelect={() => toggleUserSelection(userId)}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-1 items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {profile.avatar ? (
                                      <AvatarImage src={profile.avatar} alt={profile.name || ''} />
                                    ) : null}
                                    <AvatarFallback>
                                      {profile.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      {profile.name || 'Unnamed User'}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {profile.handle ? `@${profile.handle}` : profile.contactEmail}
                                    </div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className="ml-2 h-4 w-4 text-primary" strokeWidth={3} />
                                )}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </>
                    )}
                  </CommandList>
                </Command>

                {/* Selected users display */}
                {selectedUsers.length > 0 && (
                  <div className="mt-4">
                    <div className="mb-2 text-sm font-medium">
                      Selected ({selectedUsers.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedUsers.map(userId => {
                        const profile = profilesData?.profiles?.find(p => p.user?.id === userId);
                        if (!profile) return null;

                        return (
                          <Badge key={userId} variant="secondary" className="gap-1 pr-1">
                            <span>{profile.name || 'Unnamed User'}</span>
                            <button
                              onClick={() => toggleUserSelection(userId)}
                              className="ml-1 rounded-full p-0.5 hover:bg-muted"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  disabled={isInviting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInviteUsers}
                  disabled={selectedUsers.length === 0 || isInviting}
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Inviting...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Invite {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Pending Join Requests ({pendingRequests.length})
              </CardTitle>
              <CardDescription>Review and approve membership requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((membership: any) => {
                    const user = membership.user;
                    const profile = user?.profile;
                    const userName = profile?.name || 'Unknown User';
                    const userAvatar = profile?.avatar || '';
                    const userHandle = profile?.handle || '';
                    const createdAt = membership.createdAt
                      ? new Date(membership.createdAt).toLocaleDateString()
                      : 'N/A';

                    return (
                      <TableRow key={membership.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              className="h-10 w-10 cursor-pointer"
                              onClick={() => navigateToUser(user.id)}
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
                              onClick={() => navigateToUser(user.id)}
                            >
                              <div className="font-medium">{userName}</div>
                              {userHandle && (
                                <div className="text-sm text-muted-foreground">@{userHandle}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleApproveRequest(membership.id)}
                            >
                              <Check className="mr-1 h-4 w-4" />
                              Accept
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectRequest(membership.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-2">Remove</span>
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

        {/* Active Members */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Active Members ({activeMembers.length})
            </CardTitle>
            <CardDescription>Current group members and administrators</CardDescription>
          </CardHeader>
          <CardContent>
            {activeMembers.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">No active members found</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeMembers.map((membership: any) => {
                    const user = membership.user;
                    const profile = user?.profile;
                    const userName = profile?.name || 'Unknown User';
                    const userAvatar = profile?.avatar || '';
                    const userHandle = profile?.handle || '';
                    const status = membership.status || 'member';
                    const role = membership.role || 'member';
                    const createdAt = membership.createdAt
                      ? new Date(membership.createdAt).toLocaleDateString()
                      : 'N/A';

                    return (
                      <TableRow key={membership.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              className="h-10 w-10 cursor-pointer"
                              onClick={() => navigateToUser(user.id)}
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
                              onClick={() => navigateToUser(user.id)}
                            >
                              <div className="font-medium">{userName}</div>
                              {userHandle && (
                                <div className="text-sm text-muted-foreground">@{userHandle}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={role}
                            onValueChange={newRole => handleChangeRole(membership.id, newRole)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>{getStatusBadge(status)}</TableCell>
                        <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {status === 'member' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePromoteToAdmin(membership.id)}
                              >
                                <Shield className="mr-1 h-4 w-4" />
                                Promote to Admin
                              </Button>
                            )}
                            {status === 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDemoteToMember(membership.id)}
                              >
                                Demote to Member
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(membership.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="ml-2">Remove</span>
                            </Button>
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

        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Pending Invitations ({pendingInvitations.length})
              </CardTitle>
              <CardDescription>
                Users who have been invited but haven't accepted yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingInvitations.map((membership: any) => {
                    const user = membership.user;
                    const profile = user?.profile;
                    const userName = profile?.name || 'Unknown User';
                    const userAvatar = profile?.avatar || '';
                    const userHandle = profile?.handle || '';
                    const createdAt = membership.createdAt
                      ? new Date(membership.createdAt).toLocaleDateString()
                      : 'N/A';

                    return (
                      <TableRow key={membership.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar
                              className="h-10 w-10 cursor-pointer"
                              onClick={() => navigateToUser(user.id)}
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
                              onClick={() => navigateToUser(user.id)}
                            >
                              <div className="font-medium">{userName}</div>
                              {userHandle && (
                                <div className="text-sm text-muted-foreground">@{userHandle}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWithdrawInvitation(membership.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="ml-2">Withdraw Invitation</span>
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
      </div>
    </AuthGuard>
  );
}
