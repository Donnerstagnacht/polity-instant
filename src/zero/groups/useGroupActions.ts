import { useCallback } from 'react'
import { useZero } from '@rocicorp/zero/react'
import { toast } from 'sonner'
import { useTranslation } from '@/hooks/use-translation'
import { mutators } from '../mutators'
import { DEFAULT_GROUP_ROLES } from '../rbac/constants'

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
        await zero.mutate(mutators.groups.create(args))
        toast.success(t('features.groups.toasts.created'))
      } catch (error) {
        console.error('Failed to create group:', error)
        toast.error(t('features.groups.toasts.createFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.update>[0]) => {
      try {
        await zero.mutate(mutators.groups.update(args))
        toast.success(t('features.groups.toasts.updated'))
      } catch (error) {
        console.error('Failed to update group:', error)
        toast.error(t('features.groups.toasts.updateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.delete>[0]) => {
      try {
        await zero.mutate(mutators.groups.delete(args))
        toast.success(t('features.groups.toasts.deleted'))
      } catch (error) {
        console.error('Failed to delete group:', error)
        toast.error(t('features.groups.toasts.deleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Membership ─────────────────────────────────────────────────────
  const joinGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.joinGroup>[0]) => {
      try {
        await zero.mutate(mutators.groups.joinGroup(args))
        toast.success(t('features.groups.toasts.joined'))
      } catch (error) {
        console.error('Failed to join group:', error)
        toast.error(t('features.groups.toasts.joinFailed'))
        throw error
      }
    },
    [zero]
  )

  const leaveGroup = useCallback(
    async (args: Parameters<typeof mutators.groups.leaveGroup>[0]) => {
      try {
        await zero.mutate(mutators.groups.leaveGroup(args))
        toast.success(t('features.groups.toasts.left'))
      } catch (error) {
        console.error('Failed to leave group:', error)
        toast.error(t('features.groups.toasts.leaveFailed'))
        throw error
      }
    },
    [zero]
  )

  const inviteMember = useCallback(
    async (args: Parameters<typeof mutators.groups.inviteMember>[0]) => {
      try {
        await zero.mutate(mutators.groups.inviteMember(args))
        toast.success(t('features.groups.toasts.invitationSent'))
      } catch (error) {
        console.error('Failed to invite member:', error)
        toast.error(t('features.groups.toasts.inviteFailed'))
        throw error
      }
    },
    [zero]
  )

  const acceptInvitation = useCallback(
    async (args: Parameters<typeof mutators.groups.acceptInvitation>[0]) => {
      try {
        await zero.mutate(mutators.groups.acceptInvitation(args))
        toast.success(t('features.groups.toasts.invitationAccepted'))
      } catch (error) {
        console.error('Failed to accept invitation:', error)
        toast.error(t('features.groups.toasts.acceptInvitationFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateMemberRole = useCallback(
    async (args: Parameters<typeof mutators.groups.updateMemberRole>[0]) => {
      try {
        await zero.mutate(mutators.groups.updateMemberRole(args))
        toast.success(t('features.groups.toasts.memberRoleUpdated'))
      } catch (error) {
        console.error('Failed to update member role:', error)
        toast.error(t('features.groups.toasts.memberRoleUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Roles ──────────────────────────────────────────────────────────
  const createRole = useCallback(
    async (args: Parameters<typeof mutators.groups.createRole>[0]) => {
      try {
        await zero.mutate(mutators.groups.createRole(args))
        toast.success(t('features.groups.toasts.roleCreated'))
      } catch (error) {
        console.error('Failed to create role:', error)
        toast.error(t('features.groups.toasts.roleCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteRole = useCallback(
    async (args: Parameters<typeof mutators.groups.deleteRole>[0]) => {
      try {
        await zero.mutate(mutators.groups.deleteRole(args))
        toast.success(t('features.groups.toasts.roleDeleted'))
      } catch (error) {
        console.error('Failed to delete role:', error)
        toast.error(t('features.groups.toasts.roleDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  const assignActionRight = useCallback(
    async (args: Parameters<typeof mutators.groups.assignActionRight>[0]) => {
      try {
        await zero.mutate(mutators.groups.assignActionRight(args))
        toast.success(t('features.groups.toasts.actionRightAssigned'))
      } catch (error) {
        console.error('Failed to assign action right:', error)
        toast.error(t('features.groups.toasts.actionRightAssignFailed'))
        throw error
      }
    },
    [zero]
  )

  const removeActionRight = useCallback(
    async (args: Parameters<typeof mutators.groups.removeActionRight>[0]) => {
      try {
        await zero.mutate(mutators.groups.removeActionRight(args))
        toast.success(t('features.groups.toasts.actionRightRemoved'))
      } catch (error) {
        console.error('Failed to remove action right:', error)
        toast.error(t('features.groups.toasts.actionRightRemoveFailed'))
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
        for (const roleDef of DEFAULT_GROUP_ROLES) {
          const roleId = crypto.randomUUID()
          if (roleDef.name === 'Admin') adminRoleId = roleId
          await zero.mutate(mutators.groups.createRole({
            id: roleId,
            name: roleDef.name,
            description: roleDef.description,
            scope: 'group',
            group_id: groupId,
            event_id: null,
            amendment_id: null,
            blog_id: null,
          }))
          for (const perm of roleDef.permissions) {
            await zero.mutate(mutators.groups.assignActionRight({
              id: crypto.randomUUID(),
              resource: perm.resource,
              action: perm.action,
              role_id: roleId,
              group_id: groupId,
              event_id: null,
              amendment_id: null,
              blog_id: null,
            }))
          }
        }
        if (adminRoleId) {
          await zero.mutate(mutators.groups.joinGroup({
            id: crypto.randomUUID(),
            group_id: groupId,
            status: 'member',
            visibility: 'public',
            role_id: adminRoleId,
          }))
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
        await zero.mutate(mutators.groups.createRelationship(args))
        toast.success(t('features.groups.toasts.relationshipCreated'))
      } catch (error) {
        console.error('Failed to create relationship:', error)
        toast.error(t('features.groups.toasts.relationshipCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updateRelationship = useCallback(
    async (args: Parameters<typeof mutators.groups.updateRelationship>[0]) => {
      try {
        await zero.mutate(mutators.groups.updateRelationship(args))
        toast.success(t('features.groups.toasts.relationshipUpdated'))
      } catch (error) {
        console.error('Failed to update relationship:', error)
        toast.error(t('features.groups.toasts.relationshipUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deleteRelationship = useCallback(
    async (args: Parameters<typeof mutators.groups.deleteRelationship>[0]) => {
      try {
        await zero.mutate(mutators.groups.deleteRelationship(args))
        toast.success(t('features.groups.toasts.relationshipDeleted'))
      } catch (error) {
        console.error('Failed to delete relationship:', error)
        toast.error(t('features.groups.toasts.relationshipDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  // ── Positions ──────────────────────────────────────────────────────
  const createPosition = useCallback(
    async (args: Parameters<typeof mutators.groups.createPosition>[0]) => {
      try {
        await zero.mutate(mutators.groups.createPosition(args))
        toast.success(t('features.groups.toasts.positionCreated'))
      } catch (error) {
        console.error('Failed to create position:', error)
        toast.error(t('features.groups.toasts.positionCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updatePosition = useCallback(
    async (args: Parameters<typeof mutators.groups.updatePosition>[0]) => {
      try {
        await zero.mutate(mutators.groups.updatePosition(args))
        toast.success(t('features.groups.toasts.positionUpdated'))
      } catch (error) {
        console.error('Failed to update position:', error)
        toast.error(t('features.groups.toasts.positionUpdateFailed'))
        throw error
      }
    },
    [zero]
  )

  const deletePosition = useCallback(
    async (args: Parameters<typeof mutators.groups.deletePosition>[0]) => {
      try {
        await zero.mutate(mutators.groups.deletePosition(args))
        toast.success(t('features.groups.toasts.positionDeleted'))
      } catch (error) {
        console.error('Failed to delete position:', error)
        toast.error(t('features.groups.toasts.positionDeleteFailed'))
        throw error
      }
    },
    [zero]
  )

  const createPositionHolderHistory = useCallback(
    async (args: Parameters<typeof mutators.groups.createPositionHolderHistory>[0]) => {
      try {
        await zero.mutate(mutators.groups.createPositionHolderHistory(args))
        toast.success(t('features.groups.toasts.positionHolderHistoryCreated'))
      } catch (error) {
        console.error('Failed to create position holder history:', error)
        toast.error(t('features.groups.toasts.positionHolderHistoryCreateFailed'))
        throw error
      }
    },
    [zero]
  )

  const updatePositionHolderHistory = useCallback(
    async (args: Parameters<typeof mutators.groups.updatePositionHolderHistory>[0]) => {
      try {
        await zero.mutate(mutators.groups.updatePositionHolderHistory(args))
        toast.success(t('features.groups.toasts.positionHolderHistoryUpdated'))
      } catch (error) {
        console.error('Failed to update position holder history:', error)
        toast.error(t('features.groups.toasts.positionHolderHistoryUpdateFailed'))
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
