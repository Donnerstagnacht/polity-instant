/**
 * Notification Settings Types
 *
 * These types define the structure of user notification preferences
 * for each entity category (groups, events, amendments, blogs, todos, social).
 */

// ============================================================================
// Group Notification Settings
// ============================================================================

export interface GroupNotificationSettings {
  /** Tasks assigned to the user within the group */
  tasksAssigned: boolean;
  /** Payment-related notifications (created, updated, deleted) */
  paymentNotifications: boolean;
  /** New events created in the group */
  newEvents: boolean;
  /** New amendments linked to the group */
  newAmendments: boolean;
  /** New relationships (parent/child group connections) */
  newRelationships: boolean;
  /** New positions created in the group */
  newPositions: boolean;
  /** New documents shared in the group */
  newDocuments: boolean;
  /** New members joined (admin only) */
  newMembers: boolean;
  /** Role updates (promotions, demotions) */
  roleUpdates: boolean;
  /** New subscribers (admin only) */
  newSubscribers: boolean;
  /** Profile updates (name, description, image) */
  profileUpdates: boolean;
  /** Membership requests (admin only) */
  membershipRequests: boolean;
  /** Membership invitations */
  membershipInvitations: boolean;
}

// ============================================================================
// Event Notification Settings
// ============================================================================

export interface EventNotificationSettings {
  /** Agenda item changes */
  agendaItems: boolean;
  /** Election events (created, started, ended) */
  elections: boolean;
  /** Vote-related notifications */
  votes: boolean;
  /** Schedule/date changes */
  scheduleChanges: boolean;
  /** New participants (organizer only) */
  newParticipants: boolean;
  /** Role updates (promotions, demotions) */
  roleUpdates: boolean;
  /** Position changes (filled, vacated) */
  positionChanges: boolean;
  /** Profile updates (title, description) */
  profileUpdates: boolean;
  /** New subscribers (organizer only) */
  newSubscribers: boolean;
  /** Participation requests (organizer only) */
  participationRequests: boolean;
  /** Participation invitations */
  participationInvitations: boolean;
  /** Delegate nominations */
  delegateNominations: boolean;
  /** Speaker list additions */
  speakerListAdditions: boolean;
  /** Meeting bookings */
  meetingBookings: boolean;
}

// ============================================================================
// Amendment Notification Settings
// ============================================================================

export interface AmendmentNotificationSettings {
  /** Change requests created */
  changeRequests: boolean;
  /** Change request decisions (accepted, rejected) */
  changeRequestDecisions: boolean;
  /** New collaborators (owner only) */
  newCollaborators: boolean;
  /** Role updates */
  roleUpdates: boolean;
  /** Upvotes/downvotes (owner only) */
  upvotesDownvotes: boolean;
  /** New subscribers (owner only) */
  newSubscribers: boolean;
  /** Process progress (path advancement) */
  processProgress: boolean;
  /** Supporting groups added */
  supportingGroups: boolean;
  /** Amendment clones */
  clones: boolean;
  /** Discussions and comments */
  discussions: boolean;
  /** Profile updates */
  profileUpdates: boolean;
  /** Workflow changes */
  workflowChanges: boolean;
  /** Collaboration requests (owner only) */
  collaborationRequests: boolean;
  /** Collaboration invitations */
  collaborationInvitations: boolean;
  /** Voting session events */
  votingSessions: boolean;
}

// ============================================================================
// Blog Notification Settings
// ============================================================================

export interface BlogNotificationSettings {
  /** New subscribers (owner only) */
  newSubscribers: boolean;
  /** Upvotes/downvotes (owner only) */
  upvotesDownvotes: boolean;
  /** Profile updates */
  profileUpdates: boolean;
  /** New writers (owner only) */
  newWriters: boolean;
  /** Role updates */
  roleUpdates: boolean;
  /** Comments */
  comments: boolean;
  /** Writer requests (owner only) */
  writerRequests: boolean;
  /** Writer invitations */
  writerInvitations: boolean;
}

// ============================================================================
// Todo Notification Settings
// ============================================================================

export interface TodoNotificationSettings {
  /** Task assigned to user */
  taskAssigned: boolean;
  /** Task updated (status, due date, priority) */
  taskUpdated: boolean;
  /** Task completed (to creator) */
  taskCompleted: boolean;
  /** Due date reminders (24h, 1h before) */
  dueDateReminders: boolean;
  /** Overdue alerts */
  overdueAlerts: boolean;
}

// ============================================================================
// Social Notification Settings
// ============================================================================

export interface SocialNotificationSettings {
  /** New followers */
  newFollowers: boolean;
  /** Mentions in content */
  mentions: boolean;
  /** Direct messages */
  directMessages: boolean;
  /** Conversation requests */
  conversationRequests: boolean;
}

