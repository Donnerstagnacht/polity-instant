'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../../db/db';
import { tx, id } from '@instantdb/react';
import { useTranslation } from '@/hooks/use-translation';

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
  const { t } = useTranslation();
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [error, setError] = useState<string | null>(null);

  const { user } = db.useAuth();

  // Keep a stable ref for the translation function to avoid callback re-identity
  const tRef = useRef(t);
  tRef.current = t;

  // Check if push notifications are supported
  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;

    setIsSupported(supported);

    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    setIsLoading(false);
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
      } catch {
        setError(tRef.current('components.pushNotifications.errors.changeFailed'));
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSubscription();
  }, [isSupported, user]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      throw new Error(tRef.current('components.pushNotifications.errors.notSupported'));
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch {
      throw new Error(tRef.current('components.pushNotifications.errors.permissionRequest'));
    }
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError(tRef.current('components.pushNotifications.errors.notSupported'));
      return;
    }

    if (!user) {
      setError(tRef.current('components.pushNotifications.errors.notLoggedIn'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Request permission if not already granted (read directly from API, not state)
      let currentPermission = Notification.permission;

      if (currentPermission !== 'granted') {
        currentPermission = await requestPermission();
      }

      if (currentPermission !== 'granted') {
        const errorMsg =
          currentPermission === 'denied'
            ? tRef.current('components.pushNotifications.errors.permissionBlocked')
            : tRef.current('components.pushNotifications.errors.permissionDismissed');
        setError(errorMsg);
        setIsLoading(false);
        throw new Error(errorMsg);
      }

      // Ensure service worker is registered
      let swRegistration = await navigator.serviceWorker.getRegistration();

      if (!swRegistration) {
        try {
          swRegistration = await navigator.serviceWorker.register('/custom-sw.js', {
            scope: '/',
          });

          // Wait for it to become active
          if (swRegistration.installing) {
            await new Promise<void>((resolve) => {
              swRegistration!.installing!.addEventListener('statechange', function (e) {
                if ((e.target as ServiceWorker).state === 'activated') {
                  resolve();
                }
              });
            });
          }
        } catch {
          throw new Error(tRef.current('components.pushNotifications.errors.swRegistration'));
        }
      }

      // Wait for service worker to be ready with timeout
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration>((_, reject) =>
          setTimeout(
            () => reject(new Error(tRef.current('components.pushNotifications.errors.swTimeout'))),
            5000
          )
        ),
      ]);

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

        if (!vapidPublicKey) {
          throw new Error(tRef.current('components.pushNotifications.errors.vapidMissing'));
        }

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // Store subscription in InstantDB
      const subscriptionJson = subscription.toJSON();
      const keys = subscriptionJson.keys;

      if (!keys || !keys.auth || !keys.p256dh) {
        throw new Error(tRef.current('components.pushNotifications.errors.invalidKeys'));
      }

      await db.transact([
        tx.pushSubscriptions[id()]
          .update({
            endpoint: subscription.endpoint,
            auth: keys.auth,
            p256dh: keys.p256dh,
            userAgent: navigator.userAgent,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .link({ user: user.id }),
      ]);

      setIsSubscribed(true);
      setError(null);
    } catch (err: any) {
      const errorMsg =
        err.message || tRef.current('components.pushNotifications.errors.subscribeFailed');
      setError(errorMsg);
      setIsSubscribed(false);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, requestPermission]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) {
      setError(tRef.current('components.pushNotifications.errors.notSupported'));
      return;
    }

    if (!user) {
      setError(tRef.current('components.pushNotifications.errors.notLoggedIn'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const endpoint = subscription.endpoint;

        // Unsubscribe from push at browser level
        await subscription.unsubscribe();

        // Remove matching subscription record(s) from InstantDB
        const { data } = await db.queryOnce({
          pushSubscriptions: {
            $: {
              where: {
                endpoint,
                'user.id': user.id,
              },
            },
          },
        });

        if (data?.pushSubscriptions?.length) {
          await db.transact(
            data.pushSubscriptions.map((sub: any) => tx.pushSubscriptions[sub.id].delete())
          );
        }
      }

      setIsSubscribed(false);
      setError(null);
    } catch (err: any) {
      setError(
        err.message || tRef.current('components.pushNotifications.errors.unsubscribeFailed')
      );
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
