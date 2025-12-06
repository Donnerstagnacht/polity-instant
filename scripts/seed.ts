/**
 * InstantDB Seed Script
 *
 * This script populates the database with test data for all entities.
 *
 * CRITICAL: This uses the InstantDB Admin SDK which requires an admin token.
 * Set INSTANT_ADMIN_TOKEN in your .env.local file.
 *
 * Usage: npm run seed
 */

import { init, tx, id } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { config } from 'dotenv';
import { resolve } from 'path';
import { TEST_ENTITY_IDS } from '../e2e/test-entity-ids';

// Load environment variables from .env and .env.local
config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '.env.local'), override: true });

// Get environment variables
const APP_ID = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const ADMIN_TOKEN = process.env.INSTANT_ADMIN_TOKEN;

if (!APP_ID) {
  throw new Error('NEXT_PUBLIC_INSTANT_APP_ID is required in .env or .env.local');
}

if (!ADMIN_TOKEN) {
  throw new Error(
    'INSTANT_ADMIN_TOKEN is required in .env or .env.local. Get this from the Instant dashboard or MCP tools.'
  );
}

// Initialize the admin SDK
const db = init({
  appId: APP_ID,
  adminToken: ADMIN_TOKEN,
});

// Configuration
const SEED_CONFIG = {
  mainTestUserId: TEST_ENTITY_IDS.mainTestUser,
  tobiasUserId: TEST_ENTITY_IDS.tobiasUser,
  users: 20,
  groups: 8,
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
};

// Helper function to batch transactions with retry logic
async function batchTransact(transactions: any[], batchSize = 20) {
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    let retries = 3;
    while (retries > 0) {
      try {
        await db.transact(batch);
        break; // Success, exit retry loop
      } catch (error: any) {
        retries--;
        if (retries === 0 || !error.body?.hint?.condition?.includes('deadlock')) {
          throw error; // Re-throw if out of retries or not a deadlock
        }
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, (4 - retries) * 500));
      }
    }
    // Small delay between batches to avoid overwhelming the database
    if (i + batchSize < transactions.length) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }
}

// Helper functions
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

// Helper function to get random visibility
function randomVisibility(): 'public' | 'authenticated' | 'private' {
  const visibilities: ('public' | 'authenticated' | 'private')[] = [
    'public',
    'authenticated',
    'private',
  ];
  return randomItem(visibilities);
}

// Helper function to create hashtags
function createHashtagTransactions(
  entityId: string,
  entityType: 'user' | 'group' | 'amendment' | 'event' | 'blog',
  tags: string[]
): any[] {
  const transactions = [];

  for (const tag of tags) {
    const hashtagId = id();

    // Use the forward label from the schema (not the relationship name)
    transactions.push(
      tx.hashtags[hashtagId]
        .update({
          tag: tag.toLowerCase().replace(/\s+/g, ''),
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ [entityType]: entityId })
    );
  }

  return transactions;
}

// Helper function to create a document for an amendment
function createAmendmentDocument(
  amendmentId: string,
  amendmentTitle: string,
  ownerId: string
): any[] {
  const transactions = [];
  const documentId = id();

  // Create document content based on amendment
  const documentContent = [
    { type: 'h1', children: [{ text: amendmentTitle }] },
    { type: 'h2', children: [{ text: 'Summary' }] },
    {
      type: 'p',
      children: [
        {
          text: 'This is the full text of the amendment. Edit this document to modify the amendment text.',
        },
      ],
    },
    { type: 'h2', children: [{ text: 'Proposed Changes' }] },
    { type: 'p', children: [{ text: faker.lorem.paragraphs(2) }] },
    { type: 'h2', children: [{ text: 'Rationale' }] },
    { type: 'p', children: [{ text: faker.lorem.paragraphs(1) }] },
  ];

  // Create the document
  transactions.push(
    tx.documents[documentId]
      .update({
        title: amendmentTitle,
        content: documentContent,
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: faker.date.recent({ days: 7 }),
        isPublic: true, // Amendment documents are typically public
        tags: ['amendment', 'proposal', 'policy'],
      })
      .link({ owner: ownerId })
  );

  // Link the document to the amendment
  transactions.push(tx.amendments[amendmentId].link({ document: documentId }));

  return transactions;
}

// Predefined hashtag pools
const USER_HASHTAGS = [
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

const GROUP_HASHTAGS = [
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

const AMENDMENT_HASHTAGS = [
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

const EVENT_HASHTAGS = [
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

const BLOG_HASHTAGS = [
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

// Seed data generators
async function seedUsers() {
  console.log('Seeding users...');
  const userIds: string[] = [];
  const blogIds: string[] = [];
  const amendmentIds: string[] = [];
  const transactions = [];

  // First, ensure the main test user exists and update it
  const mainUserId = SEED_CONFIG.mainTestUserId;
  userIds.push(mainUserId);

  // Create or update main user in $users table
  transactions.push(
    tx.$users[mainUserId].update({
      email: 'test@polity.app',
      imageURL: faker.image.avatar(),
      type: 'user',
      name: 'Test User',
      subtitle: 'Main Test Account',
      avatar: faker.image.avatar(),
      bio: 'This is the main test user account for development.',
      handle: 'testuser',
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: new Date(),
      lastSeenAt: new Date(),
      about: 'Main test user for Polity development.',
      contactEmail: 'test@polity.app',
      contactTwitter: '@testuser',
      contactWebsite: 'https://polity.app',
      contactLocation: 'Test City',
      visibility: 'public',
    })
  );

  // Add some stats for main user
  for (let j = 0; j < 5; j++) {
    const statId = id();
    transactions.push(
      tx.stats[statId]
        .update({
          label: ['Posts', 'Subscribers', 'Following', 'Groups', 'Events'][j],
          value: randomInt(10, 100),
          unit: 'count',
        })
        .link({ user: mainUserId })
    );
  }

  // Add a statement for main user
  const statementId = id();
  transactions.push(
    tx.statements[statementId]
      .update({
        text: 'Passionate about building better communities through technology.',
        tag: 'politics',
        visibility: 'public',
      })
      .link({ user: mainUserId })
  );

  // Add hashtags for main user
  const mainUserHashtags = randomItems(USER_HASHTAGS, 2);
  transactions.push(...createHashtagTransactions(mainUserId, 'user', mainUserHashtags));

  // Add some links for main user's groups (will be created later)
  // This will be done after groups are created

  // Add a blog post for main user (no group link for user's personal blog)
  const blogId = id();
  blogIds.push(blogId);
  transactions.push(
    tx.blogs[blogId]
      .update({
        title: 'Welcome to Polity Test Environment',
        date: new Date().toISOString(),
        likeCount: randomInt(10, 50),
        commentCount: randomInt(5, 20),
        visibility: 'public',
      })
      .link({ user: mainUserId })
  );

  // Add hashtags to main user's blog (minimum 1, maximum 2)
  const mainBlogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 2));
  transactions.push(...createHashtagTransactions(blogId, 'blog', mainBlogHashtags));

  // Create Tobias's user account
  const tobiasUserId = SEED_CONFIG.tobiasUserId;
  userIds.push(tobiasUserId);

  // Create Tobias in $users table
  transactions.push(
    tx.$users[tobiasUserId].update({
      email: 'tobias.hassebrock@gmail.com',
      imageURL: faker.image.avatar(),
      type: 'user',
      name: 'Tobias Hassebrock',
      subtitle: 'Developer & Community Member',
      avatar: faker.image.avatar(),
      bio: 'Passionate about building better digital communities.',
      handle: 'tobias',
      createdAt: faker.date.past({ years: 2 }),
      updatedAt: new Date(),
      lastSeenAt: new Date(),
      about: 'Developer and community enthusiast working on Polity.',
      contactEmail: 'tobias.hassebrock@gmail.com',
      contactTwitter: '@tobias',
      contactWebsite: 'https://polity.app',
      contactLocation: 'Germany',
      visibility: 'public',
    })
  );

  // Add some stats for Tobias
  for (let j = 0; j < 5; j++) {
    const statId = id();
    transactions.push(
      tx.stats[statId]
        .update({
          label: ['Posts', 'Subscribers', 'Following', 'Groups', 'Events'][j],
          value: randomInt(10, 100),
          unit: 'count',
        })
        .link({ user: tobiasUserId })
    );
  }

  // Add a statement for Tobias
  const tobiasStatementId = id();
  transactions.push(
    tx.statements[tobiasStatementId]
      .update({
        text: 'Building the future of community engagement platforms.',
        tag: 'technology',
        visibility: 'public',
      })
      .link({ user: tobiasUserId })
  );

  // Add hashtags for Tobias
  const tobiasHashtags = randomItems(USER_HASHTAGS, 2);
  transactions.push(...createHashtagTransactions(tobiasUserId, 'user', tobiasHashtags));

  // Add a blog post for Tobias (no group link for user's personal blog)
  const tobiasBlogId = id();
  blogIds.push(tobiasBlogId);
  transactions.push(
    tx.blogs[tobiasBlogId]
      .update({
        title: 'The Future of Digital Communities',
        date: new Date().toISOString(),
        likeCount: randomInt(20, 80),
        commentCount: randomInt(10, 30),
        visibility: 'public',
      })
      .link({ user: tobiasUserId })
  );

  // Add hashtags to Tobias's blog (minimum 1, maximum 2)
  const tobiasBlogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 2));
  transactions.push(...createHashtagTransactions(tobiasBlogId, 'blog', tobiasBlogHashtags));

  // Add additional statements for Tobias with different visibility values
  const tobiasStatement2Id = id();
  transactions.push(
    tx.statements[tobiasStatement2Id]
      .update({
        text: 'Privacy is fundamental to digital freedom.',
        tag: 'privacy',
        visibility: 'authenticated',
      })
      .link({ user: tobiasUserId })
  );

  const tobiasStatement3Id = id();
  transactions.push(
    tx.statements[tobiasStatement3Id]
      .update({
        text: 'Personal thoughts on upcoming platform features.',
        tag: 'technology',
        visibility: 'private',
      })
      .link({ user: tobiasUserId })
  );

  // Add additional blogs for Tobias with different visibility values
  const tobiasBlog2Id = id();
  blogIds.push(tobiasBlog2Id);
  transactions.push(
    tx.blogs[tobiasBlog2Id]
      .update({
        title: 'Understanding Open Source Governance',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        likeCount: randomInt(15, 50),
        commentCount: randomInt(5, 20),
        visibility: 'authenticated',
      })
      .link({ user: tobiasUserId })
  );
  const tobiasBlog2Hashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 2));
  transactions.push(...createHashtagTransactions(tobiasBlog2Id, 'blog', tobiasBlog2Hashtags));

  const tobiasBlog3Id = id();
  blogIds.push(tobiasBlog3Id);
  transactions.push(
    tx.blogs[tobiasBlog3Id]
      .update({
        title: 'Draft: Platform Architecture Redesign',
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        likeCount: randomInt(0, 5),
        commentCount: 0,
        visibility: 'private',
      })
      .link({ user: tobiasUserId })
  );
  const tobiasBlog3Hashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 2));
  transactions.push(...createHashtagTransactions(tobiasBlog3Id, 'blog', tobiasBlog3Hashtags));

  // Add todos for Tobias with different visibility values
  const tobiasTodo1Id = id();
  transactions.push(
    tx.todos[tobiasTodo1Id]
      .update({
        title: 'Review community feedback',
        description: 'Go through latest community suggestions and feedback',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
        completedAt: null,
        tags: ['community', 'feedback'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ creator: tobiasUserId })
  );

  const tobiasTodo2Id = id();
  transactions.push(
    tx.todos[tobiasTodo2Id]
      .update({
        title: 'Team meeting preparation',
        description: 'Prepare agenda and materials for team sync',
        status: 'todo',
        priority: 'medium',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        tags: ['meeting', 'team'],
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        visibility: 'authenticated',
      })
      .link({ creator: tobiasUserId })
  );

  const tobiasTodo3Id = id();
  transactions.push(
    tx.todos[tobiasTodo3Id]
      .update({
        title: 'Personal project ideas',
        description: 'Brainstorm new features and experiments',
        status: 'todo',
        priority: 'low',
        dueDate: null,
        completedAt: null,
        tags: ['ideas', 'personal'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        visibility: 'private',
      })
      .link({ creator: tobiasUserId })
  );

  // Add events for Tobias with different visibility values
  const tobiasEvent1Id = id();
  const event1Start = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const event1End = new Date(event1Start.getTime() + 2 * 60 * 60 * 1000);
  transactions.push(
    tx.events[tobiasEvent1Id]
      .update({
        title: 'Public Tech Meetup',
        description: 'Monthly community tech meetup - all welcome!',
        location: 'Community Center, Main Street',
        startDate: event1Start,
        endDate: event1End,
        isPublic: true,
        capacity: 100,
        imageURL: faker.image.url(),
        tags: ['meetup', 'community', 'technology'],
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ organizer: tobiasUserId })
  );

  const tobiasEvent2Id = id();
  const event2Start = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
  const event2End = new Date(event2Start.getTime() + 3 * 60 * 60 * 1000);
  transactions.push(
    tx.events[tobiasEvent2Id]
      .update({
        title: 'Members Workshop',
        description: 'Workshop for registered members on platform features',
        location: 'Online via Zoom',
        startDate: event2Start,
        endDate: event2End,
        isPublic: false,
        capacity: 50,
        imageURL: faker.image.url(),
        tags: ['workshop', 'members', 'training'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        visibility: 'authenticated',
      })
      .link({ organizer: tobiasUserId })
  );

  const tobiasEvent3Id = id();
  const event3Start = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000);
  const event3End = new Date(event3Start.getTime() + 1 * 60 * 60 * 1000);
  transactions.push(
    tx.events[tobiasEvent3Id]
      .update({
        title: 'Private Planning Session',
        description: 'Internal planning for Q2 strategy',
        location: 'Office Conference Room',
        startDate: event3Start,
        endDate: event3End,
        isPublic: false,
        capacity: 10,
        imageURL: faker.image.url(),
        tags: ['planning', 'internal', 'strategy'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        visibility: 'private',
      })
      .link({ organizer: tobiasUserId })
  );

  // Add amendments for Tobias with different visibility values
  const tobiasAmendment1Id = id();
  amendmentIds.push(tobiasAmendment1Id);
  transactions.push(
    tx.amendments[tobiasAmendment1Id].update({
      title: 'Community Guidelines Update',
      subtitle: 'Proposed changes to community standards',
      status: 'Under Review',
      supporters: randomInt(50, 150),
      date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
      tags: ['policy', 'community'],
      visibility: 'public',
    })
  );
  const tobiasAmend1Hashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
  transactions.push(
    ...createHashtagTransactions(tobiasAmendment1Id, 'amendment', tobiasAmend1Hashtags)
  );
  transactions.push(
    ...createAmendmentDocument(tobiasAmendment1Id, 'Community Guidelines Update', tobiasUserId)
  );

  const tobiasAmendment2Id = id();
  amendmentIds.push(tobiasAmendment2Id);
  transactions.push(
    tx.amendments[tobiasAmendment2Id].update({
      title: 'Member Voting Process Reform',
      subtitle: 'Improving voting mechanisms for members',
      status: 'Drafting',
      supporters: randomInt(20, 60),
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
      tags: ['reform', 'voting'],
      visibility: 'authenticated',
    })
  );
  const tobiasAmend2Hashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
  transactions.push(
    ...createHashtagTransactions(tobiasAmendment2Id, 'amendment', tobiasAmend2Hashtags)
  );
  transactions.push(
    ...createAmendmentDocument(tobiasAmendment2Id, 'Member Voting Process Reform', tobiasUserId)
  );

  const tobiasAmendment3Id = id();
  amendmentIds.push(tobiasAmendment3Id);
  transactions.push(
    tx.amendments[tobiasAmendment3Id].update({
      title: 'Internal Policy Draft',
      subtitle: 'Draft policy for internal review only',
      status: 'Drafting',
      supporters: randomInt(5, 15),
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
      tags: ['policy', 'draft'],
      visibility: 'private',
    })
  );
  const tobiasAmend3Hashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
  transactions.push(
    ...createHashtagTransactions(tobiasAmendment3Id, 'amendment', tobiasAmend3Hashtags)
  );
  transactions.push(
    ...createAmendmentDocument(tobiasAmendment3Id, 'Internal Policy Draft', tobiasUserId)
  );

  // ========== FLUSH MAIN AND TOBIAS USER TRANSACTIONS ==========
  // Flush all transactions from mainTestUser and tobiasUser before creating E2E test entities
  console.log(
    `  Flushing ${transactions.length} pending transactions (mainTestUser + tobiasUser)...`
  );
  await batchTransact(transactions);
  transactions.length = 0; // Clear the array

  // ========== CREATE DETERMINISTIC E2E TEST ENTITIES IN BATCHES ==========
  console.log('  Creating deterministic E2E test entities...');

  // Test User 1
  const testUser1Id = TEST_ENTITY_IDS.testUser1;
  userIds.push(testUser1Id);

  console.log(`  Creating testUser1 (${testUser1Id})...`);
  // Create user first
  try {
    await db.transact([
      tx.$users[testUser1Id].update({
        email: 'e2etest1@polity.app',
        imageURL: faker.image.avatar(),
        type: 'user',
        name: 'E2E Test User 1',
        subtitle: 'First E2E Test User',
        avatar: faker.image.avatar(),
        bio: 'This user is used for E2E subscription tests.',
        handle: 'e2etest1',
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
        lastSeenAt: new Date(),
        about: 'E2E test user #1 for subscription testing.',
        contactEmail: 'e2etest1@polity.app',
        visibility: 'public',
      }),
    ]);
    console.log(`  ✓ testUser1 user record created`);
  } catch (error: any) {
    console.error(`  ✗ Failed to create testUser1:`, error.message);
    if (error.hint) {
      console.error(`  Hint:`, JSON.stringify(error.hint, null, 2));
    }
    throw error;
  }

  // Then create stats that link to the user
  const testUser1StatsTxs = [];
  for (let j = 0; j < 3; j++) {
    testUser1StatsTxs.push(
      tx.stats[id()]
        .update({
          label: ['Posts', 'Contributions', 'Supporters'][j],
          value: randomInt(10, 100),
        })
        .link({ user: testUser1Id })
    );
  }
  await db.transact(testUser1StatsTxs);

  // Test User 2
  const testUser2Id = TEST_ENTITY_IDS.testUser2;
  userIds.push(testUser2Id);

  await db.transact([
    tx.$users[testUser2Id].update({
      email: 'e2etest2@polity.app',
      imageURL: faker.image.avatar(),
      type: 'user',
      name: 'E2E Test User 2',
      subtitle: 'Second E2E Test User',
      avatar: faker.image.avatar(),
      bio: 'Another user for E2E subscription tests.',
      handle: 'e2etest2',
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
      lastSeenAt: new Date(),
      about: 'E2E test user #2 for subscription testing.',
      contactEmail: 'e2etest2@polity.app',
      visibility: 'public',
    }),
  ]);

  const testUser2StatsTxs = [];
  for (let j = 0; j < 3; j++) {
    testUser2StatsTxs.push(
      tx.stats[id()]
        .update({
          label: ['Posts', 'Contributions', 'Supporters'][j],
          value: randomInt(5, 50),
        })
        .link({ user: testUser2Id })
    );
  }
  await db.transact(testUser2StatsTxs);

  // Test User 3
  const testUser3Id = TEST_ENTITY_IDS.testUser3;
  userIds.push(testUser3Id);

  await db.transact([
    tx.$users[testUser3Id].update({
      email: 'e2etest3@polity.app',
      imageURL: faker.image.avatar(),
      type: 'user',
      name: 'E2E Test User 3',
      subtitle: 'Third E2E Test User',
      avatar: faker.image.avatar(),
      bio: 'Third user for E2E subscription tests.',
      handle: 'e2etest3',
      createdAt: faker.date.past({ years: 1 }),
      updatedAt: new Date(),
      lastSeenAt: new Date(),
      about: 'E2E test user #3 for subscription testing.',
      contactEmail: 'e2etest3@polity.app',
      visibility: 'public',
    }),
  ]);

  const testUser3StatsTxs = [];
  for (let j = 0; j < 3; j++) {
    testUser3StatsTxs.push(
      tx.stats[id()]
        .update({
          label: ['Posts', 'Contributions', 'Supporters'][j],
          value: randomInt(15, 75),
        })
        .link({ user: testUser3Id })
    );
  }
  await db.transact(testUser3StatsTxs);

  // Test Blogs
  const testBlog1Id = TEST_ENTITY_IDS.testBlog1;
  blogIds.push(testBlog1Id);
  const testBlog1Txs = [];
  testBlog1Txs.push(
    tx.blogs[testBlog1Id]
      .update({
        title: 'E2E Test Blog Post 1',
        date: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0,
        visibility: 'public',
      })
      .link({ user: testUser1Id })
  );
  testBlog1Txs.push(...createHashtagTransactions(testBlog1Id, 'blog', ['test', 'e2e']));
  await db.transact(testBlog1Txs);

  const testBlog2Id = TEST_ENTITY_IDS.testBlog2;
  blogIds.push(testBlog2Id);
  const testBlog2Txs = [];
  testBlog2Txs.push(
    tx.blogs[testBlog2Id]
      .update({
        title: 'E2E Test Blog Post 2',
        date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        likeCount: 5,
        commentCount: 2,
        visibility: 'public',
      })
      .link({ user: testUser2Id })
  );
  testBlog2Txs.push(...createHashtagTransactions(testBlog2Id, 'blog', ['testing', 'qa']));
  await db.transact(testBlog2Txs);

  const testBlog3Id = TEST_ENTITY_IDS.testBlog3;
  blogIds.push(testBlog3Id);
  const testBlog3Txs = [];
  testBlog3Txs.push(
    tx.blogs[testBlog3Id]
      .update({
        title: 'E2E Test Blog Post 3',
        date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        likeCount: 10,
        commentCount: 5,
        visibility: 'public',
      })
      .link({ user: testUser3Id })
  );
  testBlog3Txs.push(...createHashtagTransactions(testBlog3Id, 'blog', ['e2e', 'testing']));
  await db.transact(testBlog3Txs);

  // Test Amendments
  const testAmendment1Id = TEST_ENTITY_IDS.testAmendment1;
  amendmentIds.push(testAmendment1Id);
  const testAmend1Txs = [];
  testAmend1Txs.push(
    tx.amendments[testAmendment1Id].update({
      title: 'E2E Test Amendment 1',
      subtitle: 'First amendment for E2E subscription testing',
      status: 'Under Review',
      supporters: 0,
      date: new Date().toISOString(),
      code: 'E2E-TEST-001',
      tags: ['test', 'e2e'],
      visibility: 'public',
    })
  );
  testAmend1Txs.push(...createHashtagTransactions(testAmendment1Id, 'amendment', ['test', 'e2e']));
  testAmend1Txs.push(
    ...createAmendmentDocument(testAmendment1Id, 'E2E Test Amendment 1', testUser1Id)
  );
  await db.transact(testAmend1Txs);

  const testAmendment2Id = TEST_ENTITY_IDS.testAmendment2;
  amendmentIds.push(testAmendment2Id);
  const testAmend2Txs = [];
  testAmend2Txs.push(
    tx.amendments[testAmendment2Id].update({
      title: 'E2E Test Amendment 2',
      subtitle: 'Second amendment for E2E subscription testing',
      status: 'Drafting',
      supporters: 3,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      code: 'E2E-TEST-002',
      tags: ['test', 'e2e'],
      visibility: 'public',
    })
  );
  testAmend2Txs.push(
    ...createHashtagTransactions(testAmendment2Id, 'amendment', ['testing', 'qa'])
  );
  testAmend2Txs.push(
    ...createAmendmentDocument(testAmendment2Id, 'E2E Test Amendment 2', testUser2Id)
  );
  await db.transact(testAmend2Txs);

  const testAmendment3Id = TEST_ENTITY_IDS.testAmendment3;
  amendmentIds.push(testAmendment3Id);
  const testAmend3Txs = [];
  testAmend3Txs.push(
    tx.amendments[testAmendment3Id].update({
      title: 'E2E Test Amendment 3',
      subtitle: 'Third amendment for E2E subscription testing',
      status: 'Approved',
      supporters: 15,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      code: 'E2E-TEST-003',
      tags: ['test', 'e2e'],
      visibility: 'public',
    })
  );
  testAmend3Txs.push(
    ...createHashtagTransactions(testAmendment3Id, 'amendment', ['e2e', 'testing'])
  );
  testAmend3Txs.push(
    ...createAmendmentDocument(testAmendment3Id, 'E2E Test Amendment 3', testUser3Id)
  );
  await db.transact(testAmend3Txs);

  for (let i = 0; i < SEED_CONFIG.users; i++) {
    const userId = id();
    const email = faker.internet.username().toLowerCase();
    const handle = faker.internet.username().toLowerCase();
    const name = faker.person.fullName();

    userIds.push(userId);

    const createdAt = faker.date.past({ years: 2 });
    transactions.push(
      tx.$users[userId].update({
        email,
        imageURL: faker.image.avatar(),
        type: 'user',
        name,
        subtitle: faker.person.jobTitle(),
        avatar: faker.image.avatar(),
        bio: faker.lorem.paragraph(),
        handle,
        createdAt,
        updatedAt: new Date(),
        lastSeenAt: faker.date.recent({ days: 7 }),
        about: faker.lorem.paragraphs(2),
        contactEmail: email,
        contactTwitter: `@${faker.internet.username()}`,
        contactWebsite: faker.internet.url(),
        contactLocation: faker.location.city(),
        whatsapp: faker.phone.number(),
        instagram: `@${faker.internet.username()}`,
        twitter: `@${faker.internet.username()}`,
        facebook: faker.internet.username(),
        snapchat: faker.internet.username(),
        visibility: randomVisibility(),
      })
    );

    // Add some stats
    const statCount = randomInt(2, 5);
    for (let j = 0; j < statCount; j++) {
      const statId = id();
      transactions.push(
        tx.stats[statId]
          .update({
            label: randomItem(['Posts', 'Subscribers', 'Following', 'Groups', 'Events']),
            value: randomInt(10, 1000),
            unit: randomItem(['count', 'points', 'score']),
          })
          .link({ user: userId })
      );
    }

    // Add some statements
    const statementCount = randomInt(1, 3);
    for (let j = 0; j < statementCount; j++) {
      const statementId = id();
      transactions.push(
        tx.statements[statementId]
          .update({
            text: faker.lorem.sentence(),
            tag: randomItem(['politics', 'environment', 'education', 'healthcare', 'economy']),
            visibility: randomVisibility(),
          })
          .link({ user: userId })
      );
    }

    // Add some blogs
    const blogCount = randomInt(1, 4);
    for (let j = 0; j < blogCount; j++) {
      const blogId = id();
      blogIds.push(blogId);
      transactions.push(
        tx.blogs[blogId]
          .update({
            title: faker.lorem.sentence(),
            date: faker.date.past({ years: 1 }).toISOString(),
            likeCount: randomInt(0, 500),
            commentCount: randomInt(0, 100),
            visibility: randomVisibility(),
          })
          .link({ user: userId })
      );

      // Add hashtags to blog (minimum 1, maximum 4)
      const blogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 4));
      transactions.push(...createHashtagTransactions(blogId, 'blog', blogHashtags));
    }

    // Add hashtags for this user
    const userHashtags = randomItems(USER_HASHTAGS, randomInt(2, 5));
    transactions.push(...createHashtagTransactions(userId, 'user', userHashtags));

    // Add some amendments
    const amendmentCount = randomInt(0, 2);
    for (let j = 0; j < amendmentCount; j++) {
      const amendmentId = id();
      amendmentIds.push(amendmentId);
      const amendmentTitle = faker.lorem.sentence();
      transactions.push(
        tx.amendments[amendmentId].update({
          title: amendmentTitle,
          subtitle: faker.lorem.sentence(),
          status: randomItem(['Passed', 'Rejected', 'Under Review', 'Drafting']),
          supporters: randomInt(10, 1000),
          date: faker.date.past({ years: 1 }).toISOString(),
          code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
          tags: [randomItem(['policy', 'reform', 'legislation', 'amendment', 'proposal'])],
          visibility: randomVisibility(),
        })
      );

      // Add hashtags to amendment
      const amendmentHashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(amendmentId, 'amendment', amendmentHashtags));

      // Create a document for this amendment
      transactions.push(...createAmendmentDocument(amendmentId, amendmentTitle, userId));
    }
  }

  // Execute in batches to avoid timeout
  console.log(`  Creating ${transactions.length} user-related records...`);
  await batchTransact(transactions);

  console.log(`✓ Created ${userIds.length} users (including main test user and Tobias)`);
  console.log(`✓ All user data stored in $users entity`);
  return { userIds, blogIds, amendmentIds };
}

