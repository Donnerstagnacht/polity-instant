'use client';

import { use, useState, useMemo } from 'react';
import { db, tx, id } from '../../../../db';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  UserPlus,
  UserX,
  Shield,
  Clock,
  Check,
  X,
  Loader2,
  Search,
  Plus,
} from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { useToast } from '@/global-state/use-toast';

// Define available action rights for events
const ACTION_RIGHTS = [
  { resource: 'events', action: 'update', label: 'Update Event' },
  { resource: 'events', action: 'delete', label: 'Delete Event' },
  { resource: 'events', action: 'manage_participants', label: 'Manage Participants' },
  { resource: 'events', action: 'manage_speakers', label: 'Manage Speakers' },
  { resource: 'events', action: 'manage_votes', label: 'Manage Votes' },
  { resource: 'agendaItems', action: 'create', label: 'Create Agenda Items' },
  { resource: 'agendaItems', action: 'update', label: 'Update Agenda Items' },
  { resource: 'agendaItems', action: 'delete', label: 'Delete Agenda Items' },
  { resource: 'agendaItems', action: 'manage', label: 'Manage Agenda' },
];

interface PageParams {
  params: Promise<{ id: string }>;
}

export default function EventParticipantsPage({ params }: PageParams) {
  const router = useRouter();
  const resolvedParams = use(params);
  const eventId = resolvedParams.id;
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState('participants');
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [addRoleDialogOpen, setAddRoleDialogOpen] = useState(false);

  // Query event and participants
  const { data, isLoading, error } = db.useQuery({
    events: {
      $: {
        where: {
          id: eventId,
        },
      },
      participants: {
        user: {},
        role: {},
      },
      group: {
        roles: {
          $: {
            where: {
              scope: 'event',
            },
          },
          actionRights: {},
        },
      },
    },
  });

  // Query all users for user search
  const { data: usersData, isLoading: isLoadingUsers } = db.useQuery({
    $users: {},
  });

  // Check if current user is admin
  const { user } = db.useAuth();
  const currentUserId = user?.id;

  const event = data?.events?.[0];
  const participants = event?.participants || [];
  const rolesData = { roles: event?.group?.roles || [] };

  const currentUserParticipation = participants.find((p: any) => p.user?.id === currentUserId);
  const isAdmin = currentUserParticipation?.role?.name === 'Organizer';

  // Get existing participant IDs to exclude from invite search
  const existingParticipantIds = participants.map(p => p.user?.id).filter(Boolean) as string[];

  // Filter users for invite search
  const filteredUsers = usersData?.$users?.filter(user => {
    if (!user?.id) return false;
    if (existingParticipantIds.includes(user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.contactEmail?.toLowerCase().includes(query)
    );
  });

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
        const participantId = id();
        return tx.eventParticipants[participantId]
          .create({
            role: 'member',
            status: 'invited',
            createdAt: Date.now(),
          })
          .link({ user: userId, event: eventId });
      });

      await db.transact(inviteTransactions);

      toast({
        title: 'Success',
        description: `Invited ${selectedUsers.length} ${selectedUsers.length === 1 ? 'participant' : 'participants'}`,
      });

      // Reset state
      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite participants:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite participants. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsInviting(false);
    }
  };

  // Handle removing participant
  const handleRemoveParticipant = async (participantId: string) => {
    try {
      await db.transact(db.tx.eventParticipants[participantId].delete());
    } catch (err) {
      console.error('Error removing participant:', err);
    }
  };

  // Handle changing participant role
  const handleChangeRole = async (participantId: string, newRole: string) => {
    try {
      await db.transact(
        db.tx.eventParticipants[participantId].link({
          role: newRole,
        })
      );
    } catch (err) {
      console.error('Error changing role:', err);
    }
  };

  // Handle accepting request
  const handleAcceptRequest = async (participantId: string) => {
    try {
      await db.transact(
        db.tx.eventParticipants[participantId].update({
          status: 'member',
        })
      );
    } catch (err) {
      console.error('Error accepting request:', err);
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

    if (!event?.group?.id) {
      toast({
        title: 'Error',
        description: 'Event group not found',
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
            scope: 'event',
          })
          .link({ group: event.group.id }),
      ]);

      toast({
        title: 'Success',
        description: 'Role created successfully',
      });

      setNewRoleName('');
      setNewRoleDescription('');
      setAddRoleDialogOpen(false);
    } catch (error) {
      console.error('Failed to create role:', error);
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
        const role = rolesData?.roles?.find(r => r.id === roleId);
        const actionRightToRemove = role?.actionRights?.find(
          ar => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await db.transact([tx.actionRights[actionRightToRemove.id].delete()]);
        }
      } else {
        const actionRightId = id();
        await db.transact([
          tx.actionRights[actionRightId]
            .create({
              resource,
              action,
              eventId: eventId,
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

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error || !event) {
    return <div className="container mx-auto p-4">Event not found</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="mb-4 text-muted-foreground">You must be an admin to manage participants.</p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Filter participants based on search query
  const filteredParticipants = useMemo(() => {
    if (!searchQuery.trim()) return participants;

    const query = searchQuery.toLowerCase();
    return participants.filter((participant: any) => {
      const userName = participant.user?.name?.toLowerCase() || '';
      const userEmail = participant.user?.contactEmail?.toLowerCase() || '';
      const userHandle = participant.user?.handle?.toLowerCase() || '';
      const status = participant.status?.toLowerCase() || '';
      return (
        userName.includes(query) ||
        userEmail.includes(query) ||
        userHandle.includes(query) ||
        status.includes(query)
      );
    });
  }, [participants, searchQuery]);

  const pendingRequests = useMemo(
    () => filteredParticipants.filter((p: any) => p.status === 'requested'),
    [filteredParticipants]
  );
  const activeParticipants = useMemo(
    () => filteredParticipants.filter((p: any) => p.status === 'member' || p.role === 'Organizer'),
    [filteredParticipants]
  );
  const invitedUsers = useMemo(
    () => filteredParticipants.filter((p: any) => p.status === 'invited'),
    [filteredParticipants]
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Manage Participants</h1>
        <p className="text-muted-foreground">Event: {event.title}</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search participants by name, email, or status..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Tabs for Participants and Roles */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="participants">Participants</TabsTrigger>
          <TabsTrigger value="roles">Roles</TabsTrigger>
        </TabsList>

        {/* Participants Tab */}
        <TabsContent value="participants" className="space-y-6">
          {/* Invite Section */}
          <div>
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Participant
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Invite Participants</DialogTitle>
                  <DialogDescription>
                    Search and select users to invite to this event. They will receive an invitation
                    to participate.
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

          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold">
                <Clock className="h-5 w-5" />
                Pending Requests ({pendingRequests.length})
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((participant: any) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user?.avatar} />
                            <AvatarFallback>
                              {participant.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {participant.user?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>{participant.user?.contactEmail || '-'}</TableCell>
                      <TableCell>{new Date(participant.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleAcceptRequest(participant.id)}>
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveParticipant(participant.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Active Participants */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold">
              Active Participants ({activeParticipants.length})
            </h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeParticipants.map((participant: any) => (
                  <TableRow key={participant.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={participant.user?.avatar} />
                          <AvatarFallback>
                            {participant.user?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        {participant.user?.name || 'Unknown'}
                      </div>
                    </TableCell>
                    <TableCell>{participant.user?.contactEmail || '-'}</TableCell>
                    <TableCell>
                      <Select
                        value={participant.role || 'member'}
                        onValueChange={newRole => handleChangeRole(participant.id, newRole)}
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
                    <TableCell>{new Date(participant.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {participant.role !== 'Organizer' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeRole(participant.id, 'Organizer')}
                          >
                            <Shield className="mr-1 h-4 w-4" />
                            Make Organizer
                          </Button>
                        )}
                        {participant.role === 'Organizer' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleChangeRole(participant.id, 'Participant')}
                          >
                            Remove Organizer
                          </Button>
                        )}
                        {participant.user?.id !== currentUserId && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveParticipant(participant.id)}
                          >
                            <UserX className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Invited Users */}
          {invitedUsers.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">
                Pending Invitations ({invitedUsers.length})
              </h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Invited</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitedUsers.map((participant: any) => (
                    <TableRow key={participant.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={participant.user?.avatar} />
                            <AvatarFallback>
                              {participant.user?.name?.[0]?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          {participant.user?.name || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>{participant.user?.contactEmail || '-'}</TableCell>
                      <TableCell>{new Date(participant.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveParticipant(participant.id)}
                        >
                          Cancel Invitation
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                    Manage roles and their action rights for this event
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
                        Create a new role with custom permissions for this event.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="role-name" className="text-sm font-medium">
                          Role Name
                        </label>
                        <Input
                          id="role-name"
                          placeholder="e.g., Organizer, Speaker, Moderator"
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
                                <UserX className="h-3 w-3 text-destructive" />
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
                                        handleToggleActionRight(role.id, resource, action, hasRight)
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
  );
}
