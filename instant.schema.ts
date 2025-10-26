// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from '@instantdb/react';

const _schema = i.schema({
  // We inferred 56 attributes!
  // Take a look at this schema, and if everything looks good,
  // run `push schema` again to enforce the types.
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    agendaItems: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      duration: i.number().optional(),
      endTime: i.date().optional(),
      order: i.number().indexed(),
      scheduledTime: i.string().optional(),
      startTime: i.date().optional(),
      status: i.string().indexed(),
      title: i.string().indexed(),
      type: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    amendments: i.entity({
      code: i.string().optional(),
      date: i.string(),
      status: i.string(),
      subtitle: i.string().optional(),
      supporters: i.number(),
      tags: i.json().optional(),
      title: i.string(),
    }),
    amendmentVoteEntries: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
      vote: i.string().indexed(),
    }),
    amendmentVotes: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      justification: i.string().optional(),
      originalText: i.string().optional(),
      proposedText: i.string(),
      status: i.string().indexed(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
      votingEndTime: i.date().optional(),
      votingStartTime: i.date().optional(),
    }),
    blogs: i.entity({
      comments: i.number(),
      date: i.string(),
      likes: i.number(),
      title: i.string(),
    }),
    changeRequests: i.entity({
      createdAt: i.date().indexed(),
      description: i.string(),
      justification: i.string().optional(),
      proposedChange: i.string(),
      status: i.string().indexed(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
      votingEndTime: i.date().optional(),
      votingStartTime: i.date().optional(),
    }),
    changeRequestVotes: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
      vote: i.string().indexed(),
    }),
    conversationParticipants: i.entity({
      joinedAt: i.date().indexed(),
      lastReadAt: i.date().optional(),
      leftAt: i.date().optional(),
    }),
    conversations: i.entity({
      createdAt: i.date().indexed(),
      lastMessageAt: i.date().indexed(),
    }),
    documentCollaborators: i.entity({
      addedAt: i.date().indexed(),
      canEdit: i.boolean(),
    }),
    documentCursors: i.entity({
      color: i.string(),
      name: i.string(),
      position: i.json(),
      updatedAt: i.date().indexed(),
    }),
    documents: i.entity({
      content: i.json(),
      createdAt: i.date().indexed(),
      discussions: i.json().optional(),
      isPublic: i.boolean().optional(),
      tags: i.json().optional(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    electionCandidates: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      imageURL: i.string().optional(),
      name: i.string().indexed(),
      order: i.number().indexed(),
    }),
    elections: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      isMultipleChoice: i.boolean(),
      majorityType: i.string().indexed(),
      maxSelections: i.number().optional(),
      status: i.string().indexed(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
      votingEndTime: i.date().optional(),
      votingStartTime: i.date().optional(),
    }),
    electionVotes: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
    }),
    eventParticipants: i.entity({
      joinedAt: i.date().indexed(),
      role: i.string().optional(),
      status: i.string().indexed(),
    }),
    events: i.entity({
      capacity: i.number().optional(),
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      endDate: i.date().indexed().optional(),
      imageURL: i.string().optional(),
      isPublic: i.boolean().indexed(),
      location: i.string().optional(),
      startDate: i.date().indexed(),
      tags: i.json().optional(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    follows: i.entity({
      createdAt: i.date().indexed(),
    }),
    groupMemberships: i.entity({
      joinedAt: i.date().indexed(),
      role: i.string().indexed(),
    }),
    groupRelationships: i.entity({
      createdAt: i.date().indexed(),
      relationshipType: i.string().indexed(),
      updatedAt: i.date().indexed(),
      withRight: i.string().indexed(),
    }),
    groups: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      isPublic: i.boolean().indexed(),
      memberCount: i.number().indexed(),
      name: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    hashtags: i.entity({
      createdAt: i.date().indexed(),
      tag: i.string().indexed(),
    }),
    links: i.entity({
      createdAt: i.date().indexed(),
      label: i.string().indexed(),
      url: i.string(),
    }),
    magicCodes: i.entity({
      code: i.string(),
      createdAt: i.date().indexed(),
      email: i.string().indexed(),
      expiresAt: i.date().indexed(),
      usedAt: i.date().optional(),
    }),
    payments: i.entity({
      amount: i.number(),
      createdAt: i.date().indexed(),
      label: i.string().indexed(),
      type: i.string().indexed(),
    }),
    messages: i.entity({
      content: i.string(),
      createdAt: i.date().indexed(),
      deletedAt: i.date().optional(),
      isRead: i.boolean().indexed(),
      updatedAt: i.date().optional(),
    }),
    notifications: i.entity({
      actionUrl: i.string().optional(),
      createdAt: i.date().indexed(),
      isRead: i.boolean().indexed(),
      message: i.string(),
      relatedEntityId: i.string().optional(),
      relatedEntityType: i.string().optional(),
      title: i.string(),
      type: i.string().indexed(),
    }),
    positions: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      firstTermStart: i.date().indexed(),
      term: i.number(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    profiles: i.entity({
      about: i.string().optional(),
      avatar: i.string().optional(),
      bio: i.string().optional(),
      contactEmail: i.string().indexed().optional(),
      contactLocation: i.string().optional(),
      contactTwitter: i.string().optional(),
      contactWebsite: i.string().optional(),
      createdAt: i.date().indexed(),
      facebook: i.string().optional(),
      handle: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      instagram: i.string().optional(),
      isActive: i.boolean().indexed(),
      lastSeenAt: i.date().indexed().optional(),
      name: i.string().optional(),
      snapchat: i.string().optional(),
      subtitle: i.string().optional(),
      twitter: i.string().optional(),
      type: i.string().optional(),
      updatedAt: i.date().indexed(),
      whatsapp: i.string().optional(),
    }),
    statements: i.entity({
      tag: i.string(),
      text: i.string(),
    }),
    stats: i.entity({
      label: i.string(),
      unit: i.string().optional(),
      value: i.number(),
    }),
    todoAssignments: i.entity({
      assignedAt: i.date().indexed(),
      role: i.string().optional(),
    }),
    todos: i.entity({
      completedAt: i.date().optional(),
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      dueDate: i.date().indexed().optional(),
      priority: i.string().indexed(),
      status: i.string().indexed(),
      tags: i.json().optional(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    user: i.entity({
      abbr: i.string().optional(),
      amendments: i.number().optional(),
      description: i.string().optional(),
      events: i.number().optional(),
      members: i.number(),
      name: i.string(),
      role: i.string(),
      tags: i.json().optional(),
    }),
    speakerList: i.entity({
      completed: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      order: i.number().indexed(),
      time: i.number(),
      title: i.string(),
    }),
    threads: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
      upvotes: i.number().optional(),
      downvotes: i.number().optional(),
    }),
    comments: i.entity({
      createdAt: i.date().indexed(),
      text: i.string(),
      updatedAt: i.date().indexed().optional(),
      upvotes: i.number().optional(),
      downvotes: i.number().optional(),
    }),
    threadVotes: i.entity({
      createdAt: i.date().indexed(),
      vote: i.number().indexed(), // 1 for upvote, -1 for downvote
    }),
    commentVotes: i.entity({
      createdAt: i.date().indexed(),
      vote: i.number().indexed(), // 1 for upvote, -1 for downvote
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'linkedPrimaryUser',
        onDelete: 'cascade',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'linkedGuestUsers',
      },
    },
    agendaItemsCreator: {
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
    agendaItemsEvent: {
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
    amendmentsGroup: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'amendments',
      },
    },
    amendmentsUser: {
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
    amendmentVoteEntriesAmendmentVote: {
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
    amendmentVoteEntriesVoter: {
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
    amendmentVotesAgendaItem: {
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
    amendmentVotesCreator: {
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
    blogsGroup: {
      forward: {
        on: 'blogs',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'blogs',
      },
    },
    blogsUser: {
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
    changeRequestsAmendmentVote: {
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
    changeRequestsCreator: {
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
    changeRequestVotesChangeRequest: {
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
    changeRequestVotesVoter: {
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
    conversationParticipantsConversation: {
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
    conversationParticipantsUser: {
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
    documentCollaboratorsDocument: {
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
    documentCollaboratorsUser: {
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
    documentCursorsDocument: {
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
    documentCursorsUser: {
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
    documentsOwner: {
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
    electionCandidatesElection: {
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
    electionCandidatesUser: {
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
    electionsAgendaItem: {
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
    electionsPosition: {
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
    electionVotesCandidate: {
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
    electionVotesElection: {
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
    electionVotesVoter: {
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
    eventParticipantsEvent: {
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
    eventParticipantsUser: {
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
    eventsGroup: {
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
    eventsOrganizer: {
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
    followsFollowee: {
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
    followsFollower: {
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
    groupMembershipsGroup: {
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
    groupMembershipsUser: {
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
    groupRelationshipsChildGroup: {
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
    groupRelationshipsParentGroup: {
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
    groupsOwner: {
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
    hashtagsAmendment: {
      forward: {
        on: 'hashtags',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'hashtags',
      },
    },
    hashtagBlogs: {
      forward: {
        on: 'hashtags',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'hashtags',
      },
    },
    hashtagsEvent: {
      forward: {
        on: 'hashtags',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'hashtags',
      },
    },
    hashtagsGroup: {
      forward: {
        on: 'hashtags',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'hashtags',
      },
    },

    hashtagsUser: {
      forward: {
        on: 'hashtags',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'hashtags',
      },
    },
    linksGroup: {
      forward: {
        on: 'links',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'links',
      },
    },
    messagesConversation: {
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
    messagesSender: {
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
    paymentsPayerUser: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'payerUser',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'paymentsMade',
      },
    },
    paymentsPayerGroup: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'payerGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'paymentsMade',
      },
    },
    paymentsReceiverUser: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'receiverUser',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'paymentsReceived',
      },
    },
    paymentsReceiverGroup: {
      forward: {
        on: 'payments',
        has: 'one',
        label: 'receiverGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'paymentsReceived',
      },
    },
    positionsCurrentHolder: {
      forward: {
        on: 'positions',
        has: 'one',
        label: 'currentHolder',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'currentPositions',
      },
    },
    positionsGroup: {
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
    profilesAvatarFile: {
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
    profilesUser: {
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
    statementsUser: {
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
    statsUser: {
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
    todoAssignmentsTodo: {
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
    todoAssignmentsUser: {
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
    todosCreator: {
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
    todosGroup: {
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
    userUser: {
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
    speakerListAgendaItem: {
      forward: {
        on: 'speakerList',
        has: 'one',
        label: 'agendaItem',
      },
      reverse: {
        on: 'agendaItems',
        has: 'many',
        label: 'speakerList',
      },
    },
    speakerListUser: {
      forward: {
        on: 'speakerList',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'speakerList',
      },
    },
    threadsAmendment: {
      forward: {
        on: 'threads',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'threads',
      },
    },
    threadsCreator: {
      forward: {
        on: 'threads',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdThreads',
      },
    },
    threadsFile: {
      forward: {
        on: 'threads',
        has: 'one',
        label: 'file',
      },
      reverse: {
        on: '$files',
        has: 'many',
        label: 'threads',
      },
    },
    commentsThread: {
      forward: {
        on: 'comments',
        has: 'one',
        label: 'thread',
      },
      reverse: {
        on: 'threads',
        has: 'many',
        label: 'comments',
      },
    },
    commentsCreator: {
      forward: {
        on: 'comments',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdComments',
      },
    },
    commentsParentComment: {
      forward: {
        on: 'comments',
        has: 'one',
        label: 'parentComment',
      },
      reverse: {
        on: 'comments',
        has: 'many',
        label: 'replies',
      },
    },
    threadVotesThread: {
      forward: {
        on: 'threadVotes',
        has: 'one',
        label: 'thread',
      },
      reverse: {
        on: 'threads',
        has: 'many',
        label: 'votes',
      },
    },
    threadVotesUser: {
      forward: {
        on: 'threadVotes',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'threadVotes',
      },
    },
    commentVotesComment: {
      forward: {
        on: 'commentVotes',
        has: 'one',
        label: 'comment',
      },
      reverse: {
        on: 'comments',
        has: 'many',
        label: 'votes',
      },
    },
    commentVotesUser: {
      forward: {
        on: 'commentVotes',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'commentVotes',
      },
    },
    changeRequestsAmendment: {
      forward: {
        on: 'changeRequests',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'changeRequests',
      },
    },
  },
  rooms: {
    editor: {
      presence: i.entity({
        avatar: i.string().optional(),
        color: i.string(),
        name: i.string(),
        userId: i.string(),
      }),
      topics: {
        typing: i.entity({
          isTyping: i.boolean(),
          userId: i.string(),
        }),
      },
    },
  },
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
type AppSchema = _AppSchema;
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
