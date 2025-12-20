import { i } from '@instantdb/react';

const _common = {
  entities: {
    subscribers: i.entity({
      createdAt: i.date().indexed(),
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
    timelineEvents: i.entity({
      createdAt: i.date().indexed(),
      eventType: i.string().indexed(), // 'created', 'updated', 'comment_added', 'vote_started', 'participant_joined', etc.
      entityType: i.string().indexed(), // 'user', 'group', 'amendment', 'event', 'blog'
      entityId: i.string().indexed(),
      title: i.string().indexed(),
      description: i.string().optional(),
      metadata: i.json().optional(), // Additional context like old/new values, vote results, etc.
    }),
  },
  links: {
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
  } as const,
};

export default _common;
