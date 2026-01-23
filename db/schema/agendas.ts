import { i } from '@instantdb/react';

const _agendas = {
  entities: {
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
      // Agenda item activation fields
      activatedAt: i.date().indexed().optional(), // Timestamp when item was activated
      completedAt: i.date().indexed().optional(), // Timestamp when item was completed
    }),
    speakerList: i.entity({
      completed: i.boolean().indexed(),
      createdAt: i.date().indexed(),
      order: i.number().indexed(),
      time: i.number(),
      title: i.string(),
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
    electionCandidates: i.entity({
      createdAt: i.date().indexed(),
      description: i.string().optional(),
      imageURL: i.string().optional(),
      name: i.string().indexed(),
      order: i.number().indexed(),
    }),
    electionVotes: i.entity({
      createdAt: i.date().indexed(),
      updatedAt: i.date().optional(),
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
  } as const,
};

export default _agendas;
