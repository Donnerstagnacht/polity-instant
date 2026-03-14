import { useState, useEffect, useRef } from 'react';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { useEventSubscribers } from '@/zero/events/useEventState';
import { useAuth } from '@/providers/auth-provider';
import { notifyEventNewSubscriber } from '@/features/notifications/utils/notification-helpers.ts';
import { toast } from 'sonner';

/**
 * Hook to handle event subscription functionality
 * @param targetEventId - The ID of the event to subscribe/unsubscribe
 */
export function useSubscribeEvent(targetEventId?: string) {
  const { user: authUser } = useAuth();
  const { subscribe: doSubscribe, unsubscribe: doUnsubscribe } = useCommonActions();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const optimisticTargetRef = useRef<boolean | null>(null);
  const createdSubscriptionIdRef = useRef<string | null>(null);

  // Query current user's name for notifications
  const currentUserName = authUser?.email || 'Someone';

  // Query event title for notifications - use subscribers data
  const { subscribers: subscribersData, subscriberCount: persistedSubscriberCount, isLoading: subscriptionLoading } = useEventSubscribers(targetEventId);
  const eventTitle = subscribersData?.[0]?.event?.title || 'Event';
  const subscriptionData = { subscribers: subscribersData || [] };

  // Update subscription state when data changes
  useEffect(() => {
    const subscribers = subscriptionData?.subscribers || [];

    // Check if the current user is subscribed
    const subscribed = authUser?.id
      ? subscribers.some(sub => sub.subscriber_user?.id === authUser.id)
      : false;

    if (optimisticTargetRef.current !== null) {
      // Only clear optimistic state once DB data matches expected state
      if (subscribed === optimisticTargetRef.current) {
        optimisticTargetRef.current = null;
        createdSubscriptionIdRef.current = null;
        setSubscriberCount(persistedSubscriberCount ?? subscribers.length);
      }
      return;
    }

    setIsSubscribed(subscribed);
    setSubscriberCount(persistedSubscriberCount ?? subscribers.length);
  }, [subscriptionData, authUser?.id, targetEventId, subscriptionLoading, persistedSubscriberCount]);

  // Subscribe to an event
  const subscribe = async () => {
    if (!authUser?.id || !targetEventId) {
      return;
    }

    // Prevent duplicate subscriptions
    const existing = (subscriptionData?.subscribers || []).find(
      sub => sub.subscriber_user?.id === authUser.id
    );
    if (existing) return;

    // Optimistic update
    optimisticTargetRef.current = true;
    setIsSubscribed(true);
    setSubscriberCount(prev => prev + 1);
    setIsLoading(true);
    try {
      const subscriptionId = crypto.randomUUID();
      createdSubscriptionIdRef.current = subscriptionId;

      await doSubscribe({
        id: subscriptionId,
        user_id: null,
        group_id: null,
        amendment_id: null,
        event_id: targetEventId,
        blog_id: null,
      });


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
    let subsToDelete = subscribers.filter(sub => sub.subscriber_user?.id === authUser.id);

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
      await Promise.all(subsToDelete.map(sub => doUnsubscribe({ id: sub.id })));
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
