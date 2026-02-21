/**
 * Notification Factory
 *
 * Creates notifications for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminUpsert } from '../admin-db';

export interface CreateNotificationOptions {
  id?: string;
  type?: string;
  title?: string;
  message?: string;
  isRead?: boolean;
  relatedGroupId?: string;
  relatedEventId?: string;
  relatedAmendmentId?: string;
  relatedUserId?: string;
}

export interface CreatedNotification {
  id: string;
  type: string;
}

export class NotificationFactory extends FactoryBase {
  private _counter = 0;

  /**
   * Create a notification for a recipient from a sender.
   */
  async createNotification(
    recipientId: string,
    senderId: string,
    overrides: CreateNotificationOptions = {}
  ): Promise<CreatedNotification> {
    this._counter++;
    const notificationId = overrides.id ?? this.generateId();
    const type = overrides.type ?? 'comment_added';
    const now = new Date().toISOString();

    await adminUpsert('notification', {
      id: notificationId,
      recipient_id: recipientId,
      sender_id: senderId,
      type,
      title: overrides.title ?? `E2E Notification ${this._counter}`,
      message: overrides.message ?? 'Test notification message',
      is_read: overrides.isRead ?? false,
      related_group_id: overrides.relatedGroupId ?? null,
      related_event_id: overrides.relatedEventId ?? null,
      related_amendment_id: overrides.relatedAmendmentId ?? null,
      related_user_id: overrides.relatedUserId ?? null,
      created_at: now,
    });

    this.trackEntity('notification', notificationId);
    return { id: notificationId, type };
  }
}
