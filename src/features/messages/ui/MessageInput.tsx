import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Conversation } from '../types';
import { getOtherParticipant } from '../utils';
import { useTranslation } from '@/hooks/use-translation';

interface MessageInputProps {
  conversation: Conversation;
  currentUserId?: string;
  onSendMessage: (content: string) => void;
}

export function MessageInput({
  conversation,
  currentUserId,
  onSendMessage,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText.trim());
    setMessageText('');
  };

  const otherParticipantName = getOtherParticipant(conversation, currentUserId)?.name || t('common.labels.unknownUser');

  return (
    <CardContent className="flex-shrink-0 border-t p-4">
      {conversation.type !== 'group' &&
      conversation.status === 'pending' &&
      conversation.requestedBy?.id === currentUserId ? (
        <div className="text-center text-sm text-muted-foreground">
          {t('features.messages.conversation.waitingForAccept', { name: otherParticipantName })}
        </div>
      ) : conversation.status === 'rejected' ? (
        <div className="text-center text-sm text-muted-foreground">
          {t('features.messages.conversation.rejected')}
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            placeholder={t('features.messages.compose.messagePlaceholder')}
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button type="submit" size="icon" disabled={!messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      )}
    </CardContent>
  );
}
