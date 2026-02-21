import { useMemo } from 'react';
import { useCommonState } from '@/zero/common/useCommonState';
import { useCommonActions } from '@/zero/common/useCommonActions';

/**
 * Hook to query and manage user subscriptions
 * @param userId - The user ID to query subscriptions for
 */
export function useUserSubscriptions(userId?: string) {
  const { userSubscriptions: subscriptionRows, userSubscribers: subscriberRows } = useCommonState({
    subscriberId: userId,
    subscriberUserId: userId,
  });

  const { unsubscribe: commonUnsubscribe } = useCommonActions();

  const subscriptions = useMemo(() => subscriptionRows || [], [subscriptionRows]);
  const subscribers = useMemo(() => subscriberRows || [], [subscriberRows]);

  const isLoading = false;

  const unsubscribe = async (subscriptionId: string) => {
    try {
      await commonUnsubscribe({ id: subscriptionId });
      return { success: true };
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      return { success: false, error };
    }
  };

  const removeSubscriber = async (subscriptionId: string) => {
    try {
      await commonUnsubscribe({ id: subscriptionId });
      return { success: true };
    } catch (error) {
      console.error('Failed to remove subscriber:', error);
      return { success: false, error };
    }
  };

  /**
   * Get subscription counts by type
   */
  const getSubscriptionCounts = useMemo(() => {
    const counts = {
      users: 0,
      groups: 0,
      amendments: 0,
      events: 0,
      blogs: 0,
      total: subscriptions.length,
    };

    subscriptions.forEach((sub: any) => {
      if (sub.user) counts.users++;
      if (sub.group) counts.groups++;
      if (sub.amendment) counts.amendments++;
      if (sub.event) counts.events++;
      if (sub.blog) counts.blogs++;
    });

    return counts;
  }, [subscriptions]);

  return {
    subscriptions,
    subscribers,
    isLoading,
    unsubscribe,
    removeSubscriber,
    getSubscriptionCounts,
  };
}
