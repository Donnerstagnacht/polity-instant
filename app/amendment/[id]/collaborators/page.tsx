'use client';

import { use, useState, useMemo } from 'react';
import { db, tx, id } from '../../../../db';
import { useRouter } from 'next/navigation';
import { AuthGuard } from '@/features/auth/AuthGuard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { UserPlus, Users, Shield, Check, X, Loader2, Trash2, Search } from 'lucide-react';
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

  // Query amendment and collaborators
  const { data } = db.useQuery({
    amendments: {
      $: {
        where: {
          id: amendmentId,
        },
      },
      collaborators: {
        user: {
          profile: {},
        },
      },
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

  // Check if current user is admin
  const { user } = db.useAuth();
  const currentUserId = user?.id;

  const amendment = data?.amendments?.[0];
  const collaborators = amendment?.collaborators || [];

  const currentUserCollaboration = collaborators.find((c: any) => c.user?.id === currentUserId);
  const isAdmin = currentUserCollaboration?.status === 'admin';

  // Get existing collaborator IDs to exclude from invite search
  const existingCollaboratorIds = collaborators.map(c => c.user?.id).filter(Boolean) as string[];

  // Filter profiles for invite search
  const filteredProfiles = profilesData?.profiles?.filter(profile => {
    if (!profile.user?.id) return false;
    if (existingCollaboratorIds.includes(profile.user.id)) return false;

    const query = inviteSearchQuery.toLowerCase();
    return (
      profile.name?.toLowerCase().includes(query) ||
      profile.handle?.toLowerCase().includes(query) ||
      profile.contactEmail?.toLowerCase().includes(query)
    );
  });

  // Filter collaborators based on search query
  const filteredCollaborators = useMemo(() => {
    if (!searchQuery.trim()) return collaborators;

    const query = searchQuery.toLowerCase();
    return collaborators.filter((collaboration: any) => {
      const userName = collaboration.user?.profile?.name?.toLowerCase() || '';
      const userHandle = collaboration.user?.profile?.handle?.toLowerCase() || '';
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
    () => filteredCollaborators.filter((c: any) => c.status === 'member' || c.status === 'admin'),
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
    await handleChangeStatus(collaboratorId, 'admin');
  };

  const handleDemoteToMember = async (collaboratorId: string) => {
    if (!isAdmin) return;
    await handleChangeStatus(collaboratorId, 'member');
  };

  const handleWithdrawInvitation = async (collaboratorId: string) => {
    if (!isAdmin) return;
    await handleRemoveCollaborator(collaboratorId);
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
                    const profile = user?.profile;
                    const userName = profile?.name || 'Unknown User';
                    const userAvatar = profile?.avatar || '';
                    const userHandle = profile?.handle || '';
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
            <CardDescription>Current amendment collaborators and administrators</CardDescription>
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
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeCollaborators.map((collaboration: any) => {
                    const user = collaboration.user;
                    const profile = user?.profile;
                    const userName = profile?.name || 'Unknown User';
                    const userAvatar = profile?.avatar || '';
                    const userHandle = profile?.handle || '';
                    const status = collaboration.status || 'member';
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
                                <div className="text-sm text-muted-foreground">@{userHandle}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={role}
                            onValueChange={newRole => handleChangeRole(collaboration.id, newRole)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="collaborator">Collaborator</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="reviewer">Reviewer</SelectItem>
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
                                onClick={() => handlePromoteToAdmin(collaboration.id)}
                              >
                                <Shield className="mr-1 h-4 w-4" />
                                Promote to Admin
                              </Button>
                            )}
                            {status === 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDemoteToMember(collaboration.id)}
                              >
                                Demote to Member
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
                    const profile = user?.profile;
                    const userName = profile?.name || 'Unknown User';
                    const userAvatar = profile?.avatar || '';
                    const userHandle = profile?.handle || '';
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
      </div>
    </AuthGuard>
  );
}
