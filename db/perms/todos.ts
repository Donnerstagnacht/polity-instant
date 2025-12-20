import type { InstantRules } from '@instantdb/react';

const rules = {
  todos: {
    allow: {
      view: 'isPublicOrAuthenticatedOrAuthorized',
      create: 'isAuthenticated && (isGroupMember || hasGroupTodoCreate)',
      update: 'isCreator || hasGroupTodoUpdate',
      delete: 'isCreator || hasGroupTodoDelete',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isCreator',
      'auth.id == data.ref("creator.id")',
      'isAssignee',
      'auth.id in data.ref("assignments.user.id")',
      'isGroupMember',
      'data.ref("group.id") in auth.ref("$user.memberships.group.id")',
      'isPublic',
      'data.visibility == "public"',
      'isAuthenticatedVisibility',
      'data.visibility == "authenticated"',
      'isPrivate',
      'data.visibility == "private"',
      'isPublicOrAuthenticatedOrAuthorized',
      'data.visibility == "public" || (data.visibility == "authenticated" && isAuthenticated) || (data.visibility == "private" && (isCreator || isAssignee)) || data.visibility == null',
      'hasGroupTodoCreate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'todos' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'create' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupTodoUpdate',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'todos' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'update' in auth.ref('$user.memberships.group.roles.actionRights.action')",
      'hasGroupTodoDelete',
      "data.ref('group.id') in auth.ref('$user.memberships.group.roles.actionRights.group.id') && " +
        "'todos' in auth.ref('$user.memberships.group.roles.actionRights.resource') && " +
        "'delete' in auth.ref('$user.memberships.group.roles.actionRights.action')",
    ],
  },
  todoAssignments: {
    allow: {
      view: 'isAssignee || isTodoCreator',
      create: 'isTodoCreator',
      update: 'isAssignee',
      delete: 'isTodoCreator',
    },
    bind: [
      'isAuthenticated',
      'auth.id != null',
      'isAssignee',
      'auth.id == data.ref("user.id")',
      'isTodoCreator',
      'auth.id == data.ref("todo.creator.id")',
    ],
  },
} satisfies InstantRules;

export default rules;
