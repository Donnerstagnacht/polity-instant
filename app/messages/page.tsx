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
import { Search, Send, ArrowLeft, Plus, Pin, PinOff, Trash2, X, Check } from 'lucide-react';
import { cn } from '@/utils/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

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
  createdAt: string;
  lastMessageAt: string;
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
  pinned?: boolean;
  status?: string; // 'pending', 'accepted', 'rejected'
  requestedBy?: { id: string; name?: string; handle?: string }; // User who initiated the conversation request
  type?: string; // 'direct', 'group'
  name?: string; // For group conversations
  group?: any; // Group entity if this is a group conversation
}

export default function MessagesPage() {
  const { user } = db.useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSearchDialogOpen, setUserSearchDialogOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [memberListDialogOpen, setMemberListDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
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

  // Query all users for search dialog
  const { data: allUsersData } = db.useQuery({
    $users: {
      $: {
        where: {
          visibility: 'public',
        },
      },
    },
  });

  const allUsers = allUsersData?.$users || [];

  // Query all conversations where the user is a participant
  const { data, isLoading } = db.useQuery({
    conversations: {
      group: {}, // Load group data for group conversations
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

  const conversations = (data?.conversations || []) as Conversation[];

  // Filter conversations and messages based on search query
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) {
      // Sort conversations: pinned first, then by lastMessageAt (newest first)
      return [...conversations].sort((a, b) => {
        // First, sort by pinned status
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

        // Then sort by lastMessageAt
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
        // First, sort by pinned status
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;

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
    } as Conversation;
  }, [conversations, selectedConversationId]);

  // Get the other participant in the conversation (for 1-on-1 chats) or group info
  const getConversationDisplay = (conversation: Conversation) => {
    if (conversation.type === 'group') {
      return {
        name: conversation.name || conversation.group?.name || 'Group Chat',
        avatar: conversation.group?.imageURL || null,
        handle: null,
        isGroup: true,
        participantCount: conversation.participants.length,
      };
    } else {
      const otherUser = conversation.participants.find(p => p.user?.id !== user?.id)?.user;
      return {
        name: otherUser?.name || 'Unknown User',
        avatar: otherUser?.avatar,
        handle: otherUser?.handle,
        isGroup: false,
      };
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    if (conversation.type === 'group') return null;
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

  // Filter users in search dialog
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) {
      return allUsers.filter(u => u.id !== user?.id); // Exclude current user
    }
    return allUsers
      .filter(u => u.id !== user?.id) // Exclude current user
      .filter((u: any) => {
        const name = u.name?.toLowerCase() || '';
        const handle = u.handle?.toLowerCase() || '';
        return (
          name.includes(userSearchQuery.toLowerCase()) ||
          handle.includes(userSearchQuery.toLowerCase())
        );
      });
  }, [allUsers, userSearchQuery, user?.id]);

  // Create a new conversation request
  const handleCreateConversationRequest = async (otherUserId: string) => {
    if (!user?.id) return;

    // Check if conversation already exists between these users
    const existingConversation = conversations.find((conv: Conversation) => {
      const participantIds = conv.participants.map((p: any) => p.user?.id);
      return participantIds.includes(user.id) && participantIds.includes(otherUserId);
    });

    if (existingConversation) {
      // Select the existing conversation
      setSelectedConversationId(existingConversation.id);
      setUserSearchDialogOpen(false);
      setUserSearchQuery('');
      return;
    }

    const conversationId = id();
    const participant1Id = id();
    const participant2Id = id();

    try {
      await db.transact([
        tx.conversations[conversationId].update({
          createdAt: new Date().toISOString(),
          lastMessageAt: new Date().toISOString(),
          status: 'pending',
          type: 'direct',
        }),
        tx.conversations[conversationId].link({
          requestedBy: user.id,
        }),
        tx.conversationParticipants[participant1Id].update({
          joinedAt: new Date().toISOString(),
        }),
        tx.conversationParticipants[participant1Id].link({
          conversation: conversationId,
          user: user.id,
        }),
        tx.conversationParticipants[participant2Id].update({
          joinedAt: new Date().toISOString(),
        }),
        tx.conversationParticipants[participant2Id].link({
          conversation: conversationId,
          user: otherUserId,
        }),
      ]);

      setSelectedConversationId(conversationId);
      setUserSearchDialogOpen(false);
      setUserSearchQuery('');
    } catch (error) {
      console.error('Failed to create conversation request:', error);
    }
  };

  // Accept a conversation request
  const handleAcceptConversation = async (conversationId: string) => {
    try {
      await db.transact([
        tx.conversations[conversationId].update({
          status: 'accepted',
        }),
      ]);
    } catch (error) {
      console.error('Failed to accept conversation:', error);
    }
  };

  // Reject a conversation request
  const handleRejectConversation = async (conversationId: string) => {
    try {
      // Find all messages in this conversation and delete them
      const conversation = conversations.find((c: Conversation) => c.id === conversationId);
      if (!conversation) return;

      const deleteTransactions = conversation.messages.map((msg: Message) =>
        tx.messages[msg.id].delete()
      );

      // Delete participants
      const participantTransactions = conversation.participants.map((p: any) =>
        tx.conversationParticipants[p.id].delete()
      );

      // Delete conversation
      await db.transact([
        ...deleteTransactions,
        ...participantTransactions,
        tx.conversations[conversationId].delete(),
      ]);

      setSelectedConversationId(null);
    } catch (error) {
      console.error('Failed to reject conversation:', error);
    }
  };

  // Pin/Unpin a conversation
  const handleTogglePin = async (conversationId: string, currentPinned: boolean) => {
    try {
      await db.transact([
        tx.conversations[conversationId].update({
          pinned: !currentPinned,
        }),
      ]);
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  // Delete a conversation
  const handleDeleteConversation = async (conversationId: string) => {
    try {
      const conversation = conversations.find((c: Conversation) => c.id === conversationId);
      if (!conversation) return;

      const deleteTransactions = conversation.messages.map((msg: Message) =>
        tx.messages[msg.id].delete()
      );

      const participantTransactions = conversation.participants.map((p: any) =>
        tx.conversationParticipants[p.id].delete()
      );

      await db.transact([
        ...deleteTransactions,
        ...participantTransactions,
        tx.conversations[conversationId].delete(),
      ]);

      setSelectedConversationId(null);
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
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
                <Dialog open={userSearchDialogOpen} onOpenChange={setUserSearchDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="icon" variant="default" className="rounded-full">
                      <Plus className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Start a New Conversation</DialogTitle>
                      <DialogDescription>
                        Search for users to start a conversation with
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search users by name or handle..."
                          value={userSearchQuery}
                          onChange={e => setUserSearchQuery(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <div className="max-h-[400px] space-y-2 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                          <div className="py-8 text-center">
                            <p className="text-muted-foreground">
                              {userSearchQuery ? 'No users found' : 'Start typing to search users'}
                            </p>
                          </div>
                        ) : (
                          filteredUsers.map((searchUser: any) => (
                            <div
                              key={searchUser.id}
                              className="flex w-full items-center justify-between gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                            >
                              <button
                                onClick={() => handleCreateConversationRequest(searchUser.id)}
                                className="flex flex-1 items-center gap-3 text-left"
                              >
                                <Avatar className="h-10 w-10 flex-shrink-0">
                                  <AvatarImage src={searchUser.avatar || searchUser.imageURL} />
                                  <AvatarFallback>
                                    {searchUser.name?.[0]?.toUpperCase() || 'U'}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0 flex-1">
                                  <p className="truncate font-semibold">
                                    {searchUser.name || 'Unknown User'}
                                  </p>
                                  {searchUser.handle && (
                                    <p className="truncate text-sm text-muted-foreground">
                                      @{searchUser.handle}
                                    </p>
                                  )}
                                </div>
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
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
                    const display = getConversationDisplay(conversation);
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
                <CardHeader className="flex-shrink-0 flex-row items-center justify-between space-y-0 border-b">
                  <div className="flex items-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="mr-2 md:hidden"
                      onClick={() => setSelectedConversationId(null)}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    {(() => {
                      const display = getConversationDisplay(selectedConversation);
                      return (
                        <>
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
                                onClick={() => setMemberListDialogOpen(true)}
                                className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                              >
                                {display.participantCount} members
                              </button>
                            ) : (
                              display.handle && (
                                <p className="text-sm text-muted-foreground">@{display.handle}</p>
                              )
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Action Bar - Only show for accepted conversations */}
                  {selectedConversation.status === 'accepted' && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          handleTogglePin(
                            selectedConversation.id,
                            selectedConversation.pinned || false
                          )
                        }
                        title={
                          selectedConversation.pinned ? 'Unpin conversation' : 'Pin conversation'
                        }
                      >
                        {selectedConversation.pinned ? (
                          <PinOff className="h-4 w-4 text-primary" />
                        ) : (
                          <Pin className="h-4 w-4" />
                        )}
                      </Button>
                      {/* Only show delete for direct messages, not group chats */}
                      {selectedConversation.type !== 'group' && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setConversationToDelete(selectedConversation.id);
                            setDeleteDialogOpen(true);
                          }}
                          title="Delete conversation"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  )}
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

                    {/* Conversation Request Accept/Reject - Show if pending and user is recipient - Only for direct messages */}
                    {selectedConversation.type !== 'group' &&
                      selectedConversation.status === 'pending' &&
                      selectedConversation.requestedBy?.id !== currentUser?.id && (
                        <div className="border-t pt-4">
                          <Card className="bg-muted/50">
                            <CardContent className="flex flex-col items-center gap-3 p-4">
                              <p className="text-center text-sm font-medium">
                                {getOtherParticipant(selectedConversation)?.name || 'This user'}{' '}
                                wants to start a conversation with you
                              </p>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => handleAcceptConversation(selectedConversation.id)}
                                  variant="default"
                                  size="sm"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Accept
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (
                                      confirm(
                                        'Are you sure you want to reject this conversation request?'
                                      )
                                    ) {
                                      handleRejectConversation(selectedConversation.id);
                                    }
                                  }}
                                  variant="outline"
                                  size="sm"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Message Input - Fixed */}
                <CardContent className="flex-shrink-0 border-t p-4">
                  {selectedConversation.type !== 'group' &&
                  selectedConversation.status === 'pending' &&
                  selectedConversation.requestedBy?.id === currentUser?.id ? (
                    <div className="text-center text-sm text-muted-foreground">
                      Waiting for{' '}
                      {getOtherParticipant(selectedConversation)?.name || 'the other user'} to
                      accept your conversation request
                    </div>
                  ) : selectedConversation.status === 'rejected' ? (
                    <div className="text-center text-sm text-muted-foreground">
                      This conversation request was rejected
                    </div>
                  ) : (
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
                  )}
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

        {/* Member List Dialog for Group Conversations */}
        <Dialog open={memberListDialogOpen} onOpenChange={setMemberListDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Group Members</DialogTitle>
              <DialogDescription>
                {selectedConversation?.name || selectedConversation?.group?.name || 'Group'} members
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] space-y-2 overflow-y-auto py-4">
              {selectedConversation?.participants.map((participant: any) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-accent"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={participant.user?.avatar || participant.user?.imageURL} />
                    <AvatarFallback>
                      {participant.user?.name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold">{participant.user?.name || 'Unknown User'}</p>
                    {participant.user?.handle && (
                      <p className="text-sm text-muted-foreground">@{participant.user?.handle}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Conversation</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this conversation? This action cannot be undone and
                all messages will be permanently deleted.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setConversationToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (conversationToDelete) {
                    handleDeleteConversation(conversationToDelete);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageWrapper>
    </AuthGuard>
  );
}
