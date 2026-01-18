import { Card } from '@/components/ui/card';
import { cn } from '@/utils/utils';
import { Conversation } from '../types';
import { ConversationHeader } from './ConversationHeader';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { useTranslation } from '@/hooks/use-translation';

interface MessageViewProps {
  conversation?: Conversation;
  currentUserId?: string;
  onBack: () => void;
  onTogglePin: (id: string, currentPinned: boolean) => void;
  onDeleteClick: (id: string) => void;
  onMembersClick: () => void;
  onSendMessage: (content: string) => void;
  onAcceptConversation: (conversation: Conversation) => void;
  onRejectConversation: (conversation: Conversation) => void;
  className?: string;
}

export function MessageView({
  conversation,
  currentUserId,
  onBack,
  onTogglePin,
  onDeleteClick,
  onMembersClick,
  onSendMessage,
  onAcceptConversation,
  onRejectConversation,
  className,
}: MessageViewProps) {
  const { t } = useTranslation();

  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden md:col-span-2',
        !conversation && 'hidden md:flex',
        className
      )}
    >
      {conversation ? (
        <div className="flex h-full flex-col">
          <ConversationHeader
            conversation={conversation}
            currentUserId={currentUserId}
            onBack={onBack}
            onTogglePin={onTogglePin}
            onDeleteClick={onDeleteClick}
            onMembersClick={onMembersClick}
          />
          <MessageList
            conversation={conversation}
            currentUserId={currentUserId}
            onAcceptConversation={onAcceptConversation}
            onRejectConversation={onRejectConversation}
          />
          <MessageInput
            conversation={conversation}
            currentUserId={currentUserId}
            onSendMessage={onSendMessage}
          />
        </div>
      ) : (
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold">{t('features.messages.conversation.select')}</p>
            <p className="text-sm text-muted-foreground">
              {t('features.messages.conversation.selectDescription')}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
