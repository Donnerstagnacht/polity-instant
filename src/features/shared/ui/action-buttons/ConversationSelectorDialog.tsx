'use client';

import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/features/shared/ui/ui/dialog.tsx';
import { Input } from '@/features/shared/ui/ui/input.tsx';
import { Avatar, AvatarFallback, AvatarImage } from '@/features/shared/ui/ui/avatar.tsx';
import { Badge } from '@/features/shared/ui/ui/badge.tsx';
import { Search, MessageSquare } from 'lucide-react';
import { useAuth } from '@/providers/auth-provider.tsx';
import { useMessageState } from '@/zero/messages/useMessageState.ts';
import { useMessageActions } from '@/zero/messages/useMessageActions.ts';
import { cn } from '@/features/shared/utils/utils.ts';
import { toast } from 'sonner';
import { useTranslation } from '@/features/shared/hooks/use-translation.ts';

interface ConversationSelectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
  shareTitle: string;
}

export function ConversationSelectorDialog({
  open,
  onOpenChange,
  shareUrl,
  shareTitle,
}: ConversationSelectorDialogProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { sendMessage } = useMessageActions();
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState<string | null>(null);

  // Query all conversations where the user is a participant, with related conversation data
  const { conversationsByUser: conversationsRaw, isLoading } = useMessageState({
    includeConversationsByUser: !!user?.id,
    userId: user?.id,
  });

  // Extract the nested conversation from each participant row
  const conversations = useMemo(() =>
    (conversationsRaw || [])
      .map(cp => cp.conversation)
      .filter((c): c is NonNullable<typeof c> => c != null),
    [conversationsRaw]
  );

  // Filter conversations based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      // Sort conversations by last_message_at (newest first)
      return [...conversations].sort((a, b) => {
        const timeA = a.last_message_at || 0;
        const timeB = b.last_message_at || 0;
        return timeB - timeA;
      });
    }

    return conversations
      .filter((conv) => {
        // Search in participant names
        const participantMatch = conv.participants.some((p) => {
          const name = [p.user?.first_name, p.user?.last_name].filter(Boolean).join(' ').toLowerCase();
          const handle = p.user?.handle?.toLowerCase() || '';
          return (
            name.includes(searchQuery.toLowerCase()) || handle.includes(searchQuery.toLowerCase())
          );
        });

        // Search in group name
        const groupMatch = conv.group?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        return participantMatch || groupMatch;
      })
      .sort((a, b) => {
        const timeA = a.last_message_at || 0;
        const timeB = b.last_message_at || 0;
        return timeB - timeA;
      });
  }, [conversations, searchQuery]);

  // Get the other participant in the conversation (for 1-on-1 chats) or group info
  const getConversationDisplay = (conversation: (typeof conversations)[number]) => {
    if (conversation.type === 'group') {
      return {
        name: conversation.name || conversation.group?.name || t('common.labels.groupChat'),
        avatar: conversation.group?.image_url || null,
        handle: null,
        isGroup: true,
        participantCount: conversation.participants.length,
      };
    } else {
      const otherUser = conversation.participants.find(p => p.user?.id !== user?.id)?.user;
      return {
        name: [otherUser?.first_name, otherUser?.last_name].filter(Boolean).join(' ') || t('common.labels.unspecifiedUser'),
        avatar: otherUser?.avatar,
        handle: otherUser?.handle,
        isGroup: false,
      };
    }
  };

  // Send link to conversation
  const handleShareToConversation = async (conversationId: string) => {
    if (!user?.id) return;

    setSending(conversationId);

    const messageId = crypto.randomUUID();
    const fullUrl = typeof window !== 'undefined' ? window.location.origin + shareUrl : shareUrl;
    const messageContent = `${shareTitle}\n${fullUrl}`;

    try {
      await sendMessage({
        id: messageId,
        conversation_id: conversationId,
        content: messageContent,
        deleted_at: 0,
      });

      toast.success(t('common.share.linkShared'));
      onOpenChange(false);
      setSearchQuery('');
    } catch (error) {
      console.error('Failed to share link:', error);
      toast.error(t('common.share.linkShareFailed'));
    } finally {
      setSending(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t('common.share.title')}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={t('common.share.searchConversations')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {isLoading ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">{t('common.loading.conversations')}</p>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="py-8 text-center">
                <MessageSquare className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? t('common.share.noConversationsFound') : t('common.share.noConversationsYet')}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const display = getConversationDisplay(conversation);
                const isSending = sending === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => handleShareToConversation(conversation.id)}
                    disabled={isSending || conversation.status === 'pending'}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent',
                      isSending && 'opacity-50'
                    )}
                  >
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarImage src={display.avatar || undefined} />
                      <AvatarFallback>{display.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold">{display.name}</p>
                        {display.isGroup && (
                          <Badge variant="secondary" className="text-xs">
                            {display.participantCount}
                          </Badge>
                        )}
                        {conversation.status === 'pending' && (
                          <Badge variant="outline" className="text-xs">
                            {t('common.labels.pending')}
                          </Badge>
                        )}
                      </div>
                      {display.handle && (
                        <p className="truncate text-sm text-muted-foreground">@{display.handle}</p>
                      )}
                    </div>
                    {isSending && <div className="text-xs text-muted-foreground">{t('common.labels.sending')}</div>}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
