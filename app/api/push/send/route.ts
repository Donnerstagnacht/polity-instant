import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { init } from '@instantdb/admin';

// Initialize InstantDB Admin
if (!process.env.NEXT_PUBLIC_INSTANT_APP_ID || !process.env.INSTANT_ADMIN_TOKEN) {
  throw new Error('Missing InstantDB configuration');
}

const db = init({
  appId: process.env.NEXT_PUBLIC_INSTANT_APP_ID,
  adminToken: process.env.INSTANT_ADMIN_TOKEN,
});

// Configure VAPID details
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  throw new Error('Missing VAPID configuration');
}

const vapidDetails = {
  subject: process.env.VAPID_EMAIL || 'mailto:your-email@example.com',
  publicKey: process.env.VAPID_PUBLIC_KEY,
  privateKey: process.env.VAPID_PRIVATE_KEY,
};

webpush.setVapidDetails(vapidDetails.subject, vapidDetails.publicKey, vapidDetails.privateKey);

interface PushSubscription {
  id: string;
  endpoint: string;
  auth: string;
  p256dh: string;
  user: {
    id: string;
  };
}

interface NotificationPayload {
  title: string;
  message: string;
  actionUrl?: string;
  notificationId?: string;
  type?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, notification } = body as {
      userId: string;
      notification: NotificationPayload;
    };

    if (!userId || !notification) {
      return NextResponse.json({ error: 'Missing userId or notification data' }, { status: 400 });
    }

    // Validate VAPID configuration
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error('[Push API] VAPID keys not configured');
      return NextResponse.json({ error: 'Push notifications not configured' }, { status: 500 });
    }

    // Query all push subscriptions for this user
    const result = await db.query({
      pushSubscriptions: {
        $: {
          where: {
            'user.id': userId,
          },
        },
        user: {},
      },
    });

    const subscriptions = result.pushSubscriptions as unknown as PushSubscription[];

    if (!subscriptions || subscriptions.length === 0) {
      console.log(`[Push API] No subscriptions found for user ${userId}`);
      return NextResponse.json(
        {
          message: 'No subscriptions found',
          sent: 0,
          failed: 0,
        },
        { status: 200 }
      );
    }

    console.log(`[Push API] Found ${subscriptions.length} subscription(s) for user ${userId}`);

    // Prepare notification payload
    const payload = JSON.stringify({
      title: notification.title,
      message: notification.message,
      body: notification.message, // Alias for compatibility
      actionUrl: notification.actionUrl,
      notificationId: notification.notificationId,
      type: notification.type,
      icon: notification.icon || '/icons/icon-192x192.png',
      badge: notification.badge || '/icons/icon-192x192.png',
      tag: notification.tag || notification.type || 'notification',
      requireInteraction: notification.requireInteraction || false,
      actions: notification.actions || [],
    });

    // Send push notification to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async subscription => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              auth: subscription.auth,
              p256dh: subscription.p256dh,
            },
          };

          await webpush.sendNotification(pushSubscription, payload);

          console.log(
            `[Push API] Successfully sent notification to ${subscription.endpoint.substring(0, 50)}...`
          );

          return { success: true, subscriptionId: subscription.id };
        } catch (error: any) {
          console.error(`[Push API] Failed to send to subscription ${subscription.id}:`, error);

          // Handle expired or invalid subscriptions
          if (error.statusCode === 410 || error.statusCode === 404) {
            console.log(
              `[Push API] Subscription ${subscription.id} is no longer valid, removing...`
            );

            // Delete invalid subscription
            try {
              await db.transact([db.tx.pushSubscriptions[subscription.id].delete()]);
              console.log(`[Push API] Deleted invalid subscription ${subscription.id}`);
            } catch (deleteError) {
              console.error(
                `[Push API] Failed to delete subscription ${subscription.id}:`,
                deleteError
              );
            }
          }

          return {
            success: false,
            subscriptionId: subscription.id,
            error: error.message,
          };
        }
      })
    );

    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.filter(
      r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
    ).length;

    console.log(`[Push API] Sent ${sent} notification(s), ${failed} failed for user ${userId}`);

    return NextResponse.json(
      {
        message: 'Push notifications sent',
        sent,
        failed,
        total: subscriptions.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Push API] Error sending push notifications:', error);
    return NextResponse.json({ error: 'Failed to send push notifications' }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  const isConfigured = !!process.env.VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY;

  return NextResponse.json({
    status: 'ok',
    pushNotificationsEnabled: isConfigured,
    vapidPublicKey:
      isConfigured && process.env.VAPID_PUBLIC_KEY
        ? process.env.VAPID_PUBLIC_KEY.substring(0, 20) + '...'
        : 'Not configured',
  });
}
