import { useState, useEffect } from 'react';
import { db, tx, id } from '../../../../db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { createNotification } from '@/utils/notification-helpers';

/**
 * Hook to handle amendment subscription functionality
 * @param targetAmendmentId - The ID of the amendment to subscribe/unsubscribe
 */
export function useSubscribeAmendment(targetAmendmentId?: string) {
  const { user: authUser } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Query to get all subscribers for the target amendment
  const { data: subscriptionData, isLoading: subscriptionLoading } = db.useQuery(
    targetAmendmentId
      ? {
          subscribers: {
            $: {
              where: {
                'amendment.id': targetAmendmentId,
              },
            },
            subscriber: {},
            amendment: {},
          },
        }
      : null
  );

  // Update subscription state when data changes
  useEffect(() => {
    const subscribers = subscriptionData?.subscribers || [];

    // Check if the current user is subscribed
    const subscribed = authUser?.id
      ? subscribers.some(sub => sub.subscriber?.id === authUser.id)
      : false;

    setIsSubscribed(subscribed);
    setSubscriberCount(subscribers.length);
  }, [subscriptionData, authUser?.id, targetAmendmentId, subscriptionLoading]);

  // Subscribe to an amendment
  const subscribe = async () => {
    if (!authUser?.id || !targetAmendmentId) {
      return;
    }

    setIsLoading(true);
    try {
      const subscriptionId = id();
      const notification = createNotification({
        senderId: authUser.id,
        recipientEntityType: 'amendment',
        recipientEntityId: targetAmendmentId,
        type: 'group_update',
        title: 'New Subscriber',
        message: `${authUser.name || 'A user'} subscribed to this amendment`,
        actionUrl: `/user/${authUser.id}`,
        relatedEntityType: 'amendment',
        relatedAmendmentId: targetAmendmentId,
      });

      await db.transact([
        tx.subscribers[subscriptionId]
          .update({
            createdAt: new Date(),
          })
          .link({
            subscriber: authUser.id,
            amendment: targetAmendmentId,
          }),
        ...notification,
      ]);
    } catch (error) {
      console.error('Failed to subscribe to amendment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from an amendment
  const unsubscribe = async () => {
    if (!authUser?.id || !targetAmendmentId) {
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
      console.error('Failed to unsubscribe from amendment:', error);
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
    canSubscribe: !!authUser?.id && !!targetAmendmentId,
  };
}
