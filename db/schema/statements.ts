import { i } from '@instantdb/react';

const _statements = {
  entities: {
    statements: i.entity({
      tag: i.string(),
      text: i.string(),
      visibility: i.string().indexed().optional(), // 'public', 'authenticated', 'private'
    }),
  },
  links: {
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
    timelineEventsStatement: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'statement',
      },
      reverse: {
        on: 'statements',
        has: 'many',
        label: 'timelineEvents',
      },
    },
  } as const,
};

export default _statements;
