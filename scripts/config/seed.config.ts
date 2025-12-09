import { TEST_ENTITY_IDS } from '../../e2e/test-entity-ids';
import { ARIA_KAI_USER_ID, ARIA_KAI_EMAIL } from '../../e2e/aria-kai';

/**
 * Seed Configuration
 * Controls the quantity and distribution of seeded entities
 */
export const SEED_CONFIG = {
  mainTestUserId: TEST_ENTITY_IDS.mainTestUser,
  tobiasUserId: TEST_ENTITY_IDS.tobiasUser,
  ariaKaiUserId: ARIA_KAI_USER_ID,
  users: { min: 15, max: 20 },
  groups: { min: 6, max: 8 },
  events: { min: 8, max: 12 },
  membersPerGroup: { min: 3, max: 10 },
  followsPerUser: { min: 2, max: 8 },
  conversationsPerUser: { min: 1, max: 3 },
  messagesPerConversation: { min: 5, max: 15 },
  eventsPerGroup: { min: 1, max: 3 },
  participantsPerEvent: { min: 3, max: 8 },
  notificationsPerUser: { min: 2, max: 7 },
  todosPerUser: { min: 2, max: 5 },
  todoAssignmentsPerTodo: { min: 1, max: 3 },
  positionsPerGroup: { min: 2, max: 5 },
} as const;

/**
 * Predefined hashtag pools for different entity types
 */
export const USER_HASHTAGS = [
  'activist',
  'volunteer',
  'leader',
  'organizer',
  'advocate',
  'community',
  'politics',
  'environment',
  'education',
  'healthcare',
  'technology',
  'innovation',
  'sustainability',
  'democracy',
  'justice',
  'equality',
  'reform',
  'policy',
  'governance',
  'engagement',
];

export const GROUP_HASHTAGS = [
  'community',
  'organization',
  'political',
  'social',
  'activism',
  'nonprofit',
  'grassroots',
  'coalition',
  'network',
  'movement',
  'progressive',
  'conservative',
  'centrist',
  'reform',
  'advocacy',
  'local',
  'national',
  'global',
  'regional',
  'municipal',
];

export const AMENDMENT_HASHTAGS = [
  'policy',
  'reform',
  'legislation',
  'amendment',
  'proposal',
  'regulation',
  'law',
  'statute',
  'ordinance',
  'resolution',
  'bill',
  'measure',
  'initiative',
  'referendum',
  'act',
  'governance',
  'democracy',
  'rights',
  'freedom',
  'justice',
];

export const EVENT_HASHTAGS = [
  'conference',
  'workshop',
  'meetup',
  'seminar',
  'social',
  'networking',
  'training',
  'symposium',
  'forum',
  'townhall',
  'rally',
  'protest',
  'demonstration',
  'gathering',
  'assembly',
  'webinar',
  'panel',
  'discussion',
  'debate',
  'presentation',
];

export const BLOG_HASHTAGS = [
  'news',
  'opinion',
  'analysis',
  'commentary',
  'insights',
  'perspective',
  'thoughts',
  'ideas',
  'discussion',
  'debate',
  'reflection',
  'review',
  'update',
  'announcement',
  'feature',
  'story',
  'article',
  'post',
  'blog',
  'writing',
];

/**
 * Test entity IDs for deterministic E2E testing
 */
export { TEST_ENTITY_IDS, ARIA_KAI_USER_ID, ARIA_KAI_EMAIL };
