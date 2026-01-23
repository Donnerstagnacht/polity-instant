import { i } from '@instantdb/react';

const _amendments = {
  entities: {
    amendments: i.entity({
      code: i.string().optional(),
      createdAt: i.date().indexed().optional(),
      date: i.string(),
      imageURL: i.string().optional(),
      videoURL: i.string().optional(),
      videoThumbnailURL: i.string().optional(),
      status: i.string(),
      workflowStatus: i.string().indexed().optional(), // 'collaborative_editing', 'internal_suggesting', 'internal_voting', 'viewing', 'event_suggesting', 'event_voting'
      currentEventId: i.string().optional(), // ID of current event in process
      subtitle: i.string().optional(),
      supporters: i.number(),
      supporterGroups: i.json().optional(), // Array of group IDs that supported this amendment
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
      characterCount: i.number().indexed().optional(), // Total diff length (insertions + deletions)
      source: i.string().indexed().optional(), // 'collaborator' | 'event_participant'
      sourceEventId: i.string().optional(), // Event ID if created by event participant
      votingOrder: i.number().optional(), // Manual override for voting sequence (organizers only)
    }),
    changeRequestVotes: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
      vote: i.string().indexed(), // 'accept', 'reject', 'abstain'
    }),
    amendmentVotingSessions: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      votingType: i.string().indexed(), // 'internal' | 'event'
      status: i.string().indexed(), // 'pending', 'active', 'completed'
      votingStartTime: i.date().indexed(),
      votingEndTime: i.date().indexed(),
      votingIntervalMinutes: i.number(), // Voting duration in minutes
      currentChangeRequestIndex: i.number().optional(), // Current index in sequential voting
      autoClose: i.boolean().optional(), // Auto-close when votingEndTime reached
    }),
    amendmentVotingSessionVotes: i.entity({
      createdAt: i.date().indexed(),
      vote: i.string().indexed(), // 'accept', 'reject', 'abstain'
    }),
    amendmentCollaborators: i.entity({
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, member, admin
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
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
    // Support confirmations for when change requests are accepted on supported amendments
    supportConfirmations: i.entity({
      status: i.string().indexed(), // 'pending', 'confirmed', 'declined'
      changeRequestId: i.string().indexed(), // Reference to the change request that triggered this
      originalVersion: i.json(), // Snapshot of amendment document at time of support
      createdAt: i.date().indexed(),
      respondedAt: i.date().indexed().optional(), // When the group responded
    }),
  },
  links: {
    amendmentsOwner: {
      forward: {
        on: 'amendments',
        has: 'one',
        label: 'owner',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'ownedAmendments',
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
    roleAmendment: {
      forward: { on: 'roles', has: 'one', label: 'amendment' },
      reverse: { on: 'amendments', has: 'many', label: 'roles' },
    },
    actionRightAmendment: {
      forward: { on: 'actionRights', has: 'one', label: 'amendment' },
      reverse: { on: 'amendments', has: 'many', label: 'scopedActionRights' },
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
    amendmentVotingSessionsAmendment: {
      forward: {
        on: 'amendmentVotingSessions',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'votingSessions',
      },
    },
    amendmentVotingSessionsEvent: {
      forward: {
        on: 'amendmentVotingSessions',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'amendmentVotingSessions',
      },
    },
    amendmentVotingSessionsAgendaItem: {
      forward: {
        on: 'amendmentVotingSessions',
        has: 'one',
        label: 'agendaItem',
      },
      reverse: {
        on: 'agendaItems',
        has: 'many',
        label: 'amendmentVotingSessions',
      },
    },
    amendmentVotingSessionVotesSession: {
      forward: {
        on: 'amendmentVotingSessionVotes',
        has: 'one',
        label: 'session',
      },
      reverse: {
        on: 'amendmentVotingSessions',
        has: 'many',
        label: 'votes',
      },
    },
    amendmentVotingSessionVotesVoter: {
      forward: {
        on: 'amendmentVotingSessionVotes',
        has: 'one',
        label: 'voter',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'amendmentSessionVotes',
      },
    },
    amendmentVotingSessionVotesChangeRequest: {
      forward: {
        on: 'amendmentVotingSessionVotes',
        has: 'one',
        label: 'changeRequest',
      },
      reverse: {
        on: 'changeRequests',
        has: 'many',
        label: 'sessionVotes',
      },
    },
    // Support confirmation links
    supportConfirmationsAmendment: {
      forward: {
        on: 'supportConfirmations',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'supportConfirmations',
      },
    },
    supportConfirmationsGroup: {
      forward: {
        on: 'supportConfirmations',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'supportConfirmations',
      },
    },
    supportConfirmationsChangeRequest: {
      forward: {
        on: 'supportConfirmations',
        has: 'one',
        label: 'changeRequest',
      },
      reverse: {
        on: 'changeRequests',
        has: 'many',
        label: 'supportConfirmations',
      },
    },
    supportConfirmationsAgendaItem: {
      forward: {
        on: 'supportConfirmations',
        has: 'one',
        label: 'agendaItem',
      },
      reverse: {
        on: 'agendaItems',
        has: 'one',
        label: 'supportConfirmation',
      },
    },
  } as const,
};

export default _amendments;
