import { useState, useEffect } from 'react';
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

    setIsSubscribed(subscribed);
    setSubscriberCount(subscribers.length);
  }, [subscriptionData, authUser?.id, targetEventId, subscriptionLoading]);

  // Subscribe to an event
  const subscribe = async () => {
    if (!authUser?.id || !targetEventId) {
      return;
    }

    setIsLoading(true);
    try {
      const subscriptionId = id();
      const notification = notifyEventNewSubscriber({
        senderId: authUser.id,
        senderName: currentUserName,
        eventId: targetEventId,
        eventTitle: eventTitle,
      });

      await db.transact([
        tx.subscribers[subscriptionId]
          .update({
            createdAt: new Date(),
          })
          .link({
            subscriber: authUser.id,
            event: targetEventId,
          }),
        ...notification,
      ]);
      toast.success('Successfully subscribed to event');
    } catch (error) {
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
    if (subscribers.length === 0) {
      return;
    }

    setIsLoading(true);
    try {
      const subscription = subscribers.find(sub => sub.subscriber?.id === authUser.id);
      if (subscription) {
        await db.transact([tx.subscribers[subscription.id].delete()]);
        toast.success('Successfully unsubscribed from event');
      }
    } catch (error) {
      console.error('Failed to unsubscribe from event:', error);
      toast.error('Failed to unsubscribe from event. Please try again.');
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
    canSubscribe: !!authUser?.id && !!targetEventId,
  };
}
