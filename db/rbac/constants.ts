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
      { resource: 'roles' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupMemberships' as ResourceType, action: 'manage' as ActionType },
      { resource: 'positions' as ResourceType, action: 'manage' as ActionType },
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
      { resource: 'notifications' as ResourceType, action: 'manageNotifications' as ActionType },
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
  { resource: 'messages', action: 'create', label: 'Create Messages' },
  { resource: 'messages', action: 'read', label: 'Read Messages' },
  { resource: 'messages', action: 'update', label: 'Update Messages' },
  { resource: 'messages', action: 'delete', label: 'Delete Messages' },
  { resource: 'events', action: 'create', label: 'Create Events' },
  { resource: 'events', action: 'update', label: 'Update Events' },
  { resource: 'events', action: 'delete', label: 'Delete Events' },
  { resource: 'events', action: 'manage_participants', label: 'Manage Event Participants' },
  { resource: 'events', action: 'manage_speakers', label: 'Manage Speakers' },
  { resource: 'events', action: 'manage_votes', label: 'Manage Votes' },
  { resource: 'agendaItems', action: 'create', label: 'Create Agenda Items' },
  { resource: 'agendaItems', action: 'update', label: 'Update Agenda Items' },
  { resource: 'agendaItems', action: 'delete', label: 'Delete Agenda Items' },
  { resource: 'amendments', action: 'manage', label: 'Manage Amendments' },
  { resource: 'amendments', action: 'create', label: 'Create Amendments' },
  { resource: 'amendments', action: 'view', label: 'View Amendments' },
  { resource: 'amendments', action: 'update', label: 'Update Amendments' },
  { resource: 'amendments', action: 'delete', label: 'Delete Amendments' },
  { resource: 'blogs', action: 'create', label: 'Create Blogs' },
  { resource: 'blogs', action: 'update', label: 'Update Blogs' },
  { resource: 'blogs', action: 'delete', label: 'Delete Blogs' },
  { resource: 'blogs', action: 'manage', label: 'Manage Blogs' },
  { resource: 'groups', action: 'manage_relationships', label: 'Manage Group Relationships' },
  { resource: 'todos', action: 'create', label: 'Create Todos' },
  { resource: 'todos', action: 'update', label: 'Update Todos' },
  { resource: 'todos', action: 'delete', label: 'Delete Todos' },
  { resource: 'elections', action: 'manage', label: 'Manage Elections' },
  { resource: 'positions', action: 'manage', label: 'Manage Positions' },
  { resource: 'payments', action: 'create', label: 'Create Payments' },
  { resource: 'notifications', action: 'manageNotifications', label: 'Manage Notifications' },
  { resource: 'payments', action: 'update', label: 'Update Payments' },
  { resource: 'payments', action: 'delete', label: 'Delete Payments' },
  { resource: 'links', action: 'create', label: 'Create Links' },
  { resource: 'links', action: 'update', label: 'Update Links' },
  { resource: 'links', action: 'delete', label: 'Delete Links' },
] as const;
