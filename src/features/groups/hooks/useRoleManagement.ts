/**
 * Hook for role management operations
 */

import { useState } from 'react';
import { useGroupActions } from '@/zero/groups/useGroupActions';
import { toast } from 'sonner';
import { notifyActionRightsChanged } from '@/utils/notification-helpers';
import { sendNotificationFn } from '@/server/notifications';

export function useRoleManagement(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    createRole: createRoleAction,
    deleteRole: deleteRoleAction,
    assignActionRight,
    removeActionRight,
  } = useGroupActions();

  const addRole = async (name: string, description: string) => {
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
        event_id: '',
        amendment_id: '',
        blog_id: '',
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
          event_id: '',
          amendment_id: '',
          blog_id: '',
          role_id: roleId,
        });
      }

      sendNotificationFn({ data: { helper: 'notifyActionRightsChanged', params: { senderId, groupId, groupName, roleName } } }).catch(console.error)
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
    toggleActionRight,
    isLoading,
  };
}
