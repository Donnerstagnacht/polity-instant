'use client';

import { use, useState, useMemo } from 'react';
import { db, tx, id } from '../../../../db';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus, Users, Shield, Check, X, Loader2, Trash2, Search, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToast } from '@/global-state/use-toast';

// Define available action rights for amendments
const ACTION_RIGHTS = [
  { resource: 'amendments', action: 'update', label: 'Update Amendment' },
  { resource: 'amendments', action: 'delete', label: 'Delete Amendment' },
  { resource: 'documents', action: 'view', label: 'View Document' },
  { resource: 'documents', action: 'update', label: 'Edit Document' },
  { resource: 'threads', action: 'create', label: 'Create Threads' },
  { resource: 'threads', action: 'update', label: 'Update Threads' },
  { resource: 'threads', action: 'delete', label: 'Delete Threads' },
  { resource: 'comments', action: 'create', label: 'Create Comments' },
  { resource: 'comments', action: 'update', label: 'Update Comments' },
  { resource: 'comments', action: 'delete', label: 'Delete Comments' },
];

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function AmendmentCollaboratorsPage({ params }: PageParams) {
  const router = useRouter();
  const resolvedParams = use(params);
  const amendmentId = resolvedParams.id;
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('collaborators');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);

  // Query amendment and collaborators
  const { data } = db.useQuery({
    amendments: {
      $: {
        where: {
          id: amendmentId,
        },
      },
      amendmentRoleCollaborators: {
        user: {},
      },
      roles: {
        $: {
          where: {
            scope: 'amendment',
          },
        },
        actionRights: {},
      },
      group: {
        roles: {
          $: {
            where: {
              scope: 'group',
            },
          },
          actionRights: {},
        },
      },
    },
  });

  // Query all users for user search
  const { data: usersData, isLoading: isLoadingUsers } = db.useQuery({
    $users: {
      $: {
        where: {
          isActive: true,
        },
      },
    },
  });

  // Check if current user is admin
  const { user } = db.useAuth();
  const currentUserId = user?.id;

  const amendment = data?.amendments?.[0];
  const collaborators = amendment?.amendmentRoleCollaborators || [];
  const amendmentRoles = amendment?.roles || [];
  const groupRoles = amendment?.group?.roles || [];
  const rolesData = { roles: [...amendmentRoles, ...groupRoles] };

  const currentUserCollaboration = collaborators.find((c: any) => c.user?.id === currentUserId);
  const isAdmin = currentUserCollaboration?.role === 'Applicant';

  // Get existing collaborator IDs to exclude from invite search
  const existingCollaboratorIds = collaborators.map(c => c.user?.id).filter(Boolean) as string[];

  // Filter users for invite search
  const filteredUsers = usersData?.$users?.filter(user => {
    if (!user?.id) return false;
    if (existingCollaboratorIds.includes(user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.contactEmail?.toLowerCase().includes(query)
    );
  });

  // Filter collaborators based on search query
  const filteredCollaborators = useMemo(() => {
    if (!searchQuery.trim()) return collaborators;

    const query = searchQuery.toLowerCase();
    return collaborators.filter((collaboration: any) => {
      const userName = collaboration.user?.name?.toLowerCase() || '';
      const userHandle = collaboration.user?.handle?.toLowerCase() || '';
      const role = collaboration.role?.toLowerCase() || '';
      const status = collaboration.status?.toLowerCase() || '';
      return (
        userName.includes(query) ||
        userHandle.includes(query) ||
        role.includes(query) ||
        status.includes(query)
      );
    });
  }, [collaborators, searchQuery]);

  // Separate by status
  const pendingRequests = useMemo(
    () => filteredCollaborators.filter((c: any) => c.status === 'requested'),
    [filteredCollaborators]
  );
  const activeCollaborators = useMemo(
    () => filteredCollaborators.filter((c: any) => c.status === 'member' || c.role === 'Applicant'),
    [filteredCollaborators]
  );
  const pendingInvitations = useMemo(
    () => filteredCollaborators.filter((c: any) => c.status === 'invited'),
    [filteredCollaborators]
  );

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
        const collaboratorId = id();
        return tx.amendmentCollaborators[collaboratorId]
          .create({
            role: 'collaborator',
            status: 'invited',
            createdAt: Date.now(),
          })
          .link({ user: userId, amendment: amendmentId });
      });

      await db.transact(inviteTransactions);

      toast({
        title: 'Success',
        description: `Invited ${selectedUsers.length} ${selectedUsers.length === 1 ? 'collaborator' : 'collaborators'}`,
      });

      // Reset state
      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite collaborators:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite collaborators. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Handle status updates
  const handleChangeRole = async (collaboratorId: string, newRole: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([
        tx.amendmentCollaborators[collaboratorId].update({
          role: newRole,
        }),
      ]);
    } catch (error) {
      console.error('Failed to change role:', error);
    }
  };

  const handleChangeStatus = async (collaboratorId: string, newStatus: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([
        tx.amendmentCollaborators[collaboratorId].update({
          status: newStatus,
        }),
      ]);
    } catch (error) {
      console.error('Failed to change status:', error);
    }
  };

  // Handler for adding a new role
  const handleAddRole = async () => {
    if (!newRoleName.trim()) return;

    try {
      // Create amendment-level role
      await db.transact([
        db.tx.roles[id()]
          .update({
            name: newRoleName,
            description: newRoleDescription || '',
            scope: 'amendment',
          })
          .link({
            amendment: amendmentId,
          }),
      ]);

      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);

      toast({
        title: 'Success',
        description: 'Role created successfully',
      });
    } catch (error) {
      console.error('Error adding role:', error);
      toast({
        title: 'Error',
        description: 'Failed to create role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handler for removing a role
  const handleRemoveRole = async (roleId: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([db.tx.roles[roleId].delete()]);

      toast({
        title: 'Success',
        description: 'Role removed successfully',
      });
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove role. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Handler for toggling action rights
  const handleToggleActionRight = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHas: boolean
  ) => {
    if (!isAdmin) return;

    try {
      if (currentlyHas) {
        // Find and remove the action right
        const role = rolesData.roles.find((r: any) => r.id === roleId);
        const actionRight = role?.actionRights?.find(
          (ar: any) => ar.resource === resource && ar.action === action
        );

        if (actionRight) {
          await db.transact([db.tx.actionRights[actionRight.id].unlink({ roles: roleId })]);
        }
      } else {
        // Create new action right and link to role
        const actionRightId = id();
        const role = rolesData.roles.find((r: any) => r.id === roleId);

        // Determine which ID field to use based on role scope
        const updateData: any = { resource, action };
        if (role?.scope === 'amendment') {
          updateData.amendmentId = amendmentId;
        } else if (role?.scope === 'group' && amendment?.group?.id) {
          updateData.groupId = amendment.group.id;
        }

        await db.transact([
          db.tx.actionRights[actionRightId].update(updateData).link({ roles: roleId }),
        ]);
      }
    } catch (error) {
      console.error('Error toggling action right:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permission. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveCollaborator = async (collaboratorId: string) => {
    if (!isAdmin) return;

    try {
      await db.transact([tx.amendmentCollaborators[collaboratorId].delete()]);
    } catch (error) {
      console.error('Failed to remove collaborator:', error);
    }
  };

  const handleApproveRequest = async (collaboratorId: string) => {
    if (!isAdmin) return;
    await handleChangeStatus(collaboratorId, 'member');
  };

  const handleRejectRequest = async (collaboratorId: string) => {
    if (!isAdmin) return;
    await handleRemoveCollaborator(collaboratorId);
  };

  const handlePromoteToAdmin = async (collaboratorId: string) => {
    if (!isAdmin) return;
    await handleChangeRole(collaboratorId, 'Applicant');
  };

  const handleDemoteToMember = async (collaboratorId: string) => {
    if (!isAdmin) return;
    await handleChangeRole(collaboratorId, 'Collaborator');
  };

  const handleWithdrawInvitation = async (collaboratorId: string) => {
    if (!isAdmin) return;
    await handleRemoveCollaborator(collaboratorId);
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
              <CardDescription>
                Only amendment administrators can manage collaborators.
              </CardDescription>
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
          <h1 className="text-3xl font-bold">Manage Amendment Collaborators</h1>
          <p className="mt-2 text-muted-foreground">
            {amendment?.title || 'Amendment'} - Manage collaborators, requests, and invitations
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search collaborators by name, role, or status..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Tabs for Collaborators and Roles */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
          </TabsList>

          {/* Collaborators Tab */}
          <TabsContent value="collaborators" className="space-y-6">
            {/* Invite Section */}
            <div>
              <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Collaborator
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Invite Collaborators</DialogTitle>
                    <DialogDescription>
                      Search and select users to invite to collaborate on this amendment. They will
                      receive an invitation to join.
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
                                        <div className="font-medium">
                                          {user.name || 'Unnamed User'}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {user.handle ? `@${user.handle}` : user.contactEmail}
                                        </div>
                                      </div>
                                    </div>
                                    {isSelected && (
                                      <Check
                                        className="ml-2 h-4 w-4 text-primary"
                                        strokeWidth={3}
                                      />
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

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Pending Collaboration Requests ({pendingRequests.length})
                  </CardTitle>
                  <CardDescription>Review and approve collaboration requests</CardDescription>
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
                      {pendingRequests.map((collaboration: any) => {
                        const user = collaboration.user;
                        const userName = user?.name || 'Unknown User';
                        const userAvatar = user?.avatar || '';
                        const userHandle = user?.handle || '';
                        const createdAt = collaboration.createdAt
                          ? new Date(collaboration.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={collaboration.id}>
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
                                  onClick={() => handleApproveRequest(collaboration.id)}
                                >
                                  <Check className="mr-1 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRejectRequest(collaboration.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="ml-2">Decline</span>
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

            {/* Active Collaborators */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Collaborators ({activeCollaborators.length})
                </CardTitle>
                <CardDescription>
                  Current amendment collaborators and administrators
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activeCollaborators.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No active collaborators found
                  </p>
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
                      {activeCollaborators.map((collaboration: any) => {
                        const user = collaboration.user;
                        const userName = user?.name || 'Unknown User';
                        const userAvatar = user?.avatar || '';
                        const userHandle = user?.handle || '';
                        const role = collaboration.role || 'collaborator';
                        const createdAt = collaboration.createdAt
                          ? new Date(collaboration.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={collaboration.id}>
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
                                value={role}
                                onValueChange={newRole =>
                                  handleChangeRole(collaboration.id, newRole)
                                }
                              >
                                <SelectTrigger className="w-40">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {rolesData?.roles?.map((roleOption: any) => (
                                    <SelectItem key={roleOption.id} value={roleOption.name}>
                                      {roleOption.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{createdAt}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {role !== 'Applicant' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePromoteToAdmin(collaboration.id)}
                                  >
                                    <Shield className="mr-1 h-4 w-4" />
                                    Promote to Applicant
                                  </Button>
                                )}
                                {role === 'Applicant' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDemoteToMember(collaboration.id)}
                                  >
                                    Demote to Collaborator
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveCollaborator(collaboration.id)}
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
                      {pendingInvitations.map((collaboration: any) => {
                        const user = collaboration.user;
                        const userName = user?.name || 'Unknown User';
                        const userAvatar = user?.avatar || '';
                        const userHandle = user?.handle || '';
                        const createdAt = collaboration.createdAt
                          ? new Date(collaboration.createdAt).toLocaleDateString()
                          : 'N/A';

                        return (
                          <TableRow key={collaboration.id}>
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
                                onClick={() => handleWithdrawInvitation(collaboration.id)}
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
                      Manage roles and their action rights for this amendment
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
                          Create a new role with custom permissions for this amendment.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label htmlFor="role-name" className="text-sm font-medium">
                            Role Name
                          </label>
                          <Input
                            id="role-name"
                            placeholder="e.g., Editor, Reviewer, Contributor"
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
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">{role.name}</span>
                                  <Badge
                                    variant={role.scope === 'amendment' ? 'default' : 'secondary'}
                                    className="px-1.5 py-0 text-[10px]"
                                  >
                                    {role.scope}
                                  </Badge>
                                </div>
                                {role.description && (
                                  <span className="text-xs font-normal text-muted-foreground">
                                    {role.description}
                                  </span>
                                )}
                                {role.scope === 'amendment' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-1 h-6 w-6 p-0"
                                    onClick={() => handleRemoveRole(role.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                )}
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
