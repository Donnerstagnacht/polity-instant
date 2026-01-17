/**
 * Hook for managing group links
 */

import { useState } from 'react';
import db, { tx, id } from '../../../../db/db';
import { toast } from 'sonner';
import type { GroupLink } from '../types/group.types';
import { notifyLinkAdded, notifyLinkRemoved } from '@/utils/notification-helpers';

export function useGroupLinks(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);

  // Query links
  const { data, isLoading: isQuerying } = db.useQuery({
    links: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
    },
  });

  const links = (data?.links || []) as any as GroupLink[];

  const addLink = async (
    label: string,
    url: string,
    senderId?: string,
    groupName?: string,
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      const linkId = id();
      const transactions: any[] = [
        tx.links[linkId]
          .update({
            label,
            url,
            createdAt: Date.now(),
          })
          .link({ group: groupId }),
      ];

      // Send notifications to admins
      if (senderId && groupName && adminUserIds) {
        adminUserIds.forEach(adminId => {
          if (adminId !== senderId) {
            const notificationTxs = notifyLinkAdded({
              senderId,
              groupId,
              groupName,
              linkTitle: label,
            });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);
      toast.success('Link added successfully!');
      return { success: true, linkId };
    } catch (error) {
      console.error('Failed to add link:', error);
      toast.error('Failed to add link');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteLink = async (
    linkId: string,
    linkLabel?: string,
    senderId?: string,
    groupName?: string,
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      const transactions: any[] = [tx.links[linkId].delete()];

      // Send notifications to admins
      if (senderId && linkLabel && groupName && adminUserIds) {
        adminUserIds.forEach(adminId => {
          if (adminId !== senderId) {
            const notificationTxs = notifyLinkRemoved({
              senderId,
              groupId,
              groupName,
              linkTitle: linkLabel,
            });
            transactions.push(...notificationTxs);
          }
        });
      }

      await db.transact(transactions);
      toast.success('Link deleted successfully!');
      return { success: true };
    } catch (error) {
      console.error('Failed to delete link:', error);
      toast.error('Failed to delete link');
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    links,
    addLink,
    deleteLink,
    isLoading: isLoading || isQuerying,
  };
}
