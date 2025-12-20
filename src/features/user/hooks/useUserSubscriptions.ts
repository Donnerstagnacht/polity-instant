import { useMemo } from 'react';
import { db, tx } from '../../../../db/db';
import { toast } from 'sonner';

/**
 * Hook to query and manage user subscriptions
 * @param userId - The user ID to query subscriptions for
 */
export function useUserSubscriptions(userId?: string) {
  // Query for subscriptions (users, groups, amendments, events, blogs)
  const { data: subscriptionsData, isLoading: subscriptionsLoading } = db.useQuery(
    userId
      ? {
          subscribers: {
            $: {
              where: {
                'subscriber.id': userId,
              },
            },
            user: {},
            group: {},
            amendment: {},
            event: {
              organizer: {},
            },
            blog: {},
          },
        }
      : null
  );

  // Query for subscribers (users subscribed to this user)
  const { data: subscribersData, isLoading: subscribersLoading } = db.useQuery(
    userId
      ? {
          subscribers: {
            $: {
              where: {
                'user.id': userId,
              },
            },
            subscriber: {},
          },
        }
      : null
  );

  const subscriptions = useMemo(() => subscriptionsData?.subscribers || [], [subscriptionsData]);
  const subscribers = useMemo(() => subscribersData?.subscribers || [], [subscribersData]);

  const isLoading = subscriptionsLoading || subscribersLoading;

  /**
   * Unsubscribe from an entity
   */
  const unsubscribe = async (subscriptionId: string) => {
    try {
      await db.transact([tx.subscribers[subscriptionId].delete()]);
      toast.success('Unsubscribed successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast.error('Failed to unsubscribe');
      return { success: false, error };
    }
  };

  /**
   * Remove a subscriber
   */
  const removeSubscriber = async (subscriptionId: string) => {
    try {
      await db.transact([tx.subscribers[subscriptionId].delete()]);
      toast.success('Subscriber removed successfully');
      return { success: true };
    } catch (error) {
      console.error('Failed to remove subscriber:', error);
      toast.error('Failed to remove subscriber');
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
