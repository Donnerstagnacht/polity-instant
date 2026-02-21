/**
 * RBAC Helper Functions
 *
 * Core permission checking functions for the Role-Based Access Control system.
 * These work across all scopes: Group, Event, Blog, Amendment.
 * Ported from db/rbac/helpers.ts — no InstantDB dependencies.
 */

import { PERMISSION_IMPLIES } from './constants';
import type {
  Membership,
  Participation,
  BloggerRelation,
  Amendment,
  ResourceType,
  ActionType,
} from './types';

// ============================================================================
// Internal Helpers
// ============================================================================

/**
 * Check if userAction satisfies requiredAction via inheritance.
 * E.g., if user has 'manage' and we need 'delete', returns true.
 */
function checkWithInheritance(userAction: ActionType, requiredAction: ActionType): boolean {
  if (userAction === requiredAction) return true;
  return PERMISSION_IMPLIES[userAction]?.includes(requiredAction) ?? false;
}

// ============================================================================
// Identity Helpers
// ============================================================================

/**
 * Check if target user is the authenticated user.
 */
export function isSelf(targetUserId: string | undefined, authUserId: string | undefined): boolean {
  if (!targetUserId || !authUserId) return false;
  return targetUserId === authUserId;
}

// ============================================================================
// Scope Permission Helpers
// ============================================================================

/**
 * Check if user has group-level permission for a specific resource and action.
 */
export function hasGroupPermission(
  memberships: Membership[] | undefined,
  groupId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  if (!memberships) return false;

  return memberships.some(
    m =>
      m.group?.id === groupId &&
      m.role?.actionRights?.some(
        right =>
          right.resource === resource &&
          checkWithInheritance(right.action, action) &&
          right.group?.id === groupId
      )
  );
}

/**
 * Check if user has event-level permission for a specific resource and action.
 */
export function hasEventPermission(
  participations: Participation[] | undefined,
  eventId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  if (!participations) return false;

  return participations.some(
    p =>
      p.event?.id === eventId &&
      p.role?.actionRights?.some(
        right =>
          right.resource === resource &&
          checkWithInheritance(right.action, action) &&
          right.event?.id === eventId
      )
  );
}

/**
 * Check if user has active voting rights in an event.
 */
export function hasActiveVotingRight(
  participations: Participation[] | undefined,
  eventId: string
): boolean {
  return hasEventPermission(participations, eventId, 'events', 'active_voting');
}

/**
 * Check if user has passive voting rights in an event.
 */
export function hasPassiveVotingRight(
  participations: Participation[] | undefined,
  eventId: string
): boolean {
  return hasEventPermission(participations, eventId, 'events', 'passive_voting');
}

/**
 * Check if user has blog-level permission for a specific resource and action.
 */
export function hasBlogPermission(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  if (!bloggerRelations) return false;

  return bloggerRelations.some(
    b =>
      b.blog?.id === blogId &&
      b.role?.actionRights?.some(
        right =>
          right.resource === resource &&
          checkWithInheritance(right.action, action) &&
          right.blog?.id === blogId
      )
  );
}

/**
 * Check if user has amendment-level permission via collaborator roles.
 */
export function hasAmendmentPermission(
  amendment: Amendment | undefined,
  userId: string,
  resource: ResourceType,
  action: ActionType
): boolean {
  // Check new structure first
  if (amendment?.amendmentRoleCollaborators) {
    const collaborator = amendment.amendmentRoleCollaborators.find(c => c.user?.id === userId);
    if (collaborator?.role?.actionRights) {
      return collaborator.role.actionRights.some(
        right => right.resource === resource && checkWithInheritance(right.action, action)
      );
    }
  }

  if (!amendment?.collaborators || !amendment?.roles) return false;

  const collaboration = amendment.collaborators.find(c => c.user?.id === userId);
  if (!collaboration?.roleName) return false;

  const role = amendment.roles.find(r => r.name === collaboration.roleName);
  if (!role?.actionRights) return false;

  return role.actionRights.some(
    right =>
      right.resource === resource &&
      checkWithInheritance(right.action, action) &&
      right.amendment?.id === amendment.id
  );
}

// ============================================================================
// Membership Helpers
// ============================================================================

/**
 * Check if user is a member of a group.
 */
export function isGroupMember(memberships: Membership[] | undefined, groupId: string): boolean {
  if (!memberships) return false;
  return memberships.some(m => m.group?.id === groupId);
}

/**
 * Check if user is a participant in an event.
 */
export function isEventParticipant(
  participations: Participation[] | undefined,
  eventId: string
): boolean {
  if (!participations) return false;
  return participations.some(p => p.event?.id === eventId);
}

/**
 * Check if user is a blogger (has any role) in a blog.
 */
export function isBlogger(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string
): boolean {
  if (!bloggerRelations) return false;
  return bloggerRelations.some(b => b.blog?.id === blogId);
}

/**
 * Check if user is a collaborator on an amendment.
 */
export function isAmendmentCollaborator(amendment: Amendment | undefined, userId: string): boolean {
  if (amendment?.amendmentRoleCollaborators) {
    return amendment.amendmentRoleCollaborators.some(c => c.user?.id === userId);
  }
  if (!amendment?.collaborators) return false;
  return amendment.collaborators.some(c => c.user?.id === userId);
}

/**
 * Check if user is the author of an amendment.
 */
export function isAmendmentAuthor(amendment: Amendment | undefined, userId: string): boolean {
  if (amendment?.owner) return amendment.owner.id === userId;
  if (!amendment?.user) return false;
  return amendment.user.id === userId;
}
