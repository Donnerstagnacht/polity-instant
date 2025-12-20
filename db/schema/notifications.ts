import { i } from '@instantdb/react';

const _notifications = {
  entities: {
    notifications: i.entity({
      actionUrl: i.string().optional(),
      createdAt: i.date().indexed(),
      isRead: i.boolean().indexed(),
      message: i.string(),
      relatedEntityType: i.string().optional(),
      title: i.string(),
      type: i.string().indexed(),
      // Fields for entity-based notifications
      onBehalfOfEntityType: i.string().indexed().optional(), // 'group', 'event', 'amendment', 'blog'
      onBehalfOfEntityId: i.string().indexed().optional(),
      recipientEntityType: i.string().indexed().optional(), // 'group', 'event', 'amendment', 'blog'
      recipientEntityId: i.string().indexed().optional(),
    }),
    pushSubscriptions: i.entity({
      endpoint: i.string().unique().indexed(),
      auth: i.string(),
      p256dh: i.string(),
      userAgent: i.string().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),
  },
  links: {
    notificationsRecipient: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'recipient',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'notifications',
      },
    },
    notificationsSender: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'sender',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'sentNotifications',
      },
    },
    notificationsRelatedUser: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'relatedUser',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'relatedNotifications',
      },
    },
    notificationsRelatedGroup: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'relatedGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'relatedNotifications',
      },
    },
    notificationsRelatedAmendment: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'relatedAmendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'relatedNotifications',
      },
    },
    notificationsRelatedEvent: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'relatedEvent',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'relatedNotifications',
      },
    },
    notificationsRelatedBlog: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'relatedBlog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'relatedNotifications',
      },
    },
    notificationsOnBehalfOfGroup: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'onBehalfOfGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'sentNotifications',
      },
    },
    notificationsOnBehalfOfEvent: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'onBehalfOfEvent',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'sentNotifications',
      },
    },
    notificationsOnBehalfOfAmendment: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'onBehalfOfAmendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'sentNotifications',
      },
    },
    notificationsOnBehalfOfBlog: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'onBehalfOfBlog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'sentNotifications',
      },
    },
    notificationsRecipientGroup: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'recipientGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'receivedNotifications',
      },
    },
    notificationsRecipientEvent: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'recipientEvent',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'receivedNotifications',
      },
    },
    notificationsRecipientAmendment: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'recipientAmendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'receivedNotifications',
      },
    },
    notificationsRecipientBlog: {
      forward: {
        on: 'notifications',
        has: 'one',
        label: 'recipientBlog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'receivedNotifications',
      },
    },
    pushSubscriptionsUser: {
      forward: {
        on: 'pushSubscriptions',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'pushSubscriptions',
      },
    },
  } as const,
};

export default _notifications;
