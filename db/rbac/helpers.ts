/**
 * RBAC Helper Functions
 *
 * Core permission checking functions for the Role-Based Access Control system.
 * These work across all scopes: Group, Event, Blog, Amendment.
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
 *
 * @param targetUserId - ID of the user to check
 * @param authUserId - ID of the authenticated user
 * @returns true if they are the same user
 *
 * @example
 * if (isSelf(profileUser.id, authUser.id)) {
 *   // Show edit button
 * }
 */
export function isSelf(
  targetUserId: string | undefined,
  authUserId: string | undefined
): boolean {
  if (!targetUserId || !authUserId) return false;
  return targetUserId === authUserId;
}

// ============================================================================
// Scope Permission Helpers
// ============================================================================

/**
 * Check if user has group-level permission for a specific resource and action.
 *
 * @param memberships - User's group memberships with roles
 * @param groupId - ID of the group to check permissions for
 * @param resource - Resource type (e.g., 'events', 'amendments')
 * @param action - Action type (e.g., 'create', 'update', 'manage')
 * @returns true if user has the permission
 *
 * @example
 * const canManageEvents = hasGroupPermission(user.memberships, groupId, 'events', 'manage');
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
 *
 * @param participations - User's event participations with roles
 * @param eventId - ID of the event to check permissions for
 * @param resource - Resource type (e.g., 'agendaItems', 'eventParticipants')
 * @param action - Action type
 * @returns true if user has the permission
 *
 * @example
 * const canManageAgenda = hasEventPermission(user.participations, eventId, 'agendaItems', 'manage');
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
 * Check if user has blog-level permission for a specific resource and action.
 *
 * @param bloggerRelations - User's blog blogger relationships with roles
 * @param blogId - ID of the blog to check permissions for
 * @param resource - Resource type (e.g., 'blogs', 'comments')
 * @param action - Action type
 * @returns true if user has the permission
 *
 * @example
 * const canEditBlog = hasBlogPermission(user.bloggerRelations, blogId, 'blogs', 'update');
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
 *
 * @param amendment - The amendment object with collaborators and roles
 * @param userId - ID of the user to check
 * @param resource - Resource type
 * @param action - Action type
 * @returns true if user has the permission
 *
 * @example
 * const canEditAmendment = hasAmendmentPermission(amendment, userId, 'amendments', 'update');
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
        right =>
          right.resource === resource &&
          checkWithInheritance(right.action, action)
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
 *
 * @param memberships - User's group memberships
 * @param groupId - ID of the group
 * @returns true if user is a member
 *
 * @example
 * if (isGroupMember(user.memberships, groupId)) {
 *   // Show group content
 * }
 */
export function isGroupMember(
  memberships: Membership[] | undefined,
  groupId: string
): boolean {
  if (!memberships) return false;
  return memberships.some(m => m.group?.id === groupId);
}

/**
 * Check if user is a participant in an event.
 *
 * @param participations - User's event participations
 * @param eventId - ID of the event
 * @returns true if user is a participant
 *
 * @example
 * if (isEventParticipant(user.participations, eventId)) {
 *   // Show event participation options
 * }
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
 *
 * @param bloggerRelations - User's blog blogger relationships
 * @param blogId - ID of the blog
 * @returns true if user is a blogger
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
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user to check
 * @returns true if user is a collaborator
 */
export function isAmendmentCollaborator(
  amendment: Amendment | undefined,
  userId: string
): boolean {
  if (amendment?.amendmentRoleCollaborators) {
    return amendment.amendmentRoleCollaborators.some(c => c.user?.id === userId);
  }
  if (!amendment?.collaborators) return false;
  return amendment.collaborators.some(c => c.user?.id === userId);
}

/**
 * Check if user is the author of an amendment.
 *
 * @param amendment - The amendment object
 * @param userId - ID of the user to check
 * @returns true if user is the author
 */
export function isAmendmentAuthor(
  amendment: Amendment | undefined,
  userId: string
): boolean {
  if (amendment?.owner) return amendment.owner.id === userId;
  if (!amendment?.user) return false;
  return amendment.user.id === userId;
}
