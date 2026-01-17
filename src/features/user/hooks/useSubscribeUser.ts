import { useState, useEffect } from 'react';
import { db, tx, id } from '../../../../db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { toast } from 'sonner';
import { notifyNewFollower } from '@/utils/notification-helpers';

/**
 * Hook to handle user subscription functionality
 * @param targetUserId - The ID of the user to subscribe/unsubscribe
 */
export function useSubscribeUser(targetUserId?: string) {
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

  // Query to get all subscribers for the target user (we'll filter client-side)
  const { data: subscriptionData, isLoading: subscriptionLoading } = db.useQuery(
    targetUserId
      ? {
          subscribers: {
            $: {
              where: {
                'user.id': targetUserId,
              },
            },
            subscriber: {},
            user: {},
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
  }, [subscriptionData, authUser?.id, targetUserId, subscriptionLoading]);

  // Subscribe to a user
  const subscribe = async () => {
    if (!authUser?.id || !targetUserId || authUser.id === targetUserId) {
      return;
    }

    setIsLoading(true);
    try {
      const subscriptionTx = tx.subscribers[id()]
        .update({
          createdAt: new Date(),
        })
        .link({
          subscriber: authUser.id,
          user: targetUserId,
        });

      // Create notification for the user being followed
      const notificationTxs = notifyNewFollower({
        senderId: authUser.id,
        senderName: currentUserName,
        recipientUserId: targetUserId,
      });

      await db.transact([subscriptionTx, ...notificationTxs]);
      toast.success('Successfully subscribed to user');
    } catch (error) {
      console.error('🔔 [subscribe] Failed to subscribe:', error);
      toast.error('Failed to subscribe to user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from a user
  const unsubscribe = async () => {
    if (!authUser?.id || !targetUserId) {
      return;
    }

    const subscribers = subscriptionData?.subscribers || [];
    if (subscribers.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const subscriptionId = subscribers[0].id;
      await db.transact([tx.subscribers[subscriptionId].delete()]);
      toast.success('Successfully unsubscribed from user');
    } catch (error) {
      console.error('🔔 [unsubscribe] Failed to unsubscribe:', error);
      toast.error('Failed to unsubscribe from user. Please try again.');
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
    canSubscribe: authUser?.id && targetUserId && authUser.id !== targetUserId,
  };
}
