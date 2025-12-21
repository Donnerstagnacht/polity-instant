import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/utils';
import { Pin } from 'lucide-react';
import { Conversation } from '../types';
import { getConversationDisplay, getUnreadCount, formatTime } from '../utils';

interface ConversationItemProps {
  conversation: Conversation;
  currentUserId?: string;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

export function ConversationItem({
  conversation,
  currentUserId,
  isSelected,
  onSelect,
}: ConversationItemProps) {
  const display = getConversationDisplay(conversation, currentUserId);
  const lastMessage = conversation.messages[conversation.messages.length - 1];
  const unreadCount = getUnreadCount(conversation, currentUserId);

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent',
        isSelected && 'bg-accent'
      )}
    >
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage src={display.avatar || undefined} />
        <AvatarFallback>{display.name?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {conversation.pinned && (
              <Pin className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
            )}
            <p className="truncate font-semibold">{display.name}</p>
            {display.isGroup && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {display.participantCount}
              </Badge>
            )}
          </div>
          {lastMessage && (
            <span className="flex-shrink-0 whitespace-nowrap text-xs text-muted-foreground">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {lastMessage && (
            <p className="truncate text-sm text-muted-foreground">
              {lastMessage.content.length > 40
                ? `${lastMessage.content.substring(0, 40)}...`
                : lastMessage.content}
            </p>
          )}
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 min-w-[20px] flex-shrink-0 rounded-full px-1.5 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </div>
    </button>
  );
}
