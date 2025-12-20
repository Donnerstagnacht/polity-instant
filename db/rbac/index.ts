/**
 * RBAC Module
 *
 * Role-Based Access Control system for the Polity application.
 */

// Types
export type {
  ResourceType,
  ActionType,
  ActionRight,
  Role,
  Membership,
  Participation,
  BloggerRelation,
  Amendment,
  AmendmentCollaborator,
  PermissionContext,
} from './types';

// Constants
export {
  PERMISSION_IMPLIES,
  DEFAULT_GROUP_ROLES,
  DEFAULT_BLOG_ROLES,
  DEFAULT_AMENDMENT_ROLES,
  DEFAULT_EVENT_ROLES,
} from './constants';

// Helper functions
export {
  isSelf,
  hasGroupPermission,
  hasEventPermission,
  hasBlogPermission,
  hasAmendmentPermission,
  isGroupMember,
  isEventParticipant,
  isBlogger,
  isAmendmentCollaborator,
  isAmendmentAuthor,
} from './helpers';

// Hooks
export { usePermissions } from './usePermissions';
