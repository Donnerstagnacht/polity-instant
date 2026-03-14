/**
 * Notification category values for the `category` column.
 */
export const NOTIFICATION_CATEGORIES = {
  MEMBERSHIP: 'membership',
  SUBSCRIPTION: 'subscription',
  CONTENT: 'content',
  MODERATION: 'moderation',
  VOTING: 'voting',
  SYSTEM: 'system',
  AMENDMENT: 'amendment',
  EVENT: 'event',
  GROUP: 'group',
} as const

export type NotificationCategory = typeof NOTIFICATION_CATEGORIES[keyof typeof NOTIFICATION_CATEGORIES]
