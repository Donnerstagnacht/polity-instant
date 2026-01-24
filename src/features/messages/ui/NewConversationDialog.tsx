import { useEffect, useMemo, useState } from 'react';
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
import { useTranslation } from '@/hooks/use-translation';

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUserId?: string;
  onUserSelect: (userId: string) => void;
  initialSearchQuery?: string;
  existingConversationUserIds?: string[]; // User IDs that already have a direct conversation
}

export function NewConversationDialog({
  open,
  onOpenChange,
  currentUserId,
  onUserSelect,
  initialSearchQuery,
  existingConversationUserIds = [],
}: NewConversationDialogProps) {
  const { t } = useTranslation();
  const [userSearchQuery, setUserSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      setUserSearchQuery(initialSearchQuery ?? '');
    }
  }, [initialSearchQuery, open]);

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
    // Base filter: exclude current user, Aria & Kai, and users with existing conversations
    const baseFilter = (u: any) =>
      u.id !== currentUserId &&
      u.id !== ARIA_KAI_USER_ID &&
      !existingConversationUserIds.includes(u.id);

    if (!userSearchQuery.trim()) {
      return allUsers.filter(baseFilter);
    }
    return allUsers.filter(baseFilter).filter((u: any) => {
      const name = u.name?.toLowerCase() || '';
      const handle = u.handle?.toLowerCase() || '';
      return (
        name.includes(userSearchQuery.toLowerCase()) ||
        handle.includes(userSearchQuery.toLowerCase())
      );
    });
  }, [allUsers, userSearchQuery, currentUserId, existingConversationUserIds]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('features.messages.compose.startNew')}</DialogTitle>
          <DialogDescription>{t('features.messages.compose.searchDescription')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('features.messages.compose.searchUsersPlaceholder')}
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {userSearchQuery
                    ? t('features.messages.compose.noUsersFound')
                    : t('features.messages.compose.startTyping')}
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
                      <AvatarImage src={searchUser.avatar || searchUser.imageURL} />
                      <AvatarFallback>{searchUser.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {searchUser.name || t('common.labels.unknownUser')}
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
