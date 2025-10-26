// instant.perms.ts
// This file defines the permission rules for the Polity application
// It controls who can create, read, update, and delete data

import type { InstantRules } from '@instantdb/react';

const rules = {
  // DEVELOPMENT MODE: Allow all operations
  // WARNING: This is insecure and should only be used for development/testing
  // TODO: Re-enable proper permissions before production deployment
  $default: {
    allow: {
      create: 'true',
      view: 'true',
      update: 'true',
      delete: 'true',
    },
  },

  // User permissions
  $users: {
    allow: {
      // Users cannot create their own accounts (handled by magic code flow)
      create: 'false',
      // Users can view other users' profiles if authenticated
      view: 'auth.id != null',
      // $users namespace is read-only - no updates allowed
      update: 'false',
      // $users namespace is read-only - no deletes allowed
      delete: 'false',
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
      view: 'data.isPublic == true || isMember || isOwner',
      // Only group owners can update group details
      update: 'isOwner',
      // Only group owners can delete groups
      delete: 'isOwner',
    },
    bind: [
      'isMember',
      "auth.id in data.ref('memberships.user.id')",
      'isOwner',
      "auth.id in data.ref('owner.id')",
    ],
  },

  // Group membership permissions
  groupMemberships: {
    allow: {
      // Group owners can create memberships (invites), users can create their own requests, or existing admin members can invite
      create: 'isGroupOwner || isSelfRequest || isGroupAdmin',
      // Users can view memberships they're part of, group owners can view all, or group admins can view all
      view: 'isMember || isGroupOwner || isGroupAdmin',
      // Users can update their own membership (e.g., accepting invitations), group owners can update any, or group admins can update any
      update: 'isMember || isGroupOwner || isGroupAdmin',
      // Users can leave groups, group owners can remove members, or group admins can remove members
      delete: 'isMember || isGroupOwner || isGroupAdmin',
    },
    bind: [
      'isMember',
      "auth.id in data.ref('user.id')",
      'isGroupOwner',
      "auth.id in data.ref('group.owner.id')",
      'isSelfRequest',
      "auth.id in data.ref('user.id') && data.status == 'requested'",
      'isGroupAdmin',
      "auth.id in data.ref('group.memberships.user.id') && 'admin' in data.ref('group.memberships.status')",
    ],
  },

  // Event participant permissions
  eventParticipants: {
    allow: {
      // Event organizers can create participations (invites), users can create their own requests, or existing admin participants can invite
      create: 'isEventOrganizer || isSelfRequest || isEventAdmin',
      // Users can view participations they're part of, event organizers can view all, or event admins can view all
      view: 'isParticipant || isEventOrganizer || isEventAdmin',
      // Users can update their own participation (e.g., accepting invitations), event organizers can update any, or event admins can update any
      update: 'isParticipant || isEventOrganizer || isEventAdmin',
      // Users can leave events, event organizers can remove participants, or event admins can remove participants
      delete: 'isParticipant || isEventOrganizer || isEventAdmin',
    },
    bind: [
      'isParticipant',
      "auth.id in data.ref('user.id')",
      'isEventOrganizer',
      "auth.id in data.ref('event.organizer.id')",
      'isSelfRequest',
      "auth.id in data.ref('user.id') && data.status == 'requested'",
      'isEventAdmin',
      "auth.id in data.ref('event.participants.user.id') && 'admin' in data.ref('event.participants.status')",
    ],
  },

  // Amendment collaborator permissions
  amendmentCollaborators: {
    allow: {
      // Amendment owners can create collaborations (invites), users can create their own requests, or existing admin collaborators can invite
      create: 'isAmendmentOwner || isSelfRequest || isAmendmentAdmin',
      // Users can view collaborations they're part of, amendment owners can view all, or amendment admins can view all
      view: 'isCollaborator || isAmendmentOwner || isAmendmentAdmin',
      // Users can update their own collaboration (e.g., accepting invitations), amendment owners can update any, or amendment admins can update any
      update: 'isCollaborator || isAmendmentOwner || isAmendmentAdmin',
      // Users can leave amendments, amendment owners can remove collaborators, or amendment admins can remove collaborators
      delete: 'isCollaborator || isAmendmentOwner || isAmendmentAdmin',
    },
    bind: [
      'isCollaborator',
      "auth.id in data.ref('user.id')",
      'isAmendmentOwner',
      "auth.id in data.ref('amendment.user.id')",
      'isSelfRequest',
      "auth.id in data.ref('user.id') && data.status == 'requested'",
      'isAmendmentAdmin',
      "auth.id in data.ref('amendment.collaborators.user.id') && 'admin' in data.ref('amendment.collaborators.status')",
    ],
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

  // User profile permissions
  profiles: {
    allow: {
      // Users can create their own profile
      create: 'isOwner',
      // Anyone authenticated can view profiles
      view: 'auth.id != null',
      // Users can only update their own profile
      update: 'isOwner',
      // Users can only delete their own profile
      delete: 'isOwner',
    },
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
  },

  // User stats permissions
  stats: {
    allow: {
      // Users can create stats for themselves
      create: 'isOwner',
      // Anyone authenticated can view stats
      view: 'auth.id != null',
      // Users can only update their own stats
      update: 'isOwner',
      // Users can only delete their own stats
      delete: 'isOwner',
    },
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
  },

  // User statements permissions
  statements: {
    allow: {
      // Users can create their own statements
      create: 'isOwner',
      // Anyone authenticated can view statements
      view: 'auth.id != null',
      // Users can only update their own statements
      update: 'isOwner',
      // Users can only delete their own statements
      delete: 'isOwner',
    },
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
  },

  // User blogs permissions
  blogs: {
    allow: {
      // Users can create their own blogs
      create: 'isOwner',
      // Anyone authenticated can view blogs
      view: 'auth.id != null',
      // Users can only update their own blogs
      update: 'isOwner',
      // Users can only delete their own blogs
      delete: 'isOwner',
    },
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
  },

  // User amendments permissions
  amendments: {
    allow: {
      // Users can create their own amendments
      create: 'isOwner',
      // Anyone authenticated can view amendments
      view: 'auth.id != null',
      // Users can only update their own amendments
      update: 'isOwner',
      // Users can only delete their own amendments
      delete: 'isOwner',
    },
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
  },

  // User groups (user entity) permissions
  user: {
    allow: {
      // Users can create group entries for themselves
      create: 'isOwner',
      // Anyone authenticated can view user groups
      view: 'auth.id != null',
      // Users can only update their own group entries
      update: 'isOwner',
      // Users can only delete their own group entries
      delete: 'isOwner',
    },
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
  },

  // Follow/follower permissions
  follows: {
    allow: {
      // Users can follow other users (follower must be themselves)
      create: 'isFollower',
      // Anyone authenticated can view follow relationships
      view: 'auth.id != null',
      // No one can update follow relationships (delete and recreate instead)
      update: 'false',
      // Users can only unfollow themselves (delete their own follow records)
      delete: 'isFollower',
    },
    bind: ['isFollower', "auth.id in data.ref('follower.id')"],
  },

  // Group relationships permissions
  groupRelationships: {
    allow: {
      // Only group owners (of either parent or child) can create relationships
      create: 'isParentOwner || isChildOwner',
      // Anyone authenticated can view group relationships
      view: 'auth.id != null',
      // Only group owners can update relationships
      update: 'isParentOwner || isChildOwner',
      // Only group owners can delete relationships
      delete: 'isParentOwner || isChildOwner',
    },
    bind: [
      'isParentOwner',
      "auth.id in data.ref('parentGroup.owner.id')",
      'isChildOwner',
      "auth.id in data.ref('childGroup.owner.id')",
    ],
  },

  // Thread permissions (for discussions)
  threads: {
    allow: {
      // Any authenticated user can create threads
      create: 'auth.id != null',
      // Anyone authenticated can view threads
      view: 'auth.id != null',
      // Only thread creator can update
      update: 'isCreator',
      // Only thread creator can delete
      delete: 'isCreator',
    },
    bind: ['isCreator', "auth.id in data.ref('creator.id')"],
  },

  // Comment permissions
  comments: {
    allow: {
      // Any authenticated user can create comments
      create: 'auth.id != null',
      // Anyone authenticated can view comments
      view: 'auth.id != null',
      // Only comment creator can update
      update: 'isCreator',
      // Only comment creator can delete
      delete: 'isCreator',
    },
    bind: ['isCreator', "auth.id in data.ref('creator.id')"],
  },

  // Change requests permissions
  changeRequests: {
    allow: {
      // Any authenticated user can create change requests
      create: 'auth.id != null',
      // Anyone authenticated can view change requests
      view: 'auth.id != null',
      // Only creator can update
      update: 'isCreator',
      // Only creator can delete
      delete: 'isCreator',
    },
    bind: ['isCreator', "auth.id in data.ref('creator.id')"],
  },

  // Thread votes permissions
  threadVotes: {
    allow: {
      // Any authenticated user can vote
      create: 'auth.id != null',
      // Anyone authenticated can view votes
      view: 'auth.id != null',
      // Users can update their own votes
      update: 'isVoter',
      // Users can delete their own votes
      delete: 'isVoter',
    },
    bind: ['isVoter', "auth.id in data.ref('user.id')"],
  },

  // Comment votes permissions
  commentVotes: {
    allow: {
      // Any authenticated user can vote
      create: 'auth.id != null',
      // Anyone authenticated can view votes
      view: 'auth.id != null',
      // Users can update their own votes
      update: 'isVoter',
      // Users can delete their own votes
      delete: 'isVoter',
    },
    bind: ['isVoter', "auth.id in data.ref('user.id')"],
  },

  // Additional security rules can be added here
  // For example, rate limiting, content filtering, etc.
} satisfies InstantRules;

export default rules;
