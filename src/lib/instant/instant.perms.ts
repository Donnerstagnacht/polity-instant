// instant.perms.ts
// This file defines the permission rules for the Polity application
// It controls who can create, read, update, and delete data

export const permissions = {
  // Default: Deny all access unless explicitly allowed
  $default: {
    allow: {
      create: 'false',
      view: 'false',
      update: 'false',
      delete: 'false',
    },
  },

  // User permissions
  $users: {
    allow: {
      // Users cannot create their own accounts (handled by magic code flow)
      create: 'false',
      // Users can view other users' profiles if authenticated
      view: 'auth.id != null',
      // Users can only update their own profile
      update: 'auth.id == data.id',
      // Users can only delete their own account
      delete: 'auth.id == data.id',
    },
  },

  // Magic code permissions (for passwordless authentication)
  magicCodes: {
    allow: {
      // Anyone can create magic codes (for login)
      create: 'true',
      // No one can view magic codes (security)
      view: 'false',
      // No one can update magic codes
      update: 'false',
      // No one can delete magic codes (they expire automatically)
      delete: 'false',
    },
  },

  // Group permissions
  groups: {
    allow: {
      // Any authenticated user can create groups
      create: 'auth.id != null',
      // Public groups are visible to all authenticated users
      // Private groups are only visible to members and owners
      view: `
        data.isPublic == true || 
        auth.id in data.memberships.user.id || 
        auth.id == data.owner.id
      `,
      // Only group owners can update group details
      update: 'auth.id == data.owner.id',
      // Only group owners can delete groups
      delete: 'auth.id == data.owner.id',
    },
  },

  // Group membership permissions
  groupMemberships: {
    allow: {
      // Users can join groups themselves, or owners can add members
      create: `
        auth.id != null && (
          auth.id == data.user.id || 
          auth.id == data.group.owner.id
        )
      `,
      // Users can view memberships they're part of, or owners can view all
      view: `
        auth.id == data.user.id || 
        auth.id == data.group.owner.id
      `,
      // Only group owners can update member roles
      update: 'auth.id == data.group.owner.id',
      // Users can leave groups, or owners can remove members
      delete: `
        auth.id == data.user.id || 
        auth.id == data.group.owner.id
      `,
    },
  },

  // File permissions (for avatars, uploads, etc.)
  $files: {
    allow: {
      // Any authenticated user can upload files
      create: 'auth.id != null',
      // Any authenticated user can view files
      view: 'auth.id != null',
      // No one can update files (create new ones instead)
      update: 'false',
      // Users can delete their own uploaded files
      delete: 'auth.id != null', // Could be more restrictive based on file ownership
    },
  },

  // Additional security rules can be added here
  // For example, rate limiting, content filtering, etc.
};
