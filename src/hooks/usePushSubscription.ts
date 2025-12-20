'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../db/db';
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

      console.log('[usePushSubscription] Browser support check:', {
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        notification: 'Notification' in window,
        supported,
      });

      setIsSupported(supported);

      if (supported && 'Notification' in window) {
        const currentPermission = Notification.permission;
        console.log('[usePushSubscription] Current notification permission:', currentPermission);
        setPermission(currentPermission);
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
      console.log('[usePushSubscription] ===== REQUESTING PERMISSION =====');
      console.log('[usePushSubscription] Current state:', {
        permission: Notification.permission,
        isSupported,
        hasNotification: 'Notification' in window,
      });
      
      // Show an alert to confirm we're actually calling this
      console.log('[usePushSubscription] About to call Notification.requestPermission()...');
      
      const result = await Notification.requestPermission();
      
      console.log('[usePushSubscription] ===== PERMISSION RESULT:', result, '=====');
      setPermission(result);
      return result;
    } catch (err) {
      console.error('[usePushSubscription] Error requesting permission:', err);
      throw new Error('Fehler beim Anfordern der Benachrichtigungsberechtigung');
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
      console.log('[usePushSubscription] Current permission:', currentPermission);
      
      if (currentPermission !== 'granted') {
        console.log('[usePushSubscription] Requesting permission...');
        currentPermission = await requestPermission();
        console.log('[usePushSubscription] Permission result:', currentPermission);
      }

      if (currentPermission !== 'granted') {
        const errorMsg = currentPermission === 'denied' 
          ? 'Benachrichtigungen wurden blockiert. Bitte in den Browser-Einstellungen aktivieren.'
          : 'Bitte erlauben Sie Benachrichtigungen im Browser-Dialog.';
        setError(errorMsg);
        setIsLoading(false);
        throw new Error(errorMsg);
      }

      console.log('[usePushSubscription] Permission granted, getting service worker...');
      
      // Check if service worker is registered
      let swRegistration = await navigator.serviceWorker.getRegistration();
      console.log('[usePushSubscription] Current SW registration:', swRegistration);
      
      if (!swRegistration) {
        console.log('[usePushSubscription] No SW registration found, attempting to register...');
        try {
          swRegistration = await navigator.serviceWorker.register('/custom-sw.js', {
            scope: '/',
          });
          console.log('[usePushSubscription] Service Worker registered successfully:', swRegistration);
          
          // Wait for it to become active
          if (swRegistration.installing) {
            await new Promise<void>((resolve) => {
              swRegistration!.installing!.addEventListener('statechange', function(e) {
                if ((e.target as ServiceWorker).state === 'activated') {
                  resolve();
                }
              });
            });
          }
        } catch (error) {
          console.error('[usePushSubscription] Failed to register service worker:', error);
          throw new Error('Service Worker konnte nicht registriert werden. Bitte laden Sie die Seite neu.');
        }
      }
      
      // Wait for service worker to be ready with timeout
      console.log('[usePushSubscription] Waiting for service worker to be ready...');
      const registration = await Promise.race([
        navigator.serviceWorker.ready,
        new Promise<ServiceWorkerRegistration>((_, reject) => 
          setTimeout(() => reject(new Error('Service Worker Timeout - bitte Seite neu laden')), 5000)
        )
      ]);
      
      console.log('[usePushSubscription] Service worker ready:', registration);

      // Check if already subscribed
      console.log('[usePushSubscription] Checking existing subscription...');
      let subscription = await registration.pushManager.getSubscription();
      console.log('[usePushSubscription] Existing subscription:', subscription);

      if (!subscription) {
        // Get VAPID public key from environment
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        console.log('[usePushSubscription] VAPID public key:', vapidPublicKey ? 'configured' : 'MISSING');

        if (!vapidPublicKey) {
          throw new Error('VAPID public key not configured');
        }

        console.log('[usePushSubscription] Creating new push subscription...');
        // Subscribe to push notifications
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        console.log('[usePushSubscription] Created new push subscription:', subscription);
      } else {
        console.log('[usePushSubscription] Using existing push subscription');
      }

      // Store subscription in InstantDB
      console.log('[usePushSubscription] Preparing to save to database...');
      const subscriptionJson = subscription.toJSON();
      const keys = subscriptionJson.keys;
      console.log('[usePushSubscription] Subscription keys:', keys ? 'present' : 'MISSING');

      if (!keys || !keys.auth || !keys.p256dh) {
        throw new Error('Invalid subscription keys');
      }

      console.log('[usePushSubscription] Saving subscription to InstantDB...');
      const dbResult = await db.transact([
        tx.pushSubscriptions[id()].update({
          endpoint: subscription.endpoint,
          auth: keys.auth,
          p256dh: keys.p256dh,
          userAgent: navigator.userAgent,
          createdAt: new Date(),
          updatedAt: new Date(),
        }).link({ user: user.id }),
      ]);

      console.log('[usePushSubscription] Database result:', dbResult);
      console.log('[usePushSubscription] ===== SUBSCRIPTION SAVED SUCCESSFULLY =====');

      setIsSubscribed(true);
      setError(null);
    } catch (err: any) {
      console.error('[usePushSubscription] Error subscribing:', err);
      const errorMsg = err.message || 'Fehler beim Aktivieren der Push-Benachrichtigungen';
      setError(errorMsg);
      setIsSubscribed(false);
      setIsLoading(false);
      throw err;
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
