/**
 * Hook for role management operations
 */

import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';

export function useRoleManagement(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);

  const addRole = async (name: string, description: string) => {
    if (!name.trim()) {
      toast.error('Role name is required');
      return { success: false };
    }

    setIsLoading(true);
    try {
      const roleId = id();

      await db.transact([
        tx.roles[roleId]
          .update({
            name,
            description,
            scope: 'group',
            createdAt: Date.now(),
          })
          .link({ group: groupId }),
      ]);

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
      await db.transact([tx.roles[roleId].delete()]);
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
    roleActionRights: any[]
  ) => {
    setIsLoading(true);
    try {
      if (currentlyHasRight) {
        // Find and remove the action right
        const actionRightToRemove = roleActionRights.find(
          (ar) => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          await db.transact([tx.actionRights[actionRightToRemove.id].delete()]);
        }
      } else {
        // Add the action right
        const actionRightId = id();
        await db.transact([
          tx.actionRights[actionRightId]
            .update({
              resource,
              action,
              groupId,
              createdAt: Date.now(),
            })
            .link({ role: roleId }),
        ]);
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
    toggleActionRight,
    isLoading,
  };
}
