import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { Conversation, Message } from '../types';
import { getOtherParticipant } from '../utils';
import { AriaKaiMessageActions } from '@/components/messages/AriaKaiMessageActions';
import { ARIA_KAI_USER_ID } from '../../../../e2e/aria-kai';
import { useTranslation } from '@/hooks/use-translation';

interface MessageListProps {
  conversation: Conversation;
  currentUserId?: string;
  onAcceptConversation: (conversation: Conversation) => void;
  onRejectConversation: (conversation: Conversation) => void;
}

export function MessageList({
  conversation,
  currentUserId,
  onAcceptConversation,
  onRejectConversation,
}: MessageListProps) {
  const { t } = useTranslation();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  const otherParticipantName = getOtherParticipant(conversation, currentUserId)?.name || t('common.labels.unknownUser');

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="space-y-4 p-4">
        {conversation.messages.length === 0 ? (
          <div className="flex h-full items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">
              {t('features.messages.conversation.noMessagesYet')}
            </p>
          </div>
        ) : (
          conversation.messages.map((message: Message) => {
            const isOwnMessage = message.sender?.id === currentUserId;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwnMessage={isOwnMessage}
              />
            );
          })
        )}

        {/* Aria & Kai Tutorial Actions - Show only in Aria & Kai conversation */}
        {conversation.participants.some(
          (p) => p.user?.id === ARIA_KAI_USER_ID
        ) &&
          currentUserId && (
            <AriaKaiMessageActions
              conversationId={conversation.id}
              currentUserId={currentUserId}
            />
          )}

        {/* Conversation Request Accept/Reject - Show if pending and user is recipient - Only for direct messages */}
        {conversation.type !== 'group' &&
          conversation.status === 'pending' &&
          conversation.requestedBy?.id !== currentUserId && (
            <div className="border-t pt-4">
              <Card className="bg-muted/50">
                <CardContent className="flex flex-col items-center gap-3 p-4">
                  <p className="text-center text-sm font-medium">
                    {t('features.messages.conversation.wantsToStart', { name: otherParticipantName })}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => onAcceptConversation(conversation)}
                      variant="default"
                      size="sm"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      {t('features.messages.conversation.accept')}
                    </Button>
                    <Button
                      onClick={() => {
                        if (
                          confirm(t('features.messages.conversation.rejectConfirm'))
                        ) {
                          onRejectConversation(conversation);
                        }
                      }}
                      variant="outline"
                      size="sm"
                    >
                      <X className="mr-2 h-4 w-4" />
                      {t('features.messages.conversation.reject')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
