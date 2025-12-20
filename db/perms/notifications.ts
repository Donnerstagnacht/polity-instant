import type { InstantRules } from '@instantdb/react';

const rules = {
  notifications: {
    allow: {
      view: 'isRecipient',
      create: 'false',
      update: 'isRecipient',
      delete: 'isRecipient',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isRecipient',
      'auth.id == data.ref("recipient.id")',
    ],
  },
  pushSubscriptions: {
    allow: {
      view: 'isSelf',
      create: 'isSelf',
      update: 'isSelf',
      delete: 'isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("user.id")',
    ],
  },
} satisfies InstantRules;

export default rules;