// ============================================================================
// Delivery Settings
// ============================================================================

export interface DeliverySettings {
  /** Browser push notifications (requires permission) */
  pushNotifications: boolean;
  /** In-app notifications */
  inAppNotifications: boolean;
  /** Email notifications (future) */
  emailNotifications: boolean;
}

// ============================================================================
// Timeline Settings
// ============================================================================

export type TimelineRefreshFrequency = 'realtime' | 'every5min' | 'every15min' | 'manual';

export interface TimelineSettings {
  /** Show timeline on homepage */
  showOnHomepage: boolean;
  /** Timeline refresh frequency */
  refreshFrequency: TimelineRefreshFrequency;
}

// ============================================================================
// Complete Notification Settings
// ============================================================================

export interface NotificationSettings {
  id?: string;
  groupNotifications: GroupNotificationSettings;
  eventNotifications: EventNotificationSettings;
  amendmentNotifications: AmendmentNotificationSettings;
  blogNotifications: BlogNotificationSettings;
  todoNotifications: TodoNotificationSettings;
  socialNotifications: SocialNotificationSettings;
  deliverySettings: DeliverySettings;
  timelineSettings: TimelineSettings;
  createdAt?: Date;
  updatedAt?: Date;
}

// ============================================================================
// Default Settings
// ============================================================================

export const DEFAULT_GROUP_NOTIFICATIONS: GroupNotificationSettings = {
  tasksAssigned: true,
  paymentNotifications: true,
  newEvents: true,
  newAmendments: true,
  newRelationships: true,
  newPositions: true,
  newDocuments: true,
  newMembers: true,
  roleUpdates: true,
  newSubscribers: true,
  profileUpdates: true,
  membershipRequests: true,
  membershipInvitations: true,
};

export const DEFAULT_EVENT_NOTIFICATIONS: EventNotificationSettings = {
  agendaItems: true,
  elections: true,
  votes: true,
  scheduleChanges: true,
  newParticipants: true,
  roleUpdates: true,
  positionChanges: true,
  profileUpdates: true,
  newSubscribers: true,
  participationRequests: true,
  participationInvitations: true,
  delegateNominations: true,
  speakerListAdditions: true,
  meetingBookings: true,
};

export const DEFAULT_AMENDMENT_NOTIFICATIONS: AmendmentNotificationSettings = {
  changeRequests: true,
  changeRequestDecisions: true,
  newCollaborators: true,
  roleUpdates: true,
  upvotesDownvotes: true,
  newSubscribers: true,
  processProgress: true,
  supportingGroups: true,
  clones: true,
  discussions: true,
  profileUpdates: true,
  workflowChanges: true,
  collaborationRequests: true,
  collaborationInvitations: true,
  votingSessions: true,
};

export const DEFAULT_BLOG_NOTIFICATIONS: BlogNotificationSettings = {
  newSubscribers: true,
  upvotesDownvotes: true,
  profileUpdates: true,
  newWriters: true,
  roleUpdates: true,
  comments: true,
  writerRequests: true,
  writerInvitations: true,
};

export const DEFAULT_TODO_NOTIFICATIONS: TodoNotificationSettings = {
  taskAssigned: true,
  taskUpdated: true,
  taskCompleted: true,
  dueDateReminders: true,
  overdueAlerts: true,
};

export const DEFAULT_SOCIAL_NOTIFICATIONS: SocialNotificationSettings = {
  newFollowers: true,
  mentions: true,
  directMessages: true,
  conversationRequests: true,
};

export const DEFAULT_DELIVERY_SETTINGS: DeliverySettings = {
  pushNotifications: true,
  inAppNotifications: true,
  emailNotifications: false, // Off by default as noted in spec
};

export const DEFAULT_TIMELINE_SETTINGS: TimelineSettings = {
  showOnHomepage: true,
  refreshFrequency: 'realtime',
};

export const DEFAULT_NOTIFICATION_SETTINGS: Omit<NotificationSettings, 'id' | 'createdAt' | 'updatedAt'> = {
  groupNotifications: DEFAULT_GROUP_NOTIFICATIONS,
  eventNotifications: DEFAULT_EVENT_NOTIFICATIONS,
  amendmentNotifications: DEFAULT_AMENDMENT_NOTIFICATIONS,
  blogNotifications: DEFAULT_BLOG_NOTIFICATIONS,
  todoNotifications: DEFAULT_TODO_NOTIFICATIONS,
  socialNotifications: DEFAULT_SOCIAL_NOTIFICATIONS,
  deliverySettings: DEFAULT_DELIVERY_SETTINGS,
  timelineSettings: DEFAULT_TIMELINE_SETTINGS,
};