async function seedGroupRelationships(groupIds: string[]) {
  console.log('Seeding group relationships...');
  const transactions = [];
  let totalRelationships = 0;
  let amendmentRightChains = 0;

  const rights = [
    'informationRight',
    'amendmentRight',
    'rightToSpeak',
    'activeVotingRight',
    'passiveVotingRight',
  ];

  // Track amendmentRight connections per group (both parent and child)
  const amendmentConnections = new Map<string, number>();
  groupIds.forEach(gid => amendmentConnections.set(gid, 0));

  // Helper to add an amendmentRight relationship
  const addAmendmentRelationship = (parentId: string, childId: string) => {
    const relationshipId = id();
    transactions.push(
      tx.groupRelationships[relationshipId]
        .update({
          relationshipType: 'isParent',
          withRight: 'amendmentRight',
          createdAt: faker.date.past({ years: 0.5 }),
          updatedAt: new Date(),
        })
        .link({ parentGroup: parentId, childGroup: childId })
    );
    totalRelationships++;
    amendmentRightChains++;
    amendmentConnections.set(parentId, (amendmentConnections.get(parentId) || 0) + 1);
    amendmentConnections.set(childId, (amendmentConnections.get(childId) || 0) + 1);
  };

  // Create some relationships between groups
  // Make sure we have at least 3 groups to create relationships
  if (groupIds.length >= 3) {
    // Phase 1: Create core amendmentRight chains
    for (let i = 0; i < Math.min(groupIds.length - 1, 7); i++) {
      addAmendmentRelationship(groupIds[i], groupIds[i + 1]);

      // Also add some additional rights
      const additionalRights = randomItems(
        rights.filter(r => r !== 'amendmentRight'),
        randomInt(0, 2)
      );
      for (const right of additionalRights) {
        const relationshipId = id();
        transactions.push(
          tx.groupRelationships[relationshipId]
            .update({
              relationshipType: 'isParent',
              withRight: right,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ parentGroup: groupIds[i], childGroup: groupIds[i + 1] })
        );
        totalRelationships++;
      }
    }

    // Phase 2: Create cross-connections to ensure EVERY group has at least 2 amendmentRight connections
    if (groupIds.length >= 8) {
      // Group 0 -> Group 3
      addAmendmentRelationship(groupIds[0], groupIds[3]);
      // Group 0 -> Group 4
      addAmendmentRelationship(groupIds[0], groupIds[4]);
      // Group 1 -> Group 5
      addAmendmentRelationship(groupIds[1], groupIds[5]);
      // Group 2 -> Group 6
      addAmendmentRelationship(groupIds[2], groupIds[6]);
      // Group 3 -> Group 5
      addAmendmentRelationship(groupIds[3], groupIds[5]);
      // Group 3 -> Group 6
      addAmendmentRelationship(groupIds[3], groupIds[6]);
      // Group 4 -> Group 7
      addAmendmentRelationship(groupIds[4], groupIds[7]);
      // Group 3 -> Group 7
      addAmendmentRelationship(groupIds[3], groupIds[7]);
      // Group 2 -> Group 3
      addAmendmentRelationship(groupIds[2], groupIds[3]);

      // Ensure every group has at least 2 amendmentRight connections
      groupIds.forEach((groupId, idx) => {
        const currentConnections = amendmentConnections.get(groupId) || 0;
        if (currentConnections < 2) {
          const needed = 2 - currentConnections;
          for (let i = 0; i < needed; i++) {
            const potentialPartners = groupIds.filter(
              (otherId, otherIdx) =>
                otherId !== groupId && Math.abs(idx - otherIdx) > 0 && Math.abs(idx - otherIdx) <= 3
            );

            if (potentialPartners.length > 0) {
              const partner = randomItem(potentialPartners);
              const partnerIdx = groupIds.indexOf(partner);

              if (idx < partnerIdx) {
                addAmendmentRelationship(groupId, partner);
              } else {
                addAmendmentRelationship(partner, groupId);
              }
            }
          }
        }
      });

      // Add some non-amendmentRight relationships for variety
      const relationshipId3 = id();
      transactions.push(
        tx.groupRelationships[relationshipId3]
          .update({
            relationshipType: 'isParent',
            withRight: 'informationRight',
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[0], childGroup: groupIds[3] })
      );
      totalRelationships++;

      const relationshipId4 = id();
      transactions.push(
        tx.groupRelationships[relationshipId4]
          .update({
            relationshipType: 'isParent',
            withRight: 'rightToSpeak',
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[0], childGroup: groupIds[4] })
      );
      totalRelationships++;

      const multipleRights = randomItems(
        rights.filter(r => r !== 'amendmentRight'),
        randomInt(1, 2)
      );
      for (const right of multipleRights) {
        const relationshipId = id();
        transactions.push(
          tx.groupRelationships[relationshipId]
            .update({
              relationshipType: 'isParent',
              withRight: right,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ parentGroup: groupIds[2], childGroup: groupIds[6] })
        );
        totalRelationships++;
      }
    } else if (groupIds.length >= 5) {
      // For smaller group counts
      addAmendmentRelationship(groupIds[3], groupIds[4]);
      addAmendmentRelationship(groupIds[0], groupIds[3]);
      addAmendmentRelationship(groupIds[1], groupIds[4]);
    }
  }

  if (transactions.length > 0) {
    await batchTransact(transactions);
  }

  let minConnections = Infinity;
  let maxConnections = 0;
  amendmentConnections.forEach(count => {
    minConnections = Math.min(minConnections, count);
    maxConnections = Math.max(maxConnections, count);
  });

  console.log(`✓ Created ${totalRelationships} group relationships with complex network structure`);
  console.log(`✓ Created ${amendmentRightChains} amendmentRight relationships for filtering`);
  console.log(
    `✓ AmendmentRight connections per group: min=${minConnections}, max=${maxConnections}`
  );
  if (groupIds.length >= 8) {
    console.log(`  - Multi-level hierarchies (up to 3+ levels deep)`);
    console.log(`  - Multiple parent-child branches creating indirect relationships`);
    console.log(`  - Some groups reachable via multiple paths`);
    console.log(`  - EVERY group has at least TWO deep amendmentRight connections`);
    console.log(`  - Group 0: Hub with multiple children (amendmentRight chains)`);
    console.log(
      `  - Group 3: Central node with both upward AND downward amendmentRight connections`
    );
    console.log(`  - Groups 5, 6, 7: Multiple parents creating redundant paths`);
  }
}

