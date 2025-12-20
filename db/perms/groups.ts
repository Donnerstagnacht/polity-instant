import type { InstantRules } from '@instantdb/react';

const rules = {
  groups: {
    bind: [
      'isMember',
      "auth.id in data.ref('memberships.user.id')",
      'isOwner',
      "auth.id in data.ref('owner.id')",
      'isAdmin',
      "auth.id in data.ref('memberships.user.id') && ('admin' in data.ref('memberships.status') || 'admin' in data.ref('memberships.role'))",
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isAuthenticated',
      'auth.id != null',
      'isPublicOrAuthenticatedOrMember',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && isMember) || data.visibility == null || data.isPublic == true',
    ],
    allow: {
      view: 'isPublicOrAuthenticatedOrMember',
      create: 'auth.id != null',
      delete: 'isOwner',
      update: 'isOwner || isAdmin',
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
  groupRelationships: {
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      'data.ref("parentGroup.id") in auth.ref("$user.memberships.group.id") || ' +
        'data.ref("childGroup.id") in auth.ref("$user.memberships.group.id")',
      'isParentGroupAdmin',
      "data.ref('parentGroup.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'groups' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage_relationships' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
    allow: {
      view: 'isGroupMember',
      create: 'isParentGroupAdmin',
      update: 'isParentGroupAdmin',
      delete: 'isParentGroupAdmin',
    },
  },
  roles: {
    allow: {
      view: 'isAuthenticated',
      create: 'isGroupAdmin',
      update: 'isGroupAdmin',
      delete: 'isGroupAdmin',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupAdmin',
      "'admin' in auth.ref('$user.memberships.group.roles.name')",
    ],
  },
  actionRights: {
    allow: {
      view: 'isAuthenticated',
      create: 'isGroupAdmin',
      update: 'isGroupAdmin',
      delete: 'isGroupAdmin',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupAdmin',
      "'admin' in auth.ref('$user.memberships.group.roles.name')",
    ],
  },
  positions: {
    allow: {
      view: 'isGroupMember',
      create: 'hasManagePositions',
      update: 'hasManagePositions',
      delete: 'hasManagePositions',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'hasManagePositions',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'positions' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'manage' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
} satisfies InstantRules;

export default rules;
