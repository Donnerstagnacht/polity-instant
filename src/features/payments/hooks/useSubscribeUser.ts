import { useState, useEffect, useRef } from 'react';
import { useUserState } from '@/zero/users/useUserState';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { useCommonState } from '@/zero/common/useCommonState';
import { useAuth } from '@/providers/auth-provider';
import { notifyNewFollower } from '@/utils/notification-helpers';

/**
 * Hook to handle user subscription functionality
 * @param targetUserId - The ID of the user to subscribe/unsubscribe
 */
export function useSubscribeUser(targetUserId?: string) {
  const { user: authUser } = useAuth();
  const { currentUser } = useUserState();
  const commonActions = useCommonActions();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const optimisticTargetRef = useRef<boolean | null>(null);
  const createdSubscriptionIdRef = useRef<string | null>(null);

  // Current user's name for notifications
  const currentUserName = currentUser
    ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(' ') || 'Someone'
    : 'Someone';

  // Query to get all subscribers for the target user (we'll filter client-side)
  const { userSubscribers: subscriptionRows } = useCommonState({
    subscriberUserId: targetUserId,
  });
  const subscriptionLoading = false;

  // Update subscription state when data changes
  useEffect(() => {
    const subscribers = subscriptionRows || [];

    // Check if the current user is subscribed by looking for their ID in the subscriber list
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
  }, [subscriptionRows, authUser?.id, targetUserId, subscriptionLoading]);

  // Subscribe to a user
  const subscribe = async () => {
    if (!authUser?.id || !targetUserId || authUser.id === targetUserId) {
      return;
    }

    // Prevent duplicate subscriptions
    const existing = (subscriptionRows || []).find(sub => sub.subscriber_user?.id === authUser.id);
    if (existing) return;

    // Optimistic update
    optimisticTargetRef.current = true;
    setIsSubscribed(true);
    setSubscriberCount(prev => prev + 1);
    setIsLoading(true);
    try {
      const subscriptionId = crypto.randomUUID();
      createdSubscriptionIdRef.current = subscriptionId;

      await commonActions.subscribe({
        id: subscriptionId,
        user_id: targetUserId,
        group_id: null,
        amendment_id: null,
        event_id: null,
        blog_id: null,
      });

      // Notification is server-only — send separately
      try {
        notifyNewFollower({
          senderId: authUser.id,
          senderName: currentUserName,
          recipientUserId: targetUserId,
        });
      } catch {
        /* notification delivery is best-effort */
      }
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      createdSubscriptionIdRef.current = null;
      setIsSubscribed(false);
      setSubscriberCount(prev => prev - 1);
      console.error('🔔 [subscribe] Failed to subscribe:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from a user
  const unsubscribe = async () => {
    if (!authUser?.id || !targetUserId) {
      return;
    }

    const subscribers = subscriptionRows || [];
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
        await commonActions.unsubscribe({ id: sub.id });
      }
      createdSubscriptionIdRef.current = null;
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      setIsSubscribed(true);
      setSubscriberCount(prev => prev + subsToDelete.length);
      console.error('🔔 [unsubscribe] Failed to unsubscribe:', error);
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