async function seedGroups(userIds: string[]) {
  console.log('Seeding groups...');
  const groupIds: string[] = [];
  const blogIds: string[] = [];
  const amendmentIds: string[] = [];
  const transactions = [];
  const groupRoleMap: Record<string, { boardMemberId: string; memberId: string }> = {};

  const mainUserId = SEED_CONFIG.mainTestUserId;

  // Create 2 groups owned by main test user
  for (let i = 0; i < 2; i++) {
    const groupId = id();
    const name = i === 0 ? 'Test Main Group' : faker.company.name();

    groupIds.push(groupId);

    // Create group
    transactions.push(
      tx.groups[groupId]
        .update({
          name,
          description: i === 0 ? 'Main test group for development' : faker.lorem.paragraph(),
          isPublic: true,
          memberCount: 0,
          location: faker.location.city(),
          region: faker.location.state(),
          country: faker.location.country(),
          imageURL: faker.image.url(),
          whatsapp: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }) || '',
          instagram:
            faker.helpers.maybe(() => `@${faker.internet.userName()}`, { probability: 0.7 }) || '',
          twitter:
            faker.helpers.maybe(() => `@${faker.internet.userName()}`, { probability: 0.7 }) || '',
          facebook: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }) || '',
          snapchat:
            faker.helpers.maybe(() => faker.internet.userName(), { probability: 0.3 }) || '',
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
          visibility: 'public',
        })
        .link({ owner: mainUserId })
    );

    // Create roles for this group
    const boardMemberRoleId = id();
    const memberRoleId = id();
    groupRoleMap[groupId] = { boardMemberId: boardMemberRoleId, memberId: memberRoleId };

    transactions.push(
      tx.roles[boardMemberRoleId]
        .update({
          name: 'Board Member',
          description: 'Board member with administrative access',
          scope: 'group',
        })
        .link({ group: groupId }),
      tx.roles[memberRoleId]
        .update({
          name: 'Member',
          description: 'Regular group member',
          scope: 'group',
        })
        .link({ group: groupId })
    );

    // Add conversation rights to both roles
    const conversationRights = [
      { resource: 'messages', action: 'create' },
      { resource: 'messages', action: 'read' },
      { resource: 'messages', action: 'update' },
      { resource: 'messages', action: 'delete' },
    ];

    for (const right of conversationRights) {
      const boardRightId = id();
      const memberRightId = id();

      transactions.push(
        tx.actionRights[boardRightId]
          .update({
            resource: right.resource,
            action: right.action,
          })
          .link({ roles: boardMemberRoleId, groupId: groupId }),
        tx.actionRights[memberRightId]
          .update({
            resource: right.resource,
            action: right.action,
          })
          .link({ roles: memberRoleId, groupId: groupId })
      );
    }

    // Add manageNotifications right to board member role
    const manageNotificationsRightId = id();
    transactions.push(
      tx.actionRights[manageNotificationsRightId]
        .update({
          resource: 'notifications',
          action: 'manageNotifications',
        })
        .link({ roles: boardMemberRoleId, groupId: groupId })
    );

    // Add main user as owner member
    const ownerMembershipId = id();
    transactions.push(
      tx.groupMemberships[ownerMembershipId]
        .update({
          status: 'member',
          createdAt: faker.date.past({ years: 1 }),
          visibility: 'public',
        })
        .link({ user: mainUserId, group: groupId, role: boardMemberRoleId })
    );

    // Add some members to main user's groups
    const memberCount = randomInt(5, 8);
    const members = randomItems(
      userIds.filter(uid => uid !== mainUserId),
      memberCount
    );

    for (const memberId of members) {
      const membershipId = id();
      const status = randomItem(['member', 'member', 'member', 'requested', 'invited']);
      const roleId = randomItem([memberRoleId, memberRoleId, boardMemberRoleId]); // Mostly members, occasionally board member
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            status: status,
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ user: memberId, group: groupId, role: roleId })
      );
    }

    // Update member count
    transactions.push(
      tx.groups[groupId].update({
        memberCount: members.length + 1,
      })
    );

    // Create group conversation with all members as participants
    const conversationId = id();
    const groupCreatedAt = faker.date.past({ years: 1 });
    console.log(`  Creating conversation ${conversationId} for group ${groupId} (${name})`);
    transactions.push(
      tx.conversations[conversationId]
        .update({
          type: 'group',
          name: name,
          status: 'accepted',
          createdAt: groupCreatedAt,
          lastMessageAt: groupCreatedAt,
        })
        .link({ group: groupId, requestedBy: mainUserId })
    );

    // Add owner as conversation participant
    const ownerParticipantId = id();
    transactions.push(
      tx.conversationParticipants[ownerParticipantId]
        .update({
          joinedAt: groupCreatedAt,
          lastReadAt: faker.date.recent({ days: 1 }),
        })
        .link({ conversation: conversationId, user: mainUserId })
    );

    // Add all group members as conversation participants
    for (const memberId of members) {
      const participantId = id();
      transactions.push(
        tx.conversationParticipants[participantId]
          .update({
            joinedAt: groupCreatedAt,
            lastReadAt: faker.date.recent({ days: 2 }),
          })
          .link({ conversation: conversationId, user: memberId })
      );
    }

    // Add messages from different group members
    const allParticipants = [mainUserId, ...members];
    const messageCount = randomInt(10, 20);
    for (let j = 0; j < messageCount; j++) {
      const messageId = id();
      const senderUserId = randomItem(allParticipants);
      const messageCreatedAt = faker.date.between({
        from: groupCreatedAt,
        to: new Date(),
      });

      transactions.push(
        tx.messages[messageId]
          .update({
            content: faker.lorem.sentences(randomInt(1, 3)),
            isRead: faker.datatype.boolean(0.8), // 80% read
            createdAt: messageCreatedAt,
            updatedAt: null,
            deletedAt: null,
          })
          .link({ conversation: conversationId, sender: senderUserId })
      );
    }

    // Add hashtags for this group
    const groupHashtags = randomItems(GROUP_HASHTAGS, randomInt(3, 5));
    transactions.push(...createHashtagTransactions(groupId, 'group', groupHashtags));

    // Add 1-3 blog posts for this group
    const groupBlogCount = randomInt(1, 3);
    for (let j = 0; j < groupBlogCount; j++) {
      const blogId = id();
      blogIds.push(blogId);
      transactions.push(
        tx.blogs[blogId]
          .update({
            title: faker.lorem.sentence(),
            date: faker.date.past({ years: 0.5 }).toISOString(),
            likeCount: randomInt(5, 100),
            commentCount: randomInt(0, 50),
            visibility: randomVisibility(),
          })
          .link({ user: mainUserId, group: groupId })
      );

      // Add hashtags to blog (minimum 1, maximum 4)
      const blogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 4));
      transactions.push(...createHashtagTransactions(blogId, 'blog', blogHashtags));
    }

    // Add 2-4 amendments for this group
    const amendmentCount = randomInt(2, 4);
    for (let j = 0; j < amendmentCount; j++) {
      const amendmentId = id();
      amendmentIds.push(amendmentId);
      const amendmentTitle = faker.lorem.sentence();
      transactions.push(
        tx.amendments[amendmentId]
          .update({
            title: amendmentTitle,
            subtitle: faker.lorem.sentence(),
            status: randomItem(['Passed', 'Rejected', 'Under Review', 'Drafting']),
            supporters: randomInt(10, 500),
            date: faker.date.past({ years: 1 }).toISOString(),
            code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
            tags: [randomItem(['policy', 'reform', 'legislation', 'amendment', 'proposal'])],
            visibility: randomVisibility(),
          })
          .link({ user: mainUserId, group: groupId })
      );

      // Add hashtags to amendment
      const amendmentHashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(amendmentId, 'amendment', amendmentHashtags));

      // Create a document for this amendment
      transactions.push(...createAmendmentDocument(amendmentId, amendmentTitle, mainUserId));
    }
  }

  // ========== CREATE DETERMINISTIC E2E TEST GROUPS ==========
  console.log('  Creating deterministic E2E test groups...');

  // Flush transactions before creating groups
  if (transactions.length > 0) {
    console.log(`  Flushing ${transactions.length} pending transactions...`);
    for (let i = 0; i < transactions.length; i += 50) {
      const batch = transactions.slice(i, i + 50);
      await db.transact(batch);
    }
    transactions.length = 0;
  }

  // Test Group 1
  const testGroup1Id = TEST_ENTITY_IDS.testGroup1;
  groupIds.push(testGroup1Id);
  const testGroup1Txs = [];
  testGroup1Txs.push(
    tx.groups[testGroup1Id]
      .update({
        name: 'E2E Test Group 1',
        description: 'First group for E2E subscription testing',
        isPublic: true,
        memberCount: 1,
        location: 'Test City',
        region: 'Test Region',
        country: 'Test Country',
        imageURL: faker.image.url(),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ owner: TEST_ENTITY_IDS.testUser1 })
  );
  const testGroup1BoardRoleId = id();
  const testGroup1MemberRoleId = id();
  groupRoleMap[testGroup1Id] = {
    boardMemberId: testGroup1BoardRoleId,
    memberId: testGroup1MemberRoleId,
  };
  testGroup1Txs.push(
    tx.roles[testGroup1BoardRoleId]
      .update({
        name: 'Board Member',
        description: 'Board member with administrative access',
        scope: 'group',
      })
      .link({ group: testGroup1Id }),
    tx.roles[testGroup1MemberRoleId]
      .update({
        name: 'Member',
        description: 'Regular group member',
        scope: 'group',
      })
      .link({ group: testGroup1Id })
  );
  testGroup1Txs.push(
    tx.groupMemberships[id()]
      .update({
        status: 'member',
        createdAt: new Date(),
        visibility: 'public',
      })
      .link({ user: TEST_ENTITY_IDS.testUser1, group: testGroup1Id, role: testGroup1BoardRoleId })
  );

  // Create conversation for test group 1
  const testGroup1ConvId = id();
  const testGroup1ConvParticipantId = id();
  console.log(`  Creating conversation ${testGroup1ConvId} for test group ${testGroup1Id}`);
  testGroup1Txs.push(
    tx.conversations[testGroup1ConvId]
      .update({
        type: 'group',
        name: 'E2E Test Group 1',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      })
      .link({ group: testGroup1Id, requestedBy: TEST_ENTITY_IDS.testUser1 }),
    tx.conversationParticipants[testGroup1ConvParticipantId]
      .update({
        joinedAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      })
      .link({ conversation: testGroup1ConvId, user: TEST_ENTITY_IDS.testUser1 })
  );

  testGroup1Txs.push(...createHashtagTransactions(testGroup1Id, 'group', ['test', 'e2e']));
  await db.transact(testGroup1Txs);

  // Test Group 2
  const testGroup2Id = TEST_ENTITY_IDS.testGroup2;
  groupIds.push(testGroup2Id);
  const testGroup2Txs = [];
  testGroup2Txs.push(
    tx.groups[testGroup2Id]
      .update({
        name: 'E2E Test Group 2',
        description: 'Second group for E2E subscription testing',
        isPublic: true,
        memberCount: 1,
        location: 'Test City 2',
        region: 'Test Region 2',
        country: 'Test Country',
        imageURL: faker.image.url(),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ owner: TEST_ENTITY_IDS.testUser2 })
  );
  const testGroup2BoardRoleId = id();
  const testGroup2MemberRoleId = id();
  groupRoleMap[testGroup2Id] = {
    boardMemberId: testGroup2BoardRoleId,
    memberId: testGroup2MemberRoleId,
  };
  testGroup2Txs.push(
    tx.roles[testGroup2BoardRoleId]
      .update({
        name: 'Board Member',
        description: 'Board member with administrative access',
        scope: 'group',
      })
      .link({ group: testGroup2Id }),
    tx.roles[testGroup2MemberRoleId]
      .update({
        name: 'Member',
        description: 'Regular group member',
        scope: 'group',
      })
      .link({ group: testGroup2Id })
  );
  testGroup2Txs.push(
    tx.groupMemberships[id()]
      .update({
        status: 'member',
        createdAt: new Date(),
        visibility: 'public',
      })
      .link({ user: TEST_ENTITY_IDS.testUser2, group: testGroup2Id, role: testGroup2BoardRoleId })
  );

  // Create conversation for test group 2
  const testGroup2ConvId = id();
  const testGroup2ConvParticipantId = id();
  console.log(`  Creating conversation ${testGroup2ConvId} for test group ${testGroup2Id}`);
  testGroup2Txs.push(
    tx.conversations[testGroup2ConvId]
      .update({
        type: 'group',
        name: 'E2E Test Group 2',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      })
      .link({ group: testGroup2Id, requestedBy: TEST_ENTITY_IDS.testUser2 }),
    tx.conversationParticipants[testGroup2ConvParticipantId]
      .update({
        joinedAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      })
      .link({ conversation: testGroup2ConvId, user: TEST_ENTITY_IDS.testUser2 })
  );

  testGroup2Txs.push(...createHashtagTransactions(testGroup2Id, 'group', ['testing', 'qa']));
  await db.transact(testGroup2Txs);

  // Test Group 3
  const testGroup3Id = TEST_ENTITY_IDS.testGroup3;
  groupIds.push(testGroup3Id);
  const testGroup3Txs = [];
  testGroup3Txs.push(
    tx.groups[testGroup3Id]
      .update({
        name: 'E2E Test Group 3',
        description: 'Third group for E2E subscription testing',
        isPublic: true,
        memberCount: 1,
        location: 'Test City 3',
        region: 'Test Region 3',
        country: 'Test Country',
        imageURL: faker.image.url(),
        createdAt: faker.date.past({ years: 1 }),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ owner: TEST_ENTITY_IDS.testUser3 })
  );
  const testGroup3BoardRoleId = id();
  const testGroup3MemberRoleId = id();
  groupRoleMap[testGroup3Id] = {
    boardMemberId: testGroup3BoardRoleId,
    memberId: testGroup3MemberRoleId,
  };
  testGroup3Txs.push(
    tx.roles[testGroup3BoardRoleId]
      .update({
        name: 'Board Member',
        description: 'Board member with administrative access',
        scope: 'group',
      })
      .link({ group: testGroup3Id }),
    tx.roles[testGroup3MemberRoleId]
      .update({
        name: 'Member',
        description: 'Regular group member',
        scope: 'group',
      })
      .link({ group: testGroup3Id })
  );
  testGroup3Txs.push(
    tx.groupMemberships[id()]
      .update({
        status: 'member',
        createdAt: new Date(),
        visibility: 'public',
      })
      .link({ user: TEST_ENTITY_IDS.testUser3, group: testGroup3Id, role: testGroup3MemberRoleId })
  );

  // Create conversation for test group 3
  const testGroup3ConvId = id();
  const testGroup3ConvParticipantId = id();
  console.log(`  Creating conversation ${testGroup3ConvId} for test group ${testGroup3Id}`);
  testGroup3Txs.push(
    tx.conversations[testGroup3ConvId]
      .update({
        type: 'group',
        name: 'E2E Test Group 3',
        status: 'accepted',
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      })
      .link({ group: testGroup3Id, requestedBy: TEST_ENTITY_IDS.testUser3 }),
    tx.conversationParticipants[testGroup3ConvParticipantId]
      .update({
        joinedAt: new Date().toISOString(),
        lastReadAt: new Date().toISOString(),
      })
      .link({ conversation: testGroup3ConvId, user: TEST_ENTITY_IDS.testUser3 })
  );

  testGroup3Txs.push(...createHashtagTransactions(testGroup3Id, 'group', ['e2e', 'testing']));
  await db.transact(testGroup3Txs);

  // Create remaining groups
  for (let i = 2; i < SEED_CONFIG.groups; i++) {
    const groupId = id();
    const ownerId = randomItem(userIds.filter(uid => uid !== mainUserId));
    const name = faker.company.name();

    groupIds.push(groupId);

    // Create group
    transactions.push(
      tx.groups[groupId]
        .update({
          name,
          description: faker.lorem.paragraph(),
          isPublic: faker.datatype.boolean(0.7),
          memberCount: 0,
          location: faker.location.city(),
          region: faker.location.state(),
          country: faker.location.country(),
          imageURL: faker.image.url(),
          whatsapp: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }) || '',
          instagram:
            faker.helpers.maybe(() => `@${faker.internet.userName()}`, { probability: 0.7 }) || '',
          twitter:
            faker.helpers.maybe(() => `@${faker.internet.userName()}`, { probability: 0.7 }) || '',
          facebook: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }) || '',
          snapchat:
            faker.helpers.maybe(() => faker.internet.userName(), { probability: 0.3 }) || '',
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
          visibility: randomVisibility(),
        })
        .link({ owner: ownerId })
    );

    // Create roles for this group
    const boardMemberRoleId = id();
    const memberRoleId = id();
    groupRoleMap[groupId] = { boardMemberId: boardMemberRoleId, memberId: memberRoleId };

    transactions.push(
      tx.roles[boardMemberRoleId]
        .update({
          name: 'Board Member',
          description: 'Board member with administrative access',
          scope: 'group',
        })
        .link({ group: groupId }),
      tx.roles[memberRoleId]
        .update({
          name: 'Member',
          description: 'Regular group member',
          scope: 'group',
        })
        .link({ group: groupId })
    );

    // Add group memberships
    const memberCount = randomInt(SEED_CONFIG.membersPerGroup.min, SEED_CONFIG.membersPerGroup.max);
    const members = randomItems(
      userIds.filter(uid => uid !== ownerId),
      memberCount
    );

    // Add owner as member
    const ownerMembershipId = id();
    transactions.push(
      tx.groupMemberships[ownerMembershipId]
        .update({
          status: 'member',
          createdAt: faker.date.past({ years: 1 }),
          visibility: randomVisibility(),
        })
        .link({ user: ownerId, group: groupId, role: boardMemberRoleId })
    );

    // Maybe add main user as member to some groups
    if (i < 5 && !members.includes(mainUserId)) {
      const mainUserMembershipId = id();
      const roleId = randomItem([memberRoleId, boardMemberRoleId]);
      transactions.push(
        tx.groupMemberships[mainUserMembershipId]
          .update({
            status: 'member',
            createdAt: faker.date.past({ years: 0.5 }),
            visibility: randomVisibility(),
          })
          .link({ user: mainUserId, group: groupId, role: roleId })
      );
      members.push(mainUserId);
    }

    // Track member statuses to sync with conversation participants
    const memberStatuses: Record<string, string> = {};

    for (const memberId of members) {
      const membershipId = id();
      const status = randomItem(['member', 'member', 'member', 'requested', 'invited']);
      memberStatuses[memberId] = status; // Track the status for later
      const roleId = randomItem([memberRoleId, memberRoleId, boardMemberRoleId]); // Mostly members, occasionally board member
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            status: status,
            createdAt: faker.date.past({ years: 0.5 }),
            visibility: randomVisibility(),
          })
          .link({ user: memberId, group: groupId, role: roleId })
      );
    }

    // Update member count
    transactions.push(
      tx.groups[groupId].update({
        memberCount: members.length + 1, // +1 for owner
      })
    );

    // Create group conversation with all members as participants
    const conversationId = id();
    const groupCreatedAt = faker.date.past({ years: 1 });
    console.log(`  Creating conversation ${conversationId} for group ${groupId} (${name})`);
    transactions.push(
      tx.conversations[conversationId]
        .update({
          type: 'group',
          name: name,
          status: 'accepted',
          createdAt: groupCreatedAt,
          lastMessageAt: groupCreatedAt,
        })
        .link({ group: groupId, requestedBy: ownerId })
    );

    // Add owner as conversation participant
    const ownerConvParticipantId = id();
    transactions.push(
      tx.conversationParticipants[ownerConvParticipantId]
        .update({
          joinedAt: groupCreatedAt,
          lastReadAt: faker.date.recent({ days: 1 }),
        })
        .link({ conversation: conversationId, user: ownerId })
    );

    // Only add members with 'member' status to conversation (not invited/requested)
    for (const memberId of members) {
      if (memberStatuses[memberId] === 'member') {
        const participantId = id();
        transactions.push(
          tx.conversationParticipants[participantId]
            .update({
              joinedAt: groupCreatedAt,
              lastReadAt: faker.date.recent({ days: 2 }),
            })
            .link({ conversation: conversationId, user: memberId })
        );
      }
    }

    // Add messages from different group members (only accepted members)
    const acceptedMembers = members.filter(memberId => memberStatuses[memberId] === 'member');
    const allParticipants = [ownerId, ...acceptedMembers];
    const messageCount = randomInt(10, 20);
    for (let j = 0; j < messageCount; j++) {
      const messageId = id();
      const senderUserId = randomItem(allParticipants);
      const messageCreatedAt = faker.date.between({
        from: groupCreatedAt,
        to: new Date(),
      });

      transactions.push(
        tx.messages[messageId]
          .update({
            content: faker.lorem.sentences(randomInt(1, 3)),
            isRead: faker.datatype.boolean(0.8), // 80% read
            createdAt: messageCreatedAt,
            updatedAt: null,
            deletedAt: null,
          })
          .link({ conversation: conversationId, sender: senderUserId })
      );
    }

    // Add hashtags for this group
    const groupHashtags = randomItems(GROUP_HASHTAGS, randomInt(3, 5));
    transactions.push(...createHashtagTransactions(groupId, 'group', groupHashtags));

    // Add 1-3 blog posts for this group
    const groupBlogCount = randomInt(1, 3);
    for (let j = 0; j < groupBlogCount; j++) {
      const blogId = id();
      blogIds.push(blogId);
      transactions.push(
        tx.blogs[blogId]
          .update({
            title: faker.lorem.sentence(),
            date: faker.date.past({ years: 0.5 }).toISOString(),
            likeCount: randomInt(5, 100),
            commentCount: randomInt(0, 50),
            visibility: randomVisibility(),
          })
          .link({ user: ownerId, group: groupId })
      );

      // Add hashtags to blog (minimum 1, maximum 4)
      const blogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 4));
      transactions.push(...createHashtagTransactions(blogId, 'blog', blogHashtags));
    }

    // Add 2-4 amendments for this group
    const amendmentCount = randomInt(2, 4);
    for (let j = 0; j < amendmentCount; j++) {
      const amendmentId = id();
      amendmentIds.push(amendmentId);
      const amendmentTitle = faker.lorem.sentence();
      transactions.push(
        tx.amendments[amendmentId]
          .update({
            title: amendmentTitle,
            subtitle: faker.lorem.sentence(),
            status: randomItem(['Passed', 'Rejected', 'Under Review', 'Drafting']),
            supporters: randomInt(10, 500),
            date: faker.date.past({ years: 1 }).toISOString(),
            code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
            tags: [randomItem(['policy', 'reform', 'legislation', 'amendment', 'proposal'])],
            visibility: randomVisibility(),
          })
          .link({ user: ownerId, group: groupId })
      );

      // Add hashtags to amendment
      const amendmentHashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(amendmentId, 'amendment', amendmentHashtags));

      // Create a document for this amendment
      transactions.push(...createAmendmentDocument(amendmentId, amendmentTitle, ownerId));
    }

    // Add 2-4 documents for each group
    const groupDocumentCount = randomInt(2, 4);
    for (let j = 0; j < groupDocumentCount; j++) {
      const docId = id();
      const docTitle = faker.helpers.arrayElement([
        `${name} Meeting Notes ${faker.date.month()}`,
        `${name} Policy Draft`,
        `${name} Project Proposal`,
        `${name} Planning Document`,
        `Budget Report - ${name}`,
        `${name} Strategic Plan`,
      ]);

      const documentContent = [
        { type: 'h1', children: [{ text: docTitle }] },
        {
          type: 'p',
          children: [{ text: faker.lorem.paragraph() }],
        },
        { type: 'h2', children: [{ text: 'Overview' }] },
        { type: 'p', children: [{ text: faker.lorem.paragraph() }] },
        { type: 'h2', children: [{ text: 'Key Points' }] },
        { type: 'p', children: [{ text: `• ${faker.lorem.sentence()}` }] },
        { type: 'p', children: [{ text: `• ${faker.lorem.sentence()}` }] },
        { type: 'p', children: [{ text: `• ${faker.lorem.sentence()}` }] },
      ];

      transactions.push(
        tx.documents[docId]
          .update({
            title: docTitle,
            content: documentContent,
            createdAt: faker.date.past({ years: 0.3 }),
            updatedAt: faker.date.recent({ days: 30 }),
            isPublic: randomItem([true, false, false]), // 33% public
            tags: ['group', 'collaboration'],
          })
          .link({ owner: ownerId, group: groupId })
      );
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} group-related records...`);
  await batchTransact(transactions);

  console.log(
    `✓ Created ${SEED_CONFIG.groups} groups with memberships, blogs, amendments, and documents (2 owned by main test user)`
  );
  return { groupIds, blogIds, amendmentIds };
}

async function seedGroupInvitationsAndRequests(groupIds: string[], userIds: string[]) {
  console.log('Seeding additional group invitations and requests...');
  const transactions = [];
  let totalInvitations = 0;
  let totalRequests = 0;

  // For each group, add 2-4 pending invitations and 2-4 pending requests
  for (const groupId of groupIds) {
    // Get users who might not already be members
    const availableUsers = userIds.filter(() => {
      // Simple filter - in production this would check existing memberships
      return Math.random() > 0.3; // 70% chance a user is available
    });

    // Add 2-4 invitations
    const invitationCount = randomInt(2, 4);
    const invitedUsers = randomItems(availableUsers, invitationCount);

    for (const invitedUserId of invitedUsers) {
      const membershipId = id();
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            status: 'invited',
            createdAt: faker.date.recent({ days: 30 }),
          })
          .link({ user: invitedUserId, group: groupId })
      );
      totalInvitations++;
    }

    // Add 2-4 requests (from different users)
    const requestCount = randomInt(2, 4);
    const requestingUsers = randomItems(
      availableUsers.filter(u => !invitedUsers.includes(u)),
      requestCount
    );

    for (const requestingUserId of requestingUsers) {
      const membershipId = id();
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            status: 'requested',
            createdAt: faker.date.recent({ days: 30 }),
          })
          .link({ user: requestingUserId, group: groupId })
      );
      totalRequests++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalInvitations} pending invitations and ${totalRequests} pending requests`
  );
  console.log(`  Each group now has 2-4 invitations and 2-4 requests`);
}

async function seedEventParticipationRequestsAndInvites(eventIds: string[], userIds: string[]) {
  console.log('Seeding event participation requests and invitations...');
  const transactions = [];
  let totalInvitations = 0;
  let totalRequests = 0;
  let totalAdmins = 0;

  // For each event, add 2-4 pending invitations, 2-4 pending requests, and 1-2 admins
  for (const eventId of eventIds) {
    // Get users who might not already be participants
    const availableUsers = userIds.filter(() => {
      // Simple filter - in production this would check existing participants
      return Math.random() > 0.3; // 70% chance a user is available
    });

    // Add 2-4 invitations
    const invitationCount = randomInt(2, 4);
    const invitedUsers = randomItems(availableUsers, invitationCount);

    for (const invitedUserId of invitedUsers) {
      const participantId = id();
      transactions.push(
        tx.eventParticipants[participantId]
          .update({
            status: 'invited',
            createdAt: faker.date.recent({ days: 30 }),
          })
          .link({ user: invitedUserId, event: eventId })
      );
      totalInvitations++;
    }

    // Add 2-4 requests (from different users)
    const requestCount = randomInt(2, 4);
    const requestingUsers = randomItems(
      availableUsers.filter(u => !invitedUsers.includes(u)),
      requestCount
    );

    for (const requestingUserId of requestingUsers) {
      const participantId = id();
      transactions.push(
        tx.eventParticipants[participantId]
          .update({
            status: 'requested',
            createdAt: faker.date.recent({ days: 30 }),
          })
          .link({ user: requestingUserId, event: eventId })
      );
      totalRequests++;
    }

    // Add 1-2 admin participants
    const adminCount = randomInt(1, 2);
    const adminUsers = randomItems(
      availableUsers.filter(u => !invitedUsers.includes(u) && !requestingUsers.includes(u)),
      adminCount
    );

    for (const userId of adminUsers) {
      const participantId = id();
      transactions.push(
        tx.eventParticipants[participantId]
          .update({
            status: 'member',
            createdAt: faker.date.past({ years: 0.17 }),
          })
          .link({ user: userId, event: eventId })
      );
      totalAdmins++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalInvitations} pending event invitations, ${totalRequests} pending requests, and ${totalAdmins} admin participants`
  );
  console.log(`  Each event now has 2-4 invitations, 2-4 requests, and 1-2 admins`);
}

async function seedAmendmentCollaborationRequestsAndInvites(
  amendmentIds: string[],
  userIds: string[]
) {
  console.log('Seeding amendment collaboration requests and invitations...');
  const transactions = [];
  let totalInvitations = 0;
  let totalRequests = 0;
  let totalAdmins = 0;

  // For each amendment, add 2-4 pending invitations, 2-4 pending requests, and 1-2 admins
  for (const amendmentId of amendmentIds) {
    // Get users who might not already be collaborators
    const availableUsers = userIds.filter(() => {
      // Simple filter - in production this would check existing collaborators
      return Math.random() > 0.3; // 70% chance a user is available
    });

    // Add 2-4 invitations
    const invitationCount = randomInt(2, 4);
    const invitedUsers = randomItems(availableUsers, invitationCount);

    for (const invitedUserId of invitedUsers) {
      const collaboratorId = id();
      transactions.push(
        tx.amendmentCollaborators[collaboratorId]
          .update({
            status: 'invited',
            createdAt: faker.date.recent({ days: 30 }),
            visibility: randomVisibility(),
          })
          .link({ user: invitedUserId, amendment: amendmentId })
      );
      totalInvitations++;
    }

    // Add 2-4 requests (from different users)
    const requestCount = randomInt(2, 4);
    const requestingUsers = randomItems(
      availableUsers.filter(u => !invitedUsers.includes(u)),
      requestCount
    );

    for (const requestingUserId of requestingUsers) {
      const collaboratorId = id();
      transactions.push(
        tx.amendmentCollaborators[collaboratorId]
          .update({
            status: 'requested',
            createdAt: faker.date.recent({ days: 30 }),
            visibility: randomVisibility(),
          })
          .link({ user: requestingUserId, amendment: amendmentId })
      );
      totalRequests++;
    }

    // Add 1-2 admin collaborators
    const adminCount = randomInt(1, 2);
    const adminUsers = randomItems(
      availableUsers.filter(u => !invitedUsers.includes(u) && !requestingUsers.includes(u)),
      adminCount
    );

    for (const userId of adminUsers) {
      const collaboratorId = id();
      transactions.push(
        tx.amendmentCollaborators[collaboratorId]
          .update({
            status: 'member',
            createdAt: faker.date.past({ years: 0.17 }),
            visibility: randomVisibility(),
          })
          .link({ user: userId, amendment: amendmentId })
      );
      totalAdmins++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalInvitations} pending amendment invitations, ${totalRequests} pending requests, and ${totalAdmins} admin collaborators`
  );
  console.log(`  Each amendment now has 2-4 invitations, 2-4 requests, and 1-2 admins`);
}

async function seedFollows(userIds: string[], groupIds: string[]) {
  console.log('Seeding follows and subscribers...');
  const transactions = [];
  let totalFollows = 0;
  let totalSubscribers = 0;
  let totalGroupSubscribers = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;

  // Make main user follow 10 random users (legacy follows)
  const usersToFollow = randomItems(
    userIds.filter(uid => uid !== mainUserId),
    10
  );

  for (const followeeId of usersToFollow) {
    const followId = id();
    transactions.push(
      tx.follows[followId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ follower: mainUserId, followee: followeeId })
    );
    totalFollows++;
  }

  // Make 5 random users follow the main user (legacy follows)
  const followers = randomItems(
    userIds.filter(uid => uid !== mainUserId && !usersToFollow.includes(uid)),
    5
  );

  for (const followerId of followers) {
    const followId = id();
    transactions.push(
      tx.follows[followId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ follower: followerId, followee: mainUserId })
    );
    totalFollows++;
  }

  // Create follows for other users (legacy follows)
  for (const userId of userIds) {
    if (userId === mainUserId) continue; // Skip main user, already handled

    const followCount = randomInt(SEED_CONFIG.followsPerUser.min, SEED_CONFIG.followsPerUser.max);
    const usersToFollow = randomItems(
      userIds.filter(uid => uid !== userId),
      followCount
    );

    for (const followeeId of usersToFollow) {
      const followId = id();
      transactions.push(
        tx.follows[followId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ follower: userId, followee: followeeId })
      );
      totalFollows++;
    }
  }

  // NEW: Create subscribers (the new system)
  // Make main user subscribe to 10 random users
  const usersToSubscribe = randomItems(
    userIds.filter(uid => uid !== mainUserId),
    10
  );

  for (const targetUserId of usersToSubscribe) {
    const subscriberId = id();
    transactions.push(
      tx.subscribers[subscriberId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: mainUserId, user: targetUserId })
    );
    totalSubscribers++;
  }

  // Make 5 random users subscribe to the main user
  const subscribersToMain = randomItems(
    userIds.filter(uid => uid !== mainUserId && !usersToSubscribe.includes(uid)),
    5
  );

  for (const subscriberId of subscribersToMain) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: subscriberId, user: mainUserId })
    );
    totalSubscribers++;
  }

  // Create subscribers for other users
  for (const userId of userIds) {
    if (userId === mainUserId) continue; // Skip main user, already handled

    const subscribeCount = randomInt(
      SEED_CONFIG.followsPerUser.min,
      SEED_CONFIG.followsPerUser.max
    );
    const usersToSubscribe = randomItems(
      userIds.filter(uid => uid !== userId),
      subscribeCount
    );

    for (const targetUserId of usersToSubscribe) {
      const subscriptionId = id();
      transactions.push(
        tx.subscribers[subscriptionId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ subscriber: userId, user: targetUserId })
      );
      totalSubscribers++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  // NEW: Create group subscriptions
  // Make main user subscribe to 3 random groups
  const groupsToSubscribe = randomItems(groupIds, 3);

  for (const targetGroupId of groupsToSubscribe) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: mainUserId, group: targetGroupId })
    );
    totalGroupSubscribers++;
  }

  // Make 3 random users subscribe to first 2 groups
  const firstTwoGroups = groupIds.slice(0, 2);
  for (const groupId of firstTwoGroups) {
    const groupSubscribers = randomItems(userIds, 3);
    for (const userId of groupSubscribers) {
      const subscriptionId = id();
      transactions.push(
        tx.subscribers[subscriptionId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ subscriber: userId, group: groupId })
      );
      totalGroupSubscribers++;
    }
  }

  // Execute group subscription transactions in batches
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalFollows} follow relationships (legacy), ${totalSubscribers} user subscriber relationships, and ${totalGroupSubscribers} group subscriber relationships`
  );
  console.log(`  Main user: 10 following, 5 followers (legacy)`);
  console.log(
    `  Main user: 10 user subscriptions, 5 subscribers, 3 group subscriptions (new system)`
  );
}

async function seedEntitySubscriptions(
  userIds: string[],
  amendmentIds: string[],
  eventIds: string[],
  blogIds: string[]
) {
  console.log('Seeding amendments, events, and blogs subscriptions...');
  const transactions = [];
  let totalAmendmentSubscribers = 0;
  let totalEventSubscribers = 0;
  let totalBlogSubscribers = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;

  // Make main user subscribe to some amendments
  const amendmentsToSubscribe = randomItems(amendmentIds, Math.min(3, amendmentIds.length));
  for (const amendmentId of amendmentsToSubscribe) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: mainUserId, amendment: amendmentId })
    );
    totalAmendmentSubscribers++;
  }

  // Make 3 random users subscribe to first few amendments
  const firstAmendments = amendmentIds.slice(0, Math.min(3, amendmentIds.length));
  for (const amendmentId of firstAmendments) {
    const subscribers = randomItems(userIds, 3);
    for (const userId of subscribers) {
      const subscriptionId = id();
      transactions.push(
        tx.subscribers[subscriptionId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ subscriber: userId, amendment: amendmentId })
      );
      totalAmendmentSubscribers++;
    }
  }

  // Make main user subscribe to some events
  const eventsToSubscribe = randomItems(eventIds, Math.min(3, eventIds.length));
  for (const eventId of eventsToSubscribe) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: mainUserId, event: eventId })
    );
    totalEventSubscribers++;
  }

  // Make 3 random users subscribe to first few events
  const firstEvents = eventIds.slice(0, Math.min(3, eventIds.length));
  for (const eventId of firstEvents) {
    const subscribers = randomItems(userIds, 3);
    for (const userId of subscribers) {
      const subscriptionId = id();
      transactions.push(
        tx.subscribers[subscriptionId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ subscriber: userId, event: eventId })
      );
      totalEventSubscribers++;
    }
  }

  // Make main user subscribe to some blogs
  const blogsToSubscribe = randomItems(blogIds, Math.min(3, blogIds.length));
  for (const blogId of blogsToSubscribe) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: mainUserId, blog: blogId })
    );
    totalBlogSubscribers++;
  }

  // Make 3 random users subscribe to first few blogs
  const firstBlogs = blogIds.slice(0, Math.min(3, blogIds.length));
  for (const blogId of firstBlogs) {
    const subscribers = randomItems(userIds, 3);
    for (const userId of subscribers) {
      const subscriptionId = id();
      transactions.push(
        tx.subscribers[subscriptionId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ subscriber: userId, blog: blogId })
      );
      totalBlogSubscribers++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalAmendmentSubscribers} amendment subscribers, ${totalEventSubscribers} event subscribers, and ${totalBlogSubscribers} blog subscribers`
  );
  console.log(
    `  Main user: subscribed to ${amendmentsToSubscribe.length} amendments, ${eventsToSubscribe.length} events, ${blogsToSubscribe.length} blogs`
  );
}

