/**
 * RBAC Constants
 *
 * Permission inheritance mappings and default role templates.
 * Ported from db/rbac/constants.ts — no InstantDB dependencies.
 */

import type { ActionType, ResourceType } from './types';

/**
 * Permission inheritance: defines which actions imply other actions.
 * E.g., 'manage' implies 'view', 'create', 'update', 'delete'.
 */
export const PERMISSION_IMPLIES: Partial<Record<ActionType, ActionType[]>> = {
  manage: ['view', 'create', 'update', 'delete'],
  moderate: ['view'],
  manage_members: ['view', 'invite_members'],
  manage_roles: ['view'],
  manage_participants: ['view'],
  manage_speakers: ['view'],
  manage_votes: ['view'],
  manageNotifications: ['viewNotifications'],
};

/**
 * Default role templates for new groups.
 * These can be used to auto-generate roles when a group is created.
 */
export const DEFAULT_GROUP_ROLES = [
  {
    name: 'Admin',
    description: 'Full group control',
    permissions: [
      { resource: 'agendaItems' as ResourceType, action: 'manage' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'view' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'view' as ActionType },
      { resource: 'blogs' as ResourceType, action: 'manage' as ActionType },
      { resource: 'blogs' as ResourceType, action: 'view' as ActionType },
      { resource: 'comments' as ResourceType, action: 'moderate' as ActionType },
      { resource: 'elections' as ResourceType, action: 'manage' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage_participants' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage_speakers' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage_votes' as ActionType },
      { resource: 'events' as ResourceType, action: 'active_voting' as ActionType },
      { resource: 'events' as ResourceType, action: 'passive_voting' as ActionType },
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      { resource: 'groupDocuments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupDocuments' as ResourceType, action: 'view' as ActionType },
      { resource: 'groupLinks' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupLinks' as ResourceType, action: 'view' as ActionType },
      { resource: 'groupMemberships' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupMemberships' as ResourceType, action: 'view' as ActionType },
      {
        resource: 'groupNotifications' as ResourceType,
        action: 'manageNotifications' as ActionType,
      },
      {
        resource: 'groupNotifications' as ResourceType,
        action: 'viewNotifications' as ActionType,
      },
      { resource: 'groupPayments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupPayments' as ResourceType, action: 'view' as ActionType },
      { resource: 'groupPositions' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupPositions' as ResourceType, action: 'view' as ActionType },
      { resource: 'groupRelationships' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupRelationships' as ResourceType, action: 'view' as ActionType },
      { resource: 'groupRoles' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupRoles' as ResourceType, action: 'view' as ActionType },
      { resource: 'groups' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groups' as ResourceType, action: 'view' as ActionType },
      { resource: 'groupTodos' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupTodos' as ResourceType, action: 'view' as ActionType },
      { resource: 'messages' as ResourceType, action: 'manage' as ActionType },
      { resource: 'messages' as ResourceType, action: 'view' as ActionType },
    ],
  },
  {
    name: 'Moderator',
    description: 'Content moderation',
    permissions: [
      { resource: 'amendments' as ResourceType, action: 'moderate' as ActionType },
      { resource: 'comments' as ResourceType, action: 'moderate' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      {
        resource: 'groupNotifications' as ResourceType,
        action: 'viewNotifications' as ActionType,
      },
    ],
  },
  {
    name: 'Member',
    description: 'Standard member access',
    permissions: [
      { resource: 'amendments' as ResourceType, action: 'create' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'view' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'vote' as ActionType },
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      {
        resource: 'groupNotifications' as ResourceType,
        action: 'viewNotifications' as ActionType,
      },
      { resource: 'messages' as ResourceType, action: 'manage' as ActionType },
    ],
  },
];

/**
 * Default role templates for blogs.
 */
export const DEFAULT_BLOG_ROLES = [
  {
    name: 'Owner',
    description: 'Full blog control',
    permissions: [
      { resource: 'blogs' as ResourceType, action: 'manage' as ActionType },
      { resource: 'blogBloggers' as ResourceType, action: 'manage' as ActionType },
    ],
  },
  {
    name: 'Writer',
    description: 'Can write and edit posts',
    permissions: [
      { resource: 'blogs' as ResourceType, action: 'view' as ActionType },
      { resource: 'blogs' as ResourceType, action: 'update' as ActionType },
    ],
  },
];

/**
 * Available action rights for amendment-scoped roles.
 * This is the single source of truth for amendment collaborator permissions.
 */
export const AMENDMENT_ACTION_RIGHTS = [
  { resource: 'amendments' as ResourceType, action: 'manage' as ActionType, label: 'Manage Amendment' },
  { resource: 'amendments' as ResourceType, action: 'view' as ActionType, label: 'View Amendment' },
  { resource: 'amendments' as ResourceType, action: 'create' as ActionType, label: 'Create Amendment' },
  { resource: 'amendments' as ResourceType, action: 'update' as ActionType, label: 'Update Amendment' },
  { resource: 'amendments' as ResourceType, action: 'delete' as ActionType, label: 'Delete Amendment' },
  { resource: 'amendments' as ResourceType, action: 'vote' as ActionType, label: 'Vote on Amendment' },
  { resource: 'amendments' as ResourceType, action: 'moderate' as ActionType, label: 'Moderate Amendment' },
  { resource: 'documents' as ResourceType, action: 'view' as ActionType, label: 'View Document' },
  { resource: 'documents' as ResourceType, action: 'update' as ActionType, label: 'Edit Document' },
  { resource: 'threads' as ResourceType, action: 'create' as ActionType, label: 'Create Threads' },
  { resource: 'threads' as ResourceType, action: 'update' as ActionType, label: 'Update Threads' },
  { resource: 'threads' as ResourceType, action: 'delete' as ActionType, label: 'Delete Threads' },
  { resource: 'comments' as ResourceType, action: 'create' as ActionType, label: 'Create Comments' },
  { resource: 'comments' as ResourceType, action: 'update' as ActionType, label: 'Update Comments' },
  { resource: 'comments' as ResourceType, action: 'delete' as ActionType, label: 'Delete Comments' },
  {
    resource: 'notifications' as ResourceType,
    action: 'manageNotifications' as ActionType,
    label: 'Manage Notifications',
  },
  {
    resource: 'notifications' as ResourceType,
    action: 'viewNotifications' as ActionType,
    label: 'View Notifications',
  },
] as const;

/**
 * Default role templates for amendments.
 */
export const DEFAULT_AMENDMENT_ROLES = [
  {
    name: 'Author',
    description: 'Full amendment control',
    permissions: AMENDMENT_ACTION_RIGHTS.map(({ resource, action }) => ({ resource, action })),
  },
  {
    name: 'Collaborator',
    description: 'Can edit the amendment',
    permissions: [
      { resource: 'amendments' as ResourceType, action: 'view' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'update' as ActionType },
      {
        resource: 'groupNotifications' as ResourceType,
        action: 'viewNotifications' as ActionType,
      },
    ],
  },
];

/**
 * Default role templates for events.
 */
export const DEFAULT_EVENT_ROLES = [
  {
    name: 'Organizer',
    description: 'Event organizer with full permissions',
    permissions: [
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      { resource: 'events' as ResourceType, action: 'update' as ActionType },
      { resource: 'events' as ResourceType, action: 'delete' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage_participants' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage_speakers' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage_votes' as ActionType },
      { resource: 'events' as ResourceType, action: 'active_voting' as ActionType },
      { resource: 'events' as ResourceType, action: 'passive_voting' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'view' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'create' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'update' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'delete' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'manage' as ActionType },
      {
        resource: 'notifications' as ResourceType,
        action: 'manageNotifications' as ActionType,
      },
      {
        resource: 'notifications' as ResourceType,
        action: 'viewNotifications' as ActionType,
      },
    ],
  },
  {
    name: 'Voter',
    description: 'Event participant with voting rights',
    permissions: [
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      { resource: 'events' as ResourceType, action: 'active_voting' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'view' as ActionType },
      {
        resource: 'notifications' as ResourceType,
        action: 'viewNotifications' as ActionType,
      },
    ],
  },
  {
    name: 'Participant',
    description: 'Regular event participant',
    permissions: [
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      { resource: 'events' as ResourceType, action: 'active_voting' as ActionType },
      { resource: 'events' as ResourceType, action: 'passive_voting' as ActionType },
      { resource: 'agendaItems' as ResourceType, action: 'view' as ActionType },
      {
        resource: 'notifications' as ResourceType,
        action: 'viewNotifications' as ActionType,
      },
    ],
  },
];

/**
 * Available action rights for group membership management UI.
 * Used to display permission options when creating or editing roles.
 * Sorted alphabetically by resource, then by action (manage before view).
 */
export const ACTION_RIGHTS = [
  // agendaItems
  { resource: 'agendaItems', action: 'manage', label: 'Manage Agenda Items' },
  { resource: 'agendaItems', action: 'view', label: 'View Agenda Items' },
  // amendments
  { resource: 'amendments', action: 'manage', label: 'Manage Amendments' },
  { resource: 'amendments', action: 'view', label: 'View Amendments' },
  // blogs
  { resource: 'blogs', action: 'manage', label: 'Manage Blogs' },
  { resource: 'blogs', action: 'view', label: 'View Blogs' },
  // comments
  { resource: 'comments', action: 'moderate', label: 'Moderate Comments' },
  // elections
  { resource: 'elections', action: 'manage', label: 'Manage Elections' },
  // events
  { resource: 'events', action: 'manage', label: 'Manage Events' },
  { resource: 'events', action: 'manage_participants', label: 'Manage Event Participants' },
  { resource: 'events', action: 'manage_speakers', label: 'Manage Speakers' },
  { resource: 'events', action: 'manage_votes', label: 'Manage Votes' },
  { resource: 'events', action: 'active_voting', label: 'Active Voting Rights' },
  {
    resource: 'events',
    action: 'passive_voting',
    label: 'Passive Voting Rights (Can Be Candidate)',
  },
  { resource: 'events', action: 'view', label: 'View Events' },
  // groupDocuments
  { resource: 'groupDocuments', action: 'manage', label: 'Manage Documents' },
  { resource: 'groupDocuments', action: 'view', label: 'View Documents' },
  // groupLinks
  { resource: 'groupLinks', action: 'manage', label: 'Manage Links' },
  { resource: 'groupLinks', action: 'view', label: 'View Links' },
  // groupMemberships
  { resource: 'groupMemberships', action: 'manage', label: 'Manage Members' },
  { resource: 'groupMemberships', action: 'view', label: 'View Members' },
  // groupNotifications
  { resource: 'groupNotifications', action: 'manageNotifications', label: 'Manage Notifications' },
  { resource: 'groupNotifications', action: 'viewNotifications', label: 'View Notifications' },
  // groupPayments
  { resource: 'groupPayments', action: 'manage', label: 'Manage Payments' },
  { resource: 'groupPayments', action: 'view', label: 'View Payments' },
  // groupPositions
  { resource: 'groupPositions', action: 'manage', label: 'Manage Positions' },
  { resource: 'groupPositions', action: 'view', label: 'View Positions' },
  // groupRelationships
  { resource: 'groupRelationships', action: 'manage', label: 'Manage Group Relationships' },
  { resource: 'groupRelationships', action: 'view', label: 'View Group Relationships' },
  // groupRoles
  { resource: 'groupRoles', action: 'manage', label: 'Manage Roles' },
  { resource: 'groupRoles', action: 'view', label: 'View Roles' },
  // groups
  { resource: 'groups', action: 'manage', label: 'Manage Group Settings' },
  { resource: 'groups', action: 'view', label: 'View Group' },
  // groupTodos
  { resource: 'groupTodos', action: 'manage', label: 'Manage Todos' },
  { resource: 'groupTodos', action: 'view', label: 'View Todos' },
  // messages
  { resource: 'messages', action: 'manage', label: 'Manage Messages' },
  { resource: 'messages', action: 'view', label: 'View Messages' },
] as const;
