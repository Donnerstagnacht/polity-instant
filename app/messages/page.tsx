'use client';

import { PageWrapper } from '@/components/layout/page-wrapper';
import { AuthGuard } from '@/features/auth/AuthGuard.tsx';
import { useState, useMemo, useEffect, useRef } from 'react';
import { db, tx, id } from '../../db';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Search, Send, ArrowLeft } from 'lucide-react';
import { cn } from '@/utils/utils';

interface Message {
  id: string;
  content: string;
  isRead: boolean;
  createdAt: string | number;
  sender?: {
    id: string;
    name?: string;
    avatar?: string;
    handle?: string;
  };
}

interface Conversation {
  id: string;
  lastMessageAt: string | number;
  participants: {
    id: string;
    user?: {
      id: string;
      name?: string;
      avatar?: string;
      handle?: string;
    };
  }[];
  messages: Message[];
}

export default function MessagesPage() {
  const { user } = db.useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user data for sending messages
  const { data: userData } = db.useQuery({
    $users: {
      $: {
        where: {
          id: user?.id,
        },
      },
    },
  });

  const currentUser = userData?.$users?.[0];

  // Query all conversations where the user is a participant
  const { data, isLoading } = db.useQuery({
    conversations: {
      participants: {
        user: {},
      },
      messages: {
        $: {
          order: {
            createdAt: 'asc' as const, // Sort oldest to newest (newest at bottom like WhatsApp)
          },
        },
        sender: {},
      },
    },
  });

  const conversations = data?.conversations || [];

  // Filter conversations and messages based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      // Sort conversations by lastMessageAt (newest first)
      return [...conversations].sort((a, b) => {
        const timeA = new Date(a.lastMessageAt || 0).getTime();
        const timeB = new Date(b.lastMessageAt || 0).getTime();
        return timeB - timeA; // Newest first
      });
    }

    return conversations
      .filter((conv: Conversation) => {
        // Search in participant names
        const participantMatch = conv.participants.some((p: any) => {
          const name = p.user?.name?.toLowerCase() || '';
          const handle = p.user?.handle?.toLowerCase() || '';
          return (
            name.includes(searchQuery.toLowerCase()) || handle.includes(searchQuery.toLowerCase())
          );
        });

        // Search in messages
        const messageMatch = conv.messages.some((msg: Message) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        );

        return participantMatch || messageMatch;
      })
      .sort((a, b) => {
        // Sort by lastMessageAt (newest first)
        const timeA = new Date(a.lastMessageAt || 0).getTime();
        const timeB = new Date(b.lastMessageAt || 0).getTime();
        return timeB - timeA;
      });
  }, [conversations, searchQuery]);

  // Get selected conversation with sorted messages
  const selectedConversation = useMemo(() => {
    const conversation = conversations.find(
      (conv: Conversation) => conv.id === selectedConversationId
    );
    if (!conversation) return undefined;

    // Sort messages by createdAt timestamp (oldest to newest, like WhatsApp)
    const sortedMessages = [...conversation.messages].sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeA - timeB;
    });

    return {
      ...conversation,
      messages: sortedMessages,
    };
  }, [conversations, selectedConversationId]);

  // Get the other participant in the conversation (for 1-on-1 chats)
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p.user?.id !== user?.id)?.user;
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  // Send a message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId || !user?.id) return;

    const messageId = id();

    try {
      await db.transact([
        tx.messages[messageId].update({
          content: messageText.trim(),
          isRead: false,
          createdAt: new Date().toISOString(),
        }),
        tx.messages[messageId].link({
          conversation: selectedConversationId,
          sender: user.id,
        }),
        tx.conversations[selectedConversationId].update({
          lastMessageAt: new Date().toISOString(),
        }),
      ]);

      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (!selectedConversation || !currentUser?.id) return;

    const unreadMessages = selectedConversation.messages.filter(
      (msg: Message) => !msg.isRead && msg.sender?.id !== currentUser.id
    );

    if (unreadMessages.length > 0) {
      db.transact(
        unreadMessages.map((msg: Message) =>
          tx.messages[msg.id].update({
            isRead: true,
          })
        )
      );
    }
  }, [selectedConversation, currentUser?.id]);

  // Format date/time - show time if today, date if before today
  const formatTime = (date: string | number) => {
    const now = new Date();
    const messageDate = new Date(date);

    // Check if message is from today
    const isToday =
      now.getDate() === messageDate.getDate() &&
      now.getMonth() === messageDate.getMonth() &&
      now.getFullYear() === messageDate.getFullYear();

    if (isToday) {
      // Show time if today (e.g., "2:30 PM")
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else {
      // Show date if before today (e.g., "Jan 15")
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  // Get unread count for a conversation
  const getUnreadCount = (conversation: Conversation) => {
    return conversation.messages.filter(msg => !msg.isRead && msg.sender?.id !== currentUser?.id)
      .length;
  };

  if (isLoading) {
    return (
      <AuthGuard requireAuth={true}>
        <PageWrapper className="container mx-auto p-4">
          <div className="flex h-[600px] items-center justify-center">
            <p className="text-muted-foreground">Loading conversations...</p>
          </div>
        </PageWrapper>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <PageWrapper className="container mx-auto min-h-screen p-4">
        <div className="flex h-[calc(100vh-6rem)] flex-col gap-4 md:grid md:h-[calc(100vh-3rem)] md:grid-cols-3">
          {/* Chat List */}
          <Card
            className={cn(
              'flex flex-col overflow-hidden md:col-span-1',
              selectedConversationId && 'hidden md:flex'
            )}
          >
            <CardHeader className="flex-shrink-0 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Messages</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <Separator />
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-1 p-4">
                {filteredConversations.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground">
                      {searchQuery ? 'No conversations found' : 'No conversations yet'}
                    </p>
                  </div>
                ) : (
                  filteredConversations.map((conversation: Conversation) => {
                    const otherUser = getOtherParticipant(conversation);
                    const lastMessage = conversation.messages[conversation.messages.length - 1];
                    const unreadCount = getUnreadCount(conversation);

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversationId(conversation.id)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors hover:bg-accent',
                          selectedConversationId === conversation.id && 'bg-accent'
                        )}
                      >
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={otherUser?.avatar} />
                          <AvatarFallback>
                            {otherUser?.name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="truncate font-semibold">
                              {otherUser?.name || 'Unknown User'}
                            </p>
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
                  })
                )}
              </div>
            </div>
          </Card>

          {/* Message View */}
          <Card
            className={cn(
              'flex flex-col overflow-hidden md:col-span-2',
              !selectedConversationId && 'hidden md:flex'
            )}
          >
            {selectedConversation ? (
              <div className="flex h-full flex-col">
                {/* Chat Header - Fixed */}
                <CardHeader className="flex-shrink-0 flex-row items-center space-y-0 border-b">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="mr-2 md:hidden"
                    onClick={() => setSelectedConversationId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={getOtherParticipant(selectedConversation)?.avatar} />
                    <AvatarFallback>
                      {getOtherParticipant(selectedConversation)?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <h3 className="font-semibold">
                      {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                    </h3>
                    {getOtherParticipant(selectedConversation)?.handle && (
                      <p className="text-sm text-muted-foreground">
                        @{getOtherParticipant(selectedConversation)?.handle}
                      </p>
                    )}
                  </div>
                </CardHeader>

                {/* Messages - Scrollable Area */}
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-4 p-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="flex h-full items-center justify-center py-12">
                        <p className="text-sm text-muted-foreground">
                          No messages yet. Start the conversation!
                        </p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((message: Message) => {
                        const isOwnMessage = message.sender?.id === currentUser?.id;

                        return (
                          <div
                            key={message.id}
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
                              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
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
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input - Fixed */}
                <CardContent className="flex-shrink-0 border-t p-4">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex gap-2"
                  >
                    <Input
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      className="flex-1"
                      onKeyDown={e => {
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
                </CardContent>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <p className="text-lg font-semibold">Select a conversation</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a conversation from the list to start messaging
                  </p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </PageWrapper>
    </AuthGuard>
  );
}
