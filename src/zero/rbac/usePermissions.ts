/**
 * usePermissions Hook
 *
 * Unified hook for checking permissions in React components.
 * Uses the shared checkPermission() logic from check.ts — the same logic
 * that can() uses on the server in mutators.
 *
 * @example
 * ```tsx
 * const { can, canManage, isLoading } = usePermissions({ groupId });
 *
 * if (isLoading) return <Spinner />;
 * {can('create', 'events') && <CreateEventButton />}
 * {canManage('roles') && <RoleManagementPanel />}
 * ```
 */

import { useMemo } from 'react'
import { useQuery } from '@rocicorp/zero/react'
import { useAuth } from '@/providers/auth-provider'
import { queries } from '../queries'
import {
  checkPermission,
  isSelf,
  isGroupMember,
  isEventParticipant,
  isBlogger,
  isAmendmentCollaborator,
  isAmendmentAuthor,
  hasActiveVotingRight,
  hasPassiveVotingRight,
} from './check'
import type {
  PermissionContext,
  ResourceType,
  ActionType,
  Membership,
  Participation,
  BloggerRelation,
  ActionRight,
} from './types'

// ============================================================================
// Data Loading (React hooks)
// ============================================================================

function useAuthUserId(): string | undefined {
  const { user } = useAuth()
  return user?.id
}

interface UsePermissionsData {
  memberships: Membership[] | undefined
  participations: Participation[] | undefined
  bloggerRelations: BloggerRelation[] | undefined
  isLoading: boolean
}

function mapActionRights(raw: any[] | undefined): ActionRight[] {
  if (!raw) return []
  return raw.map((ar: any) => ({
    id: ar.id,
    resource: ar.resource,
    action: ar.action,
    group: ar.group_id ? { id: ar.group_id } : undefined,
    event: ar.event_id ? { id: ar.event_id } : undefined,
    amendment: ar.amendment_id ? { id: ar.amendment_id } : undefined,
    blog: ar.blog_id ? { id: ar.blog_id } : undefined,
  }))
}

function usePermissionsData(userId: string | undefined): UsePermissionsData {
  const [membershipsRaw, membershipsResult] = useQuery(
    userId ? queries.rbac.membershipPermissions({ userId }) : undefined,
  )

  const [participationsRaw, participationsResult] = useQuery(
    userId ? queries.rbac.participantPermissions({ userId }) : undefined,
  )

  const [bloggerRelationsRaw, bloggerResult] = useQuery(
    userId ? queries.rbac.bloggerPermissions({ userId }) : undefined,
  )

  const isLoading =
    membershipsResult.type === 'unknown' ||
    participationsResult.type === 'unknown' ||
    bloggerResult.type === 'unknown'

  const memberships = useMemo(() => {
    if (!membershipsRaw) return undefined
    return (membershipsRaw as any[]).map((m: any) => ({
      id: m.id,
      group: m.group ? { id: m.group.id } : undefined,
      role: m.role
        ? {
            id: m.role.id,
            name: m.role.name,
            description: m.role.description,
            scope: m.role.scope,
            actionRights: mapActionRights(m.role.action_rights),
          }
        : undefined,
    })) as Membership[]
  }, [membershipsRaw])

  const participations = useMemo(() => {
    if (!participationsRaw) return undefined
    return (participationsRaw as any[]).map((p: any) => ({
      id: p.id,
      event: p.event ? { id: p.event.id } : undefined,
      role: p.role
        ? {
            id: p.role.id,
            name: p.role.name,
            description: p.role.description,
            scope: p.role.scope,
            actionRights: mapActionRights(p.role.action_rights),
          }
        : undefined,
    })) as Participation[]
  }, [participationsRaw])

  const bloggerRelations = useMemo(() => {
    if (!bloggerRelationsRaw) return undefined
    return (bloggerRelationsRaw as any[]).map((b: any) => ({
      id: b.id,
      blog: b.blog ? { id: b.blog.id } : undefined,
      role: b.role
        ? {
            id: b.role.id,
            name: b.role.name,
            description: b.role.description,
            scope: b.role.scope,
            actionRights: mapActionRights(b.role.action_rights),
          }
        : undefined,
    })) as BloggerRelation[]
  }, [bloggerRelationsRaw])

  return { memberships, participations, bloggerRelations, isLoading }
}

// ============================================================================
// Main Hook
// ============================================================================

export function usePermissions(context: PermissionContext) {
  const userId = useAuthUserId()
  const { memberships, participations, bloggerRelations, isLoading } = usePermissionsData(userId)

  return useMemo(() => {
    const can = (action: ActionType, resource: ResourceType): boolean => {
      if (!userId) return false
      return checkPermission(
        { userId, memberships, participations, bloggerRelations },
        {
          groupId: context.groupId,
          eventId: context.eventId,
          blogId: context.blogId,
          amendment: context.amendment,
        },
        action,
        resource,
      )
    }

    const isMe = (targetUserId: string | undefined): boolean => {
      return isSelf(targetUserId, userId)
    }

    const isMember = (): boolean => {
      if (!context.groupId) return false
      return isGroupMember(memberships, context.groupId)
    }

    const isParticipant = (): boolean => {
      if (!context.eventId) return false
      return isEventParticipant(participations, context.eventId)
    }

    const isABlogger = (): boolean => {
      if (!context.blogId) return false
      return isBlogger(bloggerRelations, context.blogId)
    }

    const isCollaborator = (): boolean => {
      if (!context.amendment || !userId) return false
      return isAmendmentCollaborator(context.amendment, userId)
    }

    const isAuthor = (): boolean => {
      if (!context.amendment || !userId) return false
      return isAmendmentAuthor(context.amendment, userId)
    }

    const canVote = (): boolean => {
      if (!context.eventId) return false
      return hasActiveVotingRight(participations, context.eventId)
    }

    const canBeCandidate = (): boolean => {
      if (!context.eventId) return false
      return hasPassiveVotingRight(participations, context.eventId)
    }

    return {
      isLoading,

      // Permission checks — same logic as server-side can()
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
    }
  }, [memberships, participations, bloggerRelations, userId, context, isLoading])
}
