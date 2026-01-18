import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CardHeader } from '@/components/ui/card';
import { ArrowLeft, Pin, PinOff, Trash2 } from 'lucide-react';
import { Conversation } from '../types';
import { getConversationDisplay } from '../utils';
import { ARIA_KAI_USER_ID } from '../../../../e2e/aria-kai';
import { useTranslation } from '@/hooks/use-translation';

interface ConversationHeaderProps {
  conversation: Conversation;
  currentUserId?: string;
  onBack: () => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  onDeleteClick: (id: string) => void;
  onMembersClick: () => void;
}

export function ConversationHeader({
  conversation,
  currentUserId,
  onBack,
  onTogglePin,
  onDeleteClick,
  onMembersClick,
}: ConversationHeaderProps) {
  const { t } = useTranslation();
  const display = getConversationDisplay(conversation, currentUserId);

  return (
    <CardHeader className="flex-shrink-0 flex-row items-center justify-between space-y-0 border-b">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={display.avatar || undefined} />
          <AvatarFallback>
            {display.name?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-semibold">{display.name}</h3>
          {display.isGroup ? (
            <button
              onClick={onMembersClick}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
            >
              {t('features.messages.conversation.members', { count: display.participantCount })}
            </button>
          ) : (
            display.handle && (
              <p className="text-sm text-muted-foreground">@{display.handle}</p>
            )
          )}
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center gap-1">
        {/* Only show pin for accepted conversations */}
        {conversation.status === 'accepted' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              onTogglePin(
                conversation.id,
                conversation.pinned || false
              )
            }
            title={
              conversation.pinned 
                ? t('features.messages.conversation.unpin') 
                : t('features.messages.conversation.pin')
            }
          >
            {conversation.pinned ? (
              <PinOff className="h-4 w-4 text-primary" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
        )}
        {/* Show delete for direct messages, not group chats or Aria & Kai conversation */}
        {conversation.type !== 'group' &&
          !conversation.participants.some(
            (p) => p.user?.id === ARIA_KAI_USER_ID
          ) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteClick(conversation.id)}
              title={
                conversation.status === 'pending'
                  ? t('features.messages.conversation.cancelRequest')
                  : t('features.messages.conversation.delete')
              }
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
      </div>
    </CardHeader>
  );
}
