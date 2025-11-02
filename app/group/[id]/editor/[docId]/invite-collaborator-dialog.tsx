'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { db, tx, id } from '../../../../../db';
import { UserPlus, X, Loader2, Check } from 'lucide-react';
import { useToast } from '@/global-state/use-toast';

interface InviteCollaboratorDialogProps {
  documentId: string;
  currentUserId: string;
  existingCollaborators: { user?: { id: string } }[];
}

export function InviteCollaboratorDialog({
  documentId,
  currentUserId,
  existingCollaborators,
}: InviteCollaboratorDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState(false);
  const { toast } = useToast();

  // Query all profiles for user search
  const { data: profilesData, isLoading } = db.useQuery({
    profiles: {},
  });

  // Filter profiles based on search query and exclude existing collaborators and current user
  const existingCollaboratorIds = existingCollaborators
    .map(c => c.user?.id)
    .filter(Boolean) as string[];

  const filteredProfiles = profilesData?.profiles?.filter(profile => {
    if (!profile.user?.id) return false;
    if (profile.user.id === currentUserId) return false;
    if (existingCollaboratorIds.includes(profile.user.id)) return false;

    const query = searchQuery.toLowerCase();
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

  const handleInvite = async () => {
    if (selectedUsers.length === 0) return;

    setIsInviting(true);
    try {
      // Link collaborators to document and users
      const linkTransactions = selectedUsers.flatMap(userId => {
        const collaboratorId = id();
        return [
          tx.documentCollaborators[collaboratorId].update({
            canEdit: true,
            addedAt: Date.now(),
          }),
          tx.documentCollaborators[collaboratorId].link({
            document: documentId,
            user: userId,
          }),
        ];
      });

      await db.transact(linkTransactions);

      toast({
        title: 'Success',
        description: `Invited ${selectedUsers.length} ${selectedUsers.length === 1 ? 'collaborator' : 'collaborators'}`,
      });

      // Reset state
      setSelectedUsers([]);
      setSearchQuery('');
      setOpen(false);
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Invite Collaborators</DialogTitle>
          <DialogDescription>
            Search and select users to invite as collaborators. They will be able to edit this
            document.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Search and selection UI */}
          <Command className="rounded-lg border">
            <CommandInput
              placeholder="Search by name, handle, or email..."
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            <CommandList>
              {isLoading ? (
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
                              <div className="font-medium">{profile.name || 'Unnamed User'}</div>
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isInviting}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={selectedUsers.length === 0 || isInviting}>
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
  );
}
