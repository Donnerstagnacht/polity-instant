/**
 * Hook for managing group links
 */

import { useState } from 'react';
import { useGroupLinks as useFacadeGroupLinks } from '@/zero/groups/useGroupState';
import { toast } from 'sonner';
import { useCommonActions } from '@/zero/common/useCommonActions';

export function useGroupLinks(groupId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { links, isLoading: isQuerying } = useFacadeGroupLinks(groupId);
  const { createLink: createLinkAction, deleteLink: deleteLinkAction } = useCommonActions();

  const addLink = async (label: string, url: string, senderId?: string) => {
    setIsLoading(true);
    try {
      const linkId = crypto.randomUUID();
      await createLinkAction({
        id: linkId,
        label,
        url,
        group_id: groupId,
        user_id: senderId || null,
        meeting_slot_id: null,
      });

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

  const deleteLink = async (linkId: string) => {
    setIsLoading(true);
    try {
      await deleteLinkAction({ id: linkId });

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
