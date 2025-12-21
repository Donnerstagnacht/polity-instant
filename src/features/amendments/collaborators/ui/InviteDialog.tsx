/**
 * Dialog for inviting collaborators
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserPlus, Loader2, Check, X } from 'lucide-react';
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
import { toast } from 'sonner';
import { useUserSearch } from '../hooks/useUserSearch';
import { inviteUsers } from '../utils/collaborator-operations';
import type { Collaborator, Role } from '../hooks/useCollaborators';

interface InviteDialogProps {
  amendmentId: string;
  existingCollaborators: Collaborator[];
  roles: Role[];
}

export function InviteDialog({ amendmentId, existingCollaborators, roles }: InviteDialogProps) {
  const [inviteSearchQuery, setInviteSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);

  // Get existing collaborator IDs to exclude from search
  const existingCollaboratorIds = existingCollaborators
    .map(c => c.user?.id)
    .filter(Boolean) as string[];

  const { users, isLoading } = useUserSearch(existingCollaboratorIds, inviteSearchQuery);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleInviteUsers = async () => {
    if (selectedUsers.length === 0) return;

    // Find the Collaborator role
    const collaboratorRole = roles.find(r => r.name === 'Collaborator');
    if (!collaboratorRole) {
      toast.error('Collaborator role not found');
      return;
    }

    setIsInviting(true);
    try {
      await inviteUsers(selectedUsers, amendmentId, collaboratorRole.id);

      toast.success(
        `Invited ${selectedUsers.length} ${selectedUsers.length === 1 ? 'collaborator' : 'collaborators'}`
      );

      // Reset state
      setSelectedUsers([]);
      setInviteSearchQuery('');
      setInviteDialogOpen(false);
    } catch (error) {
      console.error('Failed to invite collaborators:', error);
      toast.error('Failed to invite collaborators. Please try again.');
    } finally {
      setIsInviting(false);
    }
  };

  return (
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
            Search and select users to invite to collaborate on this amendment. They will receive
            an invitation to join.
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
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <>
                  <CommandEmpty>No users found.</CommandEmpty>
                  <CommandGroup>
                    {users?.map(user => {
                      const isSelected = selectedUsers.includes(user.id);
                      return (
                        <CommandItem
                          key={user.id}
                          value={`${user.name} ${user.handle} ${user.contactEmail}`}
                          onSelect={() => toggleUserSelection(user.id)}
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
              <div className="mb-2 text-sm font-medium">Selected ({selectedUsers.length})</div>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(userId => {
                  const user = users?.find(u => u.id === userId);
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
          <Button onClick={handleInviteUsers} disabled={selectedUsers.length === 0 || isInviting}>
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
