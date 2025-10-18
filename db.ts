// db.ts
// Main database configuration and client setup for Instant
// This file initializes the Instant client and provides typed database access

import { init, tx, id } from '@instantdb/react';
import schema from './instant.schema';

// Initialize Instant client with app ID and schema
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '869f3247-fd73-44fe-9b5f-caa541352f89';

// Create the database client
export const db = init({
  appId: APP_ID,
  schema,
});

// Export transaction and ID utilities
export { tx, id };

// Export default for easier imports
export default db;

// Type definitions for better TypeScript support
export type Database = typeof db;
export type Schema = typeof schema;

// Query helpers for common operations
export const queries = {
  // User queries
  users: {
    // Get current user
    me: () => db.useAuth(),

    // Get user by ID with profile
    byId: (userId: string) =>
      db.useQuery({
        $users: {
          $: { where: { id: userId } },
          profile: {},
        },
      }),

    // Get user by email
    byEmail: (email: string) => db.useQuery({ $users: { $: { where: { email } } } }),

    // Get active users (users with active profiles)
    active: () =>
      db.useQuery({
        profiles: {
          $: { where: { isActive: true } },
          user: {},
        },
      }),
  },

  // Group queries
  groups: {
    // Get all public groups
    public: () => db.useQuery({ groups: { $: { where: { isPublic: true } } } }),

    // Get user's groups (owned or member)
    userGroups: (userId: string) =>
      db.useQuery({
        groups: {
          $: {
            where: {
              or: [{ 'owner.id': userId }, { 'memberships.user.id': userId }],
            },
          },
          owner: {},
          memberships: { user: {} },
        },
      }),

    // Get group with members
    withMembers: (groupId: string) =>
      db.useQuery({
        groups: {
          $: { where: { id: groupId } },
          owner: {},
          memberships: { user: {} },
        },
      }),
  },

  // Group membership queries
  memberships: {
    // Get user's memberships
    byUser: (userId: string) =>
      db.useQuery({
        groupMemberships: {
          $: { where: { 'user.id': userId } },
          user: {},
          group: {},
        },
      }),

    // Get group's memberships
    byGroup: (groupId: string) =>
      db.useQuery({
        groupMemberships: {
          $: { where: { 'group.id': groupId } },
          user: {},
          group: {},
        },
      }),
  },

  // Magic code queries (limited for security)
  magicCodes: {
    // Verify magic code (should be done server-side in production)
    verify: (email: string, code: string) =>
      db.useQuery({
        magicCodes: {
          $: {
            where: {
              email,
              code,
              usedAt: { $isNull: true },
              expiresAt: { $gt: new Date() },
            },
          },
        },
      }),
  },
};

// Mutation helpers for common operations
export const mutations = {
  // User mutations
  users: {
    // Create new user (typically called after magic code verification)
    create: (userData: { email: string; name?: string; avatar?: string; handle?: string }) =>
      db.transact(
        tx.users[id()].update({
          ...userData,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      ),

    // Update user profile
    update: (
      userId: string,
      updates: {
        name?: string;
        avatar?: string;
        bio?: string;
        handle?: string;
      }
    ) =>
      db.transact(
        tx.users[userId].update({
          ...updates,
          updatedAt: new Date(),
        })
      ),

    // Update last seen
    updateLastSeen: (userId: string) =>
      db.transact(
        tx.users[userId].update({
          lastSeenAt: new Date(),
        })
      ),

    // Deactivate user
    deactivate: (userId: string) =>
      db.transact(
        tx.users[userId].update({
          isActive: false,
          updatedAt: new Date(),
        })
      ),
  },

  // Group mutations
  groups: {
    // Create new group
    create: (
      ownerId: string,
      groupData: {
        name: string;
        description?: string;
        isPublic: boolean;
      }
    ) => {
      const groupId = id();
      const membershipId = id();

      return db.transact([
        tx.groups[groupId].update({
          ...groupData,
          memberCount: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
        tx.groups[groupId].link({ owner: ownerId }),
        tx.groupMemberships[membershipId].update({
          role: 'owner',
          joinedAt: new Date(),
        }),
        tx.groupMemberships[membershipId].link({
          group: groupId,
          user: ownerId,
        }),
      ]);
    },

    // Update group
    update: (
      groupId: string,
      updates: {
        name?: string;
        description?: string;
        isPublic?: boolean;
      }
    ) =>
      db.transact(
        tx.groups[groupId].update({
          ...updates,
          updatedAt: new Date(),
        })
      ),

    // Delete group
    delete: (groupId: string) => db.transact(tx.groups[groupId].delete()),
  },

  // Group membership mutations
  memberships: {
    // Add member to group
    add: (groupId: string, userId: string, role = 'member') => {
      const membershipId = id();

      return db.transact([
        tx.groupMemberships[membershipId].update({
          role,
          joinedAt: new Date(),
        }),
        tx.groupMemberships[membershipId].link({
          group: groupId,
          user: userId,
        }),
        // Note: Member count should be updated separately or calculated dynamically
        // tx.groups[groupId].update({
        //   memberCount: currentCount + 1,
        // }),
      ]);
    },

    // Remove member from group
    remove: (membershipId: string) =>
      db.transact([
        tx.groupMemberships[membershipId].delete(),
        // Note: Member count should be updated separately or calculated dynamically
        // tx.groups[groupId].update({
        //   memberCount: currentCount - 1,
        // }),
      ]),

    // Update member role
    updateRole: (membershipId: string, role: string) =>
      db.transact(tx.groupMemberships[membershipId].update({ role })),
  },

  // Magic code mutations
  magicCodes: {
    // Create magic code
    create: (email: string, code: string) => {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 15); // 15 minute expiry

      return db.transact(
        tx.magicCodes[id()].update({
          email,
          code,
          createdAt: new Date(),
          expiresAt,
        })
      );
    },

    // Mark magic code as used
    markAsUsed: (codeId: string) =>
      db.transact(
        tx.magicCodes[codeId].update({
          usedAt: new Date(),
        })
      ),
  },
};

// Helper functions for complex operations
export const helpers = {
  // Update group member count based on actual memberships
  updateGroupMemberCount: async (groupId: string) => {
    const { data: memberships } = await db.useQuery({
      groupMemberships: {
        $: { where: { 'group.id': groupId } },
      },
    });

    const memberCount = memberships?.groupMemberships?.length || 0;

    return db.transact(
      tx.groups[groupId].update({
        memberCount,
        updatedAt: new Date(),
      })
    );
  },

  // Add member to group with proper count update
  addMemberToGroup: async (groupId: string, userId: string, role = 'member') => {
    const membershipId = id();

    // Add membership
    await db.transact([
      tx.groupMemberships[membershipId].update({
        role,
        joinedAt: new Date(),
      }),
      tx.groupMemberships[membershipId].link({
        group: groupId,
        user: userId,
      }),
    ]);

    // Update member count
    return helpers.updateGroupMemberCount(groupId);
  },

  // Remove member from group with proper count update
  removeMemberFromGroup: async (membershipId: string, groupId: string) => {
    // Remove membership
    await db.transact(tx.groupMemberships[membershipId].delete());

    // Update member count
    return helpers.updateGroupMemberCount(groupId);
  },
};
