import { Conversation, ConversationDisplay } from './types';

export const getConversationDisplay = (conversation: Conversation, currentUserId?: string): ConversationDisplay => {
  if (conversation.type === 'group') {
    return {
      name: conversation.name || conversation.group?.name || 'Group Chat',
      avatar: conversation.group?.imageURL || null,
      handle: null,
      isGroup: true,
      participantCount: conversation.participants.length,
    };
  } else {
    const otherUser = conversation.participants.find(p => p.user?.id !== currentUserId)?.user;
    return {
      name: otherUser?.name || 'Unknown User',
      avatar: otherUser?.avatar,
      handle: otherUser?.handle,
      isGroup: false,
    };
  }
};

export const getOtherParticipant = (conversation: Conversation, currentUserId?: string) => {
  if (conversation.type === 'group') return null;
  return conversation.participants.find(p => p.user?.id !== currentUserId)?.user;
};

export const formatTime = (date: string | number) => {
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

export const getUnreadCount = (conversation: Conversation, currentUserId?: string) => {
  return conversation.messages.filter(msg => !msg.isRead && msg.sender?.id !== currentUserId)
    .length;
};
