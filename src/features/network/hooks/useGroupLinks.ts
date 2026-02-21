/**
 * Hook for managing group links
 */

import { useState } from 'react';
import { useGroupLinks as useFacadeGroupLinks } from '@/zero/groups/useGroupState';
import { toast } from 'sonner';
import type { GroupLink } from '@/features/groups/types/group.types';
import { notifyLinkAdded, notifyLinkRemoved } from '@/utils/notification-helpers';
import { sendNotificationFn } from '@/server/notifications';
import { useCommonActions } from '@/zero/common/useCommonActions';

export function useGroupLinks(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { links: linksData, isLoading: isQuerying } = useFacadeGroupLinks(groupId);
  const { createLink: createLinkAction, deleteLink: deleteLinkAction } = useCommonActions();

  const links = linksData as any as GroupLink[];

  const addLink = async (
    label: string,
    url: string,
    senderId?: string,
    groupName?: string,
    adminUserIds?: string[]
  ) => {
    setIsLoading(true);
    try {
      const linkId = crypto.randomUUID();
      await createLinkAction({
        id: linkId,
        label,
        url,
        group_id: groupId,
        user_id: senderId || '',
        meeting_slot_id: '',
      });

      sendNotificationFn({ data: { helper: 'notifyLinkAdded', params: { senderId, groupId, groupName } } }).catch(console.error)
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
      await deleteLinkAction({ id: linkId });

      sendNotificationFn({ data: { helper: 'notifyLinkRemoved', params: { senderId, groupId, groupName } } }).catch(console.error)
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
