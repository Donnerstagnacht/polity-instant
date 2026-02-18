import { useState, useEffect, useRef } from 'react';
import { db, tx, id } from '../../../../db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { notifyGroupNewSubscriber } from '@/utils/notification-helpers';
import { toast } from 'sonner';

/**
 * Hook to handle group subscription functionality
 * @param targetGroupId - The ID of the group to subscribe/unsubscribe
 */
export function useSubscribeGroup(targetGroupId?: string) {
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

  // Query group name for notifications
  const { data: groupData } = db.useQuery(
    targetGroupId
      ? {
          groups: {
            $: {
              where: { id: targetGroupId },
              limit: 1,
            },
          },
        }
      : null
  );
  const groupName = groupData?.groups?.[0]?.name || 'Group';

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
  }, [subscriptionData, authUser?.id, targetGroupId, subscriptionLoading]);

  // Subscribe to a group
  const subscribe = async () => {
    if (!authUser?.id || !targetGroupId) {
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

      await db.transact([
        tx.subscribers[subscriptionId]
          .update({
            createdAt: new Date(),
          })
          .link({
            subscriber: authUser.id,
            group: targetGroupId,
          }),
      ]);

      // Send notification separately — notifications.create is server-only
      try {
        const notification = notifyGroupNewSubscriber({
          senderId: authUser.id,
          senderName: currentUserName,
          groupId: targetGroupId,
          groupName: groupName,
        });
        if (notification.length > 0) await db.transact(notification);
      } catch { /* notification delivery is best-effort */ }
      toast.success('Successfully subscribed to group');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      createdSubscriptionIdRef.current = null;
      setIsSubscribed(false);
      setSubscriberCount(prev => prev - 1);
      console.error('Failed to subscribe to group:', error);
      toast.error('Failed to subscribe to group. Please try again.');
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
      toast.success('Successfully unsubscribed from group');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      setIsSubscribed(true);
      setSubscriberCount(prev => prev + subsToDelete.length);
      console.error('Failed to unsubscribe from group:', error);
      toast.error('Failed to unsubscribe from group. Please try again.');
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
    canSubscribe: !!authUser?.id && !!targetGroupId,
  };
}
