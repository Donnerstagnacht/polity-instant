// instant.schema.ts
// This file defines the database schema for the Polity application
// It includes user authentication, groups, and magic code functionality

import { i } from '@instantdb/react';

const graph = i.graph(
  {
    // User entity with authentication (only default attributes)
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),

    // User profile entity with extended attributes
    profiles: i.entity({
      name: i.string().optional(),
      subtitle: i.string().optional(),
      avatar: i.string().optional(),
      bio: i.string().optional(),
      handle: i.string().unique().indexed().optional(),
      isActive: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      lastSeenAt: i.date().indexed().optional(),
      // User profile attributes
      about: i.string().optional(),
      // Contact fields (expanded from contact JSON)
      contactEmail: i.string().optional().indexed(),
      contactTwitter: i.string().optional(),
      contactWebsite: i.string().optional(),
      contactLocation: i.string().optional(),
      // Social media handles (expanded from socialMedia JSON)
      whatsapp: i.string().optional(),
      instagram: i.string().optional(),
      twitter: i.string().optional(),
      facebook: i.string().optional(),
      snapchat: i.string().optional(),
      // Instant built-in fields
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),

    // UserStat entity
    stats: i.entity({
      label: i.string(),
      value: i.number(),
      unit: i.string().optional(),
    }),

    // ...contacts and socialMedia merged into $users as JSON

    // UserStatement entity
    statements: i.entity({
      text: i.string(),
      tag: i.string(),
    }),

    // UserBlog entity
    blogs: i.entity({
      title: i.string(),
      date: i.string(),
      likes: i.number(),
      comments: i.number(),
    }),

    // User entity for user groups (renamed from userGroups)
    user: i.entity({
      name: i.string(),
      members: i.number(),
      role: i.string(),
      description: i.string().optional(),
      tags: i.json().optional(),
      amendments: i.number().optional(),
      events: i.number().optional(),
      abbr: i.string().optional(),
    }),

    // UserAmendment entity
    amendments: i.entity({
      title: i.string(),
      subtitle: i.string().optional(),
      status: i.string(), // 'Passed' | 'Rejected' | 'Under Review' | 'Drafting'
      supporters: i.number(),
      date: i.string(),
      code: i.string().optional(),
      tags: i.json().optional(),
    }),
    // Magic codes for passwordless authentication
    magicCodes: i.entity({
      email: i.string().indexed(),
      code: i.string(),
      createdAt: i.date().indexed(),
      expiresAt: i.date().indexed(),
      usedAt: i.date().optional(),
    }),

    // Groups for organizing users
    groups: i.entity({
      name: i.string().indexed(),
      description: i.string().optional(),
      isPublic: i.boolean().indexed(),
      memberCount: i.number().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Group memberships (many-to-many relationship between users and groups)
    groupMemberships: i.entity({
      role: i.string().indexed(), // 'owner', 'admin', 'member'
      joinedAt: i.date().indexed(),
    }),

    // Follower relationship (many-to-many: users can follow other users)
    follows: i.entity({
      createdAt: i.date().indexed(),
    }),
  },
  {
    // 1. Link between users and profiles (one-to-one)
    userProfiles: {
      forward: {
        on: 'profiles',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'profile',
      },
    },

    // 2. Link between users and groupMemberships (one-to-many)
    userGroupMemberships: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'memberships',
      },
    },

    // 3. Link between groupMemberships and groups (many-to-one)
    groupMembershipGroups: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'memberships',
      },
    },

    // 4. Link between users and amendments (one-to-many)
    userAmendments: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'amendments',
      },
    },

    // 5. Link between users and stats (one-to-many)
    userStats: {
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

    // 6. Link between users and statements (one-to-many)
    userStatements: {
      forward: {
        on: 'statements',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'statements',
      },
    },

    // 7. Link between users and blogs (one-to-many)
    userBlogs: {
      forward: {
        on: 'blogs',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'blogs',
      },
    },

    // Additional: User can own multiple groups
    userOwnedGroups: {
      forward: {
        on: 'groups',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'ownedGroups',
      },
    },

    // Additional: userGroups link for the 'user' entity
    userGroupsLink: {
      forward: {
        on: 'user',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'groups',
      },
    },

    // 8. User follows (follower relationship)
    userFollowers: {
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

    // 9. User following (followee relationship)
    userFollowing: {
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
  }
);

export default graph;
