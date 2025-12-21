import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { CardContent } from '@/components/ui/card';
import { Conversation } from '../types';
import { getOtherParticipant } from '../utils';

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
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText.trim());
    setMessageText('');
  };

  return (
    <CardContent className="flex-shrink-0 border-t p-4">
      {conversation.type !== 'group' &&
      conversation.status === 'pending' &&
      conversation.requestedBy?.id === currentUserId ? (
        <div className="text-center text-sm text-muted-foreground">
          Waiting for{' '}
          {getOtherParticipant(conversation, currentUserId)?.name || 'the other user'} to
          accept your conversation request
        </div>
      ) : conversation.status === 'rejected' ? (
        <div className="text-center text-sm text-muted-foreground">
          This conversation request was rejected
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
            placeholder="Type a message..."
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
