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
    /**
     * User notification settings - stores preferences for each notification category
     * Each JSON field contains boolean toggles for specific notification types
     */
    notificationSettings: i.entity({
      // Group notification preferences
      groupNotifications: i.json<{
        tasksAssigned: boolean;
        paymentNotifications: boolean;
        newEvents: boolean;
        newAmendments: boolean;
        newRelationships: boolean;
        newPositions: boolean;
        newDocuments: boolean;
        newMembers: boolean;
        roleUpdates: boolean;
        newSubscribers: boolean;
        profileUpdates: boolean;
        membershipRequests: boolean;
        membershipInvitations: boolean;
      }>().optional(),
      // Event notification preferences
      eventNotifications: i.json<{
        agendaItems: boolean;
        elections: boolean;
        votes: boolean;
        scheduleChanges: boolean;
        newParticipants: boolean;
        roleUpdates: boolean;
        positionChanges: boolean;
        profileUpdates: boolean;
        newSubscribers: boolean;
        participationRequests: boolean;
        participationInvitations: boolean;
        delegateNominations: boolean;
        speakerListAdditions: boolean;
        meetingBookings: boolean;
      }>().optional(),
      // Amendment notification preferences
      amendmentNotifications: i.json<{
        changeRequests: boolean;
        changeRequestDecisions: boolean;
        newCollaborators: boolean;
        roleUpdates: boolean;
        upvotesDownvotes: boolean;
        newSubscribers: boolean;
        processProgress: boolean;
        supportingGroups: boolean;
        clones: boolean;
        discussions: boolean;
        profileUpdates: boolean;
        workflowChanges: boolean;
        collaborationRequests: boolean;
        collaborationInvitations: boolean;
        votingSessions: boolean;
      }>().optional(),
      // Blog notification preferences
      blogNotifications: i.json<{
        newSubscribers: boolean;
        upvotesDownvotes: boolean;
        profileUpdates: boolean;
        newWriters: boolean;
        roleUpdates: boolean;
        comments: boolean;
        writerRequests: boolean;
        writerInvitations: boolean;
      }>().optional(),
      // Todo notification preferences
      todoNotifications: i.json<{
        taskAssigned: boolean;
        taskUpdated: boolean;
        taskCompleted: boolean;
        dueDateReminders: boolean;
        overdueAlerts: boolean;
      }>().optional(),
      // Social notification preferences
      socialNotifications: i.json<{
        newFollowers: boolean;
        mentions: boolean;
        directMessages: boolean;
        conversationRequests: boolean;
      }>().optional(),
      // Delivery settings
      deliverySettings: i.json<{
        pushNotifications: boolean;
        inAppNotifications: boolean;
        emailNotifications: boolean;
      }>().optional(),
      // Timeline settings
      timelineSettings: i.json<{
        showOnHomepage: boolean;
        refreshFrequency: 'realtime' | 'every5min' | 'every15min' | 'manual';
      }>().optional(),
      // Timestamps
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
    notificationSettingsUser: {
      forward: {
        on: 'notificationSettings',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'notificationSettings',
      },
    },
  } as const,
};

export default _notifications;