/**
 * Seed comprehensive subscriptions and memberships for Tobias user
 */
async function seedTobiasSubscriptionsAndMemberships(
  userIds: string[],
  groupIds: string[],
  amendmentIds: string[],
  eventIds: string[],
  blogIds: string[]
) {
  console.log('Seeding comprehensive subscriptions and memberships for Tobias...');
  const transactions = [];
  const tobiasUserId = SEED_CONFIG.tobiasUserId;

  // Subscribe Tobias to ALL users (except himself)
  const otherUsers = userIds.filter(uid => uid !== tobiasUserId);
  for (const userId of otherUsers) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: tobiasUserId, user: userId })
    );
  }

  // Subscribe Tobias to ALL groups
  for (const groupId of groupIds) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: tobiasUserId, group: groupId })
    );
  }

  // Subscribe Tobias to ALL amendments
  for (const amendmentId of amendmentIds) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: tobiasUserId, amendment: amendmentId })
    );
  }

  // Subscribe Tobias to ALL events
  for (const eventId of eventIds) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: tobiasUserId, event: eventId })
    );
  }

  // Subscribe Tobias to ALL blogs
  for (const blogId of blogIds) {
    const subscriptionId = id();
    transactions.push(
      tx.subscribers[subscriptionId]
        .update({
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ subscriber: tobiasUserId, blog: blogId })
    );
  }

  // Add Tobias as member to first 8 groups with different statuses
  // Groups 0-2: Board Member role with full permissions (3 groups)
  // Groups 3-4: Member role with basic permissions (2 groups)
  // Groups 5-6: requested status (2 groups)
  // Group 7: invited status (1 group)
  const first8Groups = groupIds.slice(0, Math.min(8, groupIds.length));
  for (let i = 0; i < first8Groups.length; i++) {
    const groupId = first8Groups[i];
    const membershipId = id();

    let roleName = 'Member';
    let status = 'member';

    if (i < 3) {
      // First 3 groups: Board Member with full permissions
      roleName = 'Board Member';
      status = 'member';
    } else if (i < 5) {
      // Groups 3-4: regular member
      roleName = 'Member';
      status = 'member';
    } else if (i < 7) {
      // Groups 5-6: requested
      roleName = 'Member';
      status = 'requested';
    } else {
      // Group 7: invited
      roleName = 'Member';
      status = 'invited';
    }

    // Query the role ID for this group
    const groupRoles = await db.query({
      roles: {
        $: {
          where: {
            and: [{ name: roleName }, { scope: 'group' }],
          },
        },
        group: {
          $: {
            where: {
              id: groupId,
            },
          },
        },
      },
    });

    const roleId = groupRoles?.roles?.[0]?.id;

    if (roleId) {
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            status: status,
            createdAt: faker.date.past({ years: 1 }),
          })
          .link({ user: tobiasUserId, group: groupId, role: roleId })
      );
    }
  }

  // Add Tobias as participant to events with different statuses
  // Make Tobias admin for at least half of all events
  const totalEvents = eventIds.length;
  const halfEvents = Math.ceil(totalEvents / 2); // Round up to ensure "at least half"

  // Take first 8 events if available for different participation statuses
  const first8Events = eventIds.slice(0, Math.min(8, eventIds.length));
  for (let i = 0; i < first8Events.length; i++) {
    const eventId = first8Events[i];
    const participantId = id();

    let roleName = 'Participant';
    let status = 'member';

    if (i < halfEvents) {
      // Make Tobias Organizer for at least half of the events
      roleName = 'Organizer';
      status = 'member';
    } else if (i < halfEvents + 2) {
      // Next 2 events: regular participant
      roleName = 'Participant';
      status = 'member';
    } else if (i < halfEvents + 4) {
      // Next 2 events: requested
      roleName = 'Participant';
      status = 'requested';
    } else {
      // Remaining events: invited
      roleName = 'Participant';
      status = 'invited';
    }

    // Query the role ID for this event
    const eventRoles = await db.query({
      roles: {
        $: {
          where: {
            and: [{ name: roleName }, { scope: 'event' }],
          },
        },
        event: {
          $: {
            where: {
              id: eventId,
            },
          },
        },
      },
    });

    const roleId = eventRoles?.roles?.[0]?.id;

    if (roleId) {
      transactions.push(
        tx.eventParticipants[participantId]
          .update({
            status: status,
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ user: tobiasUserId, event: eventId, role: roleId })
      );
    }
  }

  // Add Tobias as collaborator to amendments with different statuses
  // Take first 8 amendments if available
  // Amendments 0-2: Applicant role (3 amendments)
  // Amendments 3-4: Collaborator role (2 amendments)
  // Amendments 5-6: requested status (2 amendments)
  // Amendment 7: invited status (1 amendment)
  const first8Amendments = amendmentIds.slice(0, Math.min(8, amendmentIds.length));
  for (let i = 0; i < first8Amendments.length; i++) {
    const amendmentId = first8Amendments[i];
    const collaboratorId = id();

    let roleName = 'Collaborator';
    let status = 'member';

    if (i < 3) {
      // First 3 amendments: Applicant
      roleName = 'Applicant';
      status = 'member';
    } else if (i < 5) {
      // Amendments 3-4: regular collaborator
      roleName = 'Collaborator';
      status = 'member';
    } else if (i < 7) {
      // Amendments 5-6: requested
      roleName = 'Collaborator';
      status = 'requested';
    } else {
      // Amendment 7: invited
      roleName = 'Collaborator';
      status = 'invited';
    }

    // Query the role ID for this amendment
    const amendmentRoles = await db.query({
      roles: {
        $: {
          where: {
            and: [{ name: roleName }, { scope: 'amendment' }],
          },
        },
        amendment: {
          $: {
            where: {
              id: amendmentId,
            },
          },
        },
      },
    });

    const roleId = amendmentRoles?.roles?.[0]?.id;

    if (roleId) {
      transactions.push(
        tx.amendmentCollaborators[collaboratorId]
          .update({
            status: status,
            createdAt: faker.date.past({ years: 0.5 }),
            visibility: randomVisibility(),
          })
          .link({ user: tobiasUserId, amendment: amendmentId, role: roleId })
      );
    }
  }

  // Add Tobias as blogger to blogs with different roles
  // Take first 8 blogs if available
  // Blogs 0-2: Owner role (3 blogs)
  // Blogs 3-7: Writer role (5 blogs)
  const first8Blogs = blogIds.slice(0, Math.min(8, blogIds.length));
  for (let i = 0; i < first8Blogs.length; i++) {
    const blogId = first8Blogs[i];
    const bloggerId = id();

    let roleName = 'Writer';
    let status = 'member';

    if (i < 3) {
      // First 3 blogs: Owner
      roleName = 'Owner';
      status = 'member';
    } else {
      // Blogs 3-7: Writer
      roleName = 'Writer';
      status = 'member';
    }

    // Query the role ID for this blog
    const blogRoles = await db.query({
      roles: {
        $: {
          where: {
            and: [{ name: roleName }, { scope: 'blog' }],
          },
        },
        blog: {
          $: {
            where: {
              id: blogId,
            },
          },
        },
      },
    });

    const roleId = blogRoles?.roles?.[0]?.id;

    if (roleId) {
      transactions.push(
        tx.blogBloggers[bloggerId]
          .update({
            status: status,
            createdAt: faker.date.past({ years: 0.5 }),
            visibility: randomVisibility(),
          })
          .link({ user: tobiasUserId, blog: blogId, role: roleId })
      );
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Tobias subscriptions created:`);
  console.log(`  - Users: ${otherUsers.length}`);
  console.log(`  - Groups: ${groupIds.length}`);
  console.log(`  - Amendments: ${amendmentIds.length}`);
  console.log(`  - Events: ${eventIds.length}`);
  console.log(`  - Blogs: ${blogIds.length}`);
  console.log(`✓ Tobias memberships created:`);
  console.log(`  - Board Member in first 3 groups`);
  console.log(`  - Member in groups 4-5 (2 groups)`);
  console.log(`  - Requested in groups 6-7 (2 groups)`);
  console.log(`  - Invited to group 8 (1 group)`);
  console.log(`  - Total: ${first8Groups.length} groups`);
  console.log(`✓ Tobias event participations created:`);
  console.log(
    `  - Organizer in ${Math.ceil(eventIds.length / 2)} events (at least half of ${eventIds.length} total)`
  );
  console.log(`  - Participant in next 2 events`);
  console.log(`  - Requested in next 2 events`);
  console.log(`  - Invited to remaining events`);
  console.log(`  - Total: ${first8Events.length} events`);
  console.log(`✓ Tobias amendment collaborations created:`);
  console.log(`  - Applicant in first 3 amendments`);
  console.log(`  - Collaborator in amendments 4-5 (2 amendments)`);
  console.log(`  - Requested in amendments 6-7 (2 amendments)`);
  console.log(`  - Invited to amendment 8 (1 amendment)`);
  console.log(`  - Total: ${first8Amendments.length} amendments`);
  console.log(`✓ Tobias blog bloggers created:`);
  console.log(`  - Owner in first 3 blogs`);
  console.log(`  - Writer in blogs 4-8 (5 blogs)`);
  console.log(`  - Total: ${first8Blogs.length} blogs`);
}

async function seedConversationsAndMessages(userIds: string[]) {
  console.log('Seeding conversations and messages...');
  const transactions = [];
  let totalConversations = 0;
  let totalMessages = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;

  // Create 3 conversations for main test user
  const conversationPartners = randomItems(
    userIds.filter(uid => uid !== mainUserId),
    3
  );

  for (const otherUser of conversationPartners) {
    const conversationId = id();
    const createdAt = faker.date.past({ years: 0.25 });

    // Create conversation
    transactions.push(
      tx.conversations[conversationId].update({
        lastMessageAt: faker.date.recent({ days: 7 }),
        createdAt,
        type: 'direct',
        status: 'accepted',
      })
    );

    // Link requestedBy to main user
    transactions.push(
      tx.conversations[conversationId].link({
        requestedBy: mainUserId,
      })
    );

    // Add participants
    const participant1Id = id();
    transactions.push(
      tx.conversationParticipants[participant1Id]
        .update({
          lastReadAt: faker.date.recent({ days: 1 }),
          joinedAt: createdAt,
          leftAt: null,
        })
        .link({ user: mainUserId, conversation: conversationId })
    );

    const participant2Id = id();
    transactions.push(
      tx.conversationParticipants[participant2Id]
        .update({
          lastReadAt: faker.date.recent({ days: 2 }),
          joinedAt: createdAt,
          leftAt: null,
        })
        .link({ user: otherUser, conversation: conversationId })
    );

    // Add messages
    const messageCount = randomInt(8, 15);

    for (let j = 0; j < messageCount; j++) {
      const messageId = id();
      const senderUserId = randomItem([mainUserId, otherUser]);
      const messageCreatedAt = faker.date.between({
        from: createdAt,
        to: new Date(),
      });

      transactions.push(
        tx.messages[messageId]
          .update({
            content: faker.lorem.sentences(randomInt(1, 3)),
            isRead: true, // Main user's messages are all read
            createdAt: messageCreatedAt,
            updatedAt: null,
            deletedAt: null,
          })
          .link({ conversation: conversationId, sender: senderUserId })
      );
      totalMessages++;
    }

    totalConversations++;
  }

  // Create conversations for other users
  for (const userId of userIds) {
    if (userId === mainUserId) continue; // Skip main user, already handled

    const conversationCount = randomInt(
      SEED_CONFIG.conversationsPerUser.min,
      SEED_CONFIG.conversationsPerUser.max
    );

    for (let i = 0; i < conversationCount; i++) {
      const conversationId = id();
      const otherUser = randomItem(userIds.filter(uid => uid !== userId));
      const createdAt = faker.date.past({ years: 0.25 });

      // Create conversation
      transactions.push(
        tx.conversations[conversationId].update({
          lastMessageAt: faker.date.recent({ days: 7 }),
          createdAt,
          type: 'direct',
          status: 'accepted',
        })
      );

      // Link requestedBy to the first user
      transactions.push(
        tx.conversations[conversationId].link({
          requestedBy: userId,
        })
      );

      // Add participants
      const participant1Id = id();
      transactions.push(
        tx.conversationParticipants[participant1Id]
          .update({
            lastReadAt: faker.date.recent({ days: 1 }),
            joinedAt: createdAt,
            leftAt: null,
          })
          .link({ user: userId, conversation: conversationId })
      );

      const participant2Id = id();
      transactions.push(
        tx.conversationParticipants[participant2Id]
          .update({
            lastReadAt: faker.date.recent({ days: 2 }),
            joinedAt: createdAt,
            leftAt: null,
          })
          .link({ user: otherUser, conversation: conversationId })
      );

      // Add messages
      const messageCount = randomInt(
        SEED_CONFIG.messagesPerConversation.min,
        SEED_CONFIG.messagesPerConversation.max
      );

      for (let j = 0; j < messageCount; j++) {
        const messageId = id();
        const senderUserId = randomItem([userId, otherUser]);
        const messageCreatedAt = faker.date.between({
          from: createdAt,
          to: new Date(),
        });

        transactions.push(
          tx.messages[messageId]
            .update({
              content: faker.lorem.sentences(randomInt(1, 3)),
              isRead: faker.datatype.boolean(0.7), // 70% read
              createdAt: messageCreatedAt,
              updatedAt: null,
              deletedAt: null,
            })
            .link({ conversation: conversationId, sender: senderUserId })
        );
        totalMessages++;
      }

      totalConversations++;
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} conversation-related records...`);
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalConversations} conversations with ${totalMessages} messages (main user: 3 conversations)`
  );
}

async function seedEvents(userIds: string[], groupIds: string[]) {
  console.log('Seeding events...');
  const transactions: any[] = [];
  const eventIds: string[] = [];
  let totalEvents = 0;
  let totalParticipants = 0;

  // ========== CREATE DETERMINISTIC E2E TEST EVENTS ==========
  console.log('  Creating deterministic E2E test events...');

  // Flush transactions before creating events
  if (transactions.length > 0) {
    console.log(`  Flushing ${transactions.length} pending transactions...`);
    for (let i = 0; i < transactions.length; i += 50) {
      const batch = transactions.slice(i, i + 50);
      await db.transact(batch);
    }
    transactions.length = 0;
  }

  const now = new Date();

  // Test Event 1 - Future event
  const testEvent1Id = TEST_ENTITY_IDS.testEvent1;
  const testEvent1Start = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const testEvent1End = new Date(testEvent1Start.getTime() + 2 * 60 * 60 * 1000);
  eventIds.push(testEvent1Id);
  const testEvent1Txs = [];
  testEvent1Txs.push(
    tx.events[testEvent1Id]
      .update({
        title: 'E2E Test Event 1',
        description: 'First event for E2E subscription testing',
        location: 'Test Location 1',
        startDate: testEvent1Start,
        endDate: testEvent1End,
        isPublic: true,
        capacity: 100,
        imageURL: faker.image.url(),
        tags: ['test', 'e2e'],
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ organizer: TEST_ENTITY_IDS.testUser1 })
  );
  testEvent1Txs.push(...createHashtagTransactions(testEvent1Id, 'event', ['test', 'e2e']));
  await db.transact(testEvent1Txs);

  // Test Event 2 - Upcoming week event
  const testEvent2Id = TEST_ENTITY_IDS.testEvent2;
  const testEvent2Start = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  const testEvent2End = new Date(testEvent2Start.getTime() + 3 * 60 * 60 * 1000);
  eventIds.push(testEvent2Id);
  const testEvent2Txs = [];
  testEvent2Txs.push(
    tx.events[testEvent2Id]
      .update({
        title: 'E2E Test Event 2',
        description: 'Second event for E2E subscription testing',
        location: 'Test Location 2',
        startDate: testEvent2Start,
        endDate: testEvent2End,
        isPublic: true,
        capacity: 50,
        imageURL: faker.image.url(),
        tags: ['test', 'e2e'],
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ organizer: TEST_ENTITY_IDS.testUser2 })
  );
  testEvent2Txs.push(...createHashtagTransactions(testEvent2Id, 'event', ['testing', 'qa']));
  await db.transact(testEvent2Txs);

  // Test Event 3 - Far future event
  const testEvent3Id = TEST_ENTITY_IDS.testEvent3;
  const testEvent3Start = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const testEvent3End = new Date(testEvent3Start.getTime() + 4 * 60 * 60 * 1000);
  eventIds.push(testEvent3Id);
  const testEvent3Txs = [];
  testEvent3Txs.push(
    tx.events[testEvent3Id]
      .update({
        title: 'E2E Test Event 3',
        description: 'Third event for E2E subscription testing',
        location: 'Test Location 3',
        startDate: testEvent3Start,
        endDate: testEvent3End,
        isPublic: true,
        capacity: 75,
        imageURL: faker.image.url(),
        tags: ['test', 'e2e'],
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ organizer: TEST_ENTITY_IDS.testUser3 })
  );
  testEvent3Txs.push(...createHashtagTransactions(testEvent3Id, 'event', ['e2e', 'testing']));
  await db.transact(testEvent3Txs);

  // ========== CREATE DETERMINISTIC E2E TEST DOCUMENTS ==========
  console.log('  Creating deterministic E2E test documents...');

  // Test Document 1
  const testDoc1Id = TEST_ENTITY_IDS.testDocument1;
  await db.transact([
    tx.documents[testDoc1Id]
      .update({
        title: 'E2E Test Document 1',
        content: [
          { type: 'h1', children: [{ text: 'E2E Test Document 1' }] },
          { type: 'p', children: [{ text: 'This is a test document for E2E testing purposes.' }] },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        tags: ['test', 'e2e', 'document'],
      })
      .link({ owner: TEST_ENTITY_IDS.testUser1 }),
  ]);

  // Test Document 2
  const testDoc2Id = TEST_ENTITY_IDS.testDocument2;
  await db.transact([
    tx.documents[testDoc2Id]
      .update({
        title: 'E2E Test Document 2',
        content: [
          { type: 'h1', children: [{ text: 'E2E Test Document 2' }] },
          { type: 'p', children: [{ text: 'Second test document for E2E testing.' }] },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: true,
        tags: ['test', 'e2e', 'document'],
      })
      .link({ owner: TEST_ENTITY_IDS.testUser2 }),
  ]);

  // Test Document 3
  const testDoc3Id = TEST_ENTITY_IDS.testDocument3;
  await db.transact([
    tx.documents[testDoc3Id]
      .update({
        title: 'E2E Test Document 3',
        content: [
          { type: 'h1', children: [{ text: 'E2E Test Document 3' }] },
          { type: 'p', children: [{ text: 'Third test document for E2E testing.' }] },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
        isPublic: false,
        tags: ['test', 'e2e', 'document'],
      })
      .link({ owner: TEST_ENTITY_IDS.testUser3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST TODOS ==========
  console.log('  Creating deterministic E2E test todos...');

  // Test Todo 1 - In Progress
  const testTodo1Id = TEST_ENTITY_IDS.testTodo1;
  await db.transact([
    tx.todos[testTodo1Id]
      .update({
        title: 'E2E Test Todo 1',
        description: 'First test todo - in progress',
        status: 'in-progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        tags: ['test', 'e2e'],
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ creator: TEST_ENTITY_IDS.testUser1 }),
  ]);

  // Test Todo 2 - Completed
  const testTodo2Id = TEST_ENTITY_IDS.testTodo2;
  await db.transact([
    tx.todos[testTodo2Id]
      .update({
        title: 'E2E Test Todo 2',
        description: 'Second test todo - completed',
        status: 'done',
        priority: 'medium',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: new Date().toISOString(),
        tags: ['test', 'e2e'],
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
        visibility: 'public',
      })
      .link({ creator: TEST_ENTITY_IDS.testUser2 }),
  ]);

  // Test Todo 3 - Not Started
  const testTodo3Id = TEST_ENTITY_IDS.testTodo3;
  await db.transact([
    tx.todos[testTodo3Id]
      .update({
        title: 'E2E Test Todo 3',
        description: 'Third test todo - not started',
        status: 'todo',
        priority: 'low',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        completedAt: null,
        tags: ['test', 'e2e'],
        createdAt: new Date(),
        updatedAt: new Date(),
        visibility: 'private',
      })
      .link({ creator: TEST_ENTITY_IDS.testUser3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST NOTIFICATIONS ==========
  console.log('  Creating deterministic E2E test notifications...');

  // Test Notification 1
  const testNotif1Id = TEST_ENTITY_IDS.testNotification1;
  await db.transact([
    tx.notifications[testNotif1Id]
      .update({
        type: 'subscription',
        title: 'New Content Available',
        message: 'E2E Test Notification 1 - New content available',
        isRead: false,
        createdAt: new Date(),
      })
      .link({ user: TEST_ENTITY_IDS.testUser1 }),
  ]);

  // Test Notification 2
  const testNotif2Id = TEST_ENTITY_IDS.testNotification2;
  await db.transact([
    tx.notifications[testNotif2Id]
      .update({
        type: 'mention',
        title: 'You Were Mentioned',
        message: 'E2E Test Notification 2 - You were mentioned',
        isRead: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      })
      .link({ user: TEST_ENTITY_IDS.testUser2 }),
  ]);

  // Test Notification 3
  const testNotif3Id = TEST_ENTITY_IDS.testNotification3;
  await db.transact([
    tx.notifications[testNotif3Id]
      .update({
        type: 'event',
        title: 'Event Reminder',
        message: 'E2E Test Notification 3 - Event reminder',
        isRead: false,
        createdAt: new Date(),
      })
      .link({ user: TEST_ENTITY_IDS.testUser3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST POSITIONS ==========
  console.log('  Creating deterministic E2E test positions...');

  // Test Position 1 - Linked to testGroup1
  const testPos1Id = TEST_ENTITY_IDS.testPosition1;
  await db.transact([
    tx.positions[testPos1Id]
      .update({
        title: 'E2E Test Position 1 - Board Member',
        description: 'First test position for E2E testing',
        term: 2,
        firstTermStart: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ group: TEST_ENTITY_IDS.testGroup1 }),
  ]);

  // Test Position 2 - Linked to testGroup2
  const testPos2Id = TEST_ENTITY_IDS.testPosition2;
  await db.transact([
    tx.positions[testPos2Id]
      .update({
        title: 'E2E Test Position 2 - Treasurer',
        description: 'Second test position for E2E testing',
        term: 1,
        firstTermStart: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ group: TEST_ENTITY_IDS.testGroup2 }),
  ]);

  // Test Position 3 - Linked to testGroup3
  const testPos3Id = TEST_ENTITY_IDS.testPosition3;
  await db.transact([
    tx.positions[testPos3Id]
      .update({
        title: 'E2E Test Position 3 - Secretary',
        description: 'Third test position for E2E testing',
        term: 3,
        firstTermStart: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ group: TEST_ENTITY_IDS.testGroup3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST CONVERSATIONS ==========
  console.log('  Creating deterministic E2E test conversations...');

  // Test Conversation 1 - Between testUser1 and testUser2
  const testConv1Id = TEST_ENTITY_IDS.testConversation1;
  await db.transact([
    tx.conversations[testConv1Id].update({
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastMessageAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      type: 'direct',
      status: 'accepted',
    }),
    tx.conversations[testConv1Id].link({
      requestedBy: TEST_ENTITY_IDS.testUser1,
    }),
  ]);

  // Add participants
  await db.transact([
    tx.conversationParticipants[id()]
      .update({
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastReadAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      })
      .link({ conversation: testConv1Id, user: TEST_ENTITY_IDS.testUser1 }),
    tx.conversationParticipants[id()]
      .update({
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        lastReadAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      })
      .link({ conversation: testConv1Id, user: TEST_ENTITY_IDS.testUser2 }),
  ]);

  // Test Conversation 2
  const testConv2Id = TEST_ENTITY_IDS.testConversation2;
  await db.transact([
    tx.conversations[testConv2Id].update({
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastMessageAt: new Date(),
      type: 'direct',
      status: 'accepted',
    }),
    tx.conversations[testConv2Id].link({
      requestedBy: TEST_ENTITY_IDS.testUser2,
    }),
  ]);

  await db.transact([
    tx.conversationParticipants[id()]
      .update({
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastReadAt: new Date(),
      })
      .link({ conversation: testConv2Id, user: TEST_ENTITY_IDS.testUser2 }),
    tx.conversationParticipants[id()]
      .update({
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        lastReadAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      })
      .link({ conversation: testConv2Id, user: TEST_ENTITY_IDS.testUser3 }),
  ]);

  // Test Conversation 3
  const testConv3Id = TEST_ENTITY_IDS.testConversation3;
  await db.transact([
    tx.conversations[testConv3Id].update({
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      lastMessageAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      type: 'direct',
      status: 'accepted',
    }),
    tx.conversations[testConv3Id].link({
      requestedBy: TEST_ENTITY_IDS.testUser1,
    }),
  ]);

  await db.transact([
    tx.conversationParticipants[id()]
      .update({
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastReadAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      })
      .link({ conversation: testConv3Id, user: TEST_ENTITY_IDS.testUser1 }),
    tx.conversationParticipants[id()]
      .update({
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        lastReadAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      })
      .link({ conversation: testConv3Id, user: TEST_ENTITY_IDS.testUser3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST THREADS ==========
  console.log('  Creating deterministic E2E test threads...');

  // Test Thread 1
  const testThread1Id = TEST_ENTITY_IDS.testThread1;
  await db.transact([
    tx.threads[testThread1Id]
      .update({
        title: 'E2E Test Thread 1 - General Discussion',
        description: 'First test thread for E2E testing',
        upvotes: 5,
        downvotes: 1,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      })
      .link({ creator: TEST_ENTITY_IDS.testUser1, group: TEST_ENTITY_IDS.testGroup1 }),
  ]);

  // Test Thread 2
  const testThread2Id = TEST_ENTITY_IDS.testThread2;
  await db.transact([
    tx.threads[testThread2Id]
      .update({
        title: 'E2E Test Thread 2 - Feature Request',
        description: 'Second test thread for E2E testing',
        upvotes: 12,
        downvotes: 3,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      })
      .link({ creator: TEST_ENTITY_IDS.testUser2, group: TEST_ENTITY_IDS.testGroup2 }),
  ]);

  // Test Thread 3
  const testThread3Id = TEST_ENTITY_IDS.testThread3;
  await db.transact([
    tx.threads[testThread3Id]
      .update({
        title: 'E2E Test Thread 3 - Bug Report',
        description: 'Third test thread for E2E testing',
        upvotes: 8,
        downvotes: 2,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .link({ creator: TEST_ENTITY_IDS.testUser3, group: TEST_ENTITY_IDS.testGroup3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST AGENDA ITEMS ==========
  console.log('  Creating deterministic E2E test agenda items...');

  // Test Agenda Item 1 - Linked to testEvent1
  const testAgenda1Id = TEST_ENTITY_IDS.testAgendaItem1;
  await db.transact([
    tx.agendaItems[testAgenda1Id]
      .update({
        title: 'E2E Test Agenda Item 1',
        description: 'First test agenda item',
        order: 1,
        status: 'pending',
        type: 'discussion',
        duration: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ event: TEST_ENTITY_IDS.testEvent1 }),
  ]);

  // Test Agenda Item 2 - Linked to testEvent2
  const testAgenda2Id = TEST_ENTITY_IDS.testAgendaItem2;
  await db.transact([
    tx.agendaItems[testAgenda2Id]
      .update({
        title: 'E2E Test Agenda Item 2',
        description: 'Second test agenda item',
        order: 1,
        status: 'in-progress',
        type: 'vote',
        duration: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ event: TEST_ENTITY_IDS.testEvent2 }),
  ]);

  // Test Agenda Item 3 - Linked to testEvent3
  const testAgenda3Id = TEST_ENTITY_IDS.testAgendaItem3;
  await db.transact([
    tx.agendaItems[testAgenda3Id]
      .update({
        title: 'E2E Test Agenda Item 3',
        description: 'Third test agenda item',
        order: 1,
        status: 'completed',
        type: 'presentation',
        duration: 60,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      })
      .link({ event: TEST_ENTITY_IDS.testEvent3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST ELECTIONS ==========
  console.log('  Creating deterministic E2E test elections...');

  // Test Election 1 - Active
  const testElection1Id = TEST_ENTITY_IDS.testElection1;
  await db.transact([
    tx.elections[testElection1Id]
      .update({
        title: 'E2E Test Election 1 - Board Member Election',
        description: 'First test election for E2E testing',
        status: 'active',
        isMultipleChoice: false,
        majorityType: 'simple',
        votingStartTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        votingEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      })
      .link({ group: TEST_ENTITY_IDS.testGroup1 }),
  ]);

  // Test Election 2 - Completed
  const testElection2Id = TEST_ENTITY_IDS.testElection2;
  await db.transact([
    tx.elections[testElection2Id]
      .update({
        title: 'E2E Test Election 2 - Policy Vote',
        description: 'Second test election for E2E testing',
        status: 'completed',
        isMultipleChoice: true,
        majorityType: 'absolute',
        maxSelections: 3,
        votingStartTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        votingEndTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      })
      .link({ group: TEST_ENTITY_IDS.testGroup2 }),
  ]);

  // Test Election 3 - Pending
  const testElection3Id = TEST_ENTITY_IDS.testElection3;
  await db.transact([
    tx.elections[testElection3Id]
      .update({
        title: 'E2E Test Election 3 - Future Vote',
        description: 'Third test election for E2E testing',
        status: 'pending',
        isMultipleChoice: false,
        majorityType: 'simple',
        votingStartTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        votingEndTime: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ group: TEST_ENTITY_IDS.testGroup3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST MEETING SLOTS ==========
  console.log('  Creating deterministic E2E test meeting slots...');

  // Test Meeting Slot 1 - Available
  const testMeeting1Id = TEST_ENTITY_IDS.testMeetingSlot1;
  await db.transact([
    tx.meetingSlots[testMeeting1Id]
      .update({
        title: 'E2E Test Meeting Slot 1',
        description: 'First test meeting slot',
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        isPublic: true,
        isAvailable: true,
        meetingType: 'one-on-one',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ user: TEST_ENTITY_IDS.testUser1 }),
  ]);

  // Test Meeting Slot 2 - Booked
  const testMeeting2Id = TEST_ENTITY_IDS.testMeetingSlot2;
  await db.transact([
    tx.meetingSlots[testMeeting2Id]
      .update({
        title: 'E2E Test Meeting Slot 2',
        description: 'Second test meeting slot',
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000),
        isPublic: false,
        isAvailable: false,
        meetingType: 'public-meeting',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ user: TEST_ENTITY_IDS.testUser2 }),
  ]);

  // Test Meeting Slot 3 - Available
  const testMeeting3Id = TEST_ENTITY_IDS.testMeetingSlot3;
  await db.transact([
    tx.meetingSlots[testMeeting3Id]
      .update({
        title: 'E2E Test Meeting Slot 3',
        description: 'Third test meeting slot',
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        isPublic: true,
        isAvailable: true,
        meetingType: 'one-on-one',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .link({ user: TEST_ENTITY_IDS.testUser3 }),
  ]);

  // ========== CREATE DETERMINISTIC E2E TEST PAYMENTS ==========
  console.log('  Creating deterministic E2E test payments...');

  // Test Payment 1
  const testPayment1Id = TEST_ENTITY_IDS.testPayment1;
  await db.transact([
    tx.payments[testPayment1Id]
      .update({
        label: 'E2E Test Payment 1 - Membership Fee',
        amount: 5000, // $50.00
        type: 'membership',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      })
      .link({ user: TEST_ENTITY_IDS.testUser1 }),
  ]);

  // Test Payment 2
  const testPayment2Id = TEST_ENTITY_IDS.testPayment2;
  await db.transact([
    tx.payments[testPayment2Id]
      .update({
        label: 'E2E Test Payment 2 - Donation',
        amount: 10000, // $100.00
        type: 'donation',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      })
      .link({ user: TEST_ENTITY_IDS.testUser2 }),
  ]);

  // Test Payment 3
  const testPayment3Id = TEST_ENTITY_IDS.testPayment3;
  await db.transact([
    tx.payments[testPayment3Id]
      .update({
        label: 'E2E Test Payment 3 - Event Ticket',
        amount: 2500, // $25.00
        type: 'ticket',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      })
      .link({ user: TEST_ENTITY_IDS.testUser3 }),
  ]);

  // Ensure each user has at least 3 events in the upcoming week
  const upcomingWeekStart = new Date(now);
  upcomingWeekStart.setHours(0, 0, 0, 0);
  const upcomingWeekEnd = new Date(upcomingWeekStart);
  upcomingWeekEnd.setDate(upcomingWeekEnd.getDate() + 7);

  // Track which users have events in the upcoming week
  const userUpcomingEvents: Record<string, string[]> = {};
  for (const userId of userIds) {
    userUpcomingEvents[userId] = [];
  }

  // First, seed normal group events as before
  for (const groupId of groupIds) {
    const eventCount = randomInt(SEED_CONFIG.eventsPerGroup.min, SEED_CONFIG.eventsPerGroup.max);
    for (let i = 0; i < eventCount; i++) {
      const eventId = id();
      const organizerId = randomItem(userIds);
      // Randomize event date, but some in upcoming week
      let startDate;
      if (faker.datatype.boolean(0.4)) {
        // 40% chance event is in upcoming week
        startDate = new Date(upcomingWeekStart);
        startDate.setDate(startDate.getDate() + randomInt(0, 6));
        startDate.setHours(randomInt(9, 18), randomInt(0, 3) * 15, 0, 0);
      } else {
        startDate = faker.date.future({ years: 1 });
      }
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + randomInt(1, 4));

      eventIds.push(eventId);
      transactions.push(
        tx.events[eventId]
          .update({
            title: faker.lorem.words(randomInt(3, 6)),
            description: faker.lorem.paragraphs(2),
            location: `${faker.location.streetAddress()}, ${faker.location.city()}`,
            startDate,
            endDate,
            isPublic: faker.datatype.boolean(0.8),
            capacity: randomInt(20, 200),
            imageURL: faker.image.url(),
            tags: randomItems(
              ['conference', 'workshop', 'meetup', 'seminar', 'social', 'networking'],
              randomInt(1, 3)
            ),
            createdAt: faker.date.past({ years: 0.17 }),
            updatedAt: new Date(),
            visibility: randomVisibility(),
          })
          .link({ organizer: organizerId, group: groupId })
      );

      // Add participants
      const participantCount = randomInt(
        SEED_CONFIG.participantsPerEvent.min,
        SEED_CONFIG.participantsPerEvent.max
      );
      const participants = randomItems(userIds, participantCount);
      for (const participantId of participants) {
        const eventParticipantId = id();
        const status = randomItem(['member', 'member', 'member', 'admin']);
        transactions.push(
          tx.eventParticipants[eventParticipantId]
            .update({
              status,
              createdAt: faker.date.past({ years: 0.08 }),
              visibility: randomVisibility(),
            })
            .link({ user: participantId, event: eventId })
        );
        totalParticipants++;
        // Track if event is in upcoming week
        if (startDate >= upcomingWeekStart && startDate < upcomingWeekEnd) {
          userUpcomingEvents[participantId].push(eventId);
        }
      }
      // Track organizer
      if (startDate >= upcomingWeekStart && startDate < upcomingWeekEnd) {
        userUpcomingEvents[organizerId].push(eventId);
      }
      // Add hashtags for this event
      const eventHashtags = randomItems(EVENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(eventId, 'event', eventHashtags));
      totalEvents++;
    }
  }

  // For each user, ensure at least 3 events in upcoming week
  for (const userId of userIds) {
    let count = userUpcomingEvents[userId].length;
    while (count < 3) {
      // Create a new event in upcoming week for this user
      const eventId = id();
      const startDate = new Date(upcomingWeekStart);
      startDate.setDate(startDate.getDate() + randomInt(0, 6));
      startDate.setHours(randomInt(9, 18), randomInt(0, 3) * 15, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + randomInt(1, 4));
      eventIds.push(eventId);
      transactions.push(
        tx.events[eventId]
          .update({
            title: faker.lorem.words(randomInt(3, 6)),
            description: faker.lorem.paragraphs(2),
            location: `${faker.location.streetAddress()}, ${faker.location.city()}`,
            startDate,
            endDate,
            isPublic: faker.datatype.boolean(0.8),
            capacity: randomInt(20, 200),
            imageURL: faker.image.url(),
            tags: randomItems(
              ['conference', 'workshop', 'meetup', 'seminar', 'social', 'networking'],
              randomInt(1, 3)
            ),
            createdAt: faker.date.past({ years: 0.17 }),
            updatedAt: new Date(),
            visibility: randomVisibility(),
          })
          .link({ organizer: userId, group: randomItem(groupIds) })
      );
      // Add user as participant
      const eventParticipantId = id();
      transactions.push(
        tx.eventParticipants[eventParticipantId]
          .update({
            status: 'member',
            createdAt: faker.date.past({ years: 0.08 }),
            visibility: randomVisibility(),
          })
          .link({ user: userId, event: eventId })
      );
      totalParticipants++;
      userUpcomingEvents[userId].push(eventId);
      count++;
      // Add hashtags for this event
      const eventHashtags = randomItems(EVENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(eventId, 'event', eventHashtags));
      totalEvents++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${totalEvents} events with ${totalParticipants} participants`);
  return eventIds;
}

