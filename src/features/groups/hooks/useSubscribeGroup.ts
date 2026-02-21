import { useState, useEffect, useRef } from 'react';
import { useGroupSubscribers } from '@/zero/groups/useGroupState';
import { useCommonActions } from '@/zero/common/useCommonActions';
import { useUserState } from '@/zero/users/useUserState';
import { useAuth } from '@/providers/auth-provider';
import { notifyGroupNewSubscriber } from '@/utils/notification-helpers';
import { sendNotificationFn } from '@/server/notifications';
import { toast } from 'sonner';

/**
 * Hook to handle group subscription functionality
 * @param targetGroupId - The ID of the group to subscribe/unsubscribe
 */
export function useSubscribeGroup(targetGroupId?: string) {
  const { user: authUser } = useAuth();
  const { subscribe: subscribeAction, unsubscribe: unsubscribeAction } = useCommonActions();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const optimisticTargetRef = useRef<boolean | null>(null);
  const createdSubscriptionIdRef = useRef<string | null>(null);

  // Get current user name for notifications
  const { currentUser: currentUserRows } = useUserState({ userId: authUser?.id });
  const currentUserName = (currentUserRows as any)?.[0]?.name || authUser?.email || 'Someone';

  // Get group + subscribers from facade
  const { groupName, subscribers: subscribersData, isLoading: subscriptionLoading } = useGroupSubscribers(targetGroupId);

  const subscriptionData = { subscribers: subscribersData || [] };

  // Update subscription state when data changes
  useEffect(() => {
    const subscribers = subscriptionData?.subscribers || [];

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
  }, [subscriptionData, authUser?.id, targetGroupId, subscriptionLoading]);

  // Subscribe to a group
  const subscribe = async () => {
    if (!authUser?.id || !targetGroupId) {
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

      await subscribeAction({
        id: subscriptionId,
        user_id: '',
        group_id: targetGroupId,
        amendment_id: '',
        event_id: '',
        blog_id: '',
      });

      sendNotificationFn({ data: { helper: 'notifyGroupNewSubscriber', params: { senderId: authUser.id, groupId: targetGroupId, groupName } } }).catch(console.error)
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
      await Promise.all(subsToDelete.map(sub => unsubscribeAction({ id: sub.id })));
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
