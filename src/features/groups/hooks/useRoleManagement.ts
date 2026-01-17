/**
 * Hook for role management operations
 */

import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import { notifyActionRightsChanged } from '@/utils/notification-helpers';

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
    roleActionRights: any[],
    senderId?: string,
    groupName?: string,
    roleName?: string,
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      const transactions: any[] = [];

      if (currentlyHasRight) {
        // Find and remove the action right
        const actionRightToRemove = roleActionRights.find(
          (ar) => ar.resource === resource && ar.action === action
        );
        if (actionRightToRemove) {
          transactions.push(tx.actionRights[actionRightToRemove.id].delete());
        }
      } else {
        // Add the action right
        const actionRightId = id();
        transactions.push(
          tx.actionRights[actionRightId]
            .update({
              resource,
              action,
              groupId,
              createdAt: Date.now(),
            })
            .link({ role: roleId })
        );
      }

      // Send notifications to admins
      if (senderId && groupName && roleName && adminUserIds) {
        adminUserIds.forEach(adminId => {
          if (adminId !== senderId) {
            const notificationTxs = notifyActionRightsChanged({
              senderId,
              recipientUserId: adminId,
              groupId,
              groupName,
              roleName,
            });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);
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
