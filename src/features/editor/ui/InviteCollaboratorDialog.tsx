'use client';

/**
 * Unified Invite Collaborator Dialog
 *
 * Allows inviting collaborators/bloggers to any entity type.
 */

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
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { useDocumentActions } from '@/zero/documents/useDocumentActions';
import { useUserState } from '@/zero/users/useUserState';
import { UserPlus, X, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/use-translation';
import { notifyDocumentCollaboratorInvited, notifyBloggerInvited } from '@/utils/notification-helpers';
import type { EditorEntityType } from '../types';

interface InviteCollaboratorDialogProps {
  entityType: EditorEntityType;
  entityId: string;
  currentUserId: string;
  entityTitle?: string;
  existingCollaboratorIds?: string[];
}

export function InviteCollaboratorDialog({
  entityType,
  entityId,
  currentUserId,
  entityTitle,
  existingCollaboratorIds = [],
}: InviteCollaboratorDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const { createEntry } = useBlogActions();
  const { addCollaborator } = useDocumentActions();

  // Query all users via facade
  const { allUsers: users, isLoading } = useUserState({ includeAllUsers: true });

  // Filter users based on search and exclude existing collaborators
  const filteredUsers = users?.filter(user => {
    if (!user?.id) return false;
    if (user.id === currentUserId) return false;
    if (existingCollaboratorIds.includes(user.id)) return false;

    const query = searchQuery.toLowerCase();
    return (
      user.first_name?.toLowerCase().includes(query) ||
      user.last_name?.toLowerCase().includes(query) ||
      user.handle?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
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
      // Create collaborator/blogger entries
      for (const userId of selectedUsers) {
        if (entityType === 'blog') {
          const bloggerId = crypto.randomUUID();
          await createEntry({
            id: bloggerId,
            blog_id: entityId,
            user_id: userId,
            role_id: '',
            status: 'collaborator',
            visibility: '',
          });
        } else {
          const collaboratorId = crypto.randomUUID();
          await addCollaborator({
            id: collaboratorId,
            document_id: entityId,
            user_id: userId,
            role_id: '',
            status: 'collaborator',
            visibility: '',
          });
        }
      }

      // Send notifications to invited users
      for (const userId of selectedUsers) {
        if (entityType === 'blog') {
          await notifyBloggerInvited({
            senderId: currentUserId,
            recipientUserId: userId,
            blogId: entityId,
            blogTitle: entityTitle || 'Blog',
          });
        } else {
          await notifyDocumentCollaboratorInvited({
            senderId: currentUserId,
            recipientUserId: userId,
            documentId: entityId,
            documentTitle: entityTitle || 'Document',
          });
        }
      }

      const message =
        selectedUsers.length === 1
          ? t('features.editor.inviteDialog.invitedOne')
          : t('features.editor.inviteDialog.invitedMultiple').replace(
              '{{count}}',
              String(selectedUsers.length)
            );

      toast.success(message);

      // Reset state
      setSelectedUsers([]);
      setSearchQuery('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to invite collaborators:', error);
      toast.error(t('features.editor.inviteDialog.inviteFailed'));
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <UserPlus className="mr-2 h-4 w-4" />
          {t('features.editor.inviteDialog.invite')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('features.editor.inviteDialog.title')}</DialogTitle>
          <DialogDescription>{t('features.editor.inviteDialog.description')}</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {selectedUsers.map(userId => {
                const user = users?.find((u: any) => u.id === userId);
                if (!user) return null;

                return (
                  <Badge key={userId} variant="secondary" className="flex items-center gap-1 pr-1">
                    <Avatar className="h-4 w-4">
                      {user.avatar ? <AvatarImage src={user.avatar} alt={[user.first_name, user.last_name].filter(Boolean).join(' ')} /> : null}
                      <AvatarFallback className="text-[8px]">
                        {user.first_name?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span>{[user.first_name, user.last_name].filter(Boolean).join(' ') || user.handle || 'User'}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => toggleUserSelection(userId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* User search */}
          <Command className="rounded-lg border">
            <CommandInput
              placeholder={t('features.editor.inviteDialog.searchPlaceholder')}
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
                  <CommandEmpty>{t('features.editor.inviteDialog.noUsers')}</CommandEmpty>
                  <CommandGroup>
                    {filteredUsers?.slice(0, 10).map((user: any) => {
                      const isSelected = selectedUsers.includes(user.id);

                      return (
                        <CommandItem
                          key={user.id}
                          value={user.id}
                          onSelect={() => toggleUserSelection(user.id)}
                          className="cursor-pointer"
                        >
                          <div className="flex flex-1 items-center gap-2">
                            <Avatar className="h-8 w-8">
                              {user.avatar ? (
                                <AvatarImage src={user.avatar} alt={user.name || ''} />
                              ) : null}
                              <AvatarFallback>
                                {user.name?.[0]?.toUpperCase() || '?'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {user.name || user.handle || 'User'}
                              </p>
                              {user.handle && (
                                <p className="text-xs text-muted-foreground">@{user.handle}</p>
                              )}
                            </div>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {t('common.cancel')}
          </Button>
          <Button onClick={handleInvite} disabled={selectedUsers.length === 0 || isInviting}>
            {isInviting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('features.editor.inviteDialog.invite')} ({selectedUsers.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
