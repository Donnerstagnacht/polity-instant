import type { InstantRules } from '@instantdb/react';

const rules = {
  messages: {
    allow: {
      view: 'isConversationParticipant',
      create: 'isConversationParticipant',
      update: 'false',
      delete: 'isSender',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSender',
      'auth.id == data.ref("sender.id")',
      'isConversationParticipant',
      'auth.id in data.ref("conversation.participants.user.id")',
    ],
  },
  conversationParticipants: {
    allow: {
      view: 'isSelf',
      create: 'isConversationParticipant',
      update: 'false',
      delete: 'isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
      'isConversationParticipant',
      'auth.id in data.ref("conversation.participants.user.id")',
    ],
  },
  conversations: {
    allow: {
      view: 'isParticipant',
      create: 'isAuthenticated',
      update: 'isParticipant',
      delete: 'isParticipant',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isParticipant',
      'auth.id in data.ref("participants.user.id")',
    ],
  },
} satisfies InstantRules;

export default rules;
