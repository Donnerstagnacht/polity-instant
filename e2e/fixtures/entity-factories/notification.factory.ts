/**
 * Notification Factory
 *
 * Creates notifications for E2E tests.
 */

import { FactoryBase } from './factory-base';
import { adminTransact, tx } from '../admin-db';

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
    const now = new Date();
    const txns: any[] = [];

    txns.push(
      tx.notifications[notificationId]
        .update({
          type,
          title: overrides.title ?? `E2E Notification ${this._counter}`,
          message: overrides.message ?? 'Test notification message',
          isRead: overrides.isRead ?? false,
          createdAt: now,
        })
        .link({ recipient: recipientId, sender: senderId })
    );
    this.trackEntity('notifications', notificationId);

    // Link to related entities if provided
    if (overrides.relatedGroupId) {
      txns.push(tx.notifications[notificationId].link({ relatedGroup: overrides.relatedGroupId }));
      this.trackLink('notifications', notificationId, 'relatedGroup', overrides.relatedGroupId);
    }
    if (overrides.relatedEventId) {
      txns.push(tx.notifications[notificationId].link({ relatedEvent: overrides.relatedEventId }));
      this.trackLink('notifications', notificationId, 'relatedEvent', overrides.relatedEventId);
    }
    if (overrides.relatedAmendmentId) {
      txns.push(tx.notifications[notificationId].link({ relatedAmendment: overrides.relatedAmendmentId }));
      this.trackLink('notifications', notificationId, 'relatedAmendment', overrides.relatedAmendmentId);
    }
    if (overrides.relatedUserId) {
      txns.push(tx.notifications[notificationId].link({ relatedUser: overrides.relatedUserId }));
      this.trackLink('notifications', notificationId, 'relatedUser', overrides.relatedUserId);
    }

    await adminTransact(txns);
    return { id: notificationId, type };
  }
}
