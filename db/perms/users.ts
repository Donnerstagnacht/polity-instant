import type { InstantRules } from '@instantdb/react';

const rules = {
  $users: {
    allow: {
      view: 'isPublicOrAuthenticatedOrOwner',
      create: 'false',
      delete: 'false',
      update: 'isSelf',
    },
    bind: [
      'isSelf',
      'auth.id == data.id',
      'isAuthenticated',
      'auth.id != null',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrOwner',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && isSelf) || data.visibility == null',
    ],
  },
  $files: {
    allow: {
      view: 'isAuthenticated',
      create: 'isAuthenticated',
      update: 'false',
      delete: 'isOwner',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isOwner',
      'auth.id == data.ref("userAvatar.id") || auth.id == data.ref("threads.creator.id")',
    ],
  },
  follows: {
    bind: ['isFollower', "auth.id in data.ref('follower.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isFollower',
      delete: 'isFollower',
      update: 'false',
    },
  },
  magicCodes: {
    allow: {
      view: 'false',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [],
  },
  statements: {
    bind: [
      'isOwner',
      "auth.id in data.ref('user.id')",
      'isAuthenticated',
      'auth.id != null',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrOwner',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && isOwner) || data.visibility == null',
    ],
    allow: {
      view: 'isPublicOrAuthenticatedOrOwner',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  stats: {
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
} satisfies InstantRules;

export default rules;
