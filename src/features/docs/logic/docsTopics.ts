import type { DocsTopicDefinition, DocsTopicSlug } from '../types/docs.types';

export const docsTopicDefinitions: DocsTopicDefinition[] = [
  {
    slug: 'users',
    icon: 'User',
    category: 'people',
    featured: true,
    related: ['groups', 'notifications', 'messages'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'create-profile', tone: 'entry' },
        { id: 'join-spaces', tone: 'collaboration' },
        { id: 'stay-informed', tone: 'result' },
      ],
    },
  },
  {
    slug: 'groups',
    icon: 'Users',
    category: 'collaboration',
    featured: true,
    related: ['users', 'events', 'roles-and-rights'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'create-space', tone: 'entry' },
        { id: 'assign-roles', tone: 'decision' },
        { id: 'run-work', tone: 'result' },
      ],
    },
  },
  {
    slug: 'events',
    icon: 'Calendar',
    category: 'collaboration',
    featured: true,
    related: ['groups', 'calendar', 'networks-and-forwarding'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'publish-event', tone: 'entry' },
        { id: 'run-agenda', tone: 'action' },
        { id: 'capture-outcomes', tone: 'result' },
      ],
    },
  },
  {
    slug: 'amendments',
    icon: 'FileText',
    category: 'governance',
    featured: true,
    related: ['votes', 'roles-and-rights', 'networks-and-forwarding'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'draft-text', tone: 'entry' },
        { id: 'collaborate', tone: 'collaboration' },
        { id: 'forward-or-vote', tone: 'decision' },
      ],
    },
  },
  {
    slug: 'blogs',
    icon: 'Edit',
    category: 'collaboration',
    featured: false,
    related: ['groups', 'search', 'notifications'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'draft-post', tone: 'entry' },
        { id: 'publish', tone: 'action' },
        { id: 'discuss', tone: 'result' },
      ],
    },
  },
  {
    slug: 'elections',
    icon: 'Radio',
    category: 'governance',
    featured: false,
    related: ['votes', 'decision-terminal', 'roles-and-rights'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'define-position', tone: 'entry' },
        { id: 'nominate', tone: 'collaboration' },
        { id: 'confirm-results', tone: 'result' },
      ],
    },
  },
  {
    slug: 'votes',
    icon: 'CheckSquare',
    category: 'governance',
    featured: false,
    related: ['elections', 'decision-terminal', 'amendments'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'prepare-question', tone: 'entry' },
        { id: 'cast-ballot', tone: 'decision' },
        { id: 'review-result', tone: 'result' },
      ],
    },
  },
  {
    slug: 'decision-terminal',
    icon: 'AreaChart',
    category: 'governance',
    featured: true,
    related: ['votes', 'elections', 'notifications'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'watch-live', tone: 'attention' },
        { id: 'inspect-item', tone: 'decision' },
        { id: 'follow-result', tone: 'result' },
      ],
    },
  },
  {
    slug: 'search',
    icon: 'Search',
    category: 'coordination',
    featured: false,
    related: ['blogs', 'messages', 'notifications'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'search-across', tone: 'entry' },
        { id: 'narrow-context', tone: 'action' },
        { id: 'jump-to-target', tone: 'result' },
      ],
    },
  },
  {
    slug: 'messages',
    icon: 'MessageSquare',
    category: 'coordination',
    featured: false,
    related: ['notifications', 'users', 'groups'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'open-thread', tone: 'entry' },
        { id: 'coordinate', tone: 'collaboration' },
        { id: 'follow-links', tone: 'result' },
      ],
    },
  },
  {
    slug: 'notifications',
    icon: 'Bell',
    category: 'coordination',
    featured: false,
    related: ['messages', 'decision-terminal', 'calendar'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'receive-alerts', tone: 'attention' },
        { id: 'prioritize', tone: 'decision' },
        { id: 'act', tone: 'result' },
      ],
    },
  },
  {
    slug: 'calendar',
    icon: 'Calendar',
    category: 'coordination',
    featured: false,
    related: ['events', 'notifications', 'todos'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'scan-schedule', tone: 'entry' },
        { id: 'open-entry', tone: 'action' },
        { id: 'prepare', tone: 'result' },
      ],
    },
  },
  {
    slug: 'todos',
    icon: 'CheckSquare',
    category: 'coordination',
    featured: false,
    related: ['calendar', 'notifications', 'groups'],
    process: {
      kind: 'timeline',
      steps: [
        { id: 'capture-work', tone: 'entry' },
        { id: 'track-progress', tone: 'action' },
        { id: 'close-loop', tone: 'result' },
      ],
    },
  },
  {
    slug: 'roles-and-rights',
    icon: 'UserCheck',
    category: 'systems',
    featured: true,
    related: ['groups', 'events', 'amendments'],
    process: {
      kind: 'lanes',
      lanes: ['organizer', 'member', 'system'],
      steps: [
        { id: 'set-scope', lane: 'organizer', tone: 'entry' },
        { id: 'assign-role', lane: 'organizer', tone: 'decision' },
        { id: 'see-available-actions', lane: 'member', tone: 'action' },
        { id: 'enforce-boundaries', lane: 'system', tone: 'attention' },
        { id: 'adapt-over-time', lane: 'organizer', tone: 'result' },
      ],
    },
  },
  {
    slug: 'networks-and-forwarding',
    icon: 'Network',
    category: 'systems',
    featured: true,
    related: ['groups', 'events', 'amendments'],
    process: {
      kind: 'lanes',
      lanes: ['group', 'event', 'amendment'],
      steps: [
        { id: 'connect-groups', lane: 'group', tone: 'entry' },
        { id: 'inherit-context', lane: 'event', tone: 'action' },
        { id: 'route-amendments', lane: 'amendment', tone: 'decision' },
        { id: 'confirm-forwarding', lane: 'group', tone: 'attention' },
        { id: 'surface-result', lane: 'amendment', tone: 'result' },
      ],
    },
  },
];

export const docsTopicOrder = docsTopicDefinitions.map(topic => topic.slug);

export const docsTopicMap = Object.fromEntries(
  docsTopicDefinitions.map(topic => [topic.slug, topic])
) as Record<DocsTopicSlug, DocsTopicDefinition>;

export function isDocsTopicSlug(value: string): value is DocsTopicSlug {
  return value in docsTopicMap;
}

export function getDocsTopic(slug: DocsTopicSlug) {
  return docsTopicMap[slug];
}