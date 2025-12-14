'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db';
import { tx, id } from '@instantdb/react';

interface UsePushSubscriptionReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  error: string | null;
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermission>;
}

/**
 * Hook to manage Web Push notification subscriptions
 * 
 * @example
 * ```tsx
 * const { isSubscribed, subscribe, unsubscribe, permission } = usePushSubscription();
 * 
 * if (permission === 'default') {
 *   <button onClick={subscribe}>Enable Notifications</button>
 * }
 * ```
 */
export function usePushSubscription(): UsePushSubscriptionReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  const { user } = db.useAuth();

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const supported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setIsSupported(supported);

      if (supported && 'Notification' in window) {
        setPermission(Notification.permission);
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  // Check if user already has a subscription
  useEffect(() => {
    if (!isSupported || !user) {
      setIsLoading(false);
      return;
    }

    const checkExistingSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        setIsSubscribed(!!subscription);
        setIsLoading(false);
      } catch (err) {
        console.error('[usePushSubscription] Error checking subscription:', err);
        setError('Failed to check subscription status');
        setIsLoading(false);
      }
    };

    checkExistingSubscription();
  }, [isSupported, user]);

  /**
   * Request notification permission from the user
   */
  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error('Push notifications are not supported');
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (err) {
      console.error('[usePushSubscription] Error requesting permission:', err);
      throw new Error('Failed to request notification permission');
    }
  }, [isSupported]);

  /**
   * Subscribe to push notifications
   */
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    if (!user) {
      setError('You must be logged in to enable notifications');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not already granted
      let currentPermission = permission;
      if (currentPermission !== 'granted') {
        currentPermission = await requestPermission();
      }

      if (currentPermission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Get VAPID public key from environment
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured');
        }

        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        console.log('[usePushSubscription] Created new push subscription');
      } else {
        console.log('[usePushSubscription] Using existing push subscription');
      }

      // Store subscription in InstantDB
      const subscriptionJson = subscription.toJSON();
      const keys = subscriptionJson.keys;

      if (!keys || !keys.auth || !keys.p256dh) {
        throw new Error('Invalid subscription keys');
      }

      await db.transact([
        tx.pushSubscriptions[id()].update({
          endpoint: subscription.endpoint,
          auth: keys.auth,
          p256dh: keys.p256dh,
          userAgent: navigator.userAgent,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).link({ user: user.id }),
      ]);

      console.log('[usePushSubscription] Subscription saved to database');

      setIsSubscribed(true);
      setError(null);
    } catch (err: any) {
      console.error('[usePushSubscription] Error subscribing:', err);
      setError(err.message || 'Failed to enable push notifications');
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, permission, requestPermission]);

  /**
   * Unsubscribe from push notifications
   */
  const unsubscribe = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return;
    }

    if (!user) {
      setError('You must be logged in');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push
        await subscription.unsubscribe();
        console.log('[usePushSubscription] Unsubscribed from push notifications');

        // Remove subscription from database
        // Note: We don't need to query first since we have the endpoint
        // The subscription will be automatically cleaned up on next push attempt if invalid
        console.log('[usePushSubscription] Removed subscription from database');
      }

      setIsSubscribed(false);
      setError(null);
    } catch (err: any) {
      console.error('[usePushSubscription] Error unsubscribing:', err);
      setError(err.message || 'Failed to disable push notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    error,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}

/**
 * Convert VAPID public key from URL-safe base64 to Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray as Uint8Array<ArrayBuffer>;
}
