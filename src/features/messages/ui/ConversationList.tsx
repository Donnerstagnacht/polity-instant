import { Card, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';
import { cn } from '@/utils/utils';
import { Conversation } from '../types';
import { ConversationItem } from './ConversationItem';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  onSelectConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentUserId?: string;
  onNewConversationClick: () => void;
  className?: string;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  searchQuery,
  onSearchChange,
  currentUserId,
  onNewConversationClick,
  className,
}: ConversationListProps) {
  return (
    <Card
      className={cn(
        'flex flex-col overflow-hidden md:col-span-1',
        selectedConversationId && 'hidden md:flex',
        className
      )}
    >
      <CardHeader className="flex-shrink-0 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Messages</h2>
          <Button 
            size="icon" 
            variant="default" 
            className="rounded-full"
            onClick={onNewConversationClick}
          >
            <Plus className="h-5 w-5" />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-1 p-4">
          {conversations.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-muted-foreground">
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                currentUserId={currentUserId}
                isSelected={selectedConversationId === conversation.id}
                onSelect={onSelectConversation}
              />
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