async function seedNotifications(
  userIds: string[],
  groupIds: string[],
  amendmentIds: string[],
  eventIds: string[],
  blogIds: string[]
) {
  console.log('Seeding notifications...');
  const transactions = [];
  let totalNotifications = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;

  const notificationTypes = [
    'group_invite',
    'event_invite',
    'message',
    'follow',
    'mention',
    'like',
    'comment',
    'amendment_update',
  ];

  const entityNotificationTypes = [
    'membership_request',
    'membership_withdrawn',
    'participation_request',
    'participation_withdrawn',
    'collaboration_request',
    'collaboration_withdrawn',
  ];

  // Create 10 notifications for main user (mix of read/unread)
  for (let i = 0; i < 10; i++) {
    const notificationId = id();
    const senderId = randomItem(userIds.filter(uid => uid !== mainUserId));
    const type = randomItem(notificationTypes);
    const relatedType = randomItem(['group', 'event', 'user', 'amendment', 'blog']);
    const relatedEntityId = randomItem(
      relatedType === 'group'
        ? groupIds
        : relatedType === 'event'
          ? eventIds
          : relatedType === 'amendment'
            ? amendmentIds
            : relatedType === 'blog'
              ? blogIds
              : userIds
    );

    transactions.push(
      tx.notifications[notificationId]
        .update({
          type,
          title: faker.lorem.words(randomInt(3, 5)),
          message: faker.lorem.sentence(),
          isRead: i < 4, // First 4 are read, rest are unread
          createdAt: faker.date.recent({ days: i < 4 ? 7 : 2 }), // Recent ones are unread
          relatedEntityType: relatedType,
          actionUrl: faker.internet.url(),
        })
        .link({
          recipient: mainUserId,
          sender: senderId,
          ...(relatedType === 'group'
            ? { relatedGroup: relatedEntityId }
            : relatedType === 'event'
              ? { relatedEvent: relatedEntityId }
              : relatedType === 'amendment'
                ? { relatedAmendment: relatedEntityId }
                : relatedType === 'blog'
                  ? { relatedBlog: relatedEntityId }
                  : { relatedUser: relatedEntityId }),
        })
    );
    totalNotifications++;
  }

  // Create entity-based notifications (sent to entities, not users)
  // Group notifications
  for (const groupId of groupIds.slice(0, 3)) {
    const notificationCount = randomInt(2, 5);

    for (let i = 0; i < notificationCount; i++) {
      const notificationId = id();
      const senderId = randomItem(userIds);
      const type = randomItem(entityNotificationTypes.filter(t => t.includes('membership')));

      transactions.push(
        tx.notifications[notificationId]
          .update({
            type,
            title: faker.lorem.words(randomInt(3, 5)),
            message: faker.lorem.sentence(),
            isRead: faker.datatype.boolean(0.3), // 30% read
            createdAt: faker.date.recent({ days: 7 }),
            relatedEntityType: 'group',
            recipientEntityType: 'group',
            recipientEntityId: groupId,
            actionUrl: `/group/${groupId}/memberships`,
          })
          .link({
            sender: senderId,
            relatedGroup: groupId,
            recipientGroup: groupId,
            relatedUser: senderId,
          })
      );
      totalNotifications++;
    }
  }

  // Event notifications
  for (const eventId of eventIds.slice(0, 3)) {
    const notificationCount = randomInt(1, 3);

    for (let i = 0; i < notificationCount; i++) {
      const notificationId = id();
      const senderId = randomItem(userIds);
      const type = randomItem(entityNotificationTypes.filter(t => t.includes('participation')));

      transactions.push(
        tx.notifications[notificationId]
          .update({
            type,
            title: faker.lorem.words(randomInt(3, 5)),
            message: faker.lorem.sentence(),
            isRead: faker.datatype.boolean(0.3), // 30% read
            createdAt: faker.date.recent({ days: 7 }),
            relatedEntityType: 'event',
            recipientEntityType: 'event',
            recipientEntityId: eventId,
            actionUrl: `/event/${eventId}/participants`,
          })
          .link({
            sender: senderId,
            relatedEvent: eventId,
            recipientEvent: eventId,
            relatedUser: senderId,
          })
      );
      totalNotifications++;
    }
  }

  // Amendment notifications
  for (const amendmentId of amendmentIds.slice(0, 3)) {
    const notificationCount = randomInt(1, 3);

    for (let i = 0; i < notificationCount; i++) {
      const notificationId = id();
      const senderId = randomItem(userIds);
      const type = randomItem(entityNotificationTypes.filter(t => t.includes('collaboration')));

      transactions.push(
        tx.notifications[notificationId]
          .update({
            type,
            title: faker.lorem.words(randomInt(3, 5)),
            message: faker.lorem.sentence(),
            isRead: faker.datatype.boolean(0.3), // 30% read
            createdAt: faker.date.recent({ days: 7 }),
            relatedEntityType: 'amendment',
            recipientEntityType: 'amendment',
            recipientEntityId: amendmentId,
            actionUrl: `/amendment/${amendmentId}/collaborators`,
          })
          .link({
            sender: senderId,
            relatedAmendment: amendmentId,
            recipientAmendment: amendmentId,
            relatedUser: senderId,
          })
      );
      totalNotifications++;
    }
  }

  // Create notifications for other users
  for (const userId of userIds) {
    if (userId === mainUserId) continue; // Skip main user, already handled

    const notificationCount = randomInt(
      SEED_CONFIG.notificationsPerUser.min,
      SEED_CONFIG.notificationsPerUser.max
    );

    for (let i = 0; i < notificationCount; i++) {
      const notificationId = id();
      const senderId = randomItem(userIds.filter(uid => uid !== userId));
      const type = randomItem(notificationTypes);
      const relatedType = randomItem(['group', 'event', 'user', 'amendment', 'blog']);
      const relatedEntityId = randomItem(
        relatedType === 'group'
          ? groupIds
          : relatedType === 'event'
            ? eventIds
            : relatedType === 'amendment'
              ? amendmentIds
              : relatedType === 'blog'
                ? blogIds
                : userIds
      );

      transactions.push(
        tx.notifications[notificationId]
          .update({
            type,
            title: faker.lorem.words(randomInt(3, 5)),
            message: faker.lorem.sentence(),
            isRead: faker.datatype.boolean(0.4), // 40% read
            createdAt: faker.date.recent({ days: 7 }),
            relatedEntityType: relatedType,
            actionUrl: faker.internet.url(),
          })
          .link({
            recipient: userId,
            sender: senderId,
            ...(relatedType === 'group'
              ? { relatedGroup: relatedEntityId }
              : relatedType === 'event'
                ? { relatedEvent: relatedEntityId }
                : relatedType === 'amendment'
                  ? { relatedAmendment: relatedEntityId }
                  : relatedType === 'blog'
                    ? { relatedBlog: relatedEntityId }
                    : { relatedUser: relatedEntityId }),
          })
      );
      totalNotifications++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${totalNotifications} notifications (including entity notifications)`);
}

async function seedAgendaAndVoting(userIds: string[], eventIds: string[], positionIds: string[]) {
  console.log('Seeding agenda items and voting system...');
  const transactions = [];
  let totalAgendaItems = 0;
  let totalElections = 0;
  let totalAmendmentVotes = 0;
  let totalChangeRequests = 0;
  let totalVotes = 0;

  const agendaTypes = ['election', 'vote', 'speech', 'discussion'];
  const voteStatuses = ['planned', 'active', 'completed'];
  const majorityTypes = ['relative', 'absolute'];

  for (const eventId of eventIds) {
    const agendaItemCount = randomInt(2, 5); // 2-5 agenda items per event

    for (let i = 0; i < agendaItemCount; i++) {
      const agendaItemId = id();
      const creatorId = randomItem(userIds);
      const type = randomItem(agendaTypes);
      const startTime = faker.date.future({ years: 0.5 });

      // Create agenda item
      transactions.push(
        tx.agendaItems[agendaItemId]
          .update({
            title: faker.lorem.words(randomInt(3, 6)),
            description: faker.lorem.paragraph(),
            type,
            scheduledTime: startTime,
            duration: randomInt(15, 120), // 15-120 minutes
            status: randomItem(voteStatuses),
            order: i + 1,
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ creator: creatorId, event: eventId })
      );
      totalAgendaItems++;

      // Create elections for election-type agenda items (ONLY ONE per agenda item due to unique constraint)
      if (type === 'election' || faker.datatype.boolean(0.3)) {
        // 30% chance for non-election types too
        const electionId = id();
        const majorityType = randomItem(majorityTypes);
        // Always link to a random position (positions are seeded before elections)
        const positionId = randomItem(positionIds);

        const electionTx = tx.elections[electionId]
          .update({
            title: `${faker.lorem.words(2)} Wahl`,
            description: faker.lorem.sentence(),
            majorityType,
            isMultipleChoice: faker.datatype.boolean(0.3), // 30% allow multiple choices
            status: randomItem(voteStatuses),
            votingStartTime: startTime,
            votingEndTime: new Date(startTime.getTime() + randomInt(30, 180) * 60000), // 30-180 minutes later
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ agendaItem: agendaItemId, position: positionId });

        transactions.push(electionTx);
        totalElections++;

        // Add election candidates
        const candidateCount = randomInt(2, 5);
        const candidates = randomItems(userIds, candidateCount);

        for (const candidateUserId of candidates) {
          const candidateId = id();
          transactions.push(
            tx.electionCandidates[candidateId]
              .update({
                name: faker.person.fullName(),
                description: faker.lorem.sentence(),
                order: candidates.indexOf(candidateUserId) + 1,
                createdAt: faker.date.past({ years: 0.04 }),
              })
              .link({ election: electionId, user: candidateUserId })
          );
        }

        // Add election votes (some elections have votes, some don't)
        if (faker.datatype.boolean(0.6)) {
          // 60% of elections have votes
          const voterCount = randomInt(3, Math.min(8, userIds.length));
          const voters = randomItems(userIds, voterCount);

          for (const voterId of voters) {
            const voteId = id();
            const votedCandidateId = randomItem(candidates);

            // Create vote with past date (votes can only happen in past/present)
            const voteCreatedAt = faker.date.recent({ days: 30 });

            transactions.push(
              tx.electionVotes[voteId]
                .update({
                  createdAt: voteCreatedAt,
                })
                .link({
                  election: electionId,
                  voter: voterId,
                  candidate: votedCandidateId,
                })
            );
            totalVotes++;
          }
        }
      }

      // Create amendment votes for vote-type agenda items (ONLY ONE per agenda item due to unique constraint)
      if (type === 'vote' || faker.datatype.boolean(0.4)) {
        // 40% chance for non-vote types
        const amendmentVoteId = id();

        transactions.push(
          tx.amendmentVotes[amendmentVoteId]
            .update({
              title: `Abstimmung: ${faker.lorem.words(3)}`,
              description: faker.lorem.paragraph(),
              originalText: faker.lorem.paragraphs(2),
              proposedText: faker.lorem.paragraphs(2),
              status: randomItem(voteStatuses),
              votingStartTime: startTime,
              votingEndTime: new Date(startTime.getTime() + randomInt(30, 120) * 60000),
              createdAt: faker.date.past({ years: 0.08 }),
              updatedAt: new Date(),
            })
            .link({ agendaItem: agendaItemId })
        );
        totalAmendmentVotes++;

        // Add change requests
        const changeRequestCount = randomInt(0, 3);
        for (let k = 0; k < changeRequestCount; k++) {
          const changeRequestId = id();
          const submitterId = randomItem(userIds);

          transactions.push(
            tx.changeRequests[changeRequestId]
              .update({
                title: `Änderungsantrag ${k + 1}`,
                description: faker.lorem.sentence(),
                proposedChange: faker.lorem.paragraph(),
                status: randomItem(['pending', 'approved', 'rejected']),
                createdAt: faker.date.past({ years: 0.04 }),
                updatedAt: new Date(),
              })
              .link({ amendmentVote: amendmentVoteId, creator: submitterId })
          );
          totalChangeRequests++;

          // Add votes on change requests
          if (faker.datatype.boolean(0.5)) {
            // 50% of change requests have votes
            const voterCount = randomInt(2, 6);
            const voters = randomItems(userIds, voterCount);

            for (const voterId of voters) {
              const voteId = id();
              transactions.push(
                tx.changeRequestVotes[voteId]
                  .update({
                    vote: randomItem(['yes', 'no', 'abstain']),
                    createdAt: faker.date.recent({ days: 14 }),
                  })
                  .link({ changeRequest: changeRequestId, voter: voterId })
              );
              totalVotes++;
            }
          }
        }

        // Add amendment vote entries (main votes on the amendment)
        if (faker.datatype.boolean(0.7)) {
          // 70% of amendments have votes
          const voterCount = randomInt(5, Math.min(12, userIds.length));
          const voters = randomItems(userIds, voterCount);

          for (const voterId of voters) {
            const voteEntryId = id();

            // Create vote with past date (votes can only happen in past/present)
            const voteCreatedAt = faker.date.recent({ days: 30 });

            transactions.push(
              tx.amendmentVoteEntries[voteEntryId]
                .update({
                  vote: randomItem(['yes', 'yes', 'no', 'abstain']), // More yes votes
                  createdAt: voteCreatedAt,
                })
                .link({ amendmentVote: amendmentVoteId, voter: voterId })
            );
            totalVotes++;
          }
        }
      }
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} agenda and voting records...`);
  await batchTransact(transactions);

  console.log(`✓ Created ${totalAgendaItems} agenda items with:`);
  console.log(`  - ${totalElections} elections`);
  console.log(`  - ${totalAmendmentVotes} amendment votes`);
  console.log(`  - ${totalChangeRequests} change requests`);
  console.log(`  - ${totalVotes} total votes across all voting types`);
}

async function seedTodos(userIds: string[], groupIds: string[]) {
  console.log('Seeding todos...');
  const transactions = [];
  let totalTodos = 0;
  let totalAssignments = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;

  const statuses = ['todo', 'in_progress', 'completed', 'cancelled'];
  const priorities = ['low', 'medium', 'high', 'urgent'];

  // First, ensure every group has at least one todo
  for (const groupId of groupIds) {
    const todoId = id();
    const creatorId = randomItem(userIds);
    const status = randomItem(statuses);
    const createdAt = faker.date.past({ years: 0.17 });
    const dueDate = status === 'completed' ? null : faker.date.future({ years: 0.08 });
    const completedAt =
      status === 'completed' ? faker.date.between({ from: createdAt, to: new Date() }) : null;

    // Create guaranteed todo for this group
    let todoTx = tx.todos[todoId].update({
      title: faker.lorem.words(randomInt(3, 6)),
      description: faker.lorem.paragraph(),
      status,
      priority: randomItem(priorities),
      dueDate,
      completedAt,
      tags: randomItems(
        ['urgent', 'important', 'review', 'bug', 'feature', 'documentation'],
        randomInt(1, 3)
      ),
      createdAt,
      updatedAt: new Date(),
      visibility: randomVisibility(),
    });

    todoTx = todoTx.link({ creator: creatorId, group: groupId });
    transactions.push(todoTx);

    // Add assignment to creator
    const assignmentId = id();
    transactions.push(
      tx.todoAssignments[assignmentId]
        .update({
          assignedAt: createdAt,
          role: 'owner',
        })
        .link({ user: creatorId, todo: todoId })
    );
    totalAssignments++;
    totalTodos++;
  }

  // Create 5 todos for main user with varied statuses
  for (let i = 0; i < 5; i++) {
    const todoId = id();
    const status = ['todo', 'in_progress', 'completed', 'todo', 'completed'][i];
    const priority = ['high', 'medium', 'urgent', 'low', 'medium'][i];
    const groupId = i < 2 ? randomItem(groupIds) : null; // First 2 linked to groups

    const createdAt = faker.date.past({ years: 0.17 });
    const dueDate = status === 'completed' ? null : faker.date.future({ years: 0.08 });
    const completedAt =
      status === 'completed' ? faker.date.between({ from: createdAt, to: new Date() }) : null;

    const titles = [
      'Review project documentation',
      'Prepare for team meeting',
      'Complete feature implementation',
      'Update user guidelines',
      'Review pull requests',
    ];

    // Create todo
    let todoTx = tx.todos[todoId].update({
      title: titles[i],
      description: faker.lorem.paragraph(),
      status,
      priority,
      dueDate,
      completedAt,
      tags: i < 2 ? ['urgent', 'important'] : ['feature', 'review'],
      createdAt,
      updatedAt: new Date(),
      visibility: randomVisibility(),
    });

    if (groupId) {
      todoTx = todoTx.link({ creator: mainUserId, group: groupId });
    } else {
      todoTx = todoTx.link({ creator: mainUserId });
    }

    transactions.push(todoTx);

    // Add assignment to main user (owner)
    const mainAssignmentId = id();
    transactions.push(
      tx.todoAssignments[mainAssignmentId]
        .update({
          assignedAt: createdAt,
          role: 'owner',
        })
        .link({ user: mainUserId, todo: todoId })
    );
    totalAssignments++;

    // Add 1-2 additional assignees for some todos
    if (i < 3) {
      const additionalAssignees = randomItems(
        userIds.filter(uid => uid !== mainUserId),
        randomInt(1, 2)
      );

      for (const assigneeId of additionalAssignees) {
        const assignmentId = id();
        transactions.push(
          tx.todoAssignments[assignmentId]
            .update({
              assignedAt: faker.date.between({ from: createdAt, to: new Date() }),
              role: 'collaborator',
            })
            .link({ user: assigneeId, todo: todoId })
        );
        totalAssignments++;
      }
    }

    totalTodos++;
  }

  // Create todos for other users
  for (const userId of userIds) {
    if (userId === mainUserId) continue; // Skip main user, already handled

    const todoCount = randomInt(SEED_CONFIG.todosPerUser.min, SEED_CONFIG.todosPerUser.max);

    for (let i = 0; i < todoCount; i++) {
      const todoId = id();
      const status = randomItem(statuses);
      const groupId = randomItem([...groupIds, null, null]); // Some todos not linked to groups

      const createdAt = faker.date.past({ years: 0.17 });
      const dueDate = faker.date.future({ years: 0.08 });
      const completedAt =
        status === 'completed' ? faker.date.between({ from: createdAt, to: new Date() }) : null;

      // Create todo
      let todoTx = tx.todos[todoId].update({
        title: faker.lorem.words(randomInt(3, 6)),
        description: faker.lorem.paragraph(),
        status,
        priority: randomItem(priorities),
        dueDate,
        completedAt,
        tags: randomItems(
          ['urgent', 'important', 'review', 'bug', 'feature', 'documentation'],
          randomInt(0, 3)
        ),
        createdAt,
        updatedAt: new Date(),
      });

      if (groupId) {
        todoTx = todoTx.link({ creator: userId, group: groupId });
      } else {
        todoTx = todoTx.link({ creator: userId });
      }

      transactions.push(todoTx);

      // Add assignments
      const assignmentCount = randomInt(
        SEED_CONFIG.todoAssignmentsPerTodo.min,
        SEED_CONFIG.todoAssignmentsPerTodo.max
      );
      const assignees = randomItems(userIds, assignmentCount);

      for (const assigneeId of assignees) {
        const assignmentId = id();
        transactions.push(
          tx.todoAssignments[assignmentId]
            .update({
              assignedAt: faker.date.between({ from: createdAt, to: new Date() }),
              role:
                assigneeId === userId
                  ? 'owner'
                  : randomItem(['collaborator', 'reviewer', 'collaborator']),
            })
            .link({ user: assigneeId, todo: todoId })
        );
        totalAssignments++;
      }

      totalTodos++;
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} todo-related records...`);
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalTodos} todos with ${totalAssignments} assignments (each group has at least 1 todo, main user: 5 todos)`
  );
}

async function seedPositions(groupIds: string[]) {
  console.log('Seeding positions...');
  const transactions = [];
  const positionIds: string[] = [];
  let totalPositions = 0;

  const positionTitles = [
    'President',
    'Vice President',
    'Secretary',
    'Treasurer',
    'Board Member',
    'Committee Chair',
    'Regional Representative',
    'Communications Director',
    'Events Coordinator',
    'Membership Coordinator',
  ];

  const positionDescriptions = [
    'Leads the organization and represents it externally',
    'Supports the president and acts in their absence',
    'Manages documentation and communications',
    'Oversees financial matters and budgets',
    'Participates in strategic decision-making',
    'Leads specific committee activities',
    'Represents regional interests',
    'Manages external communications and media',
    'Organizes and coordinates events',
    'Manages member relations and recruitment',
  ];

  for (const groupId of groupIds) {
    const positionCount = randomInt(
      SEED_CONFIG.positionsPerGroup.min,
      SEED_CONFIG.positionsPerGroup.max
    );

    for (let i = 0; i < positionCount; i++) {
      const positionId = id();
      const titleIndex = randomInt(0, positionTitles.length - 1);
      const term = randomItem([6, 12, 24, 36]); // 6 months, 1 year, 2 years, or 3 years
      const firstTermStart = faker.date.past({ years: 2 });

      positionIds.push(positionId);

      transactions.push(
        tx.positions[positionId]
          .update({
            title: positionTitles[titleIndex],
            description: positionDescriptions[titleIndex],
            term,
            firstTermStart,
            createdAt: faker.date.past({ years: 1 }),
            updatedAt: new Date(),
          })
          .link({ group: groupId })
      );

      totalPositions++;
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} position records...`);
  await batchTransact(transactions);

  console.log(`✓ Created ${totalPositions} positions across all groups`);
  return positionIds;
}

async function seedLinks(groupIds: string[]) {
  console.log('Seeding links...');
  const transactions = [];
  let totalLinks = 0;

  const linkLabels = [
    'Website',
    'Facebook Page',
    'Twitter/X',
    'Instagram',
    'LinkedIn',
    'Discord Server',
    'Telegram Channel',
    'YouTube Channel',
    'GitHub Repository',
    'Newsletter',
    'Donation Page',
    'Meeting Calendar',
  ];

  const linkUrls = [
    'https://example.org',
    'https://facebook.com/example',
    'https://twitter.com/example',
    'https://instagram.com/example',
    'https://linkedin.com/company/example',
    'https://discord.gg/example',
    'https://t.me/example',
    'https://youtube.com/@example',
    'https://github.com/example',
    'https://example.org/newsletter',
    'https://donate.example.org',
    'https://calendar.example.org',
  ];

  for (const groupId of groupIds) {
    // Each group gets 2-5 links
    const numLinks = randomInt(2, 5);
    const selectedIndices = randomItems([...Array(linkLabels.length).keys()], numLinks);

    for (const idx of selectedIndices) {
      const linkId = id();
      totalLinks++;

      transactions.push(
        tx.links[linkId]
          .update({
            label: linkLabels[idx],
            url: linkUrls[idx],
            createdAt: faker.date.past({ years: 1 }),
          })
          .link({ group: groupId })
      );
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${totalLinks} links across all groups`);
}

async function seedPayments(userIds: string[], groupIds: string[]) {
  console.log('Seeding payments...');
  const transactions = [];
  let totalPayments = 0;

  const paymentTypes = [
    'membership_fee',
    'donation',
    'subsidies',
    'others',
    'campaign',
    'material',
    'events',
  ];

  const paymentLabels = {
    membership_fee: ['Annual Membership', 'Monthly Membership', 'Student Membership'],
    donation: ['General Donation', 'Campaign Donation', 'Building Fund'],
    subsidies: ['Government Grant', 'Foundation Grant', 'Corporate Sponsorship'],
    others: ['Miscellaneous Payment', 'Reimbursement', 'Other Income'],
    campaign: ['Campaign Contribution', 'Election Fund', 'Advertising Budget'],
    material: ['Office Supplies', 'Promotional Materials', 'Equipment Purchase'],
    events: ['Event Ticket', 'Conference Registration', 'Catering Payment'],
  };

  // Create payments for each group
  for (const groupId of groupIds) {
    // First, ensure at least one payment where this group is the receiver (income)
    const incomePaymentId = id();
    const incomeType = randomItem(['membership_fee', 'donation', 'subsidies']);
    const incomeLabel = randomItem(paymentLabels[incomeType as keyof typeof paymentLabels]);
    const incomeAmount = randomInt(100, 5000);
    totalPayments++;

    let incomeTransaction = tx.payments[incomePaymentId].update({
      label: incomeLabel,
      type: incomeType,
      amount: incomeAmount,
      createdAt: faker.date.past({ years: 2 }),
    });

    // Link payer (user or another group) and receiver (this group)
    if (faker.datatype.boolean(0.7)) {
      // 70% chance payer is a user
      incomeTransaction = incomeTransaction.link({
        payerUser: randomItem(userIds),
        receiverGroup: groupId,
      });
    } else {
      // 30% chance payer is another group
      const otherGroups = groupIds.filter(gId => gId !== groupId);
      incomeTransaction = incomeTransaction.link({
        payerGroup: otherGroups.length > 0 ? randomItem(otherGroups) : randomItem(groupIds),
        receiverGroup: groupId,
      });
    }
    transactions.push(incomeTransaction);

    // Second, ensure at least one payment where this group is the payer (expense)
    const expensePaymentId = id();
    const expenseType = randomItem(['campaign', 'material', 'events', 'others']);
    const expenseLabel = randomItem(paymentLabels[expenseType as keyof typeof paymentLabels]);
    const expenseAmount = randomInt(50, 3000);
    totalPayments++;

    let expenseTransaction = tx.payments[expensePaymentId].update({
      label: expenseLabel,
      type: expenseType,
      amount: expenseAmount,
      createdAt: faker.date.past({ years: 2 }),
    });

    // Link payer (this group) and receiver (user or another group)
    if (faker.datatype.boolean(0.5)) {
      // 50% chance receiver is a user
      expenseTransaction = expenseTransaction.link({
        payerGroup: groupId,
        receiverUser: randomItem(userIds),
      });
    } else {
      // 50% chance receiver is another group
      const otherGroups = groupIds.filter(gId => gId !== groupId);
      expenseTransaction = expenseTransaction.link({
        payerGroup: groupId,
        receiverGroup: otherGroups.length > 0 ? randomItem(otherGroups) : randomItem(groupIds),
      });
    }
    transactions.push(expenseTransaction);

    // Then create additional random payments (3-13 more)
    const numAdditionalPayments = randomInt(3, 13);

    for (let i = 0; i < numAdditionalPayments; i++) {
      const paymentId = id();
      const paymentType = randomItem(paymentTypes);
      const label = randomItem(paymentLabels[paymentType as keyof typeof paymentLabels]);
      const amount = randomInt(10, 5000);
      totalPayments++;

      let transaction = tx.payments[paymentId].update({
        label,
        type: paymentType,
        amount,
        createdAt: faker.date.past({ years: 2 }),
      });

      // Randomly decide the payment direction and participants
      const direction = faker.datatype.boolean(0.6) ? 'income' : 'expense'; // 60% income, 40% expense

      if (direction === 'income') {
        // Group receives payment
        const payerIsUser = faker.datatype.boolean(0.7); // 70% users, 30% groups
        if (payerIsUser) {
          transaction = transaction.link({
            payerUser: randomItem(userIds),
            receiverGroup: groupId,
          });
        } else {
          const otherGroups = groupIds.filter(gId => gId !== groupId);
          transaction = transaction.link({
            payerGroup: otherGroups.length > 0 ? randomItem(otherGroups) : randomItem(groupIds),
            receiverGroup: groupId,
          });
        }
      } else {
        // Group pays
        const receiverIsUser = faker.datatype.boolean(0.5); // 50% users, 50% groups
        if (receiverIsUser) {
          transaction = transaction.link({
            payerGroup: groupId,
            receiverUser: randomItem(userIds),
          });
        } else {
          const otherGroups = groupIds.filter(gId => gId !== groupId);
          transaction = transaction.link({
            payerGroup: groupId,
            receiverGroup: otherGroups.length > 0 ? randomItem(otherGroups) : randomItem(groupIds),
          });
        }
      }

      transactions.push(transaction);
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} payment records...`);
  await batchTransact(transactions);

  console.log(`✓ Created ${totalPayments} payments across all groups`);
}

async function seedDocuments(userIds: string[]) {
  console.log('Seeding documents...');
  const transactions = [];
  let totalDocuments = 0;
  let totalCollaborators = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;

  // Sample document contents
  const documentContents = [
    [
      { type: 'h1', children: [{ text: 'Project Proposal: Community Garden Initiative' }] },
      {
        type: 'p',
        children: [
          {
            text: 'This proposal outlines our plan to create a community garden in the downtown area.',
          },
        ],
      },
      { type: 'h2', children: [{ text: 'Objectives' }] },
      { type: 'p', children: [{ text: '1. Provide fresh produce to local residents' }] },
      { type: 'p', children: [{ text: '2. Create a community gathering space' }] },
      { type: 'p', children: [{ text: '3. Promote sustainable agriculture practices' }] },
    ],
    [
      { type: 'h1', children: [{ text: 'Meeting Notes - March 2024' }] },
      { type: 'p', children: [{ text: 'Attendees: Team leads from all departments' }] },
      { type: 'h2', children: [{ text: 'Key Discussion Points' }] },
      { type: 'p', children: [{ text: '• Q1 goals achieved ahead of schedule' }] },
      { type: 'p', children: [{ text: '• New hiring initiative approved' }] },
      { type: 'p', children: [{ text: '• Budget reallocation for tech infrastructure' }] },
    ],
    [
      { type: 'h1', children: [{ text: 'Policy Draft: Remote Work Guidelines' }] },
      {
        type: 'p',
        children: [
          { text: 'Draft guidelines for remote work arrangements within our organization.' },
        ],
      },
      { type: 'h2', children: [{ text: 'Eligibility' }] },
      {
        type: 'p',
        children: [
          { text: 'All full-time employees with 6+ months tenure are eligible for remote work.' },
        ],
      },
      { type: 'h2', children: [{ text: 'Requirements' }] },
      { type: 'p', children: [{ text: '1. Stable internet connection (minimum 50 Mbps)' }] },
      { type: 'p', children: [{ text: '2. Dedicated workspace at home' }] },
      { type: 'p', children: [{ text: '3. Availability during core hours (10 AM - 3 PM)' }] },
    ],
    [
      { type: 'h1', children: [{ text: 'Event Planning: Annual Fundraiser' }] },
      { type: 'p', children: [{ text: 'Planning document for our annual fundraising gala.' }] },
      { type: 'h2', children: [{ text: 'Date & Venue' }] },
      { type: 'p', children: [{ text: 'Date: October 15, 2024' }] },
      { type: 'p', children: [{ text: 'Venue: Grand Hall, Downtown Convention Center' }] },
      { type: 'h2', children: [{ text: 'Budget Estimate' }] },
      { type: 'p', children: [{ text: 'Venue rental: $5,000' }] },
      { type: 'p', children: [{ text: 'Catering: $8,000' }] },
      { type: 'p', children: [{ text: 'Entertainment: $3,000' }] },
    ],
  ];

  const documentTitles = [
    'Community Garden Initiative',
    'Team Meeting Notes',
    'Remote Work Policy',
    'Annual Fundraiser Planning',
  ];

  const documentTags = [
    ['proposal', 'community', 'environment'],
    ['meeting', 'notes', 'team'],
    ['policy', 'hr', 'remote-work'],
    ['event', 'fundraiser', 'planning'],
  ];

  // Create 2 documents for main user
  for (let i = 0; i < 2; i++) {
    const docId = id();
    totalDocuments++;

    transactions.push(
      tx.documents[docId]
        .update({
          title: documentTitles[i],
          content: documentContents[i],
          createdAt: faker.date.past({ years: 0.5 }),
          updatedAt: faker.date.recent({ days: 7 }),
          isPublic: i === 0, // First document is public
          tags: documentTags[i],
        })
        .link({ owner: mainUserId })
    );

    // Add some collaborators to the first document
    if (i === 0) {
      const collaboratorCount = randomInt(2, 4);
      const collaborators = randomItems(
        userIds.filter(uid => uid !== mainUserId),
        collaboratorCount
      );

      for (const collaboratorId of collaborators) {
        const collabId = id();
        totalCollaborators++;

        transactions.push(
          tx.documentCollaborators[collabId]
            .update({
              canEdit: faker.datatype.boolean(0.7), // 70% can edit, 30% view-only
              addedAt: faker.date.past({ years: 0.3 }),
              visibility: randomVisibility(),
            })
            .link({ document: docId, user: collaboratorId })
        );
      }
    }
  }

  // Create documents for other users
  for (let i = 2; i < 10; i++) {
    const docId = id();
    const ownerId = randomItem(userIds);
    const contentIndex = i % documentContents.length;
    totalDocuments++;

    transactions.push(
      tx.documents[docId]
        .update({
          title: documentTitles[contentIndex] + ` (${faker.word.adjective()})`,
          content: documentContents[contentIndex],
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent({ days: 30 }),
          isPublic: faker.datatype.boolean(0.3), // 30% public
          tags: documentTags[contentIndex],
        })
        .link({ owner: ownerId })
    );

    // Add collaborators to some documents
    if (faker.datatype.boolean(0.5)) {
      const collaboratorCount = randomInt(1, 3);
      const collaborators = randomItems(
        userIds.filter(uid => uid !== ownerId),
        collaboratorCount
      );

      for (const collaboratorId of collaborators) {
        const collabId = id();
        totalCollaborators++;

        transactions.push(
          tx.documentCollaborators[collabId]
            .update({
              canEdit: faker.datatype.boolean(0.6),
              addedAt: faker.date.past({ years: 0.5 }),
              visibility: randomVisibility(),
            })
            .link({ document: docId, user: collaboratorId })
        );
      }
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} document-related records...`);
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalDocuments} documents with ${totalCollaborators} collaborators (main user: 2 documents)`
  );
}

// Delete all data including $users
async function seedMeetingSlots(userIds: string[]) {
  console.log('Seeding meeting slots and bookings...');
  const transactions = [];
  let totalSlots = 0;
  let totalBookings = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;
  const tobiasUserId = SEED_CONFIG.tobiasUserId;

  // Create meeting slots for ALL users
  // Also track meetings for calendar
  const userMeetings: Record<
    string,
    {
      slotId: string;
      startTime: Date;
      endTime: Date;
      ownerId: string;
      booked: boolean;
      bookerId?: string;
    }[]
  > = {};
  for (const userId of userIds) {
    userMeetings[userId] = [];
  }
  for (const userId of userIds) {
    const now = new Date();
    // Create 5-8 available time slots in the next week
    const availableSlotsCount = randomInt(5, 8);
    for (let i = 0; i < availableSlotsCount; i++) {
      const slotId = id();
      const daysAhead = randomInt(0, 7); // Next 7 days
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + daysAhead);
      startTime.setHours(randomInt(9, 16), randomInt(0, 3) * 15, 0, 0);
      const duration = randomInt(30, 90);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      transactions.push(
        tx.meetingSlots[slotId]
          .update({
            startTime,
            endTime,
            isPublic: false,
            isAvailable: true,
            title: `1-on-1 Meeting`,
            description: 'Available for booking',
            meetingType: 'one-on-one',
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ owner: userId })
      );
      totalSlots++;
      userMeetings[userId].push({ slotId, startTime, endTime, ownerId: userId, booked: false });
    }
    // Create 3-5 booked time slots in the next week
    const bookedSlotsCount = randomInt(3, 5);
    for (let i = 0; i < bookedSlotsCount; i++) {
      const slotId = id();
      const daysAhead = randomInt(0, 7);
      const startTime = new Date(now);
      startTime.setDate(startTime.getDate() + daysAhead);
      startTime.setHours(randomInt(9, 16), randomInt(0, 3) * 15, 0, 0);
      const duration = randomInt(30, 90);
      const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      const bookerId = randomItem(userIds.filter(uid => uid !== userId));
      transactions.push(
        tx.meetingSlots[slotId]
          .update({
            startTime,
            endTime,
            isPublic: false,
            isAvailable: false,
            title: `1-on-1 Meeting`,
            description: 'Booked',
            meetingType: 'one-on-one',
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ owner: userId })
      );
      totalSlots++;
      transactions.push(
        tx.meetingBookings[id()]
          .update({
            status: 'confirmed',
            notes: faker.lorem.sentence(),
            createdAt: faker.date.past({ years: 0.04 }),
            updatedAt: new Date(),
          })
          .link({ slot: slotId, booker: bookerId })
      );
      totalBookings++;
      // Track for calendar: owner and booker
      userMeetings[userId].push({
        slotId,
        startTime,
        endTime,
        ownerId: userId,
        booked: true,
        bookerId,
      });
      userMeetings[bookerId].push({
        slotId,
        startTime,
        endTime,
        ownerId: userId,
        booked: true,
        bookerId,
      });
    }
    // For main user and Tobias, add public meeting slots
    if (userId === mainUserId || userId === tobiasUserId) {
      const publicSlotId = id();
      const publicStartTime = new Date(now);
      publicStartTime.setDate(publicStartTime.getDate() + randomInt(1, 3));
      publicStartTime.setHours(14, 0, 0, 0);
      const publicEndTime = new Date(publicStartTime.getTime() + 90 * 60 * 1000);
      transactions.push(
        tx.meetingSlots[publicSlotId]
          .update({
            startTime: publicStartTime,
            endTime: publicEndTime,
            isPublic: true,
            isAvailable: true,
            title: 'Public Office Hours',
            description: 'Open Q&A session - everyone welcome!',
            meetingType: 'public-meeting',
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ owner: userId })
      );
      totalSlots++;
      // Add 2-4 bookings for the public meeting
      const publicBookingCount = randomInt(2, 4);
      const publicBookers = randomItems(
        userIds.filter(uid => uid !== userId),
        publicBookingCount
      );
      for (const bookerId of publicBookers) {
        transactions.push(
          tx.meetingBookings[id()]
            .update({
              status: 'confirmed',
              notes: faker.lorem.sentence(),
              createdAt: faker.date.past({ years: 0.04 }),
              updatedAt: new Date(),
            })
            .link({ slot: publicSlotId, booker: bookerId })
        );
        totalBookings++;
        // Track for calendar
        userMeetings[userId].push({
          slotId: publicSlotId,
          startTime: publicStartTime,
          endTime: publicEndTime,
          ownerId: userId,
          booked: true,
          bookerId,
        });
        userMeetings[bookerId].push({
          slotId: publicSlotId,
          startTime: publicStartTime,
          endTime: publicEndTime,
          ownerId: userId,
          booked: true,
          bookerId,
        });
      }
      // Create 1 past public meeting slot
      const pastPublicSlotId = id();
      const pastPublicStartTime = faker.date.recent({ days: 7 });
      const pastPublicEndTime = new Date(pastPublicStartTime.getTime() + 90 * 60 * 1000);
      transactions.push(
        tx.meetingSlots[pastPublicSlotId]
          .update({
            startTime: pastPublicStartTime,
            endTime: pastPublicEndTime,
            isPublic: true,
            isAvailable: false,
            title: 'Past Public Office Hours',
            description: 'Community discussion session (completed)',
            meetingType: 'public-meeting',
            createdAt: faker.date.past({ years: 0.17 }),
            updatedAt: new Date(),
          })
          .link({ owner: userId })
      );
      totalSlots++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${totalSlots} meeting slots with ${totalBookings} bookings`);
  console.log(`  ${userIds.length} users with 8-13 slots each (5-8 available, 3-5 booked)`);
  console.log(`  Main user & Tobias: additional public meetings`);
}

