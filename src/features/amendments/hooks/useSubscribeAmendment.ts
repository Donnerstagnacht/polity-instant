import { useState, useEffect } from 'react';
import { db, tx, id } from '../../../../db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { notifyAmendmentNewSubscriber } from '@/utils/notification-helpers';
import { toast } from 'sonner';

/**
 * Hook to handle amendment subscription functionality
 * @param targetAmendmentId - The ID of the amendment to subscribe/unsubscribe
 */
export function useSubscribeAmendment(targetAmendmentId?: string) {
  const { user: authUser } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Query current user's name for notifications
  const { data: currentUserData } = db.useQuery(
    authUser?.id
      ? {
          $users: {
            $: {
              where: { id: authUser.id },
              limit: 1,
            },
          },
        }
      : null
  );
  const currentUserName = currentUserData?.$users?.[0]?.name || 'Someone';

  // Query amendment title for notifications
  const { data: amendmentData } = db.useQuery(
    targetAmendmentId
      ? {
          amendments: {
            $: {
              where: { id: targetAmendmentId },
              limit: 1,
            },
          },
        }
      : null
  );
  const amendmentTitle = amendmentData?.amendments?.[0]?.title || 'Amendment';

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
      const notification = notifyAmendmentNewSubscriber({
        senderId: authUser.id,
        senderName: currentUserName,
        amendmentId: targetAmendmentId,
        amendmentTitle: amendmentTitle,
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
      toast.success('Successfully subscribed to amendment');
    } catch (error) {
      console.error('Failed to subscribe to amendment:', error);
      toast.error('Failed to subscribe to amendment. Please try again.');
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
        toast.success('Successfully unsubscribed from amendment');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from amendment:', error);
      toast.error('Failed to unsubscribe from amendment. Please try again.');
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
