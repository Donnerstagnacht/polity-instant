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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Search, Users, UserPlus, Shield, Check, X, Loader2, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useGroupMembership } from '@/features/groups/hooks/useGroupMembership';
import { useToast } from '@/global-state/use-toast';

// Define available action rights
const ACTION_RIGHTS = [
  { resource: 'events', action: 'create', label: 'Create Events' },
  { resource: 'events', action: 'update', label: 'Update Events' },
  { resource: 'events', action: 'delete', label: 'Delete Events' },
  { resource: 'events', action: 'manage_participants', label: 'Manage Event Participants' },
  { resource: 'events', action: 'manage_speakers', label: 'Manage Speakers' },
  { resource: 'events', action: 'manage_votes', label: 'Manage Votes' },
  { resource: 'agendaItems', action: 'create', label: 'Create Agenda Items' },
  { resource: 'agendaItems', action: 'update', label: 'Update Agenda Items' },
  { resource: 'agendaItems', action: 'delete', label: 'Delete Agenda Items' },
  { resource: 'amendments', action: 'create', label: 'Create Amendments' },
  { resource: 'amendments', action: 'delete', label: 'Delete Amendments' },
  { resource: 'blogs', action: 'create', label: 'Create Blogs' },
  { resource: 'blogs', action: 'update', label: 'Update Blogs' },
  { resource: 'blogs', action: 'delete', label: 'Delete Blogs' },
  { resource: 'groups', action: 'manage_relationships', label: 'Manage Group Relationships' },
  { resource: 'todos', action: 'create', label: 'Create Todos' },
  { resource: 'todos', action: 'update', label: 'Update Todos' },
  { resource: 'todos', action: 'delete', label: 'Delete Todos' },
  { resource: 'elections', action: 'manage', label: 'Manage Elections' },
  { resource: 'positions', action: 'manage', label: 'Manage Positions' },
  { resource: 'payments', action: 'create', label: 'Create Payments' },
  { resource: 'payments', action: 'update', label: 'Update Payments' },
  { resource: 'payments', action: 'delete', label: 'Delete Payments' },
  { resource: 'links', action: 'create', label: 'Create Links' },
  { resource: 'links', action: 'update', label: 'Update Links' },
  { resource: 'links', action: 'delete', label: 'Delete Links' },
];

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
  const [activeTab, setActiveTab] = useState('memberships');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);
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
      user: {},
      role: {},
    },
  });

  // Query for group details
  const { data: groupData } = db.useQuery({
    groups: {
      $: { where: { id: resolvedParams.id } },
    },
  });

  // Query for roles and action rights
  const { data: rolesData } = db.useQuery({
    roles: {
      $: {
        where: {
          'group.id': resolvedParams.id,
          scope: 'group',
        },
      },
      actionRights: {},
    },
  });

  // Query all users for user search
  const { data: usersData, isLoading: isLoadingUsers } = db.useQuery({
    $users: {},
  });

  const memberships = membershipsData?.groupMemberships || [];
  const group = groupData?.groups?.[0];

  // Get existing member IDs to exclude from invite search
  const existingMemberIds = memberships.map(m => m.user?.id).filter(Boolean) as string[];

  // Filter users for invite search
  const filteredUsers = usersData?.$users?.filter(user => {
    if (!user?.id) return false;
    if (existingMemberIds.includes(user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.contactEmail?.toLowerCase().includes(query)
    );
  });

  // Filter memberships based on search query
  const filteredMemberships = useMemo(() => {
    if (!searchQuery.trim()) return memberships;

    const query = searchQuery.toLowerCase();
    return memberships.filter((membership: any) => {
      const userName = membership.user?.name?.toLowerCase() || '';
      const userHandle = membership.user?.handle?.toLowerCase() || '';
      const role = membership.role?.name?.toLowerCase() || '';
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
      filteredMemberships.filter((m: any) => m.status === 'member' || m.role === 'Board Member'),
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

  const handleChangeRole = async (membershipId: string, newRoleId: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([
        tx.groupMemberships[membershipId].link({
          role: newRoleId,
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
    const boardMemberRole = rolesData?.roles?.find((r: any) => r.name === 'Board Member');
    if (boardMemberRole) {
      await db.transact([tx.groupMemberships[membershipId].link({ role: boardMemberRole.id })]);
    }
  };

  const handleDemoteToMember = async (membershipId: string) => {
    if (!isAdmin) return;
    const memberRole = rolesData?.roles?.find((r: any) => r.name === 'Member');
    if (memberRole) {
      await db.transact([tx.groupMemberships[membershipId].link({ role: memberRole.id })]);
    }
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

  // Role management handlers
  const handleAddRole = async () => {
    if (!newRoleName.trim()) {
      toast({
        title: 'Error',
        description: 'Role name is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const roleId = id();

      await db.transact([
        tx.roles[roleId]
          .create({
            name: newRoleName,
            description: newRoleDescription,
            scope: 'group',
          })
          .link({ group: resolvedParams.id }),
      ]);

      toast({
        title: 'Success',
        description: 'Role created successfully',
      });

      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to create role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    try {
      await db.transact([tx.roles[roleId].delete()]);
      toast({
        title: 'Success',
        description: 'Role removed successfully',
      });
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActionRight = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHasRight: boolean
  ) => {
    try {
      if (currentlyHasRight) {
        // Find and remove the action right
        const role = rolesData?.roles?.find(r => r.id === roleId);
        const actionRightToRemove = role?.actionRights?.find(
          ar => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await db.transact([tx.actionRights[actionRightToRemove.id].delete()]);
        }
      } else {
        // Add the action right
        const actionRightId = id();
        await db.transact([
          tx.actionRights[actionRightId]
            .create({
              resource,
              action,
              groupId: resolvedParams.id,
            })
            .link({ roles: roleId }),
        ]);
      }
    } catch (error) {
      console.error('Failed to toggle action right:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const navigateToUser = (userId: string) => {
    router.push(`/user/${userId}`);
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
                    {isLoadingUsers ? (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        <CommandEmpty>No users found.</CommandEmpty>
                        <CommandGroup>
                          {filteredUsers?.map(user => {
                            if (!user?.id) return null;
                            const userId = user.id;
                            const isSelected = selectedUsers.includes(userId);
                            return (
                              <CommandItem
                                key={user.id}
                                value={`${user.name} ${user.handle} ${user.contactEmail}`}
                                onSelect={() => toggleUserSelection(userId)}
                                className="cursor-pointer"
                              >
                                <div className="flex flex-1 items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    {user.avatar ? (
                                      <AvatarImage src={user.avatar} alt={user.name || ''} />
                                    ) : null}
                                    <AvatarFallback>
                                      {user.name?.[0]?.toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="font-medium">{user.name || 'Unnamed User'}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {user.handle ? `@${user.handle}` : user.contactEmail}
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
                        const user = usersData?.$users?.find(u => u?.id === userId);
                        if (!user) return null;

                        return (
                          <Badge key={userId} variant="secondary" className="gap-1 pr-1">
                            <span>{user.name || 'Unnamed User'}</span>
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

        {/* Tabs for Memberships and Roles */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="memberships">Memberships</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          {/* Memberships Tab */}
          <TabsContent value="memberships" className="space-y-6">
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
                        const userName = user?.name || 'Unknown User';
                        const userAvatar = user?.avatar || '';
                        const userHandle = user?.handle || '';
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
                                    <div className="text-sm text-muted-foreground">
                                      @{userHandle}
                                    </div>
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
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeMembers.map((membership: any) => {
                        const user = membership.user;
                        const userName = user?.name || 'Unknown User';
                        const userAvatar = user?.avatar || '';
                        const userHandle = user?.handle || '';
                        const role = membership.role?.name || 'Member';
                        const roleId = membership.role?.id || '';
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
                                    <div className="text-sm text-muted-foreground">
                                      @{userHandle}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={roleId}
                                onValueChange={newRoleId =>
                                  handleChangeRole(membership.id, newRoleId)
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue placeholder={role} />
                                </SelectTrigger>
                                <SelectContent>
                                  {rolesData?.roles?.map((roleOption: any) => (
                                    <SelectItem key={roleOption.id} value={roleOption.id}>
                                      {roleOption.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {role !== 'Board Member' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePromoteToAdmin(membership.id)}
                                  >
                                    <Shield className="mr-1 h-4 w-4" />
                                    Promote to Board Member
                                  </Button>
                                )}
                                {role === 'Board Member' && (
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
                        const userName = user?.name || 'Unknown User';
                        const userAvatar = user?.avatar || '';
                        const userHandle = user?.handle || '';
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
                                    <div className="text-sm text-muted-foreground">
                                      @{userHandle}
                                    </div>
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
          </TabsContent>

          {/* Roles Tab */}
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Role Permissions
                    </CardTitle>
                    <CardDescription>
                      Manage roles and their action rights for this group
                    </CardDescription>
                  </div>
                  <Dialog open={addRoleDialogOpen} onOpenChange={setAddRoleDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Role</DialogTitle>
                        <DialogDescription>
                          Create a new role with custom permissions for this group.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="role-name" className="text-sm font-medium">
                            Role Name
                          </label>
                          <Input
                            id="role-name"
                            placeholder="e.g., Moderator, Editor, Organizer"
                            value={newRoleName}
                            onChange={e => setNewRoleName(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="role-description" className="text-sm font-medium">
                            Description (Optional)
                          </label>
                          <Input
                            id="role-description"
                            placeholder="Describe this role's purpose"
                            value={newRoleDescription}
                            onChange={e => setNewRoleDescription(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddRoleDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="button" onClick={handleAddRole}>
                          Create Role
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {rolesData?.roles && rolesData.roles.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Action Right</TableHead>
                          {rolesData.roles.map((role: any) => (
                            <TableHead key={role.id} className="min-w-[120px] text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="font-semibold">{role.name}</span>
                                {role.description && (
                                  <span className="text-xs font-normal text-muted-foreground">
                                    {role.description}
                                  </span>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="mt-1 h-6 w-6 p-0"
                                  onClick={() => handleRemoveRole(role.id)}
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {ACTION_RIGHTS.map(({ resource, action, label }) => {
                          const rightKey = `${resource}-${action}`;
                          return (
                            <TableRow key={rightKey}>
                              <TableCell className="font-medium">{label}</TableCell>
                              {rolesData.roles.map((role: any) => {
                                const hasRight = role.actionRights?.some(
                                  (ar: any) => ar.resource === resource && ar.action === action
                                );
                                return (
                                  <TableCell key={role.id} className="text-center">
                                    <div className="flex justify-center">
                                      <Checkbox
                                        checked={hasRight}
                                        onCheckedChange={() =>
                                          handleToggleActionRight(
                                            role.id,
                                            resource,
                                            action,
                                            hasRight
                                          )
                                        }
                                      />
                                    </div>
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Shield className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-4 text-muted-foreground">
                      No roles created yet. Click "Add Role" to create your first role.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthGuard>
  );
}
