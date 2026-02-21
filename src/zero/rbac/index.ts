/**
 * RBAC Module
 *
 * Role-Based Access Control system for the Polity application.
 * Ported from db/rbac/ — all InstantDB dependencies removed.
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
  AmendmentRoleCollaborator,
  PermissionContext,
} from './types';

// Constants
export {
  PERMISSION_IMPLIES,
  DEFAULT_GROUP_ROLES,
  DEFAULT_BLOG_ROLES,
  DEFAULT_AMENDMENT_ROLES,
  DEFAULT_EVENT_ROLES,
  ACTION_RIGHTS,
} from './constants';

// Helper functions
export {
  isSelf,
  hasGroupPermission,
  hasEventPermission,
  hasBlogPermission,
  hasAmendmentPermission,
  hasActiveVotingRight,
  hasPassiveVotingRight,
  isGroupMember,
  isEventParticipant,
  isBlogger,
  isAmendmentCollaborator,
  isAmendmentAuthor,
} from './helpers';

// Workflow constants
export type {
  WorkflowStatus,
  AmendmentStatus,
  VotingSessionType,
  VotingSessionStatus,
  ChangeRequestSource,
} from './workflow-constants';

export {
  WORKFLOW_TRANSITIONS,
  COLLABORATOR_SELECTABLE_STATUSES,
  EVENT_CONTROLLED_STATUSES,
  TERMINAL_STATUSES,
  WORKFLOW_STATUS_METADATA,
  canTransitionTo,
  isEventPhase,
  isTerminalStatus,
  isSelectableByCollaborator,
  getDefaultWorkflowStatus,
} from './workflow-constants';

// Queries
export { rbacQueries } from './queries';

// Hooks
export { usePermissions } from './usePermissions';
