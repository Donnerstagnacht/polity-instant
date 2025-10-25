// instant.schema.ts
// This file defines the database schema for the Polity application
// It includes user authentication, groups, and magic code functionality

import { i } from '@instantdb/react';

const _schema = i.schema({
  entities: {
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

    // Agenda system entities
    // Agenda items for events (Tagesordnungspunkte)
    agendaItems: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      type: i.string().indexed(), // 'election', 'vote', 'speech', 'discussion'
      order: i.number().indexed(), // Order within the agenda
      duration: i.number().optional(), // Duration in minutes
      status: i.string().indexed(), // 'pending', 'active', 'completed', 'cancelled'
      startTime: i.date().optional(),
      endTime: i.date().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Elections (Wahlen)
    elections: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      majorityType: i.string().indexed(), // 'absolute', 'relative'
      isMultipleChoice: i.boolean(), // Allow multiple selections
      maxSelections: i.number().optional(), // Max number of selections (for multiple choice)
      votingStartTime: i.date().optional(),
      votingEndTime: i.date().optional(),
      status: i.string().indexed(), // 'pending', 'active', 'completed', 'cancelled'
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Election candidates (Wahlvorschläge)
    electionCandidates: i.entity({
      name: i.string().indexed(),
      description: i.string().optional(),
      imageURL: i.string().optional(),
      order: i.number().indexed(),
      createdAt: i.date().indexed(),
    }),

    // Amendment entity (enhanced existing)
    amendmentVotes: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      originalText: i.string().optional(),
      proposedText: i.string(),
      justification: i.string().optional(),
      status: i.string().indexed(), // 'draft', 'proposed', 'voting', 'accepted', 'rejected'
      votingStartTime: i.date().optional(),
      votingEndTime: i.date().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Change requests for amendments
    changeRequests: i.entity({
      title: i.string().indexed(),
      description: i.string(),
      proposedChange: i.string(),
      justification: i.string().optional(),
      status: i.string().indexed(), // 'proposed', 'voting', 'accepted', 'rejected'
      votingStartTime: i.date().optional(),
      votingEndTime: i.date().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Voting system entities
    // Votes for elections
    electionVotes: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
    }),

    // Votes for amendments
    amendmentVoteEntries: i.entity({
      vote: i.string().indexed(), // 'yes', 'no', 'abstain'
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
    }),

    // Votes for change requests
    changeRequestVotes: i.entity({
      vote: i.string().indexed(), // 'yes', 'no', 'abstain'
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
    }),

    // Group relationships - hierarchical connections between groups
    groupRelationships: i.entity({
      relationshipType: i.string().indexed(), // 'isParent' or 'isChild'
      withRight: i.string().indexed(), // 'informationRight', 'amendmentRight', 'rightToSpeak', 'activeVotingRight', 'passiveVotingRight'
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Positions - elected positions within groups
    positions: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      term: i.number(), // Number of months the term lasts
      firstTermStart: i.date().indexed(), // Date when the first term started
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),

    // Documents - rich text documents with real-time collaboration
    documents: i.entity({
      title: i.string().indexed(),
      content: i.json(), // Plate.js editor content (Slate value)
      discussions: i.json().optional(), // Discussion threads and comments on suggestions
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      isPublic: i.boolean().optional(),
      tags: i.json().optional(), // Array of tag strings
    }),

    // Document collaborators - users with edit access to documents
    documentCollaborators: i.entity({
      canEdit: i.boolean(),
      addedAt: i.date().indexed(),
    }),

    // Document cursors - real-time cursor positions for collaborative editing
    documentCursors: i.entity({
      position: i.json(), // Slate selection/cursor position
      color: i.string(), // User's cursor color
      name: i.string(), // User's display name
      updatedAt: i.date().indexed(),
    }),
  },
  links: {
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

    // Agenda system relationships
    // 24. Agenda items to events (many-to-one)
    agendaItemEvents: {
      forward: {
        on: 'agendaItems',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'agendaItems',
      },
    },

    // 25. Agenda items to creator (many-to-one)
    agendaItemCreators: {
      forward: {
        on: 'agendaItems',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdAgendaItems',
      },
    },

    // 26. Elections to agenda items (one-to-one)
    electionAgendaItems: {
      forward: {
        on: 'elections',
        has: 'one',
        label: 'agendaItem',
      },
      reverse: {
        on: 'agendaItems',
        has: 'one',
        label: 'election',
      },
    },

    // 27. Election candidates to elections (many-to-one)
    electionCandidateElections: {
      forward: {
        on: 'electionCandidates',
        has: 'one',
        label: 'election',
      },
      reverse: {
        on: 'elections',
        has: 'many',
        label: 'candidates',
      },
    },

    // 28. Election candidates to users (many-to-one, optional)
    electionCandidateUsers: {
      forward: {
        on: 'electionCandidates',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'candidacies',
      },
    },

    // 29. Amendment votes to agenda items (one-to-one)
    amendmentVoteAgendaItems: {
      forward: {
        on: 'amendmentVotes',
        has: 'one',
        label: 'agendaItem',
      },
      reverse: {
        on: 'agendaItems',
        has: 'one',
        label: 'amendmentVote',
      },
    },

    // 30. Amendment votes to creator (many-to-one)
    amendmentVoteCreators: {
      forward: {
        on: 'amendmentVotes',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdAmendmentVotes',
      },
    },

    // 31. Change requests to amendment votes (many-to-one)
    changeRequestAmendmentVotes: {
      forward: {
        on: 'changeRequests',
        has: 'one',
        label: 'amendmentVote',
      },
      reverse: {
        on: 'amendmentVotes',
        has: 'many',
        label: 'changeRequests',
      },
    },

    // 32. Change requests to creator (many-to-one)
    changeRequestCreators: {
      forward: {
        on: 'changeRequests',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdChangeRequests',
      },
    },

    // Voting relationships
    // 33. Election votes to users (many-to-one)
    electionVoteUsers: {
      forward: {
        on: 'electionVotes',
        has: 'one',
        label: 'voter',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'electionVotes',
      },
    },

    // 34. Election votes to candidates (many-to-one)
    electionVoteCandidates: {
      forward: {
        on: 'electionVotes',
        has: 'one',
        label: 'candidate',
      },
      reverse: {
        on: 'electionCandidates',
        has: 'many',
        label: 'votes',
      },
    },

    // 35. Election votes to elections (many-to-one)
    electionVoteElections: {
      forward: {
        on: 'electionVotes',
        has: 'one',
        label: 'election',
      },
      reverse: {
        on: 'elections',
        has: 'many',
        label: 'votes',
      },
    },

    // 36. Amendment vote entries to users (many-to-one)
    amendmentVoteEntryUsers: {
      forward: {
        on: 'amendmentVoteEntries',
        has: 'one',
        label: 'voter',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'amendmentVoteEntries',
      },
    },

    // 37. Amendment vote entries to amendment votes (many-to-one)
    amendmentVoteEntryAmendmentVotes: {
      forward: {
        on: 'amendmentVoteEntries',
        has: 'one',
        label: 'amendmentVote',
      },
      reverse: {
        on: 'amendmentVotes',
        has: 'many',
        label: 'voteEntries',
      },
    },

    // 38. Change request votes to users (many-to-one)
    changeRequestVoteUsers: {
      forward: {
        on: 'changeRequestVotes',
        has: 'one',
        label: 'voter',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'changeRequestVotes',
      },
    },

    // Change request votes to change requests (many-to-one)
    // 39. Change request votes to change requests (many-to-one)
    changeRequestVoteChangeRequests: {
      forward: {
        on: 'changeRequestVotes',
        has: 'one',
        label: 'changeRequest',
      },
      reverse: {
        on: 'changeRequests',
        has: 'many',
        label: 'votes',
      },
    },

    // 40. Group relationships - parent group (many-to-one)
    groupRelationshipParentGroups: {
      forward: {
        on: 'groupRelationships',
        has: 'one',
        label: 'parentGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'childRelationships',
      },
    },

    // 41. Group relationships - child group (many-to-one)
    groupRelationshipChildGroups: {
      forward: {
        on: 'groupRelationships',
        has: 'one',
        label: 'childGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'parentRelationships',
      },
    },

    // 42. Positions to groups (many-to-one)
    positionGroups: {
      forward: {
        on: 'positions',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'positions',
      },
    },

    // 43. Elections to positions (many-to-one, optional)
    electionPositions: {
      forward: {
        on: 'elections',
        has: 'one',
        label: 'position',
      },
      reverse: {
        on: 'positions',
        has: 'many',
        label: 'elections',
      },
    },

    // 44. Documents to owners (many-to-one)
    documentOwners: {
      forward: {
        on: 'documents',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'ownedDocuments',
      },
    },

    // 45. Document collaborators to documents (many-to-one)
    documentCollaboratorDocuments: {
      forward: {
        on: 'documentCollaborators',
        has: 'one',
        label: 'document',
      },
      reverse: {
        on: 'documents',
        has: 'many',
        label: 'collaborators',
      },
    },

    // 46. Document collaborators to users (many-to-one)
    documentCollaboratorUsers: {
      forward: {
        on: 'documentCollaborators',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'collaboratingDocuments',
      },
    },

    // 47. Document cursors to documents (many-to-one)
    documentCursorDocuments: {
      forward: {
        on: 'documentCursors',
        has: 'one',
        label: 'document',
      },
      reverse: {
        on: 'documents',
        has: 'many',
        label: 'cursors',
      },
    },

    // 48. Document cursors to users (many-to-one)
    documentCursorUsers: {
      forward: {
        on: 'documentCursors',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'documentCursors',
      },
    },

    // 49. Profile avatars to files (many-to-one)
    profileAvatars: {
      forward: {
        on: 'profiles',
        has: 'one',
        label: 'avatarFile',
      },
      reverse: {
        on: '$files',
        has: 'one',
        label: 'profileAvatar',
      },
    },
  },
  rooms: {
    // Editor room for collaborative editing
    editor: {
      presence: i.entity({
        name: i.string(),
        avatar: i.string().optional(),
        color: i.string(),
        userId: i.string(),
      }),
      topics: {
        // Typing indicator
        typing: i.entity({
          userId: i.string(),
          isTyping: i.boolean(),
        }),
      },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
