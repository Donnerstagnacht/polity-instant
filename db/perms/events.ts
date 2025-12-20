import type { InstantRules } from '@instantdb/react';

const rules = {
  events: {
    allow: {
      view: 'isPublicOrAuthenticatedOrAuthorized',
      create: 'hasGroupEventCreatePermission',
      update: 'hasGroupEventUpdatePermission || hasEventUpdatePermission',
      delete: 'hasGroupEventDeletePermission || hasEventDeletePermission',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      "data.ref('group.id') in auth.ref('$user.memberships.group.id')",
      'isParticipant',
      "auth.id in data.ref('participants.user.id')",
      'isCreator',
      "auth.id == data.ref('creator.id')",
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrAuthorized',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && (isGroupMember || isParticipant)) || data.visibility == null || data.isPublic == true',
      'hasGroupEventCreatePermission',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupEventUpdatePermission',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupEventDeletePermission',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasEventUpdatePermission',
      "data.id in auth.ref('$user.participations.role.actionRights.event.id') && " +
        "'events' in auth.ref('$user.participations.role.actionRights.resource') && " +
        "'update' in auth.ref('$user.participations.role.actionRights.action')",
      'hasEventDeletePermission',
      "data.id in auth.ref('$user.participations.role.actionRights.event.id') && " +
        "'events' in auth.ref('$user.participations.role.actionRights.resource') && " +
        "'delete' in auth.ref('$user.participations.role.actionRights.action')",
    ],
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
  participants: {
    allow: {
      view: 'isGroupMember || isSelf',
      create: 'hasGroupEventManageParticipants || hasEventManageParticipants',
      update: 'hasGroupEventManageParticipants || hasEventManageParticipants || isSelf',
      delete: 'hasGroupEventManageParticipants || hasEventManageParticipants || isSelf',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSelf',
      'auth.id == data.ref("$user.id")',
      'isGroupMember',
      'data.ref("event.group.id") in auth.ref("$user.memberships.group.id")',
      'hasGroupEventManageParticipants',
      "data.ref('event.group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'events' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage_participants' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasEventManageParticipants',
      "data.ref('event.id') in auth.ref('$user.participations.role.actionRights.event.id') && " +
        "'events' in auth.ref('$user.participations.role.actionRights.resource') && " +
        "'manage_participants' in auth.ref('$user.participations.role.actionRights.action')",
    ],
  },
  meetingSlots: {
    bind: ['isOwner', "auth.id in data.ref('owner.id')"],
    allow: {
      view: 'data.isPublic == true || isOwner || auth.id != null',
      create: 'isOwner',
      delete: 'isOwner',
      update: 'isOwner || auth.id != null', // Allow authenticated users to book slots
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
      create: 'auth.id != null', // Allow any authenticated user to create a booking
      delete: 'isBooker || isSlotOwner',
      update: 'isBooker || isSlotOwner',
    },
  },
} satisfies InstantRules;

export default rules;
