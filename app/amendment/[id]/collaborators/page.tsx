'use client';

import { use, useState } from 'react';
import { db, tx, id } from '../../../../db';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus, UserX, Shield, Clock, Check, X, Loader2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Query amendment and collaborators
  const { data, isLoading, error } = db.useQuery({
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
  const handleUpdateStatus = async (collaboratorId: string, newStatus: 'member' | 'admin') => {
    try {
      await db.transact(
        db.tx.amendmentCollaborators[collaboratorId].update({
          status: newStatus,
        })
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  // Handle removing collaborator
  const handleRemoveCollaborator = async (collaboratorId: string) => {
    try {
      await db.transact(db.tx.amendmentCollaborators[collaboratorId].delete());
    } catch (err) {
      console.error('Error removing collaborator:', err);
    }
  };

  // Handle accepting request
  const handleAcceptRequest = async (collaboratorId: string) => {
    try {
      await db.transact(
        db.tx.amendmentCollaborators[collaboratorId].update({
          status: 'member',
        })
      );
    } catch (err) {
      console.error('Error accepting request:', err);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Loading...</div>;
  }

  if (error || !amendment) {
    return <div className="container mx-auto p-4">Amendment not found</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Access Denied</h1>
          <p className="mb-4 text-muted-foreground">
            You must be an admin to manage collaborators.
          </p>
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'admin':
        return <Badge variant="default">Admin</Badge>;
      case 'member':
        return <Badge variant="secondary">Member</Badge>;
      case 'invited':
        return <Badge variant="outline">Invited</Badge>;
      case 'requested':
        return <Badge variant="outline">Requested</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingRequests = collaborators.filter((c: any) => c.status === 'requested');
  const activeCollaborators = collaborators.filter(
    (c: any) => c.status === 'member' || c.status === 'admin'
  );
  const invitedUsers = collaborators.filter((c: any) => c.status === 'invited');

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold">Manage Collaborators</h1>
        <p className="text-muted-foreground">Amendment: {amendment.title}</p>
      </div>

      {/* Invite Section */}
      <div className="mb-8">
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
                  <div className="mb-2 text-sm font-medium">Selected ({selectedUsers.length})</div>
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
              {pendingRequests.map((collab: any) => (
                <TableRow key={collab.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collab.user?.profile?.avatar} />
                        <AvatarFallback>
                          {collab.user?.profile?.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {collab.user?.profile?.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>{collab.user?.profile?.contactEmail || '-'}</TableCell>
                  <TableCell>{new Date(collab.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAcceptRequest(collab.id)}>
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRemoveCollaborator(collab.id)}
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

      {/* Active Collaborators */}
      <div className="mb-8">
        <h2 className="mb-4 text-xl font-semibold">
          Active Collaborators ({activeCollaborators.length})
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeCollaborators.map((collab: any) => (
              <TableRow key={collab.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={collab.user?.profile?.avatar} />
                      <AvatarFallback>
                        {collab.user?.profile?.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {collab.user?.profile?.name || 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>{collab.user?.profile?.contactEmail || '-'}</TableCell>
                <TableCell>{getStatusBadge(collab.status)}</TableCell>
                <TableCell>{new Date(collab.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {collab.status === 'member' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(collab.id, 'admin')}
                      >
                        <Shield className="mr-1 h-4 w-4" />
                        Make Admin
                      </Button>
                    )}
                    {collab.status === 'admin' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(collab.id, 'member')}
                      >
                        Remove Admin
                      </Button>
                    )}
                    {collab.user?.id !== currentUserId && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleRemoveCollaborator(collab.id)}
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
              {invitedUsers.map((collab: any) => (
                <TableRow key={collab.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={collab.user?.profile?.avatar} />
                        <AvatarFallback>
                          {collab.user?.profile?.name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      {collab.user?.profile?.name || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell>{collab.user?.profile?.contactEmail || '-'}</TableCell>
                  <TableCell>{new Date(collab.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRemoveCollaborator(collab.id)}
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
    </div>
  );
}
