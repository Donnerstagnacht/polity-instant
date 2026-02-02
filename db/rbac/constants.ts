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
      { resource: 'amendments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupDocuments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupLinks' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupMemberships' as ResourceType, action: 'manage' as ActionType },
      {
        resource: 'groupNotifications' as ResourceType,
        action: 'manageNotifications' as ActionType,
      },
      { resource: 'groupPayments' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupPositions' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupRelationships' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupRoles' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groups' as ResourceType, action: 'manage' as ActionType },
      { resource: 'groupTodos' as ResourceType, action: 'manage' as ActionType },
      { resource: 'messages' as ResourceType, action: 'manage' as ActionType },
    ],
  },
  {
    name: 'Moderator',
    description: 'Content moderation',
    permissions: [
      { resource: 'amendments' as ResourceType, action: 'moderate' as ActionType },
      { resource: 'comments' as ResourceType, action: 'moderate' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
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
 * Default role templates for amendments.
 */
export const DEFAULT_AMENDMENT_ROLES = [
  {
    name: 'Author',
    description: 'Full amendment control',
    permissions: [{ resource: 'amendments' as ResourceType, action: 'manage' as ActionType }],
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
      { resource: 'agendaItems' as ResourceType, action: 'manage' as ActionType },
      { resource: 'events' as ResourceType, action: 'manage' as ActionType },
      { resource: 'eventParticipants' as ResourceType, action: 'manage' as ActionType },
      {
        resource: 'groupNotifications' as ResourceType,
        action: 'manageNotifications' as ActionType,
      },
      { resource: 'events' as ResourceType, action: 'active_voting' as ActionType },
    ],
  },
  {
    name: 'Voter',
    description: 'Event participant with voting rights',
    permissions: [
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      { resource: 'events' as ResourceType, action: 'active_voting' as ActionType },
    ],
  },
  {
    name: 'Participant',
    description: 'Regular event participant',
    permissions: [
      { resource: 'events' as ResourceType, action: 'view' as ActionType },
      { resource: 'events' as ResourceType, action: 'active_voting' as ActionType },
      { resource: 'events' as ResourceType, action: 'passive_voting' as ActionType },
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
