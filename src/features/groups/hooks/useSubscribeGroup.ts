import { useState, useEffect } from 'react';
import { db, tx, id } from '../../../../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { createNotification } from '@/utils/notification-helpers';

/**
 * Hook to handle group subscription functionality
 * @param targetGroupId - The ID of the group to subscribe/unsubscribe
 */
export function useSubscribeGroup(targetGroupId?: string) {
  const { user: authUser } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Query to get all subscribers for the target group (we'll filter client-side)
  const { data: subscriptionData, isLoading: subscriptionLoading } = db.useQuery(
    targetGroupId
      ? {
          subscribers: {
            $: {
              where: {
                'group.id': targetGroupId,
              },
            },
            subscriber: {},
            group: {},
          },
        }
      : null
  );

  // Update subscription state when data changes
  useEffect(() => {
    const subscribers = subscriptionData?.subscribers || [];

    // Check if the current user is subscribed by looking for their ID in the subscriber list
    const subscribed = authUser?.id
      ? subscribers.some(sub => sub.subscriber?.id === authUser.id)
      : false;

    setIsSubscribed(subscribed);
    setSubscriberCount(subscribers.length);
  }, [subscriptionData, authUser?.id, targetGroupId, subscriptionLoading]);

  // Subscribe to a group
  const subscribe = async () => {
    if (!authUser?.id || !targetGroupId) {
      return;
    }

    setIsLoading(true);
    try {
      const subscriptionId = id();
      const notification = createNotification({
        senderId: authUser.id,
        recipientEntityType: 'group',
        recipientEntityId: targetGroupId,
        type: 'group_update',
        title: 'New Subscriber',
        message: `${authUser.name || 'A user'} subscribed to this group`,
        actionUrl: `/user/${authUser.id}`,
        relatedEntityType: 'group',
        relatedGroupId: targetGroupId,
      });

      await db.transact([
        tx.subscribers[subscriptionId]
          .update({
            createdAt: new Date(),
          })
          .link({
            subscriber: authUser.id,
            group: targetGroupId,
          }),
        ...notification,
      ]);
    } catch (error) {
      console.error('Failed to subscribe to group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from a group
  const unsubscribe = async () => {
    if (!authUser?.id || !targetGroupId) {
      return;
    }

    const subscribers = subscriptionData?.subscribers || [];
    if (subscribers.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const subscription = subscribers.find(sub => sub.subscriber?.id === authUser.id);
      if (subscription) {
        await db.transact([tx.subscribers[subscription.id].delete()]);
      }
    } catch (error) {
      console.error('Failed to unsubscribe from group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle subscribe/unsubscribe
  const toggleSubscribe = async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  return {
    isSubscribed,
    subscriberCount,
    isLoading,
    subscribe,
    unsubscribe,
    toggleSubscribe,
    canSubscribe: !!authUser?.id && !!targetGroupId,
  };
}
