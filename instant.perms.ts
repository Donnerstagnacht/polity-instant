// Docs: https://www.instantdb.com/docs/permissions

import type { InstantRules } from '@instantdb/react';

const rules = {
  amendmentCollaborators: {
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
    allow: {
      view: 'isCollaborator || isAmendmentOwner || isAmendmentAdmin',
      create: 'isAmendmentOwner || isSelfRequest || isAmendmentAdmin',
      delete: 'isCollaborator || isAmendmentOwner || isAmendmentAdmin',
      update: 'isCollaborator || isAmendmentOwner || isAmendmentAdmin',
    },
  },
  threads: {
    bind: ['isCreator', "auth.id in data.ref('creator.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: 'isCreator',
      update: 'isCreator',
    },
  },
  blogs: {
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  user: {
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  statements: {
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  eventParticipants: {
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
    allow: {
      view: 'isParticipant || isEventOrganizer || isEventAdmin',
      create: 'isEventOrganizer || isSelfRequest || isEventAdmin',
      delete: 'isParticipant || isEventOrganizer || isEventAdmin',
      update: 'isParticipant || isEventOrganizer || isEventAdmin',
    },
  },
  groupMemberships: {
    bind: [
      'isMember',
      "auth.id in data.ref('user.id')",
      'isGroupOwner',
      "auth.id in data.ref('group.owner.id')",
      'isSelfRequest',
      "auth.id in data.ref('user.id') && data.status == 'requested'",
      'isGroupAdmin',
      "auth.id in data.ref('group.memberships.user.id') && ('admin' in data.ref('group.memberships.status') || 'admin' in data.ref('group.memberships.role'))",
    ],
    allow: {
      view: 'isMember || isGroupOwner || isGroupAdmin',
      create: 'isGroupOwner || isSelfRequest || isGroupAdmin',
      delete: 'isMember || isGroupOwner || isGroupAdmin',
      update: 'isMember || isGroupOwner || isGroupAdmin',
    },
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
  $users: {
    allow: {
      view: 'auth.id != null',
      create: 'false',
      delete: 'false',
      update: 'false',
    },
  },
  groupRelationships: {
    bind: [
      'isParentOwner',
      "auth.id in data.ref('parentGroup.owner.id')",
      'isChildOwner',
      "auth.id in data.ref('childGroup.owner.id')",
    ],
    allow: {
      view: 'auth.id != null',
      create: 'isParentOwner || isChildOwner',
      delete: 'isParentOwner || isChildOwner',
      update: 'isParentOwner || isChildOwner',
    },
  },
  changeRequests: {
    bind: ['isCreator', "auth.id in data.ref('creator.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: 'isCreator',
      update: 'isCreator',
    },
  },
  profiles: {
    bind: ['isOwner', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  $default: {
    allow: {
      view: 'true',
      create: 'true',
      delete: 'true',
      update: 'true',
    },
  },
  magicCodes: {
    allow: {
      view: 'false',
      create: 'true',
      delete: 'false',
      update: 'false',
    },
  },
  comments: {
    bind: ['isCreator', "auth.id in data.ref('creator.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: 'isCreator',
      update: 'isCreator',
    },
  },
  amendments: {
    bind: [
      'isOwner',
      "auth.id in data.ref('user.id')",
      'isAdmin',
      "auth.id in data.ref('collaborators.user.id') && 'admin' in data.ref('collaborators.status')",
    ],
    allow: {
      view: 'auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner || isAdmin',
    },
  },
  $files: {
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: 'auth.id != null',
      update: 'false',
    },
  },
  threadVotes: {
    bind: ['isVoter', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: 'isVoter',
      update: 'isVoter',
    },
  },
  commentVotes: {
    bind: ['isVoter', "auth.id in data.ref('user.id')"],
    allow: {
      view: 'auth.id != null',
      create: 'auth.id != null',
      delete: 'isVoter',
      update: 'isVoter',
    },
  },
  groups: {
    bind: [
      'isMember',
      "auth.id in data.ref('memberships.user.id')",
      'isOwner',
      "auth.id in data.ref('owner.id')",
      'isAdmin',
      "auth.id in data.ref('memberships.user.id') && ('admin' in data.ref('memberships.status') || 'admin' in data.ref('memberships.role'))",
    ],
    allow: {
      view: 'data.isPublic == true || isMember || isOwner',
      create: 'auth.id != null',
      delete: 'isOwner',
      update: 'isOwner || isAdmin',
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
  meetingSlots: {
    bind: ['isOwner', "auth.id in data.ref('owner.id')"],
    allow: {
      view: 'data.isPublic == true || isOwner || auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner',
    },
  },
  meetingBookings: {
    bind: [
      'isBooker',
      "auth.id in data.ref('booker.id')",
      'isSlotOwner',
      "auth.id in data.ref('slot.owner.id')",
    ],
    allow: {
      view: 'isBooker || isSlotOwner',
      create: 'isBooker',
      delete: 'isBooker || isSlotOwner',
      update: 'isBooker || isSlotOwner',
    },
  },
  links: {
    bind: [
      'isGroupOwner',
      "auth.id in data.ref('group.owner.id')",
      'isUserOwner',
      "auth.id in data.ref('user.id')",
      'isSlotOwner',
      "auth.id in data.ref('meetingSlot.owner.id')",
    ],
    allow: {
      view: 'auth.id != null',
      create: 'isGroupOwner || isUserOwner || isSlotOwner',
      delete: 'isGroupOwner || isUserOwner || isSlotOwner',
      update: 'isGroupOwner || isUserOwner || isSlotOwner',
    },
  },
} satisfies InstantRules;

export default rules;
