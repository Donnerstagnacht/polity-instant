// instant.schema.ts
// This file defines the database schema for the Polity application
// It includes user authentication, groups, and magic code functionality

import { i } from '@instantdb/react';

const graph = i.graph(
  {
    // User entity with authentication and profile data
    $users: i.entity({
      email: i.string().unique().indexed(),
      name: i.string().optional(),
      avatar: i.string().optional(),
      bio: i.string().optional(),
      handle: i.string().unique().indexed().optional(),
      isActive: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      lastSeenAt: i.date().indexed().optional(),
      // Instant built-in fields
      imageURL: i.string().optional(),
      type: i.string().optional(),
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

    // File storage entity (built-in Instant entity)
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
  },
  {
    // Define relationships between entities

    // User can own multiple groups
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

    // Group membership relationships
    groupMember: {
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

    userMember: {
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

    // Instant built-in user relationships
    userLink: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'linkedPrimaryUser',
        onDelete: 'cascade',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'linkedGuestUsers',
      },
    },
  }
);

export default graph;
