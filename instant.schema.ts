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
      about: i.string().optional(),
      avatar: i.string().optional(),
      bio: i.string().optional(),
      contactEmail: i.string().indexed().optional(),
      contactLocation: i.string().optional(),
      contactTwitter: i.string().optional(),
      contactWebsite: i.string().optional(),
      facebook: i.string().optional(),
      handle: i.string().unique().indexed().optional(),
      instagram: i.string().optional(),
      lastSeenAt: i.date().indexed().optional(),
      name: i.string().optional(),
      snapchat: i.string().optional(),
      subtitle: i.string().optional(),
      twitter: i.string().optional(),
      whatsapp: i.string().optional(),
      createdAt: i.date().indexed().optional(),
      updatedAt: i.date().indexed().optional(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
      tutorialStep: i.string().indexed().optional(), // 'welcome', 'overview', 'groups', 'events', 'amendments', 'blogs', 'elections', 'completed'
      assistantIntroduction: i.boolean().optional(), // Whether to show the Aria & Kai introduction dialog
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
      forwardingStatus: i.string().indexed().optional(), // 'forward_confirmed', 'previous_decision_outstanding', 'rejected', 'approved'
      title: i.string().indexed(),
      type: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    amendments: i.entity({
      code: i.string().optional(),
      createdAt: i.date().indexed().optional(),
      date: i.string(),
      imageURL: i.string().optional(),
      videoURL: i.string().optional(),
      videoThumbnailURL: i.string().optional(),
      status: i.string(),
      subtitle: i.string().optional(),
      supporters: i.number(),
      tags: i.json().optional(),
      title: i.string(),
      updatedAt: i.date().indexed().optional(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
      upvotes: i.number().optional(),
      downvotes: i.number().optional(),
    }),
    amendmentVoteEntries: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
      vote: i.string().indexed(),
    }),
    amendmentSupportVotes: i.entity({
      createdAt: i.date().indexed(),
      vote: i.number().indexed(), // 1 for upvote, -1 for downvote
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
      commentCount: i.number(),
      date: i.string(),
      likeCount: i.number(),
      title: i.string(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    blogBloggers: i.entity({
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, writer, owner
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
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
      requiresVoting: i.boolean().optional(), // Whether this CR requires voting approval
      votingThreshold: i.number().optional(), // Percentage needed to pass (default 50)
    }),
    changeRequestVotes: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
      vote: i.string().indexed(), // 'accept', 'reject', 'abstain'
    }),
    conversationParticipants: i.entity({
      joinedAt: i.date().indexed(),
      lastReadAt: i.date().optional(),
      leftAt: i.date().optional(),
    }),
    conversations: i.entity({
      createdAt: i.date().indexed(),
      lastMessageAt: i.date().indexed(),
      pinned: i.boolean().indexed().optional(), // Track pinned conversations
      status: i.string().indexed().optional(), // 'pending', 'accepted', 'rejected'
      type: i.string().indexed().optional(), // 'direct', 'group'
      name: i.string().indexed().optional(), // For group conversations, synced with group name
    }),
    documentCollaborators: i.entity({
      addedAt: i.date().indexed(),
      canEdit: i.boolean(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
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
      suggestionCounter: i.number().optional(), // Autoincrementing counter for suggestion IDs (CR-1, CR-2, etc.)
      editingMode: i.string().optional(), // 'edit', 'view', 'suggest', 'vote'
    }),
    documentVersions: i.entity({
      versionNumber: i.number().indexed(),
      title: i.string(),
      content: i.json(),
      createdAt: i.date().indexed(),
      creationType: i.string().indexed(), // 'manual', 'suggestion_added', 'suggestion_accepted', 'suggestion_declined'
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
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, member, admin
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    amendmentCollaborators: i.entity({
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, member, admin
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
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
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    follows: i.entity({
      createdAt: i.date().indexed(),
    }),
    subscribers: i.entity({
      createdAt: i.date().indexed(),
    }),
    groupMemberships: i.entity({
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, member, admin
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    roles: i.entity({
      name: i.string(),
      description: i.string().optional(),
      scope: i.string().indexed(), // 'group', 'event', 'amendment', or 'blog'
    }),
    actionRights: i.entity({
      resource: i.string().indexed(),
      action: i.string().indexed(),
    }),
    participants: i.entity({
      status: i.string().optional(), // 'invited', 'accepted', 'declined'
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
      location: i.string().optional(),
      region: i.string().optional(),
      country: i.string().optional(),
      imageURL: i.string().optional(),
      whatsapp: i.string().optional(),
      instagram: i.string().optional(),
      twitter: i.string().optional(),
      facebook: i.string().optional(),
      snapchat: i.string().optional(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
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
      relatedEntityType: i.string().optional(),
      title: i.string(),
      type: i.string().indexed(),
      // Fields for entity-based notifications
      onBehalfOfEntityType: i.string().indexed().optional(), // 'group', 'event', 'amendment', 'blog'
      onBehalfOfEntityId: i.string().indexed().optional(),
      recipientEntityType: i.string().indexed().optional(), // 'group', 'event', 'amendment', 'blog'
      recipientEntityId: i.string().indexed().optional(),
    }),
    positions: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      firstTermStart: i.date().indexed(),
      term: i.number(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
    }),
    eventPositions: i.entity({
      title: i.string().indexed(),
      description: i.string().optional(),
      capacity: i.number(), // How many participants can hold this position
      createElectionOnAgenda: i.boolean().indexed(), // Whether to auto-create election agenda item
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),
    eventPositionHolders: i.entity({
      createdAt: i.date().indexed(),
    }),

    statements: i.entity({
      tag: i.string(),
      text: i.string(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
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
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    timelineEvents: i.entity({
      createdAt: i.date().indexed(),
      eventType: i.string().indexed(), // 'created', 'updated', 'comment_added', 'vote_started', 'participant_joined', etc.
      entityType: i.string().indexed(), // 'user', 'group', 'amendment', 'event', 'blog'
      entityId: i.string().indexed(),
      title: i.string().indexed(),
      description: i.string().optional(),
      metadata: i.json().optional(), // Additional context like old/new values, vote results, etc.
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
    meetingSlots: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      startTime: i.date().indexed(),
      endTime: i.date().indexed(),
      isPublic: i.boolean().indexed(),
      isAvailable: i.boolean().indexed(),
      title: i.string().optional(),
      description: i.string().optional(),
      meetingType: i.string().indexed(), // 'one-on-one', 'public-meeting'
    }),
    meetingBookings: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      status: i.string().indexed(), // 'pending', 'confirmed', 'cancelled'
      notes: i.string().optional(),
    }),
    amendmentPaths: i.entity({
      createdAt: i.date().indexed(),
      pathLength: i.number().indexed(),
    }),
    amendmentPathSegments: i.entity({
      order: i.number().indexed(), // Position in path (0 = first, 1 = second, etc.)
      forwardingStatus: i.string().indexed(), // 'forward_confirmed' | 'previous_decision_outstanding'
      createdAt: i.date().indexed(),
    }),
    stripeCustomers: i.entity({
      stripeCustomerId: i.string().unique().indexed(),
      email: i.string().indexed().optional(),
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
    }),
    stripeSubscriptions: i.entity({
      stripeSubscriptionId: i.string().unique().indexed(),
      stripeCustomerId: i.string().indexed(),
      status: i.string().indexed(), // 'active', 'canceled', 'past_due', etc.
      currentPeriodStart: i.date().indexed(),
      currentPeriodEnd: i.date().indexed(),
      cancelAtPeriodEnd: i.boolean(),
      amount: i.number(), // in cents
      currency: i.string(),
      interval: i.string(), // 'month', 'year'
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      canceledAt: i.date().optional(),
    }),
    stripePayments: i.entity({
      stripeInvoiceId: i.string().unique().indexed(),
      stripeCustomerId: i.string().indexed(),
      stripeSubscriptionId: i.string().indexed().optional(),
      amount: i.number(), // in cents
      currency: i.string(),
      status: i.string().indexed(), // 'paid', 'failed', 'pending'
      createdAt: i.date().indexed(),
      paidAt: i.date().optional(),
    }),
  },
  links: {
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
    agendaItemsAmendment: {
      forward: {
        on: 'agendaItems',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'agendaItems',
      },
    },
    amendmentsGroup: {
      forward: {
        on: 'amendments',
        has: 'many',
        label: 'groups',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'amendments',
      },
    },
    amendmentsTargetGroup: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'targetGroup',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'targetedAmendments',
      },
    },
    amendmentsTargetEvent: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'targetEvent',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'targetedAmendments',
      },
    },
    amendmentsGroupSupporters: {
      forward: {
        on: 'amendments',
        has: 'many',
        label: 'groupSupporters',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'supportedAmendments',
      },
    },
    amendmentsClonedFrom: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'clonedFrom',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'clones',
      },
    },
    amendmentPathsAmendment: {
      forward: {
        on: 'amendmentPaths',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'one',
        label: 'path',
      },
    },
    amendmentPathsUser: {
      forward: {
        on: 'amendmentPaths',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'amendmentPaths',
      },
    },
    amendmentPathSegmentsPath: {
      forward: {
        on: 'amendmentPathSegments',
        has: 'one',
        label: 'path',
      },
      reverse: {
        on: 'amendmentPaths',
        has: 'many',
        label: 'segments',
      },
    },
    amendmentPathSegmentsGroup: {
      forward: {
        on: 'amendmentPathSegments',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'pathSegments',
      },
    },
    amendmentPathSegmentsEvent: {
      forward: {
        on: 'amendmentPathSegments',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'pathSegments',
      },
    },
    amendmentPathSegmentsAgendaItem: {
      forward: {
        on: 'amendmentPathSegments',
        has: 'one',
        label: 'agendaItem',
      },
      reverse: {
        on: 'agendaItems',
        has: 'one',
        label: 'pathSegment',
      },
    },
    amendmentPathSegmentsAmendmentVote: {
      forward: {
        on: 'amendmentPathSegments',
        has: 'one',
        label: 'amendmentVote',
      },
      reverse: {
        on: 'amendmentVotes',
        has: 'one',
        label: 'pathSegment',
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
    conversationsGroup: {
      forward: {
        on: 'conversations',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'one',
        label: 'conversation',
      },
    },
    conversationsRequestedBy: {
      forward: {
        on: 'conversations',
        has: 'one',
        label: 'requestedBy',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'requestedConversations',
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
    documentsGroup: {
      forward: {
        on: 'documents',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'documents',
      },
    },
    documentVersionsDocument: {
      forward: {
        on: 'documentVersions',
        has: 'one',
        label: 'document',
      },
      reverse: {
        on: 'documents',
        has: 'many',
        label: 'versions',
      },
    },
    documentVersionsCreator: {
      forward: {
        on: 'documentVersions',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdDocumentVersions',
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
    eventParticipantRole: {
      forward: {
        on: 'eventParticipants',
        has: 'one',
        label: 'role',
      },
      reverse: {
        on: 'roles',
        has: 'many',
        label: 'eventParticipants',
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
    subscribersSubscriber: {
      forward: {
        on: 'subscribers',
        has: 'one',
        label: 'subscriber',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'subscriptions',
      },
    },
    subscribersUser: {
      forward: {
        on: 'subscribers',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'subscribers',
      },
    },
    subscribersGroup: {
      forward: {
        on: 'subscribers',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'subscribers',
      },
    },
    subscribersAmendment: {
      forward: {
        on: 'subscribers',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'subscribers',
      },
    },
    subscribersEvent: {
      forward: {
        on: 'subscribers',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'subscribers',
      },
    },
    subscribersBlog: {
      forward: {
        on: 'subscribers',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'subscribers',
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
    groupMembershipRole: {
      forward: {
        on: 'groupMemberships',
        has: 'one',
        label: 'role',
      },
      reverse: {
        on: 'roles',
        has: 'many',
        label: 'groupMemberships',
      },
    },
    roleGroup: {
      forward: { on: 'roles', has: 'one', label: 'group' },
      reverse: { on: 'groups', has: 'many', label: 'roles' },
    },
    roleEvent: {
      forward: { on: 'roles', has: 'one', label: 'event' },
      reverse: { on: 'events', has: 'many', label: 'roles' },
    },
    roleAmendment: {
      forward: { on: 'roles', has: 'one', label: 'amendment' },
      reverse: { on: 'amendments', has: 'many', label: 'roles' },
    },
    roleBlog: {
      forward: { on: 'roles', has: 'one', label: 'blog' },
      reverse: { on: 'blogs', has: 'many', label: 'roles' },
    },
    actionRightRole: {
      forward: { on: 'actionRights', has: 'many', label: 'roles' },
      reverse: { on: 'roles', has: 'many', label: 'actionRights' },
    },
    actionRightGroup: {
      forward: { on: 'actionRights', has: 'one', label: 'group' },
      reverse: { on: 'groups', has: 'many', label: 'scopedActionRights' },
    },
    actionRightEvent: {
      forward: { on: 'actionRights', has: 'one', label: 'event' },
      reverse: { on: 'events', has: 'many', label: 'scopedActionRights' },
    },
    actionRightAmendment: {
      forward: { on: 'actionRights', has: 'one', label: 'amendment' },
      reverse: { on: 'amendments', has: 'many', label: 'scopedActionRights' },
    },
    actionRightBlog: {
      forward: { on: 'actionRights', has: 'one', label: 'blog' },
      reverse: { on: 'blogs', has: 'many', label: 'scopedActionRights' },
    },
    participantEvent: {
      forward: { on: 'participants', has: 'one', label: 'event' },
      reverse: { on: 'events', has: 'many', label: 'eventRoleParticipants' },
    },
    participantUser: {
      forward: { on: 'participants', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'many', label: 'participations' },
    },
    participantRole: {
      forward: { on: 'participants', has: 'one', label: 'role' },
      reverse: { on: 'roles', has: 'many', label: 'participants' },
    },
    collaboratorRole: {
      forward: { on: 'amendmentCollaborators', has: 'one', label: 'role' },
      reverse: { on: 'roles', has: 'many', label: 'collaborators' },
    },
    collaboratorAmendment: {
      forward: { on: 'amendmentCollaborators', has: 'one', label: 'amendment' },
      reverse: { on: 'amendments', has: 'many', label: 'amendmentRoleCollaborators' },
    },
    collaboratorUser: {
      forward: { on: 'amendmentCollaborators', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'many', label: 'collaborations' },
    },
    blogBloggersRole: {
      forward: { on: 'blogBloggers', has: 'one', label: 'role' },
      reverse: { on: 'roles', has: 'many', label: 'bloggers' },
    },
    blogBloggersBlog: {
      forward: { on: 'blogBloggers', has: 'one', label: 'blog' },
      reverse: { on: 'blogs', has: 'many', label: 'blogRoleBloggers' },
    },
    blogBloggersUser: {
      forward: { on: 'blogBloggers', has: 'one', label: 'user' },
      reverse: { on: '$users', has: 'many', label: 'bloggerRelations' },
    },
    eventsCreator: {
      forward: {
        on: 'events',
        has: 'one',
        label: 'creator',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'createdEvents',
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
        on: '$users',
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
    eventPositionsEvent: {
      forward: {
        on: 'eventPositions',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'eventPositions',
      },
    },
    eventPositionHoldersPosition: {
      forward: {
        on: 'eventPositionHolders',
        has: 'one',
        label: 'position',
      },
      reverse: {
        on: 'eventPositions',
        has: 'many',
        label: 'holders',
      },
    },
    eventPositionHoldersUser: {
      forward: {
        on: 'eventPositionHolders',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'eventPositionHolders',
      },
    },
    eventPositionsElection: {
      forward: {
        on: 'eventPositions',
        has: 'one',
        label: 'election',
      },
      reverse: {
        on: 'elections',
        has: 'one',
        label: 'eventPosition',
      },
    },
    $usersAvatarFile: {
      forward: {
        on: '$users',
        has: 'one',
        label: 'avatarFile',
      },
      reverse: {
        on: '$files',
        has: 'one',
        label: 'userAvatar',
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
    commentsBlog: {
      forward: {
        on: 'comments',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
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
    amendmentSupportVotesAmendment: {
      forward: {
        on: 'amendmentSupportVotes',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'votes',
      },
    },
    amendmentSupportVotesUser: {
      forward: {
        on: 'amendmentSupportVotes',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'amendmentSupportVotes',
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
    amendmentsDocument: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'document',
      },
      reverse: {
        on: 'documents',
        has: 'one',
        label: 'amendment',
      },
    },
    meetingSlotsOwner: {
      forward: {
        on: 'meetingSlots',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'meetingSlots',
      },
    },
    meetingBookingsSlot: {
      forward: {
        on: 'meetingBookings',
        has: 'one',
        label: 'slot',
      },
      reverse: {
        on: 'meetingSlots',
        has: 'many',
        label: 'bookings',
      },
    },
    meetingBookingsBooker: {
      forward: {
        on: 'meetingBookings',
        has: 'one',
        label: 'booker',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'meetingBookings',
      },
    },
    linksUser: {
      forward: {
        on: 'links',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'links',
      },
    },
    linksMeetingSlot: {
      forward: {
        on: 'links',
        has: 'one',
        label: 'meetingSlot',
      },
      reverse: {
        on: 'meetingSlots',
        has: 'many',
        label: 'links',
      },
    },
    timelineEventsUser: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    timelineEventsGroup: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    timelineEventsAmendment: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    timelineEventsEvent: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    timelineEventsBlog: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'blog',
      },
      reverse: {
        on: 'blogs',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    timelineEventsActor: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'actor',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'performedTimelineEvents',
      },
    },
    stripeCustomersUser: {
      forward: {
        on: 'stripeCustomers',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'one',
        label: 'stripeCustomer',
      },
    },
    stripeSubscriptionsCustomer: {
      forward: {
        on: 'stripeSubscriptions',
        has: 'one',
        label: 'customer',
      },
      reverse: {
        on: 'stripeCustomers',
        has: 'many',
        label: 'subscriptions',
      },
    },
    stripePaymentsCustomer: {
      forward: {
        on: 'stripePayments',
        has: 'one',
        label: 'customer',
      },
      reverse: {
        on: 'stripeCustomers',
        has: 'many',
        label: 'payments',
      },
    },
    stripePaymentsSubscription: {
      forward: {
        on: 'stripePayments',
        has: 'one',
        label: 'subscription',
      },
      reverse: {
        on: 'stripeSubscriptions',
        has: 'many',
        label: 'payments',
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
