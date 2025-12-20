import { i } from '@instantdb/react';

const _messages = {
  entities: {
    conversationParticipants: i.entity({
      joinedAt: i.date().indexed(),
      lastReadAt: i.date().optional(),
      leftAt: i.date().optional(),
    }),
    conversations: i.entity({
      createdAt: i.date().indexed(),
      lastMessageAt: i.date().indexed(),
      pinned: i.boolean().indexed().optional(), // Track pinned conversations
      status: i.string().indexed().optional(), // 'pending', 'accepted', 'rejected'
      type: i.string().indexed().optional(), // 'direct', 'group'
      name: i.string().indexed().optional(), // For group conversations, synced with group name
    }),
    messages: i.entity({
      content: i.string(),
      createdAt: i.date().indexed(),
      deletedAt: i.date().optional(),
      isRead: i.boolean().indexed(),
      updatedAt: i.date().optional(),
    }),
  },
  links: {
    conversationParticipantsConversation: {
      forward: {
        on: 'conversationParticipants',
        has: 'one',
        label: 'conversation',
      },
      reverse: {
        on: 'conversations',
        has: 'many',
        label: 'participants',
      },
    },
    conversationParticipantsUser: {
      forward: {
        on: 'conversationParticipants',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'conversationParticipants',
      },
    },
    conversationsGroup: {
      forward: {
        on: 'conversations',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'one',
        label: 'conversation',
      },
    },
    conversationsRequestedBy: {
      forward: {
        on: 'conversations',
        has: 'one',
        label: 'requestedBy',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'requestedConversations',
      },
    },
    messagesConversation: {
      forward: {
        on: 'messages',
        has: 'one',
        label: 'conversation',
      },
      reverse: {
        on: 'conversations',
        has: 'many',
        label: 'messages',
      },
    },
    messagesSender: {
      forward: {
        on: 'messages',
        has: 'one',
        label: 'sender',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'sentMessages',
      },
    },
  } as const,
};

export default _messages;
