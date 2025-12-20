import type { InstantRules } from '@instantdb/react';

const rules = {
  timelineEvents: {
    allow: {
      view: 'isRelevantUser',
      create: 'false',
      update: 'false',
      delete: 'false',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isRelevantUser',
      'auth.id == data.ref("user.id") || ' +
        'auth.id == data.ref("actor.id") || ' +
        'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
    ],
  },
  subscribers: {
    allow: {
      view: 'isSubscriber || isTarget',
      create: 'isSubscriber',
      update: 'false',
      delete: 'isSubscriber',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isSubscriber',
      'auth.id == data.ref("subscriber.id")',
      'isTarget',
      'auth.id == data.ref("user.id") || auth.id == data.ref("group.owner.id")',
    ],
  },
  hashtags: {
    allow: {
      view: 'isAuthenticated',
      create: 'isContentCreator',
      update: 'false',
      delete: 'isContentCreator',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isContentCreator',
      'auth.id == data.ref("amendment.user.id") || ' +
        'auth.id == data.ref("blog.user.id") || ' +
        'auth.id == data.ref("event.creator.id") || ' +
        'auth.id == data.ref("group.owner.id")',
    ],
  },
  links: {
    bind: [
      'isGroupOwner',
      "auth.id in data.ref('group.owner.id')",
      'isUserOwner',
      "auth.id in data.ref('user.id')",
      'isSlotOwner',
      "auth.id in data.ref('meetingSlot.owner.id')",
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'hasGroupLinkCreate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'links' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupLinkUpdate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'links' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupLinkDelete',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'links' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
    allow: {
      view: 'auth.id != null',
      create: 'isGroupOwner || isUserOwner || isSlotOwner || hasGroupLinkCreate',
      delete: 'isGroupOwner || isUserOwner || isSlotOwner || hasGroupLinkDelete',
      update: 'isGroupOwner || isUserOwner || isSlotOwner || hasGroupLinkUpdate',
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
} satisfies InstantRules;

export default rules;
