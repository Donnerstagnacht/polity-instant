/**
 * Invite Members Dialog Component
 *
 * Dialog for searching and inviting users to the group.
 */

import { useState } from 'react';
import { Button } from '@/features/shared/ui/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar';
import { Badge } from '@/features/shared/ui/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/features/shared/ui/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/features/shared/ui/ui/command';
import { Check, Loader2, UserPlus, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/features/shared/ui/ui/tooltip';

interface User {
  id: string;
  name?: string;
  avatar?: string;
  username?: string;
  email?: string;
}

interface InviteMembersDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  users: User[];
  selectedUsers: string[];
  onToggleUser: (userId: string) => void;
  onInvite: () => void;
  isLoading: boolean;
  isInviting: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

export function InviteMembersDialog({
  isOpen,
  onOpenChange,
  searchQuery,
  onSearchQueryChange,
  users,
  selectedUsers,
  onToggleUser,
  onInvite,
  isLoading,
  isInviting,
  disabled,
  disabledReason,
}: InviteMembersDialogProps) {
  const triggerButton = (
    <Button disabled={disabled}>
      <UserPlus className="mr-2 h-4 w-4" />
      Invite Member
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {disabled && disabledReason ? (
          <Tooltip>
            <TooltipTrigger asChild>{triggerButton}</TooltipTrigger>
            <TooltipContent>{disabledReason}</TooltipContent>
          </Tooltip>
        ) : (
          triggerButton
        )}
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
              value={searchQuery}
              onValueChange={onSearchQueryChange}
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
                    {users.map((user) => {
                      const isSelected = selectedUsers.includes(user.id);
                      return (
                        <CommandItem
                          key={user.id}
                          value={`${user.name} ${user.username} ${user.email}`}
                          onSelect={() => onToggleUser(user.id)}
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
                                {user.username ? `@${user.username}` : user.email}
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
                {selectedUsers.map((userId) => {
                  const user = users.find((u) => u.id === userId);
                  if (!user) return null;

                  return (
                    <Badge key={userId} variant="secondary" className="gap-1 pr-1">
                      <span>{user.name || 'Unnamed User'}</span>
                      <button
                        onClick={() => onToggleUser(userId)}
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
            onClick={() => onOpenChange(false)}
            disabled={isInviting}
          >
            Cancel
          </Button>
          <Button
            onClick={onInvite}
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
  );
}
