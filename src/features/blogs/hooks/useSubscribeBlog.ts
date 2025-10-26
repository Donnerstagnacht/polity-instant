import { useState, useEffect } from 'react';
import { db, tx, id } from '../../../../db';
import { useAuthStore } from '@/features/auth/auth.ts';

/**
 * Hook to handle blog subscription functionality
 * @param targetBlogId - The ID of the blog to subscribe/unsubscribe
 */
export function useSubscribeBlog(targetBlogId?: string) {
  const { user: authUser } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Query to get all subscribers for the target blog
  const { data: subscriptionData, isLoading: subscriptionLoading } = db.useQuery(
    targetBlogId
      ? {
          subscribers: {
            $: {
              where: {
                'blog.id': targetBlogId,
              },
            },
            subscriber: {},
            blog: {},
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
  }, [subscriptionData, authUser?.id, targetBlogId, subscriptionLoading]);

  // Subscribe to a blog
  const subscribe = async () => {
    if (!authUser?.id || !targetBlogId) {
      return;
    }

    setIsLoading(true);
    try {
      await db.transact([
        tx.subscribers[id()]
          .update({
            createdAt: new Date(),
          })
          .link({
            subscriber: authUser.id,
            blog: targetBlogId,
          }),
      ]);
    } catch (error) {
      console.error('Failed to subscribe to blog:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Unsubscribe from a blog
  const unsubscribe = async () => {
    if (!authUser?.id || !targetBlogId) {
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
      }
    } catch (error) {
      console.error('Failed to unsubscribe from blog:', error);
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
    canSubscribe: !!authUser?.id && !!targetBlogId,
  };
}
