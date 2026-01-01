/**
 * RBAC Constants
 *
 * Permission inheritance mappings and default role templates.
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
      { resource: 'groups' as ResourceType, action: 'manage' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupRoles' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupMemberships' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupPositions' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupRelationships' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupTodos' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupLinks' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupPayments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupDocuments' as ResourceType, action: 'manage' as ActionType },
    ],
  },
  {
    name: 'Moderator',
    description: 'Content moderation',
    permissions: [
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'moderate' as ActionType },
      { resource: 'comments' as ResourceType, action: 'moderate' as ActionType },
    ],
  },
  {
    name: 'Member',
    description: 'Standard member access',
    permissions: [
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'view' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'create' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'vote' as ActionType },
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
 * Default role templates for amendments.
 */
export const DEFAULT_AMENDMENT_ROLES = [
  {
    name: 'Author',
    description: 'Full amendment control',
    permissions: [
      { resource: 'amendments' as ResourceType, action: 'manage' as ActionType },
    ],
  },
  {
    name: 'Collaborator',
    description: 'Can edit the amendment',
    permissions: [
      { resource: 'amendments' as ResourceType, action: 'view' as ActionType },
      { resource: 'amendments' as ResourceType, action: 'update' as ActionType },
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
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      { resource: 'eventParticipants' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupNotifications' as ResourceType, action: 'manageNotifications' as ActionType },
    ],
  },
  {
    name: 'Participant',
    description: 'Regular event participant',
    permissions: [
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
    ],
  },
];

/**
 * Available action rights for group membership management UI.
 * Used to display permission options when creating or editing roles.
 */
export const ACTION_RIGHTS = [
  { resource: 'messages', action: 'manage', label: 'Manage Messages' },
  { resource: 'messages', action: 'view', label: 'View Messages' },
  { resource: 'events', action: 'manage', label: 'Manage Events' },
  { resource: 'events', action: 'view', label: 'View Events' },
  { resource: 'events', action: 'manage_participants', label: 'Manage Event Participants' },
  { resource: 'events', action: 'manage_speakers', label: 'Manage Speakers' },
  { resource: 'events', action: 'manage_votes', label: 'Manage Votes' },
  { resource: 'agendaItems', action: 'manage', label: 'Manage Agenda Items' },
  { resource: 'agendaItems', action: 'view', label: 'View Agenda Items' },
  { resource: 'amendments', action: 'manage', label: 'Manage Amendments' },
  { resource: 'amendments', action: 'view', label: 'View Amendments' },
  { resource: 'blogs', action: 'manage', label: 'Manage Blogs' },
  { resource: 'blogs', action: 'view', label: 'View Blogs' },
  { resource: 'groupRelationships', action: 'manage', label: 'Manage Group Relationships' },
  { resource: 'groupTodos', action: 'manage', label: 'Manage Todos' },
  { resource: 'groupTodos', action: 'view', label: 'View Todos' },
  { resource: 'elections', action: 'manage', label: 'Manage Elections' },
  { resource: 'groupPositions', action: 'manage', label: 'Manage Positions' },
  { resource: 'groupPayments', action: 'manage', label: 'Manage Payments' },
  { resource: 'groupPayments', action: 'view', label: 'View Payments' },
  { resource: 'groupNotifications', action: 'manageNotifications', label: 'Manage Notifications' },
  { resource: 'groupLinks', action: 'manage', label: 'Manage Links' },
  { resource: 'groupLinks', action: 'view', label: 'View Links' },
  { resource: 'groupDocuments', action: 'manage', label: 'Manage Documents' },
  { resource: 'groupDocuments', action: 'view', label: 'View Documents' },
] as const;
