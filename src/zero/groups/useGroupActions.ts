import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/features/shared/hooks/use-translation'
import { mutators } from '../mutators'
import { serverConfirmed } from '../mutate-with-server-check'
import { DEFAULT_GROUP_ROLES } from '../rbac/constants'
import { handleMutationError } from '../rbac/handleMutationError'

/**
 * Action hook for group mutations.
 * Every function is a thin wrapper around a custom mutator + sonner toast.
 */
export function useGroupActions() {
  const zero = useZero()
  const { t } = useTranslation()

  // ── CRUD ───────────────────────────────────────────────────────────
  const createGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.create>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.create(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.created'))
      } catch (error) {
        console.error('Failed to create group:', error)
        handleMutationError(error, t('features.groups.toasts.createFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const updateGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.update>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.update(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.updated'))
      } catch (error) {
        console.error('Failed to update group:', error)
        handleMutationError(error, t('features.groups.toasts.updateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const deleteGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.delete>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.delete(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete group:', error)
        handleMutationError(error, t('features.groups.toasts.deleteFailed'), t)
        throw error
      }
    },
    [zero]
  )

  // ── Membership ─────────────────────────────────────────────────────
  const joinGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.joinGroup>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.joinGroup(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.joined'))
      } catch (error) {
        console.error('Failed to join group:', error)
        handleMutationError(error, t('features.groups.toasts.joinFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const leaveGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.leaveGroup>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.leaveGroup(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.left'))
      } catch (error) {
        console.error('Failed to leave group:', error)
        handleMutationError(error, t('features.groups.toasts.leaveFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const inviteMember = useCallback(
    async (args: Parameters<typeof mutators.groups.inviteMember>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.inviteMember(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.invitationSent'))
      } catch (error) {
        console.error('Failed to invite member:', error)
        handleMutationError(error, t('features.groups.toasts.inviteFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const acceptInvitation = useCallback(
    async (args: Parameters<typeof mutators.groups.acceptInvitation>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.acceptInvitation(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.invitationAccepted'))
      } catch (error) {
        console.error('Failed to accept invitation:', error)
        handleMutationError(error, t('features.groups.toasts.acceptInvitationFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const updateMemberRole = useCallback(
    async (args: Parameters<typeof mutators.groups.updateMemberRole>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.updateMemberRole(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.memberRoleUpdated'))
      } catch (error) {
        console.error('Failed to update member role:', error)
        handleMutationError(error, t('features.groups.toasts.memberRoleUpdateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  // ── Roles ──────────────────────────────────────────────────────────
  const createRole = useCallback(
    async (args: Parameters<typeof mutators.groups.createRole>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.createRole(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.roleCreated'))
      } catch (error) {
        console.error('Failed to create role:', error)
        handleMutationError(error, t('features.groups.toasts.roleCreateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const deleteRole = useCallback(
    async (args: Parameters<typeof mutators.groups.deleteRole>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.deleteRole(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.roleDeleted'))
      } catch (error) {
        console.error('Failed to delete role:', error)
        handleMutationError(error, t('features.groups.toasts.roleDeleteFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const updateRole = useCallback(
    async (args: Parameters<typeof mutators.groups.updateRole>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.updateRole(args))
        await serverConfirmed(result)
      } catch (error) {
        console.error('Failed to update role:', error)
        handleMutationError(error, t('features.groups.toasts.roleUpdateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const assignActionRight = useCallback(
    async (args: Parameters<typeof mutators.groups.assignActionRight>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.assignActionRight(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.actionRightAssigned'))
      } catch (error) {
        console.error('Failed to assign action right:', error)
        handleMutationError(error, t('features.groups.toasts.actionRightAssignFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const removeActionRight = useCallback(
    async (args: Parameters<typeof mutators.groups.removeActionRight>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.removeActionRight(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.actionRightRemoved'))
      } catch (error) {
        console.error('Failed to remove action right:', error)
        handleMutationError(error, t('features.groups.toasts.actionRightRemoveFailed'), t)
        throw error
      }
    },
    [zero]
  )

  // ── Admin setup (silent batch — no individual toasts) ────────────
  const setupGroupAdminRoles = useCallback(
    async (groupId: string) => {
      try {
        let adminRoleId: string | null = null
        const totalRoles = DEFAULT_GROUP_ROLES.length
        for (let i = 0; i < totalRoles; i++) {
          const roleDef = DEFAULT_GROUP_ROLES[i]
          const roleId = crypto.randomUUID()
          if (roleDef.name === 'Admin') adminRoleId = roleId
          // Reverse the index so the last default role (Member) gets sort_order 0 (least rights)
          // and first (Admin) gets the highest sort_order (most rights)
          const sortOrder = totalRoles - 1 - i
          const roleResult = zero.mutate(mutators.groups.createRole({
            id: roleId,
            name: roleDef.name,
            description: roleDef.description,
            scope: 'group',
            group_id: groupId,
            event_id: null,
            amendment_id: null,
            blog_id: null,
            sort_order: sortOrder,
          }))
          await serverConfirmed(roleResult)
          for (const perm of roleDef.permissions) {
            const permResult = zero.mutate(mutators.groups.assignActionRight({
              id: crypto.randomUUID(),
              resource: perm.resource,
              action: perm.action,
              role_id: roleId,
              group_id: groupId,
              event_id: null,
              amendment_id: null,
              blog_id: null,
            }))
            await serverConfirmed(permResult)
          }
        }
        if (adminRoleId) {
          const joinResult = zero.mutate(mutators.groups.joinGroup({
            id: crypto.randomUUID(),
            group_id: groupId,
            status: 'active',
            visibility: 'public',
            role_id: adminRoleId,
          }))
          await serverConfirmed(joinResult)
        }
      } catch (error) {
        console.error('Failed to setup group admin roles:', error)
        throw error
      }
    },
    [zero]
  )

  // ── Relationships ──────────────────────────────────────────────────
  const createRelationship = useCallback(
    async (args: Parameters<typeof mutators.groups.createRelationship>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.createRelationship(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.relationshipCreated'))
      } catch (error) {
        console.error('Failed to create relationship:', error)
        handleMutationError(error, t('features.groups.toasts.relationshipCreateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const updateRelationship = useCallback(
    async (args: Parameters<typeof mutators.groups.updateRelationship>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.updateRelationship(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.relationshipUpdated'))
      } catch (error) {
        console.error('Failed to update relationship:', error)
        handleMutationError(error, t('features.groups.toasts.relationshipUpdateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const deleteRelationship = useCallback(
    async (args: Parameters<typeof mutators.groups.deleteRelationship>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.deleteRelationship(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.relationshipDeleted'))
      } catch (error) {
        console.error('Failed to delete relationship:', error)
        handleMutationError(error, t('features.groups.toasts.relationshipDeleteFailed'), t)
        throw error
      }
    },
    [zero]
  )

  // ── Positions ──────────────────────────────────────────────────────
  const createPosition = useCallback(
    async (args: Parameters<typeof mutators.groups.createPosition>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.createPosition(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.positionCreated'))
      } catch (error) {
        console.error('Failed to create position:', error)
        handleMutationError(error, t('features.groups.toasts.positionCreateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const updatePosition = useCallback(
    async (args: Parameters<typeof mutators.groups.updatePosition>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.updatePosition(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.positionUpdated'))
      } catch (error) {
        console.error('Failed to update position:', error)
        handleMutationError(error, t('features.groups.toasts.positionUpdateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const deletePosition = useCallback(
    async (args: Parameters<typeof mutators.groups.deletePosition>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.deletePosition(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.positionDeleted'))
      } catch (error) {
        console.error('Failed to delete position:', error)
        handleMutationError(error, t('features.groups.toasts.positionDeleteFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const createPositionHolderHistory = useCallback(
    async (args: Parameters<typeof mutators.groups.createPositionHolderHistory>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.createPositionHolderHistory(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.positionHolderHistoryCreated'))
      } catch (error) {
        console.error('Failed to create position holder history:', error)
        handleMutationError(error, t('features.groups.toasts.positionHolderHistoryCreateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  const updatePositionHolderHistory = useCallback(
    async (args: Parameters<typeof mutators.groups.updatePositionHolderHistory>[0]) => {
      try {
        const result = zero.mutate(mutators.groups.updatePositionHolderHistory(args))
        await serverConfirmed(result)
        toast.success(t('features.groups.toasts.positionHolderHistoryUpdated'))
      } catch (error) {
        console.error('Failed to update position holder history:', error)
        handleMutationError(error, t('features.groups.toasts.positionHolderHistoryUpdateFailed'), t)
        throw error
      }
    },
    [zero]
  )

  return {
    // CRUD
    createGroup,
    updateGroup,
    deleteGroup,

    // Membership
    joinGroup,
    leaveGroup,
    inviteMember,
    acceptInvitation,
    updateMemberRole,

    // Roles
    createRole,
    updateRole,
    deleteRole,
    assignActionRight,
    removeActionRight,
    setupGroupAdminRoles,

    // Relationships
    createRelationship,
    updateRelationship,
    deleteRelationship,

    // Positions
    createPosition,
    updatePosition,
    deletePosition,
    createPositionHolderHistory,
    updatePositionHolderHistory,
  }
}
