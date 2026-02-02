/**
 * usePermissions Hook
 *
 * Unified hook for checking permissions in React components.
 * Aggregates checks across all scopes: Group, Event, Blog, Amendment.
 */

import { useMemo } from 'react';
import { db } from '../db.ts';
import {
  hasGroupPermission,
  hasEventPermission,
  hasBlogPermission,
  hasAmendmentPermission,
  hasActiveVotingRight,
  hasPassiveVotingRight,
  isSelf,
  isGroupMember,
  isEventParticipant,
  isBlogger,
  isAmendmentCollaborator,
  isAmendmentAuthor,
} from './helpers.ts';
import type {
  PermissionContext,
  ResourceType,
  ActionType,
  Membership,
  Participation,
  BloggerRelation,
} from './types.ts';

/**
 * Hook for checking permissions in React components.
 *
 * @param context - The permission context (groupId, eventId, blogId, amendment)
 * @returns Permission checking functions
 *
 * @example
 * // In a group page
 * const { can, canManage, isLoading } = usePermissions({ groupId });
 *
 * if (isLoading) return <Spinner />;
 * {can('create', 'events') && <CreateEventButton />}
 * {canManage('roles') && <RoleManagementPanel />}
 */
export function usePermissions(context: PermissionContext) {
  const { user: authUser } = db.useAuth();
  const userId = authUser?.id;

  // Query user with relations needed for permission checks
  // Using separate queries to avoid type complexity
  const { data: membershipData, isLoading: membershipsLoading } = db.useQuery(
    userId
      ? {
          groupMemberships: {
            $: { where: { 'user.id': userId } },
            group: {
              roles: {
                actionRights: {
                  group: {},
                },
              },
            },
            role: {
              actionRights: {
                group: {},
              },
            },
          },
        }
      : null
  );

  const { data: participationData, isLoading: participationsLoading } = db.useQuery(
    userId
      ? {
          eventParticipants: {
            $: { where: { 'user.id': userId } },
            event: {},
            role: {
              actionRights: {
                event: {},
              },
            },
          },
        }
      : null
  );

  const { data: bloggerData, isLoading: bloggersLoading } = db.useQuery(
    userId
      ? {
          blogBloggers: {
            $: { where: { 'user.id': userId } },
            blog: {},
            role: {
              actionRights: {
                blog: {},
              },
            },
          },
        }
      : null
  );

  const isLoading = membershipsLoading || participationsLoading || bloggersLoading;

  return useMemo(() => {
    // Transform data to match our types
    const memberships = membershipData?.groupMemberships as Membership[] | undefined;
    const participations = participationData?.eventParticipants as Participation[] | undefined;
    const bloggerRelations = bloggerData?.blogBloggers as BloggerRelation[] | undefined;

    /**
     * Check if the authenticated user has permission for a resource and action.
     * Checks permissions across all provided scopes in the context.
     */
    const can = (action: ActionType, resource: ResourceType): boolean => {
      if (!userId) return false;

      // Check group-level permissions
      if (context.groupId) {
        if (hasGroupPermission(memberships, context.groupId, resource, action)) {
          return true;
        }
      }

      // Check event-level permissions
      if (context.eventId) {
        if (hasEventPermission(participations, context.eventId, resource, action)) {
          return true;
        }
      }

      // Check blog-level permissions
      if (context.blogId) {
        if (hasBlogPermission(bloggerRelations, context.blogId, resource, action)) {
          return true;
        }
      }

      // Check amendment-level permissions
      if (context.amendment) {
        // Author can always manage their amendment
        // if (isAmendmentAuthor(context.amendment, userId) && action === 'manage') {
        //   return true;
        // }
        if (hasAmendmentPermission(context.amendment, userId, resource, action)) {
          return true;
        }
      }

      return false;
    };

    /**
     * Check if target user is the authenticated user.
     */
    const isMe = (targetUserId: string | undefined): boolean => {
      return isSelf(targetUserId, userId);
    };

    /**
     * Check if authenticated user is a member of the context group.
     */
    const isMember = (): boolean => {
      if (!context.groupId) return false;
      return isGroupMember(memberships, context.groupId);
    };

    /**
     * Check if authenticated user is a participant in the context event.
     */
    const isParticipant = (): boolean => {
      if (!context.eventId) return false;
      return isEventParticipant(participations, context.eventId);
    };

    /**
     * Check if authenticated user is a blogger in the context blog.
     */
    const isABlogger = (): boolean => {
      if (!context.blogId) return false;
      return isBlogger(bloggerRelations, context.blogId);
    };

    /**
     * Check if authenticated user is a collaborator on the context amendment.
     */
    const isCollaborator = (): boolean => {
      if (!context.amendment || !userId) return false;
      return isAmendmentCollaborator(context.amendment, userId);
    };

    /**
     * Check if authenticated user is the author of the context amendment.
     */
    const isAuthor = (): boolean => {
      if (!context.amendment || !userId) return false;
      return isAmendmentAuthor(context.amendment, userId);
    };

    /**
     * Check if authenticated user has active voting rights in the context event.
     * Active voting allows casting votes in elections and amendment votes.
     */
    const canVote = (): boolean => {
      if (!context.eventId) return false;
      return hasActiveVotingRight(participations, context.eventId);
    };

    /**
     * Check if authenticated user has passive voting rights in the context event.
     * Passive voting allows being a candidate in elections.
     */
    const canBeCandidate = (): boolean => {
      if (!context.eventId) return false;
      return hasPassiveVotingRight(participations, context.eventId);
    };

    return {
      // Loading state
      isLoading,

      // Permission checks
      can,
      canView: (resource: ResourceType) => can('view', resource),
      canManage: (resource: ResourceType) => can('manage', resource),
      canCreate: (resource: ResourceType) => can('create', resource),
      canUpdate: (resource: ResourceType) => can('update', resource),
      canDelete: (resource: ResourceType) => can('delete', resource),

      // Identity checks
      isMe,
      userId,

      // Membership checks
      isMember,
      isParticipant,
      isABlogger,
      isCollaborator,
      isAuthor,

      // Voting permission checks
      canVote,
      canBeCandidate,

      // Raw data access (for advanced use cases)
      memberships,
      participations,
      bloggerRelations,
    };
  }, [membershipData, participationData, bloggerData, userId, context, isLoading]);
}
