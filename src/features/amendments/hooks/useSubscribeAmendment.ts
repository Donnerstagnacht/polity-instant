import { useState, useEffect, useRef } from 'react';
import { useAmendmentActions } from '@/zero/amendments/useAmendmentActions';
import { useAmendmentState } from '@/zero/amendments/useAmendmentState';
import { useAuth } from '@/providers/auth-provider';
import { notifyAmendmentNewSubscriber } from '@/features/shared/utils/notification-helpers';
import { toast } from 'sonner';

/**
 * Hook to handle amendment subscription functionality
 * @param targetAmendmentId - The ID of the amendment to subscribe/unsubscribe
 */
export function useSubscribeAmendment(targetAmendmentId?: string) {
  const { user: authUser } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const optimisticTargetRef = useRef<boolean | null>(null);
  const createdSubscriptionIdRef = useRef<string | null>(null);
  const { subscribe: subscribeAction, unsubscribe: unsubscribeAction } = useAmendmentActions();

  // Use facade state for amendment data and subscribers
  const {
    amendment: amendmentRows,
    subscribers: subscriptionData,
    isLoading: subscriptionLoading,
  } = useAmendmentState({
    amendmentId: targetAmendmentId,
    userId: authUser?.id,
  });

  // Get user name from auth user (no separate query needed)
  const currentUserName = authUser?.email?.split('@')[0] || 'Someone';

  // Get amendment title from facade
  const amendmentTitle = (amendmentRows as any)?.title || 'Amendment';

  // Update subscription state when data changes
  useEffect(() => {
    const subscribers = subscriptionData || [];

    // Check if the current user is subscribed
    const subscribed = authUser?.id
      ? subscribers.some(sub => sub.subscriber_user?.id === authUser.id)
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
  }, [subscriptionData, authUser?.id, targetAmendmentId, subscriptionLoading]);

  // Subscribe to an amendment
  const subscribe = async () => {
    if (!authUser?.id || !targetAmendmentId) {
      return;
    }

    // Prevent duplicate subscriptions
    const existing = (subscriptionData || []).find(
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

      await subscribeAction({
        id: subscriptionId,
        amendment_id: targetAmendmentId,
      });

      // Send notification separately
      try {
        await notifyAmendmentNewSubscriber({
          senderId: authUser.id,
          senderName: currentUserName,
          amendmentId: targetAmendmentId,
          amendmentTitle: amendmentTitle,
        });
      } catch { /* notification delivery is best-effort */ }
      toast.success('Successfully subscribed to amendment');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      createdSubscriptionIdRef.current = null;
      setIsSubscribed(false);
      setSubscriberCount(prev => prev - 1);
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

    const subscribers = subscriptionData || [];
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
      for (const sub of subsToDelete) {
        await unsubscribeAction(sub.id);
      }
      createdSubscriptionIdRef.current = null;
      toast.success('Successfully unsubscribed from amendment');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      setIsSubscribed(true);
      setSubscriberCount(prev => prev + subsToDelete.length);
      console.error('Failed to unsubscribe from amendment:', error);
      toast.error('Failed to unsubscribe from amendment. Please try again.');
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
    canSubscribe: !!authUser?.id && !!targetAmendmentId,
  };
}
