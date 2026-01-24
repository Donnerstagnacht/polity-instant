import { i } from '@instantdb/react';

const _common = {
  entities: {
    subscribers: i.entity({
      createdAt: i.date().indexed(),
    }),
    hashtags: i.entity({
      createdAt: i.date().indexed(),
      tag: i.string().indexed(),
      // Topic/category system for Pinterest-style filtering
      category: i.string().indexed().optional(), // 'transport', 'budget', 'climate', 'healthcare', 'education', 'housing', 'urban', 'governance', 'environment', 'economy', 'social', 'justice', 'events', 'international'
      color: i.string().optional(), // Hex color code for visual coding (e.g., '#3B82F6')
      bgColor: i.string().optional(), // Background color class (e.g., 'bg-blue-100')
      icon: i.string().optional(), // Icon name from Lucide (e.g., 'Bus', 'Coins', 'Leaf')
      description: i.string().optional(), // Optional description for the topic
      postCount: i.number().optional(), // Number of posts using this hashtag
    }),
    links: i.entity({
      createdAt: i.date().indexed(),
      label: i.string().indexed(),
      url: i.string(),
    }),
    timelineEvents: i.entity({
      createdAt: i.date().indexed(),
      eventType: i.string().indexed(), // 'created', 'updated', 'comment_added', 'vote_started', 'participant_joined', 'vote_opened', 'vote_closed', 'vote_passed', 'vote_rejected', 'election_nominations_open', 'election_voting_open', 'election_closed', 'election_winner_announced', 'video_uploaded', 'image_uploaded', 'statement_posted', 'todo_created', 'blog_published'
      entityType: i.string().indexed(), // 'user', 'group', 'amendment', 'event', 'blog'
      entityId: i.string().indexed(),
      title: i.string().indexed(),
      description: i.string().optional(),
      metadata: i.json().optional(), // Additional context like old/new values, vote results, etc.
      // Media fields for Pinterest-style timeline
      imageURL: i.string().optional(), // For image posts
      videoURL: i.string().optional(), // For video posts
      videoThumbnailURL: i.string().optional(), // Video thumbnail
      // Content categorization
      contentType: i.string().indexed().optional(), // 'group', 'event', 'amendment', 'vote', 'election', 'video', 'image', 'statement', 'todo', 'blog', 'action'
      tags: i.json().optional(), // Array of topic tags
      // Engagement stats
      stats: i.json().optional(), // Dynamic stats object (likes, views, shares, comments)
      // Vote/Election status for Decision Terminal
      voteStatus: i.string().optional(), // 'open', 'closed', 'passed', 'rejected'
      electionStatus: i.string().optional(), // 'nominations', 'voting', 'closed', 'winner'
      endsAt: i.date().optional(), // When vote/election ends (for countdown)
    }),
    // Reactions for timeline content (likes, support, oppose, etc.)
    reactions: i.entity({
      createdAt: i.date().indexed(),
      entityId: i.string().indexed(), // ID of the entity being reacted to
      entityType: i.string().indexed(), // 'timelineEvent', 'amendment', 'event', 'blog', etc.
      reactionType: i.string().indexed(), // 'support', 'oppose', 'interested', 'like', 'celebrate'
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
    timelineEventsTodo: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'todo',
      },
      reverse: {
        on: 'todos',
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
    // Timeline event links to decision entities (for agenda item navigation)
    timelineEventsElection: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'election',
      },
      reverse: {
        on: 'elections',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    timelineEventsAmendmentVote: {
      forward: {
        on: 'timelineEvents',
        has: 'one',
        label: 'amendmentVote',
      },
      reverse: {
        on: 'amendmentVotes',
        has: 'many',
        label: 'timelineEvents',
      },
    },
    // Reactions links
    reactionsUser: {
      forward: {
        on: 'reactions',
        has: 'one',
        label: 'user',
      },
      reverse: {
        on: '$users',
        has: 'many',
        label: 'reactions',
      },
    },
    reactionsTimelineEvent: {
      forward: {
        on: 'reactions',
        has: 'one',
        label: 'timelineEvent',
      },
      reverse: {
        on: 'timelineEvents',
        has: 'many',
        label: 'reactions',
      },
    },
  } as const,
};

export default _common;