async function seedBlogCommentsAndLikes(blogIds: string[], userIds: string[]) {
  console.log('Seeding blog comments and likes...');
  const transactions = [];
  let totalComments = 0;
  let totalReplies = 0;
  let totalVotes = 0;

  // For each blog, create 3-8 comments
  for (const blogId of blogIds) {
    const commentCount = randomInt(3, 8);
    const commenters = randomItems(userIds, commentCount);
    const commentIds: string[] = [];

    for (const commenterId of commenters) {
      const commentId = id();
      commentIds.push(commentId);

      transactions.push(
        tx.comments[commentId]
          .update({
            text: faker.lorem.paragraph(),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: faker.date.recent({ days: 7 }),
            upvotes: randomInt(0, 25),
            downvotes: randomInt(0, 5),
          })
          .link({ blog: blogId, creator: commenterId })
      );
      totalComments++;

      // Add votes for this comment (1-5 voters per comment)
      const voteCount = randomInt(1, 5);
      const voters = randomItems(userIds, voteCount);

      for (const voterId of voters) {
        const voteId = id();
        const voteValue = randomItem([1, 1, 1, -1]); // 75% upvotes, 25% downvotes

        transactions.push(
          tx.commentVotes[voteId]
            .update({
              vote: voteValue,
              createdAt: faker.date.recent({ days: 30 }),
            })
            .link({ comment: commentId, user: voterId })
        );
        totalVotes++;
      }
    }

    // Add 1-3 replies to random comments
    const replyCount = Math.min(randomInt(1, 3), commentIds.length);
    for (let i = 0; i < replyCount; i++) {
      const parentCommentId = randomItem(commentIds);
      const replyId = id();
      const replierId = randomItem(userIds);

      transactions.push(
        tx.comments[replyId]
          .update({
            text: faker.lorem.sentence(),
            createdAt: faker.date.recent({ days: 14 }),
            updatedAt: faker.date.recent({ days: 7 }),
            upvotes: randomInt(0, 10),
            downvotes: randomInt(0, 2),
          })
          .link({
            blog: blogId,
            creator: replierId,
            parentComment: parentCommentId,
          })
      );
      totalReplies++;

      // Add votes for replies (0-3 voters per reply)
      const replyVoteCount = randomInt(0, 3);
      const replyVoters = randomItems(userIds, replyVoteCount);

      for (const voterId of replyVoters) {
        const voteId = id();
        const voteValue = randomItem([1, 1, 1, -1]); // 75% upvotes, 25% downvotes

        transactions.push(
          tx.commentVotes[voteId]
            .update({
              vote: voteValue,
              createdAt: faker.date.recent({ days: 14 }),
            })
            .link({ comment: replyId, user: voterId })
        );
        totalVotes++;
      }
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${totalComments} comments with ${totalReplies} replies`);
  console.log(`✓ Created ${totalVotes} comment votes`);
  console.log(`  Each blog has 3-8 comments with votes and some replies`);
}

async function seedAmendmentCommentsAndVotes(amendmentIds: string[], userIds: string[]) {
  console.log('Seeding amendment comments and votes...');
  const transactions = [];
  let totalComments = 0;
  let totalReplies = 0;
  let totalVotes = 0;

  // For each amendment, create 4-10 comments (more active discussion)
  for (const amendmentId of amendmentIds) {
    const commentCount = randomInt(4, 10);
    const commenters = randomItems(userIds, commentCount);
    const commentIds: string[] = [];

    for (const commenterId of commenters) {
      const commentId = id();
      commentIds.push(commentId);

      transactions.push(
        tx.comments[commentId]
          .update({
            text: faker.lorem.paragraph(),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: faker.date.recent({ days: 7 }),
            upvotes: randomInt(0, 30),
            downvotes: randomInt(0, 8),
          })
          .link({ amendment: amendmentId, creator: commenterId })
      );
      totalComments++;

      // Add votes for this comment (2-8 voters per comment - more engagement)
      const voteCount = randomInt(2, 8);
      const voters = randomItems(userIds, voteCount);

      for (const voterId of voters) {
        const voteId = id();
        const voteValue = randomItem([1, 1, 1, -1]); // 75% upvotes, 25% downvotes

        transactions.push(
          tx.commentVotes[voteId]
            .update({
              vote: voteValue,
              createdAt: faker.date.recent({ days: 30 }),
            })
            .link({ comment: commentId, user: voterId })
        );
        totalVotes++;
      }
    }

    // Add 2-5 replies to random comments (amendments have more discussion)
    const replyCount = Math.min(randomInt(2, 5), commentIds.length);
    for (let i = 0; i < replyCount; i++) {
      const parentCommentId = randomItem(commentIds);
      const replyId = id();
      const replierId = randomItem(userIds);

      transactions.push(
        tx.comments[replyId]
          .update({
            text: faker.lorem.sentence(),
            createdAt: faker.date.recent({ days: 14 }),
            updatedAt: faker.date.recent({ days: 7 }),
            upvotes: randomInt(0, 15),
            downvotes: randomInt(0, 3),
          })
          .link({
            amendment: amendmentId,
            creator: replierId,
            parentComment: parentCommentId,
          })
      );
      totalReplies++;

      // Add votes for replies (1-4 voters per reply)
      const replyVoteCount = randomInt(1, 4);
      const replyVoters = randomItems(userIds, replyVoteCount);

      for (const voterId of replyVoters) {
        const voteId = id();
        const voteValue = randomItem([1, 1, 1, -1]); // 75% upvotes, 25% downvotes

        transactions.push(
          tx.commentVotes[voteId]
            .update({
              vote: voteValue,
              createdAt: faker.date.recent({ days: 14 }),
            })
            .link({ comment: replyId, user: voterId })
        );
        totalVotes++;
      }
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${totalComments} amendment comments with ${totalReplies} replies`);
  console.log(`✓ Created ${totalVotes} amendment comment votes`);
  console.log(`  Each amendment has 4-10 comments with votes and replies`);
}

async function cleanDatabase() {
  console.log('🗑️  Cleaning existing data (deleting all entities)...\n');

  try {
    // Query all entities to delete (including $users)
    const query = {
      $users: {},
      stats: {},
      statements: {},
      blogs: {},
      blogBloggers: {},
      amendments: {},
      amendmentCollaborators: {},
      user: {},
      groups: {},
      groupMemberships: {},
      groupRelationships: {},
      follows: {},
      subscribers: {},
      conversations: {},
      conversationParticipants: {},
      messages: {},
      events: {},
      eventParticipants: {},
      notifications: {},
      todos: {},
      todoAssignments: {},
      magicCodes: {},
      agendaItems: {},
      elections: {},
      electionCandidates: {},
      electionVotes: {},
      amendmentVotes: {},
      changeRequests: {},
      changeRequestVotes: {},
      amendmentVoteEntries: {},
      positions: {},
      documents: {},
      documentCollaborators: {},
      documentCursors: {},
      documentVersions: {},
      hashtags: {},
      links: {},
      payments: {},
      meetingSlots: {},
      meetingBookings: {},
      comments: {},
      commentVotes: {},
      threads: {},
      threadVotes: {},
      timelineEvents: {},
      speakerList: {},
      amendmentPaths: {},
      roles: {},
      actionRights: {},
      participants: {},
      stripeCustomers: {},
      stripeSubscriptions: {},
      stripePayments: {},
    };

    const data = await db.query(query);
    const deleteTransactions = [];

    // Delete all entities (including $users)
    const entitiesToDelete = [
      'stripePayments', // Delete Stripe payments first
      'stripeSubscriptions', // Delete Stripe subscriptions
      'stripeCustomers', // Delete Stripe customers
      'commentVotes', // Delete comment votes first
      'threadVotes', // Delete thread votes first
      'comments', // Delete comments
      'threads', // Delete threads
      'meetingBookings', // Delete meeting bookings first
      'meetingSlots', // Delete meeting slots
      'hashtags', // Delete hashtags first (they link to other entities)
      'links', // Delete links
      'payments', // Delete payments
      'timelineEvents', // Delete timeline events
      'speakerList', // Delete speaker list
      'amendmentPaths', // Delete amendment paths
      'documentVersions', // Delete document versions
      'documentCursors',
      'documentCollaborators',
      'documents',
      'amendmentVoteEntries',
      'changeRequestVotes',
      'changeRequests',
      'amendmentVotes',
      'electionVotes',
      'electionCandidates',
      'elections',
      'agendaItems',
      'positions',
      'todoAssignments',
      'todos',
      'notifications',
      'participants', // Delete participants
      'actionRights', // Delete action rights before roles
      'blogBloggers', // Delete blog bloggers
      'amendmentCollaborators', // Delete amendment collaborators
      'eventParticipants',
      'events',
      'messages',
      'conversationParticipants',
      'conversations',
      'subscribers', // Delete subscribers
      'follows',
      'groupRelationships', // Delete group relationships
      'groupMemberships',
      'groups',
      'user',
      'amendments',
      'blogs',
      'statements',
      'stats',
      'roles', // Delete roles after action rights but before users
      'magicCodes',
      '$users', // Delete $users last to avoid foreign key issues
    ];

    for (const entityType of entitiesToDelete) {
      const entities = (data as any)[entityType] || [];
      for (const entity of entities) {
        deleteTransactions.push((tx as any)[entityType][entity.id].delete());
      }
    }

    if (deleteTransactions.length > 0) {
      console.log(`  Deleting ${deleteTransactions.length} existing records...`);

      // Delete in batches of 100 to avoid timeout
      const batchSize = 100;
      for (let i = 0; i < deleteTransactions.length; i += batchSize) {
        const batch = deleteTransactions.slice(i, i + batchSize);
        await db.transact(batch);
        console.log(
          `    Deleted ${Math.min(i + batchSize, deleteTransactions.length)} / ${deleteTransactions.length}`
        );
      }

      console.log('  ✓ Database cleaned\n');
    } else {
      console.log('  ✓ No existing data to clean\n');
    }
  } catch (error) {
    console.warn('  ⚠️  Warning: Could not clean all data:', error);
    console.log('  Continuing with seed...\n');
  }
}

async function seedAmendmentTargets(
  amendmentIds: string[],
  groupIds: string[],
  eventIds: string[],
  userIds: string[]
) {
  console.log('Seeding amendment targets with paths, agenda items, and votes for each step...');
  const transactions = [];
  let totalAssigned = 0;
  let pathsCreated = 0;
  let agendaItemsCreated = 0;
  let amendmentVotesCreated = 0;

  // Assign target group and event to ~60% of amendments
  const amendmentsToUpdate = randomItems(amendmentIds, Math.floor(amendmentIds.length * 0.6));

  for (const amendmentId of amendmentsToUpdate) {
    const targetGroupId = randomItem(groupIds);
    const amendmentOwner = randomItem(userIds);

    // Create a mock path (2-3 groups in the path)
    const pathLength = randomInt(2, 3);
    const pathGroups = randomItems(groupIds, pathLength);
    // Ensure target group is last
    if (!pathGroups.includes(targetGroupId)) {
      pathGroups[pathGroups.length - 1] = targetGroupId;
    }

    // For each group in the path, assign an event and create agenda items + votes
    const pathData = [];
    const groupEvents = pathGroups.map(() => {
      // Find future events for this group
      const groupEvs = eventIds.filter(() => Math.random() > 0.3); // Randomly assign some events
      return randomItem(groupEvs);
    });

    // Determine which is the closest event (first one in the path for simplicity)
    let targetEventId = null;

    for (let i = 0; i < pathGroups.length; i++) {
      const groupId = pathGroups[i];
      const eventId = groupEvents[i];
      const isFirst = i === 0;

      if (eventId) {
        // Create agenda item for this event
        const agendaItemId = id();
        const amendmentVoteId = id();

        // First event gets 'forward_confirmed', others get 'previous_decision_outstanding'
        const forwardingStatus = isFirst ? 'forward_confirmed' : 'previous_decision_outstanding';

        transactions.push(
          tx.agendaItems[agendaItemId]
            .update({
              title: `Amendment Discussion`,
              description: 'Discussion and voting on amendment proposal',
              type: 'amendment',
              status: 'pending',
              forwardingStatus: forwardingStatus,
              order: randomInt(1, 10),
              createdAt: faker.date.recent({ days: 30 }),
              updatedAt: new Date(),
            })
            .link({
              event: eventId,
              creator: amendmentOwner,
              amendment: amendmentId,
            })
        );
        agendaItemsCreated++;

        // Create amendment vote linked to the agenda item
        const voteStatus = isFirst ? randomItem(['pending', 'active']) : 'pending';
        transactions.push(
          tx.amendmentVotes[amendmentVoteId]
            .update({
              title: 'Amendment Proposal Vote',
              description: 'Vote on the proposed amendment',
              proposedText: faker.lorem.paragraph(),
              originalText: faker.lorem.paragraph(),
              status: voteStatus,
              createdAt: faker.date.recent({ days: 30 }),
              updatedAt: new Date(),
              votingStartTime: voteStatus === 'active' ? faker.date.recent({ days: 2 }) : undefined,
              votingEndTime: voteStatus === 'active' ? faker.date.soon({ days: 7 }) : undefined,
            })
            .link({
              agendaItem: agendaItemId,
              creator: amendmentOwner,
            })
        );
        amendmentVotesCreated++;

        // Add some vote entries if the vote is active
        if (voteStatus === 'active') {
          const numVotes = randomInt(5, 15);
          const voters = randomItems(userIds, numVotes);
          const voteOptions = ['accept', 'reject', 'abstain'];

          for (const voterId of voters) {
            const voteEntryId = id();
            transactions.push(
              tx.amendmentVoteEntries[voteEntryId]
                .update({
                  vote: randomItem(voteOptions),
                  createdAt: faker.date.recent({ days: 5 }),
                  updatedAt: faker.date.recent({ days: 2 }),
                })
                .link({
                  amendmentVote: amendmentVoteId,
                  voter: voterId,
                })
            );
          }
        }

        // Store target event ID (last event in path)
        if (i === pathGroups.length - 1) {
          targetEventId = eventId;
        }

        // Add to path data
        pathData.push({
          groupId,
          groupName: `Group ${i + 1}`,
          eventId,
          eventTitle: `Event ${i + 1}`,
          eventStartDate: faker.date.future({ years: 0.5 }),
          agendaItemId,
          amendmentVoteId,
          forwardingStatus,
        });
      } else {
        // No event for this group
        pathData.push({
          groupId,
          groupName: `Group ${i + 1}`,
          eventId: null,
          eventTitle: 'No upcoming event',
          eventStartDate: null,
          agendaItemId: null,
          amendmentVoteId: null,
          forwardingStatus: 'previous_decision_outstanding',
        });
      }
    }

    // Create amendment path
    const pathId = id();
    transactions.push(
      tx.amendmentPaths[pathId]
        .update({
          pathData,
          pathLength: pathData.length,
          createdAt: new Date(),
        })
        .link({
          amendment: amendmentId,
        })
    );
    pathsCreated++;

    // Update amendment with target group and event
    if (targetEventId) {
      transactions.push(
        tx.amendments[amendmentId]
          .update({
            updatedAt: new Date(),
          })
          .link({
            targetGroup: targetGroupId,
            targetEvent: targetEventId,
          })
      );
    } else {
      transactions.push(
        tx.amendments[amendmentId]
          .update({
            updatedAt: new Date(),
          })
          .link({
            targetGroup: targetGroupId,
          })
      );
    }
    totalAssigned++;
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Assigned targets to ${totalAssigned} amendments`);
  console.log(`✓ Created ${agendaItemsCreated} agenda items across all path events`);
  console.log(`✓ Created ${amendmentVotesCreated} amendment votes`);
  console.log(`✓ Created ${pathsCreated} amendment paths`);
  console.log(`  ${amendmentIds.length - totalAssigned} amendments without targets (drafts)`);
}

/**
 * Seed timeline events for all entities
 * Creates a rich activity feed showing various actions on subscribed content
 */
async function seedTimelineEvents(
  userIds: string[],
  groupIds: string[],
  amendmentIds: string[],
  eventIds: string[],
  blogIds: string[]
) {
  console.log('Seeding timeline events...');
  const transactions = [];

  const entityConfigs = [
    {
      type: 'amendment',
      ids: amendmentIds,
      events: ['created', 'updated', 'comment_added', 'vote_started', 'status_changed'],
      titles: () => [
        `Amendment draft created`,
        `Amendment updated with new changes`,
        `New comment on amendment discussion`,
        `Voting started for amendment`,
        `Amendment status changed to approved`,
      ],
      descriptions: () => [
        `A new amendment proposal has been drafted and is open for review`,
        `The amendment text has been revised based on community feedback`,
        `Community members are discussing the implications of this amendment`,
        `The voting period has begun - make your voice heard`,
        `This amendment has progressed to the next stage`,
      ],
    },
    {
      type: 'event',
      ids: eventIds,
      events: ['created', 'updated', 'participant_joined', 'status_changed'],
      titles: () => [
        `New event scheduled`,
        `Event details updated`,
        `New participant joined event`,
        `Event status changed`,
      ],
      descriptions: () => [
        `An exciting new event has been added to the calendar`,
        `Important updates have been made to the event information`,
        `Another member is attending this event`,
        `The event status has been updated`,
      ],
    },
    {
      type: 'blog',
      ids: blogIds,
      events: ['created', 'updated', 'comment_added', 'published'],
      titles: () => [
        `New blog post published`,
        `Blog post updated`,
        `New comment on blog post`,
        `Blog post now live`,
      ],
      descriptions: () => [
        `Fresh insights and perspectives have been shared`,
        `The author has added additional information to this post`,
        `The community is engaging with this content`,
        `This post is now available for everyone to read`,
      ],
    },
    {
      type: 'group',
      ids: groupIds,
      events: ['created', 'updated', 'member_added', 'status_changed'],
      titles: () => [
        `New group created`,
        `Group information updated`,
        `New member joined group`,
        `Group settings changed`,
      ],
      descriptions: () => [
        `A new community group has been established`,
        `Group details and description have been refreshed`,
        `The community is growing with new members`,
        `Group administrators made updates to settings`,
      ],
    },
    {
      type: 'user',
      ids: userIds.slice(0, 10), // Only create timeline events for some users
      events: ['updated', 'status_changed'],
      titles: () => [`User updated`, `User status changed`],
      descriptions: () => [
        `This user has updated their information`,
        `Activity status has been updated`,
      ],
    },
  ];

  let eventsCreated = 0;

  // Create timeline events for each entity type
  for (const config of entityConfigs) {
    const entitiesToProcess = config.ids.slice(0, Math.min(config.ids.length, 15)); // Process subset

    for (const entityId of entitiesToProcess) {
      // Create 2-4 events per entity
      const numEvents = randomInt(2, 4);

      for (let i = 0; i < numEvents; i++) {
        const eventType = randomItem(config.events);
        const eventIndex = config.events.indexOf(eventType);
        const title = config.titles()[eventIndex];
        const description = config.descriptions()[eventIndex];
        const actorId = randomItem(userIds);

        const timelineEventId = id();
        const daysAgo = randomInt(1, 30);

        // Create metadata based on event type
        let metadata = {};
        if (eventType === 'vote_started') {
          metadata = {
            votingEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            expectedTurnout: randomInt(50, 200),
          };
        } else if (eventType === 'status_changed') {
          metadata = {
            oldStatus: randomItem(['draft', 'pending', 'active']),
            newStatus: randomItem(['active', 'approved', 'published']),
          };
        } else if (eventType === 'comment_added') {
          metadata = {
            commentCount: randomInt(1, 25),
            replyCount: randomInt(0, 10),
          };
        } else if (eventType === 'participant_joined') {
          metadata = {
            participantCount: randomInt(5, 50),
            capacity: randomInt(50, 200),
          };
        }

        transactions.push(
          tx.timelineEvents[timelineEventId]
            .update({
              eventType,
              entityType: config.type,
              entityId,
              title,
              description,
              metadata,
              createdAt: faker.date.recent({ days: daysAgo }),
            })
            .link({
              actor: actorId,
              [config.type]: entityId,
            })
        );
        eventsCreated++;
      }
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${eventsCreated} timeline events across all entity types`);
}

async function seedStripeData(userIds: string[]) {
  console.log('Seeding Stripe customers, subscriptions, and payments...');
  const transactions = [];
  let totalCustomers = 0;
  let totalSubscriptions = 0;
  let totalPayments = 0;

  // Plan amounts in cents
  const plans = [
    { name: 'running', amount: 200, currency: 'eur' }, // €2
    { name: 'development', amount: 1000, currency: 'eur' }, // €10
  ];

  // Create Stripe data for each user
  for (const userId of userIds) {
    const customerId = id();
    const stripeCustomerId = `cus_${faker.string.alphanumeric(14)}`;
    const hasSubscription = faker.datatype.boolean(0.8); // 80% of users have a subscription

    // Create customer
    transactions.push(
      tx.stripeCustomers[customerId]
        .update({
          stripeCustomerId,
          email: faker.internet.email().toLowerCase(),
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: new Date(),
        })
        .link({ user: userId })
    );
    totalCustomers++;

    if (hasSubscription) {
      // Choose a random plan (running or development)
      const plan = randomItem(plans);
      const subscriptionId = id();
      const stripeSubscriptionId = `sub_${faker.string.alphanumeric(14)}`;

      const createdAt = faker.date.past({ years: 0.8 });
      const currentPeriodStart = faker.date.recent({ days: 15 });
      const currentPeriodEnd = new Date(currentPeriodStart);
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      // 90% active, 10% canceled/past_due
      const statuses = [
        'active',
        'active',
        'active',
        'active',
        'active',
        'active',
        'active',
        'active',
        'active',
        'canceled',
        'past_due',
      ];
      const status = randomItem(statuses);

      transactions.push(
        tx.stripeSubscriptions[subscriptionId]
          .update({
            stripeSubscriptionId,
            stripeCustomerId,
            status,
            currentPeriodStart: currentPeriodStart.toISOString(),
            currentPeriodEnd: currentPeriodEnd.toISOString(),
            cancelAtPeriodEnd: status === 'canceled' ? faker.datatype.boolean(0.5) : false,
            amount: plan.amount,
            currency: plan.currency,
            interval: 'month',
            createdAt: createdAt.toISOString(),
            updatedAt: new Date().toISOString(),
            canceledAt:
              status === 'canceled' ? faker.date.recent({ days: 30 }).toISOString() : undefined,
          })
          .link({ customer: customerId })
      );
      totalSubscriptions++;

      // Create 1-5 past payments for this subscription
      const paymentCount = randomInt(1, 5);
      for (let i = 0; i < paymentCount; i++) {
        const paymentId = id();
        const stripeInvoiceId = `in_${faker.string.alphanumeric(14)}`;

        // Generate payment dates between subscription creation and now
        // Make sure we have at least 1 day between createdAt and currentPeriodStart
        const minDate = new Date(createdAt);
        const maxDate = new Date(currentPeriodStart);

        // If dates are too close, use a date range from createdAt
        let paymentCreatedAt;
        if (maxDate.getTime() - minDate.getTime() < 86400000) {
          // Less than 1 day
          // Use a date between subscription creation and now
          paymentCreatedAt = faker.date.between({
            from: minDate,
            to: new Date(),
          });
        } else {
          paymentCreatedAt = faker.date.between({
            from: minDate,
            to: maxDate,
          });
        }

        // 95% paid, 5% failed
        const paymentStatus = faker.datatype.boolean(0.95) ? 'paid' : 'failed';

        transactions.push(
          tx.stripePayments[paymentId]
            .update({
              stripeInvoiceId,
              stripeCustomerId,
              stripeSubscriptionId,
              amount: plan.amount,
              currency: plan.currency,
              status: paymentStatus,
              createdAt: paymentCreatedAt.toISOString(),
              paidAt: paymentStatus === 'paid' ? paymentCreatedAt.toISOString() : undefined,
            })
            .link({ customer: customerId })
        );
        totalPayments++;
      }
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(`✓ Created ${totalCustomers} Stripe customers`);
  console.log(`✓ Created ${totalSubscriptions} Stripe subscriptions (80% of users)`);
  console.log(`✓ Created ${totalPayments} Stripe payments (1-5 per subscription)`);
  console.log(`  - Running plan (€2/month): ~50% of subscriptions`);
  console.log(`  - Development plan (€10/month): ~50% of subscriptions`);
  console.log(`  - Active: ~90%, Canceled/Past Due: ~10%`);
  console.log(`  - Payment success rate: ~95%`);
}

/**
 * Seed RBAC entities: roles, actionRights, posts, and participants
 */
async function seedRBAC(
  userIds: string[],
  groupIds: string[],
  eventIds: string[],
  amendmentIds: string[],
  blogIds: string[]
) {
  console.log('Seeding RBAC entities (roles, actionRights, participants)...');
  const transactions = [];
  let totalRoles = 0;
  let totalActionRights = 0;
  let totalParticipants = 0;

  // Define common roles for events
  const eventRoleDefinitions = [
    {
      name: 'Organizer',
      description: 'Event organizer with full permissions',
      scope: 'event' as const,
    },
    { name: 'Participant', description: 'Regular event participant', scope: 'event' as const },
  ];

  // Define common roles for amendments
  const amendmentRoleDefinitions = [
    {
      name: 'Applicant',
      description: 'Amendment applicant with administrative access',
      scope: 'amendment' as const,
    },
    { name: 'Collaborator', description: 'Amendment collaborator', scope: 'amendment' as const },
  ];

  // Define common roles for blogs
  const blogRoleDefinitions = [
    { name: 'Owner', description: 'Blog owner with full permissions', scope: 'blog' as const },
    { name: 'Writer', description: 'Blog writer with edit access', scope: 'blog' as const },
  ];

  // Note: Role definitions and action rights are defined per resource below

  // Create roles and action rights for each group
  // NOTE: Group roles are now created in seedGroups() to allow memberships to link to them immediately
  // We skip creating duplicate group roles here
  // Group action rights can be added in a future update if needed

  // Create event-level roles and participants
  for (const eventId of eventIds) {
    const eventRoleIds: Record<string, string> = {};

    // Create event-level roles
    for (const roleDef of eventRoleDefinitions) {
      const roleId = id();
      eventRoleIds[roleDef.name] = roleId;

      transactions.push(
        tx.roles[roleId]
          .update({
            name: roleDef.name,
            description: roleDef.description,
            scope: roleDef.scope,
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ event: eventId })
      );
      totalRoles++;
    }

    // Create action rights for Organizer role (full event control)
    const organizerRoleId = eventRoleIds['Organizer'];
    const organizerActions = ['update', 'delete', 'manage_participants'];
    for (const action of organizerActions) {
      const actionRightId = id();
      transactions.push(
        tx.actionRights[actionRightId]
          .update({
            resource: 'events',
            action,
          })
          .link({ roles: [organizerRoleId], event: eventId })
      );
      totalActionRights++;
    }

    // Add action rights for Organizer to manage participants
    const manageParticipantsRight = id();
    transactions.push(
      tx.actionRights[manageParticipantsRight]
        .update({
          resource: 'eventParticipants',
          action: 'manage',
        })
        .link({ roles: [organizerRoleId], event: eventId })
    );
    totalActionRights++;

    // Add manageNotifications right to Organizer role
    const manageEventNotificationsRight = id();
    transactions.push(
      tx.actionRights[manageEventNotificationsRight]
        .update({
          resource: 'notifications',
          action: 'manageNotifications',
        })
        .link({ roles: [organizerRoleId], event: eventId })
    );
    totalActionRights++;

    // Add manageNotifications right to Organizer role
    const manageNotificationsRight = id();
    transactions.push(
      tx.actionRights[manageNotificationsRight]
        .update({
          resource: 'notifications',
          action: 'manageNotifications',
        })
        .link({ roles: [organizerRoleId], event: eventId })
    );
    totalActionRights++;

    // Create action rights for Participant role (read access)
    const participantRoleId = eventRoleIds['Participant'];
    const actionRightId = id();
    transactions.push(
      tx.actionRights[actionRightId]
        .update({
          resource: 'events',
          action: 'read',
        })
        .link({ roles: [participantRoleId], event: eventId })
    );
    totalActionRights++;

    // Create participants with roles
    const participantCount = randomInt(3, 8);
    const participantUsers = randomItems(userIds, participantCount);

    for (let i = 0; i < participantUsers.length; i++) {
      const userId = participantUsers[i];
      const participantId = id();

      // Assign roles: first is Organizer, rest are Participants
      let roleId;
      if (i === 0) {
        roleId = organizerRoleId;
      } else {
        roleId = participantRoleId;
      }

      transactions.push(
        tx.participants[participantId]
          .update({
            status: randomItem(['accepted', 'accepted', 'accepted', 'pending', 'invited']),
            createdAt: faker.date.past({ years: 0.3 }),
            updatedAt: new Date(),
          })
          .link({
            event: eventId,
            user: userId,
            role: roleId,
          })
      );
      totalParticipants++;
    }
  }

  // Create amendment-level roles
  for (const amendmentId of amendmentIds) {
    const amendmentRoleIds: Record<string, string> = {};

    // Create amendment-level roles
    for (const roleDef of amendmentRoleDefinitions) {
      const roleId = id();
      amendmentRoleIds[roleDef.name] = roleId;

      transactions.push(
        tx.roles[roleId]
          .update({
            name: roleDef.name,
            description: roleDef.description,
            scope: roleDef.scope,
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ amendment: amendmentId })
      );
      totalRoles++;
    }

    // Create action rights for Applicant role (full amendment control including collaborator management)
    const applicantRoleId = amendmentRoleIds['Applicant'];
    const applicantActions = ['update', 'delete'];
    for (const action of applicantActions) {
      const actionRightIdAR = id();
      transactions.push(
        tx.actionRights[actionRightIdAR]
          .update({
            resource: 'amendments',
            action,
          })
          .link({ roles: [applicantRoleId], amendment: amendmentId })
      );
      totalActionRights++;
    }

    // Add manage permission for amendment collaborators to Applicant role
    const manageCollaboratorsRight = id();
    transactions.push(
      tx.actionRights[manageCollaboratorsRight]
        .update({
          resource: 'amendmentCollaborators',
          action: 'manage',
        })
        .link({ roles: [applicantRoleId], amendment: amendmentId })
    );
    totalActionRights++;

    // Add manageNotifications right to Applicant role
    const manageAmendmentNotificationsRight = id();
    transactions.push(
      tx.actionRights[manageAmendmentNotificationsRight]
        .update({
          resource: 'notifications',
          action: 'manageNotifications',
        })
        .link({ roles: [applicantRoleId], amendment: amendmentId })
    );
    totalActionRights++;

    // Create action rights for Collaborator role (read and comment access)
    const collaboratorRoleId = amendmentRoleIds['Collaborator'];
    const collaboratorActions = ['read', 'update'];
    for (const action of collaboratorActions) {
      const collaboratorActionId = id();
      transactions.push(
        tx.actionRights[collaboratorActionId]
          .update({
            resource: 'amendments',
            action,
          })
          .link({ roles: [collaboratorRoleId], amendment: amendmentId })
      );
      totalActionRights++;
    }
  }

  // Create blog-level roles and bloggers
  let totalBloggers = 0;
  for (const blogId of blogIds) {
    const blogRoleIds: Record<string, string> = {};

    // Create blog-level roles
    for (const roleDef of blogRoleDefinitions) {
      const roleId = id();
      blogRoleIds[roleDef.name] = roleId;

      transactions.push(
        tx.roles[roleId]
          .update({
            name: roleDef.name,
            description: roleDef.description,
            scope: roleDef.scope,
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ blog: blogId })
      );
      totalRoles++;
    }

    // Create action rights for Owner role (full blog control)
    const ownerRoleId = blogRoleIds['Owner'];
    const ownerActions = ['update', 'delete'];
    for (const action of ownerActions) {
      const actionRightIdBlog = id();
      transactions.push(
        tx.actionRights[actionRightIdBlog]
          .update({
            resource: 'blogs',
            action,
          })
          .link({ roles: [ownerRoleId], blog: blogId })
      );
      totalActionRights++;
    }

    // Add manageNotifications right to Owner role
    const manageBlogNotificationsRight = id();
    transactions.push(
      tx.actionRights[manageBlogNotificationsRight]
        .update({
          resource: 'notifications',
          action: 'manageNotifications',
        })
        .link({ roles: [ownerRoleId], blog: blogId })
    );
    totalActionRights++;

    // Create action rights for Writer role (update and delete access)
    const writerRoleId = blogRoleIds['Writer'];
    const writerActions = ['update', 'delete'];
    for (const action of writerActions) {
      const writerActionId = id();
      transactions.push(
        tx.actionRights[writerActionId]
          .update({
            resource: 'blogs',
            action,
          })
          .link({ roles: [writerRoleId], blog: blogId })
      );
      totalActionRights++;
    }

    // Create bloggers with roles (1 owner, 1-3 writers)
    const bloggerCount = randomInt(2, 4);
    const bloggerUsers = randomItems(userIds, bloggerCount);

    for (let i = 0; i < bloggerUsers.length; i++) {
      const userId = bloggerUsers[i];
      const bloggerId = id();

      // Assign roles: first is Owner, rest are Writers
      let roleId;
      if (i === 0) {
        roleId = ownerRoleId;
      } else {
        roleId = writerRoleId;
      }

      transactions.push(
        tx.blogBloggers[bloggerId]
          .update({
            status: 'member',
            createdAt: faker.date.past({ years: 0.3 }),
            updatedAt: new Date(),
            visibility: randomVisibility(),
          })
          .link({
            blog: blogId,
            user: userId,
            role: roleId,
          })
      );
      totalBloggers++;
    }
  }

  // Execute in batches
  await batchTransact(transactions);

  console.log(
    `✓ Created ${totalRoles} roles (group-level, event-level, amendment-level, and blog-level)`
  );
  console.log(`✓ Created ${totalActionRights} action rights with RBAC permissions`);
  console.log(`✓ Created ${totalParticipants} event participants with role assignments`);
  console.log(`✓ Created ${totalBloggers} blog bloggers with role assignments`);
  console.log(`  - Each group has 2 roles: Board Member, Member`);
  console.log(`  - Each event has 2 roles: Organizer, Participant`);
  console.log(`  - Each amendment has 2 roles: Applicant, Collaborator`);
  console.log(`  - Each blog has 2 roles: Owner, Writer`);
  console.log(`  - Board Members have full access to group resources`);
  console.log(`  - Organizers have full access to event resources and participant management`);
  console.log(`  - Applicants have full access to amendment resources and collaborator management`);
  console.log(`  - Blog Owners and Writers have update/delete access to blog resources`);
}

// Main seed function
async function seed() {
  console.log('\n🌱 Starting database seed...\n');
  console.log(`App ID: ${APP_ID}\n`);

  try {
    // Clean existing data first
    await cleanDatabase();

    // Seed in order due to dependencies
    const { userIds, blogIds: userBlogIds, amendmentIds: userAmendmentIds } = await seedUsers();
    const {
      groupIds,
      blogIds: groupBlogIds,
      amendmentIds: groupAmendmentIds,
    } = await seedGroups(userIds);

    // Combine blog and amendment IDs from both functions
    const allBlogIds = [...userBlogIds, ...groupBlogIds];
    const allAmendmentIds = [...userAmendmentIds, ...groupAmendmentIds];

    await seedGroupRelationships(groupIds); // New: seed group relationships
    const positionIds = await seedPositions(groupIds); // New: seed positions
    await seedLinks(groupIds); // New: seed links
    await seedPayments(userIds, groupIds); // New: seed payments
    await seedGroupInvitationsAndRequests(groupIds, userIds); // New: seed pending invitations and requests
    await seedFollows(userIds, groupIds);
    await seedConversationsAndMessages(userIds);
    const eventIds = await seedEvents(userIds, groupIds);

    // NEW: Seed RBAC entities (roles, actionRights, posts, participants, bloggers)
    await seedRBAC(userIds, groupIds, eventIds, allAmendmentIds, allBlogIds);

    // NEW: Assign target groups and events to amendments
    await seedAmendmentTargets(allAmendmentIds, groupIds, eventIds, userIds);

    await seedEventParticipationRequestsAndInvites(eventIds, userIds); // New: seed event requests, invites, and admins
    await seedAmendmentCollaborationRequestsAndInvites(allAmendmentIds, userIds); // New: seed amendment requests, invites, and admins

    // NEW: Seed subscriptions for amendments, events, and blogs
    await seedEntitySubscriptions(userIds, allAmendmentIds, eventIds, allBlogIds);

    // NEW: Seed comprehensive subscriptions and memberships for Tobias
    await seedTobiasSubscriptionsAndMemberships(
      userIds,
      groupIds,
      allAmendmentIds,
      eventIds,
      allBlogIds
    );

    await seedAgendaAndVoting(userIds, eventIds, positionIds); // Pass positionIds
    await seedNotifications(userIds, groupIds, allAmendmentIds, eventIds, allBlogIds);
    await seedTodos(userIds, groupIds);
    await seedDocuments(userIds); // New: seed documents
    await seedMeetingSlots(userIds); // New: seed meeting slots
    await seedBlogCommentsAndLikes(allBlogIds, userIds); // New: seed blog comments and likes
    await seedAmendmentCommentsAndVotes(allAmendmentIds, userIds); // New: seed amendment comments and votes

    // Seed Stripe data
    await seedStripeData(userIds);

    // Seed timeline events
    await seedTimelineEvents(userIds, groupIds, allAmendmentIds, eventIds, allBlogIds);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Summary:');
    console.log(`  - 1 main test user (${SEED_CONFIG.mainTestUserId})`);
    console.log(`  - 1 Tobias user (${SEED_CONFIG.tobiasUserId})`);
    console.log(`  - ${SEED_CONFIG.users} additional users`);
    console.log(`  - ${SEED_CONFIG.groups} groups (2 owned by main user)`);
    console.log(
      `  - Complex group relationship network with multi-level hierarchies and indirect paths`
    );
    console.log(`  - Positions across all groups`);
    console.log(`  - Links for all groups`);
    console.log(`  - Payments (income/expenditure) for all groups`);
    console.log(`  - RBAC: Roles, action rights, posts, and participants with permissions`);
    console.log(`  - Hashtags for all users, groups, events, and amendments`);
    console.log(`  - Follow relationships (legacy) - main user: 10 following, 5 followers`);
    console.log(`  - Subscriber relationships (new) - main user: 10 subscriptions, 5 subscribers`);
    console.log(`  - Conversations and messages (main user: 3 conversations)`);
    console.log(`  - Events and participants`);
    console.log(`  - Agenda items with elections and voting system (linked to positions)`);
    console.log(`  - Notifications (main user: 10 total, 6 unread)`);
    console.log(`  - Todos and assignments (main user: 5 todos)`);
    console.log(`  - Documents with collaborators (main user: 2 documents)`);
    console.log(`  - Meeting slots and bookings (main user & Tobias: 10 slots each)`);
    console.log(`  - Blog comments and likes (3-8 comments per blog with votes and replies)`);
    console.log(
      `  - Amendment targets (~60% of amendments have target groups, events, paths, and agenda items)`
    );
    console.log(`  - Stripe customers, subscriptions, and payments (80% of users subscribed)`);
    console.log(`  - Timeline events showing activity across all subscribed entities\n`);
    console.log('Main test user details:');
    console.log(`  - ID: ${SEED_CONFIG.mainTestUserId}`);
    console.log(`  - Email: test@polity.app`);
    console.log(`  - Handle: @testuser`);
    console.log(`  - Owns 2 groups`);
    console.log(`  - Member of ~3 additional groups\n`);
    console.log('Tobias user details:');
    console.log(`  - ID: ${SEED_CONFIG.tobiasUserId}`);
    console.log(`  - Email: tobias.hassebrock@gmail.com`);
    console.log(`  - Handle: @tobias\n`);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seed();
