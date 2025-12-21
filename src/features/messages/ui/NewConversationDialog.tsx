import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';
import db from '../../../../db/db';
import { ARIA_KAI_USER_ID } from '../../../../e2e/aria-kai';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onUserSelect: (userId: string) => void;
}

export function NewConversationDialog({
  open,
  onOpenChange,
  currentUserId,
  onUserSelect,
}: NewConversationDialogProps) {
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Query all users for search dialog
  const { data: allUsersData } = db.useQuery({
    $users: {
      $: {
        where: {
          visibility: 'public',
        },
      },
    },
  });

  const allUsers = allUsersData?.$users || [];

  // Filter users in search dialog
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) {
      return allUsers.filter(
        (u: any) => u.id !== currentUserId && u.id !== ARIA_KAI_USER_ID
      ); // Exclude current user and Aria & Kai
    }
    return allUsers
      .filter((u: any) => u.id !== currentUserId && u.id !== ARIA_KAI_USER_ID) // Exclude current user and Aria & Kai
      .filter((u: any) => {
        const name = u.name?.toLowerCase() || '';
        const handle = u.handle?.toLowerCase() || '';
        return (
          name.includes(userSearchQuery.toLowerCase()) ||
          handle.includes(userSearchQuery.toLowerCase())
        );
      });
  }, [allUsers, userSearchQuery, currentUserId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Start a New Conversation</DialogTitle>
          <DialogDescription>
            Search for users to start a conversation with
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name or handle..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {userSearchQuery
                    ? 'No users found'
                    : 'Start typing to search users'}
                </p>
              </div>
            ) : (
              filteredUsers.map((searchUser: any) => (
                <div
                  key={searchUser.id}
                  className="flex w-full items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <button
                    onClick={() => onUserSelect(searchUser.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage
                        src={searchUser.avatar || searchUser.imageURL}
                      />
                      <AvatarFallback>
                        {searchUser.name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {searchUser.name || 'Unknown User'}
                      </p>
                      {searchUser.handle && (
                        <p className="truncate text-sm text-muted-foreground">
                          @{searchUser.handle}
                        </p>
                      )}
                    </div>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
