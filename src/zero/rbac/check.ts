/**
 * Core Permission Checker
 *
 * Pure function that evaluates permissions against loaded permission data.
 * Used by both:
 *   - usePermissions (React hook, client-side)
 *   - can() (server-side, inside mutators)
 *
 * This is the SINGLE SOURCE OF TRUTH for permission evaluation logic.
 */

import { PERMISSION_IMPLIES } from './constants'
import type {
  ResourceType,
  ActionType,
  Membership,
  Participation,
  BloggerRelation,
  Amendment,
} from './types'

// ============================================================================
// Types
// ============================================================================

/** All permission data needed to evaluate permission checks. */
export interface PermissionData {
  userId: string
  memberships?: Membership[]
  participations?: Participation[]
  bloggerRelations?: BloggerRelation[]
}

/** Identifies the scope a permission check targets. */
export interface PermissionScope {
  groupId?: string
  eventId?: string
  blogId?: string
  amendment?: Amendment
}

// ============================================================================
// Core Check
// ============================================================================

/**
 * Check if a user has a specific permission within a scope.
 *
 * @returns true if the user has the permission, false otherwise.
 */
export function checkPermission(
  data: PermissionData,
  scope: PermissionScope,
  action: ActionType,
  resource: ResourceType,
): boolean {
  if (!data.userId) return false

  if (scope.groupId && hasGroupPermission(data.memberships, scope.groupId, resource, action)) {
    return true
  }

  if (scope.eventId && hasEventPermission(data.participations, scope.eventId, resource, action)) {
    return true
  }

  if (scope.blogId && hasBlogPermission(data.bloggerRelations, scope.blogId, resource, action)) {
    return true
  }

  if (scope.amendment && hasAmendmentPermission(scope.amendment, data.userId, resource, action)) {
    return true
  }

  return false
}

// ============================================================================
// Identity Checks
// ============================================================================

export function isSelf(targetUserId: string | undefined, authUserId: string | undefined): boolean {
  if (!targetUserId || !authUserId) return false
  return targetUserId === authUserId
}

// ============================================================================
// Membership Checks
// ============================================================================

export function isGroupMember(memberships: Membership[] | undefined, groupId: string): boolean {
  if (!memberships) return false
  return memberships.some(m => m.group?.id === groupId)
}

export function isEventParticipant(
  participations: Participation[] | undefined,
  eventId: string,
): boolean {
  if (!participations) return false
  return participations.some(p => p.event?.id === eventId)
}

export function isBlogger(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string,
): boolean {
  if (!bloggerRelations) return false
  return bloggerRelations.some(b => b.blog?.id === blogId)
}

export function isAmendmentCollaborator(
  amendment: Amendment | undefined,
  userId: string,
): boolean {
  if (amendment?.amendmentRoleCollaborators) {
    return amendment.amendmentRoleCollaborators.some(c => c.user?.id === userId)
  }
  if (!amendment?.collaborators) return false
  return amendment.collaborators.some(c => c.user?.id === userId)
}

export function isAmendmentAuthor(amendment: Amendment | undefined, userId: string): boolean {
  if (amendment?.owner) return amendment.owner.id === userId
  if (!amendment?.user) return false
  return amendment.user.id === userId
}

// ============================================================================
// Scope Permission Helpers (internal)
// ============================================================================

function checkWithInheritance(userAction: ActionType, requiredAction: ActionType): boolean {
  if (userAction === requiredAction) return true
  return PERMISSION_IMPLIES[userAction]?.includes(requiredAction) ?? false
}

function hasGroupPermission(
  memberships: Membership[] | undefined,
  groupId: string,
  resource: ResourceType,
  action: ActionType,
): boolean {
  if (!memberships) return false
  return memberships.some(
    m =>
      m.group?.id === groupId &&
      m.role?.actionRights?.some(
        right =>
          right.resource === resource &&
          checkWithInheritance(right.action, action) &&
          right.group?.id === groupId,
      ),
  )
}

function hasEventPermission(
  participations: Participation[] | undefined,
  eventId: string,
  resource: ResourceType,
  action: ActionType,
): boolean {
  if (!participations) return false
  return participations.some(
    p =>
      p.event?.id === eventId &&
      p.role?.actionRights?.some(
        right =>
          right.resource === resource &&
          checkWithInheritance(right.action, action) &&
          right.event?.id === eventId,
      ),
  )
}

function hasBlogPermission(
  bloggerRelations: BloggerRelation[] | undefined,
  blogId: string,
  resource: ResourceType,
  action: ActionType,
): boolean {
  if (!bloggerRelations) return false
  return bloggerRelations.some(
    b =>
      b.blog?.id === blogId &&
      b.role?.actionRights?.some(
        right =>
          right.resource === resource &&
          checkWithInheritance(right.action, action) &&
          right.blog?.id === blogId,
      ),
  )
}

function hasAmendmentPermission(
  amendment: Amendment | undefined,
  userId: string,
  resource: ResourceType,
  action: ActionType,
): boolean {
  if (amendment?.amendmentRoleCollaborators) {
    const collaborator = amendment.amendmentRoleCollaborators.find(c => c.user?.id === userId)
    if (collaborator?.role?.actionRights) {
      return collaborator.role.actionRights.some(
        right => right.resource === resource && checkWithInheritance(right.action, action),
      )
    }
  }

  if (!amendment?.collaborators || !amendment?.roles) return false

  const collaboration = amendment.collaborators.find(c => c.user?.id === userId)
  if (!collaboration?.roleName) return false

  const role = amendment.roles.find(r => r.name === collaboration.roleName)
  if (!role?.actionRights) return false

  return role.actionRights.some(
    right =>
      right.resource === resource &&
      checkWithInheritance(right.action, action) &&
      right.amendment?.id === amendment.id,
  )
}

// Re-export voting helpers that use event permissions
export function hasActiveVotingRight(
  participations: Participation[] | undefined,
  eventId: string,
): boolean {
  return hasEventPermission(participations, eventId, 'events', 'active_voting')
}

export function hasPassiveVotingRight(
  participations: Participation[] | undefined,
  eventId: string,
): boolean {
  return hasEventPermission(participations, eventId, 'events', 'passive_voting')
}
