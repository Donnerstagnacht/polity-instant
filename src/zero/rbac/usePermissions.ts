/**
 * usePermissions Hook
 *
 * Unified hook for checking permissions in React components.
 * Aggregates checks across all scopes: Group, Event, Blog, Amendment.
 *
 */

import { useMemo } from 'react';
import { useQuery } from '@rocicorp/zero/react';
import { useAuth } from '@/providers/auth-provider';
import { queries } from '../queries';
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
} from './helpers';
import type {
  PermissionContext,
  ResourceType,
  ActionType,
  Membership,
  Participation,
  BloggerRelation,
} from './types';

function useAuthUserId(): string | undefined {
  const { user } = useAuth();
  return user?.id;
}

interface UsePermissionsData {
  memberships: Membership[] | undefined;
  participations: Participation[] | undefined;
  bloggerRelations: BloggerRelation[] | undefined;
  isLoading: boolean;
}

function usePermissionsData(userId: string | undefined): UsePermissionsData {
  const [membershipsRaw, membershipsResult] = useQuery(
    userId ? queries.rbac.membershipPermissions({ userId }) : undefined
  );

  const [participationsRaw, participationsResult] = useQuery(
    userId ? queries.rbac.participantPermissions({ userId }) : undefined
  );

  const [bloggerRelationsRaw, bloggerResult] = useQuery(
    userId ? queries.rbac.bloggerPermissions({ userId }) : undefined
  );

  const isLoading =
    membershipsResult.type === 'unknown' ||
    participationsResult.type === 'unknown' ||
    bloggerResult.type === 'unknown';

  const memberships = useMemo(() => {
    if (!membershipsRaw) return undefined;
    return (membershipsRaw as any[]).map((m: any) => ({
      id: m.id,
      group: m.group ? { id: m.group.id } : undefined,
      role: m.role
        ? {
            id: m.role.id,
            name: m.role.name,
            description: m.role.description,
            scope: m.role.scope,
            actionRights: (m.role.action_rights || []).map((ar: any) => ({
              id: ar.id,
              resource: ar.resource,
              action: ar.action,
              group: ar.group_id ? { id: ar.group_id } : undefined,
              event: ar.event_id ? { id: ar.event_id } : undefined,
              amendment: ar.amendment_id ? { id: ar.amendment_id } : undefined,
              blog: ar.blog_id ? { id: ar.blog_id } : undefined,
            })),
          }
        : undefined,
    })) as Membership[];
  }, [membershipsRaw]);

  const participations = useMemo(() => {
    if (!participationsRaw) return undefined;
    return (participationsRaw as any[]).map((p: any) => ({
      id: p.id,
      event: p.event ? { id: p.event.id } : undefined,
      role: p.role
        ? {
            id: p.role.id,
            name: p.role.name,
            description: p.role.description,
            scope: p.role.scope,
            actionRights: (p.role.action_rights || []).map((ar: any) => ({
              id: ar.id,
              resource: ar.resource,
              action: ar.action,
              group: ar.group_id ? { id: ar.group_id } : undefined,
              event: ar.event_id ? { id: ar.event_id } : undefined,
              amendment: ar.amendment_id ? { id: ar.amendment_id } : undefined,
              blog: ar.blog_id ? { id: ar.blog_id } : undefined,
            })),
          }
        : undefined,
    })) as Participation[];
  }, [participationsRaw]);

  const bloggerRelations = useMemo(() => {
    if (!bloggerRelationsRaw) return undefined;
    return (bloggerRelationsRaw as any[]).map((b: any) => ({
      id: b.id,
      blog: b.blog ? { id: b.blog.id } : undefined,
      role: b.role
        ? {
            id: b.role.id,
            name: b.role.name,
            description: b.role.description,
            scope: b.role.scope,
            actionRights: (b.role.action_rights || []).map((ar: any) => ({
              id: ar.id,
              resource: ar.resource,
              action: ar.action,
              group: ar.group_id ? { id: ar.group_id } : undefined,
              event: ar.event_id ? { id: ar.event_id } : undefined,
              amendment: ar.amendment_id ? { id: ar.amendment_id } : undefined,
              blog: ar.blog_id ? { id: ar.blog_id } : undefined,
            })),
          }
        : undefined,
    })) as BloggerRelation[];
  }, [bloggerRelationsRaw]);

  return {
    memberships,
    participations,
    bloggerRelations,
    isLoading,
  };
}

/**
 * Hook for checking permissions in React components.
 *
 * @param context - The permission context (groupId, eventId, blogId, amendment)
 * @returns Permission checking functions
 *
 * @example
 * const { can, canManage, isLoading } = usePermissions({ groupId });
 *
 * if (isLoading) return <Spinner />;
 * {can('create', 'events') && <CreateEventButton />}
 * {canManage('roles') && <RoleManagementPanel />}
 */
export function usePermissions(context: PermissionContext) {
  const userId = useAuthUserId();
  const { memberships, participations, bloggerRelations, isLoading } = usePermissionsData(userId);

  return useMemo(() => {
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
     */
    const canVote = (): boolean => {
      if (!context.eventId) return false;
      return hasActiveVotingRight(participations, context.eventId);
    };

    /**
     * Check if authenticated user has passive voting rights in the context event.
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
  }, [memberships, participations, bloggerRelations, userId, context, isLoading]);
}
