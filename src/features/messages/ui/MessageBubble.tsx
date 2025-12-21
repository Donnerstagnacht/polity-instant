import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageContent } from '@/components/messages/MessageContent';
import { cn } from '@/utils/utils';
import { Message } from '../types';
import { formatTime } from '../utils';

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isOwnMessage && 'flex-row-reverse'
      )}
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={message.sender?.avatar} />
        <AvatarFallback>
          {message.sender?.name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
      <div
        className={cn(
          'max-w-[70%] break-words rounded-lg px-4 py-2',
          isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <MessageContent content={message.content} />
        <p
          className={cn(
            'mt-1 text-xs',
            isOwnMessage
              ? 'text-primary-foreground/70'
              : 'text-muted-foreground'
          )}
        >
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
