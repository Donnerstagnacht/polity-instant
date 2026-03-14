import { useState, useEffect, useRef } from 'react';
import { useBlogState } from '@/zero/blogs/useBlogState';
import { useBlogActions } from '@/zero/blogs/useBlogActions';
import { useUserState } from '@/zero/users/useUserState';
import { useAuth } from '@/providers/auth-provider';
import { notifyBlogNewSubscriber } from '@/features/notifications/utils/notification-helpers.ts';
import { toast } from 'sonner';

/**
 * Hook to handle blog subscription functionality
 * @param targetBlogId - The ID of the blog to subscribe/unsubscribe
 */
export function useSubscribeBlog(targetBlogId?: string) {
  const { user: authUser } = useAuth();
  const { blog, subscribers } = useBlogState({ blogId: targetBlogId, includeSubscribers: true });
  const { subscribeToBlog, unsubscribeFromBlog, sendNotifications } = useBlogActions();
  const { currentUser } = useUserState();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const optimisticTargetRef = useRef<boolean | null>(null);
  const createdSubscriptionIdRef = useRef<string | null>(null);

  const currentUserName = currentUser?.first_name || 'Someone';
  const blogTitle = blog?.title || 'Blog';
  const subscriptionData = { subscribers: subscribers ?? [] };
  const subscriptionLoading = false;

  // Update subscription state when data changes
  useEffect(() => {
    const subs = subscriptionData?.subscribers || [];

    // Check if the current user is subscribed
    const subscribed = authUser?.id
      ? subs.some(sub => sub.subscriber_user?.id === authUser.id)
      : false;

    if (optimisticTargetRef.current !== null) {
      // Only clear optimistic state once DB data matches expected state
      if (subscribed === optimisticTargetRef.current) {
        optimisticTargetRef.current = null;
        createdSubscriptionIdRef.current = null;
        setSubscriberCount(blog?.subscriber_count ?? subs.length);
      }
      return;
    }

    setIsSubscribed(subscribed);
    setSubscriberCount(blog?.subscriber_count ?? subs.length);
  }, [subscriptionData, authUser?.id, targetBlogId, subscriptionLoading, blog?.subscriber_count]);

  // Subscribe to a blog
  const subscribe = async () => {
    if (!authUser?.id || !targetBlogId) {
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

      await subscribeToBlog({
        id: subscriptionId,
        user_id: null,
        group_id: null,
        amendment_id: null,
        event_id: null,
        blog_id: targetBlogId,
      });

      // Send notification separately — notifications.create is server-only
      try {
        const notifications = await notifyBlogNewSubscriber({
          senderId: authUser.id,
          senderName: currentUserName,
          blogId: targetBlogId,
          blogTitle: blogTitle,
        });
        if (Array.isArray(notifications) && notifications.length > 0) {
          await sendNotifications(notifications);
        }
      } catch {
        /* notification delivery is best-effort */
      }
      toast.success('Successfully subscribed to blog');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      createdSubscriptionIdRef.current = null;
      setIsSubscribed(false);
      setSubscriberCount(prev => prev - 1);
      console.error('Failed to subscribe to blog:', error);
      toast.error('Failed to subscribe to blog. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from a blog
  const unsubscribe = async () => {
    if (!authUser?.id || !targetBlogId) {
      return;
    }

    const subs = subscriptionData?.subscribers || [];
    let subsToDelete = subs.filter(sub => sub.subscriber_user?.id === authUser.id);

    // Fallback: if reactive query hasn't caught up, use stored subscription ID
    if (subsToDelete.length === 0 && createdSubscriptionIdRef.current) {
      subsToDelete = [{ id: createdSubscriptionIdRef.current } as (typeof subs)[0]];
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
      await Promise.all(subsToDelete.map(sub => unsubscribeFromBlog(sub.id)));
      createdSubscriptionIdRef.current = null;
      toast.success('Successfully unsubscribed from blog');
    } catch (error) {
      // Revert optimistic update
      optimisticTargetRef.current = null;
      setIsSubscribed(true);
      setSubscriberCount(prev => prev + subsToDelete.length);
      console.error('Failed to unsubscribe from blog:', error);
      toast.error('Failed to unsubscribe from blog. Please try again.');
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
    canSubscribe: !!authUser?.id && !!targetBlogId,
  };
}
