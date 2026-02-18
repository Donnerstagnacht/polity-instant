import { useState, useEffect, useRef } from 'react';
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
  const optimisticTargetRef = useRef<boolean | null>(null);
  const createdSubscriptionIdRef = useRef<string | null>(null);

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

    if (optimisticTargetRef.current !== null) {
      // Only clear optimistic state once DB data matches expected state
      if (subscribed === optimisticTargetRef.current) {
        optimisticTargetRef.current = null;
        createdSubscriptionIdRef.current = null;
        setSubscriberCount(subscribers.length);
      }
      return;
    }

    setIsSubscribed(subscribed);
    setSubscriberCount(subscribers.length);
  }, [subscriptionData, authUser?.id, targetUserId, subscriptionLoading]);

  // Subscribe to a user
  const subscribe = async () => {
    if (!authUser?.id || !targetUserId || authUser.id === targetUserId) {
      return;
    }

    // Prevent duplicate subscriptions
    const existing = (subscriptionData?.subscribers || []).find(
      sub => sub.subscriber?.id === authUser.id
    );
    if (existing) return;

    // Optimistic update
    optimisticTargetRef.current = true;
    setIsSubscribed(true);
    setSubscriberCount(prev => prev + 1);
    setIsLoading(true);
    try {
      const subscriptionId = id();
      createdSubscriptionIdRef.current = subscriptionId;
      const subscriptionTx = tx.subscribers[subscriptionId]
        .update({
          createdAt: new Date(),
        })
        .link({
          subscriber: authUser.id,
          user: targetUserId,
        });

      await db.transact([subscriptionTx]);

      // Notification is server-only — send separately
      try {
        const notificationTxs = notifyNewFollower({
          senderId: authUser.id,
          senderName: currentUserName,
          recipientUserId: targetUserId,
        });
        if (notificationTxs.length > 0) await db.transact(notificationTxs);
      } catch { /* notification delivery is best-effort */ }
      toast.success('Successfully subscribed to user');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      createdSubscriptionIdRef.current = null;
      setIsSubscribed(false);
      setSubscriberCount(prev => prev - 1);
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
    let subsToDelete = subscribers.filter(sub => sub.subscriber?.id === authUser.id);

    // Fallback: if reactive query hasn't caught up, use stored subscription ID
    if (subsToDelete.length === 0 && createdSubscriptionIdRef.current) {
      subsToDelete = [{ id: createdSubscriptionIdRef.current } as (typeof subscribers)[0]];
    }

    if (subsToDelete.length === 0) {
      return;
    }

    // Optimistic update
    optimisticTargetRef.current = false;
    setIsSubscribed(false);
    setSubscriberCount(prev => Math.max(0, prev - subsToDelete.length));
    setIsLoading(true);
    try {
      await db.transact(subsToDelete.map(sub => tx.subscribers[sub.id].delete()));
      createdSubscriptionIdRef.current = null;
      toast.success('Successfully unsubscribed from user');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      setIsSubscribed(true);
      setSubscriberCount(prev => prev + subsToDelete.length);
      console.error('🔔 [unsubscribe] Failed to unsubscribe:', error);
      toast.error('Failed to unsubscribe from user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle subscribe/unsubscribe
  const toggleSubscribe = async () => {
    if (isLoading) return;
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
