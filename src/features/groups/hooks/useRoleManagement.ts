/**
 * Hook for role management operations
 */

import { useState } from 'react';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { toast } from 'sonner';
import { notifyActionRightsChanged } from '@/features/shared/utils/notification-helpers';

export function useRoleManagement(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    createRole: createRoleAction,
    updateRole: updateRoleAction,
    deleteRole: deleteRoleAction,
    assignActionRight,
    removeActionRight,
  } = useGroupActions();

  const addRole = async (name: string, description: string, nextSortOrder: number = 0) => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const roleId = crypto.randomUUID();

      await createRoleAction({
        id: roleId,
        name,
        description,
        scope: 'group',
        group_id: groupId,
        event_id: null,
        amendment_id: null,
        blog_id: null,
        sort_order: nextSortOrder,
      });

      toast.success('Role created successfully');

      return { success: true, roleId };
    } catch (error) {
      console.error('Failed to create role:', error);
      toast.error('Failed to create role. Please try again.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const reorderRoles = async (orderedRoleIds: string[]) => {
    setIsLoading(true);
    try {
      for (let i = 0; i < orderedRoleIds.length; i++) {
        await updateRoleAction({ id: orderedRoleIds[i], sort_order: i });
      }
      toast.success('Role order updated');
      return { success: true };
    } catch (error) {
      console.error('Failed to reorder roles:', error);
      toast.error('Failed to update role order.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const removeRole = async (roleId: string) => {
    setIsLoading(true);
    try {
      await deleteRoleAction({ id: roleId });
      toast.success('Role removed successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to remove role:', error);
      toast.error('Failed to remove role. Please try again.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActionRight = async (
    roleId: string,
    resource: string,
    action: string,
    currentlyHasRight: boolean,
    roleActionRights: any[],
    senderId?: string,
    groupName?: string,
    roleName?: string,
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      if (currentlyHasRight) {
        // Find and remove the action right
        const actionRightToRemove = roleActionRights.find(
          (ar) => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await removeActionRight({ id: actionRightToRemove.id });
        }
      } else {
        // Add the action right
        const actionRightId = crypto.randomUUID();
        await assignActionRight({
          id: actionRightId,
          resource,
          action,
          group_id: groupId,
          event_id: null,
          amendment_id: null,
          blog_id: null,
          role_id: roleId,
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Failed to toggle action right:', error);
      toast.error('Failed to update permission. Please try again.');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addRole,
    removeRole,
    reorderRoles,
    toggleActionRight,
    isLoading,
  };
}
