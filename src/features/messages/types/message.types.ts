export interface Message {
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

export interface ConversationParticipant {
  id: string;
  user?: {
    id: string;
    name?: string;
    avatar?: string;
    handle?: string;
    imageURL?: string;
  };
}

export interface Conversation {
  id: string;
  createdAt: string;
  lastMessageAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
  pinned?: boolean;
  status?: string; // 'pending', 'accepted', 'rejected'
  requestedBy?: { id: string; name?: string; handle?: string }; // User who initiated the conversation request
  type?: string; // 'direct', 'group'
  name?: string; // For group conversations
  group?: {
    id: string;
    name?: string;
    imageURL?: string;
  }; // Group entity if this is a group conversation
}

export interface ConversationDisplay {
  name: string;
  avatar: string | null | undefined;
  handle: string | null | undefined;
  isGroup: boolean;
  participantCount?: number;
}
