import { i } from '@instantdb/react';

const _users = {
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
      about: i.string().optional(),
      avatar: i.string().optional(),
      bio: i.string().optional(),
      contactEmail: i.string().indexed().optional(),
      contactLocation: i.string().optional(),
      contactTwitter: i.string().optional(),
      contactWebsite: i.string().optional(),
      facebook: i.string().optional(),
      handle: i.string().unique().indexed().optional(),
      instagram: i.string().optional(),
      lastSeenAt: i.date().indexed().optional(),
      name: i.string().optional(),
      snapchat: i.string().optional(),
      subtitle: i.string().optional(),
      twitter: i.string().optional(),
      whatsapp: i.string().optional(),
      createdAt: i.date().indexed().optional(),
      updatedAt: i.date().indexed().optional(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
      tutorialStep: i.string().indexed().optional(), // 'welcome', 'overview', 'groups', 'events', 'amendments', 'blogs', 'elections', 'completed'
      assistantIntroduction: i.boolean().optional(), // Whether to show the Aria & Kai introduction dialog
    }),
    follows: i.entity({
      createdAt: i.date().indexed(),
    }),
    magicCodes: i.entity({
      code: i.string(),
      createdAt: i.date().indexed(),
      email: i.string().indexed(),
      expiresAt: i.date().indexed(),
      usedAt: i.date().optional(),
    }),
    stats: i.entity({
      label: i.string(),
      unit: i.string().optional(),
      value: i.number(),
    }),
  },
  links: {
    $usersAvatarFile: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'avatarFile',
      },
      reverse: {
        on: '$files',
        has: 'one',
        label: 'userAvatar',
      },
    },
    followsFollowee: {
      forward: {
        on: 'follows',
        has: 'one',
        label: 'followee',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'followers',
      },
    },
    followsFollower: {
      forward: {
        on: 'follows',
        has: 'one',
        label: 'follower',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'following',
      },
    },
    statsUser: {
      forward: {
        on: 'stats',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'stats',
      },
    },
  } as const,
};

export default _users;
