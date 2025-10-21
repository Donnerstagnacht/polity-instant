// instant.schema.ts
// This file defines the database schema for the Polity application
// It includes user authentication, groups, and magic code functionality

import { i } from '@instantdb/react';

const graph = i.graph(
  {
    // User entity with authentication (only default attributes)
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string().optional(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),

    // User profile entity with extended attributes
    profiles: i.entity({
      name: i.string().optional(),
      subtitle: i.string().optional(),
      avatar: i.string().optional(),
      bio: i.string().optional(),
      handle: i.string().unique().indexed().optional(),
      isActive: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      lastSeenAt: i.date().indexed().optional(),
      // User profile attributes
      about: i.string().optional(),
      // Contact fields (expanded from contact JSON)
      contactEmail: i.string().optional().indexed(),
      contactTwitter: i.string().optional(),
      contactWebsite: i.string().optional(),
      contactLocation: i.string().optional(),
      // Social media handles (expanded from socialMedia JSON)
      whatsapp: i.string().optional(),
      instagram: i.string().optional(),
      twitter: i.string().optional(),
      facebook: i.string().optional(),
      snapchat: i.string().optional(),
      // Instant built-in fields
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),

    // UserStat entity
    stats: i.entity({
      label: i.string(),
      value: i.number(),
      unit: i.string().optional(),
    }),

    // ...contacts and socialMedia merged into $users as JSON

    // UserStatement entity
    statements: i.entity({
      text: i.string(),
      tag: i.string(),
    }),

    // UserBlog entity
    blogs: i.entity({
      title: i.string(),
      date: i.string(),
      likes: i.number(),
      comments: i.number(),
    }),

    // User entity for user groups (renamed from userGroups)
    user: i.entity({
      name: i.string(),
      members: i.number(),
      role: i.string(),
      description: i.string().optional(),
      tags: i.json().optional(),
      amendments: i.number().optional(),
      events: i.number().optional(),
      abbr: i.string().optional(),
    }),

    // UserAmendment entity
    amendments: i.entity({
      title: i.string(),
      subtitle: i.string().optional(),
      status: i.string(), // 'Passed' | 'Rejected' | 'Under Review' | 'Drafting'
      supporters: i.number(),
      date: i.string(),
      code: i.string().optional(),
      tags: i.json().optional(),
    }),
    // Magic codes for passwordless authentication
    magicCodes: i.entity({
      email: i.string().indexed(),
      code: i.string(),
      createdAt: i.date().indexed(),
      expiresAt: i.date().indexed(),
      usedAt: i.date().optional(),
    }),

    // Groups for organizing users
    groups: i.entity({
      name: i.string().indexed(),
      description: i.string().optional(),
      isPublic: i.boolean().indexed(),
      memberCount: i.number().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Group memberships (many-to-many relationship between users and groups)
    groupMemberships: i.entity({
      role: i.string().indexed(), // 'owner', 'admin', 'member'
      joinedAt: i.date().indexed(),
    }),

    // Follower relationship (many-to-many: users can follow other users)
    follows: i.entity({
      createdAt: i.date().indexed(),
    }),

    // Message system entities
    // Conversations between users
    conversations: i.entity({
      lastMessageAt: i.date().indexed(),
      createdAt: i.date().indexed(),
    }),

    // Individual messages within conversations
    messages: i.entity({
      content: i.string(),
      isRead: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
      deletedAt: i.date().optional(),
    }),

    // Participants in a conversation
    conversationParticipants: i.entity({
      lastReadAt: i.date().optional(),
      joinedAt: i.date().indexed(),
      leftAt: i.date().optional(),
    }),

    // Events system entities
    events: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      location: i.string().optional(),
      startDate: i.date().indexed(),
      endDate: i.date().indexed().optional(),
      isPublic: i.boolean().indexed(),
      capacity: i.number().optional(),
      imageURL: i.string().optional(),
      tags: i.json().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Event participants (attendees)
    eventParticipants: i.entity({
      status: i.string().indexed(), // 'going', 'maybe', 'declined', 'invited'
      joinedAt: i.date().indexed(),
      role: i.string().optional(), // 'organizer', 'speaker', 'attendee'
    }),

    // Notifications system entities
    notifications: i.entity({
      type: i.string().indexed(), // 'group_invite', 'event_invite', 'message', 'follow', 'mention', etc.
      title: i.string(),
      message: i.string(),
      isRead: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      // References to related entities (stored as entity IDs)
      relatedEntityType: i.string().optional(), // 'group', 'event', 'user', 'message', etc.
      relatedEntityId: i.string().optional(),
      actionUrl: i.string().optional(), // URL to navigate when clicked
    }),

    // Todo system entities
    todos: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      status: i.string().indexed(), // 'todo', 'in_progress', 'completed', 'cancelled'
      priority: i.string().indexed(), // 'low', 'medium', 'high', 'urgent'
      dueDate: i.date().indexed().optional(),
      completedAt: i.date().optional(),
      tags: i.json().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Todo assignments (many-to-many: todos and users)
    todoAssignments: i.entity({
      assignedAt: i.date().indexed(),
      role: i.string().optional(), // 'owner', 'collaborator', 'reviewer'
    }),
  },
  {
    // 1. Link between users and profiles (one-to-one)
    userProfiles: {
      forward: {
        on: 'profiles',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'profile',
      },
    },

    // 2. Link between users and groupMemberships (one-to-many)
    userGroupMemberships: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'memberships',
      },
    },

    // 3. Link between groupMemberships and groups (many-to-one)
    groupMembershipGroups: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'memberships',
      },
    },

    // 4. Link between users and amendments (one-to-many)
    userAmendments: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'amendments',
      },
    },

    // 5. Link between users and stats (one-to-many)
    userStats: {
      forward: {
        on: 'stats',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'stats',
      },
    },

    // 6. Link between users and statements (one-to-many)
    userStatements: {
      forward: {
        on: 'statements',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'statements',
      },
    },

    // 7. Link between users and blogs (one-to-many)
    userBlogs: {
      forward: {
        on: 'blogs',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'blogs',
      },
    },

    // Additional: User can own multiple groups
    userOwnedGroups: {
      forward: {
        on: 'groups',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'ownedGroups',
      },
    },

    // Additional: userGroups link for the 'user' entity
    userGroupsLink: {
      forward: {
        on: 'user',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'groups',
      },
    },

    // 8. User follows (follower relationship)
    userFollowers: {
      forward: {
        on: 'follows',
        has: 'one',
        label: 'follower',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'following',
      },
    },

    // 9. User following (followee relationship)
    userFollowing: {
      forward: {
        on: 'follows',
        has: 'one',
        label: 'followee',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'followers',
      },
    },

    // 10. Conversation participants (many-to-many: users and conversations)
    conversationParticipantUsers: {
      forward: {
        on: 'conversationParticipants',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'conversationParticipants',
      },
    },

    // 11. Conversation participants to conversations
    conversationParticipantConversations: {
      forward: {
        on: 'conversationParticipants',
        has: 'one',
        label: 'conversation',
      },
      reverse: {
        on: 'conversations',
        has: 'many',
        label: 'participants',
      },
    },

    // 12. Messages to conversations (many-to-one)
    messageConversations: {
      forward: {
        on: 'messages',
        has: 'one',
        label: 'conversation',
      },
      reverse: {
        on: 'conversations',
        has: 'many',
        label: 'messages',
      },
    },

    // 13. Messages to sender profile (many-to-one)
    // Changed from $users to profiles so sender data is properly returned
    messageSenders: {
      forward: {
        on: 'messages',
        has: 'one',
        label: 'sender',
      },
      reverse: {
        on: 'profiles',
        has: 'many',
        label: 'sentMessages',
      },
    },

    // 14. Events to organizer (many-to-one)
    eventOrganizers: {
      forward: {
        on: 'events',
        has: 'one',
        label: 'organizer',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'organizedEvents',
      },
    },

    // 15. Event participants to users (many-to-one)
    eventParticipantUsers: {
      forward: {
        on: 'eventParticipants',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'eventParticipations',
      },
    },

    // 16. Event participants to events (many-to-one)
    eventParticipantEvents: {
      forward: {
        on: 'eventParticipants',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'participants',
      },
    },

    // 17. Events to groups (optional - for group events)
    eventGroups: {
      forward: {
        on: 'events',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'events',
      },
    },

    // 18. Notifications to recipient user (many-to-one)
    notificationRecipients: {
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

    // 19. Notifications to sender user (many-to-one, optional)
    notificationSenders: {
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

    // 20. Todos to creator (many-to-one)
    todoCreators: {
      forward: {
        on: 'todos',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdTodos',
      },
    },

    // 21. Todo assignments to users (many-to-one)
    todoAssignmentUsers: {
      forward: {
        on: 'todoAssignments',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'todoAssignments',
      },
    },

    // 22. Todo assignments to todos (many-to-one)
    todoAssignmentTodos: {
      forward: {
        on: 'todoAssignments',
        has: 'one',
        label: 'todo',
      },
      reverse: {
        on: 'todos',
        has: 'many',
        label: 'assignments',
      },
    },

    // 23. Todos to groups (optional - for group todos)
    todoGroups: {
      forward: {
        on: 'todos',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'todos',
      },
    },
  }
);

export default graph;
