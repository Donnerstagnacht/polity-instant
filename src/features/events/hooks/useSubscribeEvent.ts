import { useState, useEffect, useRef } from 'react';
import { db, tx, id } from '../../../../db/db';
import { useAuthStore } from '@/features/auth/auth.ts';
import { notifyEventNewSubscriber } from '@/utils/notification-helpers';
import { toast } from 'sonner';

/**
 * Hook to handle event subscription functionality
 * @param targetEventId - The ID of the event to subscribe/unsubscribe
 */
export function useSubscribeEvent(targetEventId?: string) {
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

  // Query event title for notifications
  const { data: eventData } = db.useQuery(
    targetEventId
      ? {
          events: {
            $: {
              where: { id: targetEventId },
              limit: 1,
            },
          },
        }
      : null
  );
  const eventTitle = eventData?.events?.[0]?.title || 'Event';

  // Query to get all subscribers for the target event
  const { data: subscriptionData, isLoading: subscriptionLoading } = db.useQuery(
    targetEventId
      ? {
          subscribers: {
            $: {
              where: {
                'event.id': targetEventId,
              },
            },
            subscriber: {},
            event: {},
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
  }, [subscriptionData, authUser?.id, targetEventId, subscriptionLoading]);

  // Subscribe to an event
  const subscribe = async () => {
    if (!authUser?.id || !targetEventId) {
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
            event: targetEventId,
          }),
      ]);

      // Send notification separately — notifications.create is server-only
      try {
        const notification = notifyEventNewSubscriber({
          senderId: authUser.id,
          senderName: currentUserName,
          eventId: targetEventId,
          eventTitle: eventTitle,
        });
        if (notification.length > 0) await db.transact(notification);
      } catch { /* notification delivery is best-effort */ }
      toast.success('Successfully subscribed to event');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      createdSubscriptionIdRef.current = null;
      setIsSubscribed(false);
      setSubscriberCount(prev => prev - 1);
      console.error('Failed to subscribe to event:', error);
      toast.error('Failed to subscribe to event. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from an event
  const unsubscribe = async () => {
    if (!authUser?.id || !targetEventId) {
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
      toast.success('Successfully unsubscribed from event');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      setIsSubscribed(true);
      setSubscriberCount(prev => prev + subsToDelete.length);
      console.error('Failed to unsubscribe from event:', error);
      toast.error('Failed to unsubscribe from event. Please try again.');
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
    canSubscribe: !!authUser?.id && !!targetEventId,
  };
}
