import { i } from '@instantdb/react';

const _events = {
  entities: {
    events: i.entity({
      capacity: i.number().optional(),
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      endDate: i.date().indexed().optional(),
      imageURL: i.string().optional(),
      isPublic: i.boolean().indexed(),
      location: i.string().optional(), // Legacy: single location field
      startDate: i.date().indexed(),
      streamURL: i.string().optional(), // YouTube live stream URL for the event stream page
      tags: i.json().optional(),
      title: i.string().indexed(),
      updatedAt: i.date().indexed(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
      public_participants: i.boolean().indexed().optional(), // Whether participants list is publicly visible
      participantListVisibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private' - replaces public_participants
      amendment_cutoff_date: i.date().indexed().optional(), // Deadline for submitting amendments
      eventType: i.string().indexed().optional(), // 'delegate_conference', 'open_assembly', 'general_assembly', 'other'
      delegatesFinalized: i.boolean().indexed().optional(), // Whether delegates have been finalized for delegate conferences
      delegateAllocationMode: i.string().indexed().optional(), // 'total' (fixed number) or 'ratio' (per X members)
      totalDelegates: i.number().indexed().optional(), // Total number of delegates when mode is 'total'
      delegateRatio: i.number().indexed().optional(), // Number of members per delegate when mode is 'ratio' (default: 50)

      // Recurring event fields
      recurringPattern: i.string().indexed().optional(), // 'daily', 'weekly', 'monthly', 'yearly', 'four-yearly', null for non-recurring
      recurringInterval: i.number().optional(), // e.g., 1 for every week, 2 for every 2 weeks
      recurringEndDate: i.date().indexed().optional(), // When the recurrence stops
      recurringParentId: i.string().indexed().optional(), // ID of parent event for recurring instances
      recurringInstanceDate: i.date().indexed().optional(), // Specific date for this recurring instance

      // Location type and online meeting fields
      locationType: i.string().indexed().optional(), // 'online', 'physical', 'hybrid'
      onlineMeetingLink: i.string().optional(), // URL for online meeting (Zoom, Teams, etc.)
      meetingCode: i.string().optional(), // Access code for the meeting

      // Physical location fields (structured address)
      locationName: i.string().optional(), // Name of venue (e.g., "Rathaus", "Community Center")
      street: i.string().optional(), // Street name
      houseNumber: i.string().optional(), // House/building number
      postalCode: i.string().optional(), // Postal/ZIP code
      city: i.string().optional(), // City name

      // Deadline fields for delegate conferences
      delegateNominationDeadline: i.date().indexed().optional(), // Deadline for delegate nominations
      proposalSubmissionDeadline: i.date().indexed().optional(), // Deadline for submitting proposals/amendments

      // Agenda management fields
      currentAgendaItemId: i.string().indexed().optional(), // ID of the currently active agenda item

      // Event status and cancellation fields
      status: i.string().indexed().optional(), // 'active', 'cancelled', 'completed'
      cancellationReason: i.string().optional(), // Reason for cancellation
      cancelledAt: i.date().indexed().optional(), // When the event was cancelled
    }),
    eventParticipants: i.entity({
      createdAt: i.date().indexed().optional(),
      status: i.string().indexed().optional(), // invited, requested, member, admin
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
    eventDelegates: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      priority: i.number().indexed(), // Order in the nomination list (1 = first, 2 = second, etc.)
      status: i.string().indexed(), // 'nominated', 'confirmed', 'standby'
    }),
    groupDelegateAllocations: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      allocatedDelegates: i.number().indexed(), // Current number of delegates allocated to this group
      memberCount: i.number().indexed(), // Snapshot of member count at calculation time
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
    participants: i.entity({
      status: i.string().optional(), // 'invited', 'accepted', 'declined'
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
    // Event voting sessions for structured voting at events
    eventVotingSessions: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().indexed(),
      phase: i.string().indexed(), // 'introduction', 'voting', 'completed'
      votingType: i.string().indexed(), // 'amendment', 'election', 'change_request'
      startedAt: i.date().indexed().optional(),
      endedAt: i.date().indexed().optional(),
      timeLimit: i.number().optional(), // Time limit in seconds
      autoCloseOnAllVoted: i.boolean().optional(),
      autoCloseOnTimeout: i.boolean().optional(),
      majorityType: i.string().indexed(), // 'simple', 'absolute', 'two_thirds'
      result: i.string().indexed().optional(), // 'passed', 'rejected', 'tie'
      targetEntityType: i.string().indexed(), // 'amendment', 'change_request', 'election'
      targetEntityId: i.string().indexed(),
    }),
    // Individual votes cast in event voting sessions
    eventVotes: i.entity({
      createdAt: i.date().indexed(),
      vote: i.string().indexed(), // 'accept', 'reject', 'abstain'
    }),
    // Scheduled elections for position revotes
    scheduledElections: i.entity({
      scheduledDate: i.date().indexed(),
      status: i.string().indexed(), // 'scheduled', 'event_created', 'completed', 'cancelled'
      createdAt: i.date().indexed(),
    }),
  },
  links: {
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
    eventDelegatesEvent: {
      forward: {
        on: 'eventDelegates',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'delegates',
      },
    },
    eventDelegatesUser: {
      forward: {
        on: 'eventDelegates',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'delegateAssignments',
      },
    },
    eventDelegatesGroup: {
      forward: {
        on: 'eventDelegates',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'delegateAssignments',
      },
    },
    groupDelegateAllocationsEvent: {
      forward: {
        on: 'groupDelegateAllocations',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'delegateAllocations',
      },
    },
    groupDelegateAllocationsGroup: {
      forward: {
        on: 'groupDelegateAllocations',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'delegateAllocations',
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
    roleEvent: {
      forward: { on: 'roles', has: 'one', label: 'event' },
      reverse: { on: 'events', has: 'many', label: 'roles' },
    },
    actionRightEvent: {
      forward: { on: 'actionRights', has: 'one', label: 'event' },
      reverse: { on: 'events', has: 'many', label: 'scopedActionRights' },
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
    // Event voting session links
    eventVotingSessionsAgendaItem: {
      forward: {
        on: 'eventVotingSessions',
        has: 'one',
        label: 'agendaItem',
      },
      reverse: {
        on: 'agendaItems',
        has: 'many',
        label: 'votingSessions',
      },
    },
    eventVotingSessionsEvent: {
      forward: {
        on: 'eventVotingSessions',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'votingSessions',
      },
    },
    eventVotingSessionsAmendment: {
      forward: {
        on: 'eventVotingSessions',
        has: 'one',
        label: 'amendment',
      },
      reverse: {
        on: 'amendments',
        has: 'many',
        label: 'eventVotingSessions',
      },
    },
    eventVotingSessionsChangeRequest: {
      forward: {
        on: 'eventVotingSessions',
        has: 'one',
        label: 'changeRequest',
      },
      reverse: {
        on: 'changeRequests',
        has: 'many',
        label: 'eventVotingSessions',
      },
    },
    eventVotingSessionsElection: {
      forward: {
        on: 'eventVotingSessions',
        has: 'one',
        label: 'election',
      },
      reverse: {
        on: 'elections',
        has: 'many',
        label: 'eventVotingSessions',
      },
    },
    // Event votes links
    eventVotesSession: {
      forward: {
        on: 'eventVotes',
        has: 'one',
        label: 'session',
      },
      reverse: {
        on: 'eventVotingSessions',
        has: 'many',
        label: 'votes',
      },
    },
    eventVotesVoter: {
      forward: {
        on: 'eventVotes',
        has: 'one',
        label: 'voter',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'eventVotes',
      },
    },
    eventVotesCandidate: {
      forward: {
        on: 'eventVotes',
        has: 'one',
        label: 'candidate',
      },
      reverse: {
        on: 'electionCandidates',
        has: 'many',
        label: 'eventVotes',
      },
    },
    // Event cancelled by link
    eventsCancelledBy: {
      forward: {
        on: 'events',
        has: 'one',
        label: 'cancelledBy',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'cancelledEvents',
      },
    },
    // Scheduled elections links
    scheduledElectionsPosition: {
      forward: {
        on: 'scheduledElections',
        has: 'one',
        label: 'position',
      },
      reverse: {
        on: 'positions',
        has: 'many',
        label: 'scheduledElections',
      },
    },
    scheduledElectionsGroup: {
      forward: {
        on: 'scheduledElections',
        has: 'one',
        label: 'group',
      },
      reverse: {
        on: 'groups',
        has: 'many',
        label: 'scheduledElections',
      },
    },
    scheduledElectionsEvent: {
      forward: {
        on: 'scheduledElections',
        has: 'one',
        label: 'event',
      },
      reverse: {
        on: 'events',
        has: 'many',
        label: 'scheduledElections',
      },
    },
  } as const,
};

export default _events;
