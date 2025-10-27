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
  mainTestUserId: 'f598596e-d379-413e-9c6e-c218e5e3cf17', // Your main test user
  tobiasUserId: 'a1b2c3d4-e5f6-4789-a0b1-c2d3e4f5a6b7', // Tobias's user ID
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
  const userToProfileMap = new Map<string, string>(); // Map user IDs to profile IDs
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
    })
  );

  // Create or update profile for main user - ALWAYS create profile
  const mainProfileId = id();
  userToProfileMap.set(mainUserId, mainProfileId);
  transactions.push(
    tx.profiles[mainProfileId]
      .update({
        name: 'Test User',
        subtitle: 'Main Test Account',
        avatar: faker.image.avatar(),
        bio: 'This is the main test user account for development.',
        handle: 'testuser',
        isActive: true,
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: new Date(),
        lastSeenAt: new Date(),
        about: 'Main test user for Polity development.',
        contactEmail: 'test@polity.app',
        contactTwitter: '@testuser',
        contactWebsite: 'https://polity.app',
        contactLocation: 'Test City',
      })
      .link({ user: mainUserId })
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
      })
      .link({ user: mainUserId })
  );

  // Add hashtags for main user
  const mainUserHashtags = randomItems(USER_HASHTAGS, randomInt(3, 5));
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
        likes: randomInt(10, 50),
        comments: randomInt(5, 20),
      })
      .link({ user: mainUserId })
  );

  // Add hashtags to main user's blog (minimum 1, maximum 4)
  const mainBlogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 4));
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
    })
  );

  // Create profile for Tobias
  const tobiasProfileId = id();
  userToProfileMap.set(tobiasUserId, tobiasProfileId);
  transactions.push(
    tx.profiles[tobiasProfileId]
      .update({
        name: 'Tobias Hassebrock',
        subtitle: 'Developer & Community Member',
        avatar: faker.image.avatar(),
        bio: 'Passionate about building better digital communities.',
        handle: 'tobias',
        isActive: true,
        createdAt: faker.date.past({ years: 2 }),
        updatedAt: new Date(),
        lastSeenAt: new Date(),
        about: 'Developer and community enthusiast working on Polity.',
        contactEmail: 'tobias.hassebrock@gmail.com',
        contactTwitter: '@tobias',
        contactWebsite: 'https://polity.app',
        contactLocation: 'Germany',
      })
      .link({ user: tobiasUserId })
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
      })
      .link({ user: tobiasUserId })
  );

  // Add hashtags for Tobias
  const tobiasHashtags = randomItems(USER_HASHTAGS, randomInt(3, 5));
  transactions.push(...createHashtagTransactions(tobiasUserId, 'user', tobiasHashtags));

  // Add a blog post for Tobias (no group link for user's personal blog)
  const tobiasBlogId = id();
  blogIds.push(tobiasBlogId);
  transactions.push(
    tx.blogs[tobiasBlogId]
      .update({
        title: 'The Future of Digital Communities',
        date: new Date().toISOString(),
        likes: randomInt(20, 80),
        comments: randomInt(10, 30),
      })
      .link({ user: tobiasUserId })
  );

  // Add hashtags to Tobias's blog (minimum 1, maximum 4)
  const tobiasBlogHashtags = randomItems(BLOG_HASHTAGS, randomInt(1, 4));
  transactions.push(...createHashtagTransactions(tobiasBlogId, 'blog', tobiasBlogHashtags));

  // Now create other users - EACH USER GETS A PROFILE
  for (let i = 0; i < SEED_CONFIG.users; i++) {
    const userId = id();
    const email = faker.internet.email().toLowerCase();
    const handle = faker.internet.username().toLowerCase();
    const name = faker.person.fullName();

    userIds.push(userId);

    // Create user in $users table
    transactions.push(
      tx.$users[userId].update({
        email,
        imageURL: faker.image.avatar(),
        type: 'user',
      })
    );

    // Create profile - MANDATORY for every user
    const profileId = id();
    userToProfileMap.set(userId, profileId); // Track profile ID for this user
    const createdAt = faker.date.past({ years: 2 });

    transactions.push(
      tx.profiles[profileId]
        .update({
          name,
          subtitle: faker.person.jobTitle(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.paragraph(),
          handle,
          isActive: faker.datatype.boolean(0.9), // 90% active
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
        })
        .link({ user: userId })
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
            likes: randomInt(0, 500),
            comments: randomInt(0, 100),
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
        tx.amendments[amendmentId]
          .update({
            title: amendmentTitle,
            subtitle: faker.lorem.sentence(),
            status: randomItem(['Passed', 'Rejected', 'Under Review', 'Drafting']),
            supporters: randomInt(10, 1000),
            date: faker.date.past({ years: 1 }).toISOString(),
            code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
            tags: [randomItem(['policy', 'reform', 'legislation', 'amendment', 'proposal'])],
          })
          .link({ user: userId })
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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(`✓ Created ${userIds.length} users (including main test user and Tobias)`);
  console.log(`✓ Each user has a complete profile with all contact fields`);
  console.log(`✓ Total profiles: ${userToProfileMap.size}`);
  return { userIds, userToProfileMap, blogIds, amendmentIds };
}

async function seedGroupRelationships(groupIds: string[]) {
  console.log('Seeding group relationships...');
  const transactions = [];
  let totalRelationships = 0;

  const rights = [
    'informationRight',
    'amendmentRight',
    'rightToSpeak',
    'activeVotingRight',
    'passiveVotingRight',
  ];

  // Create some relationships between groups
  // Make sure we have at least 3 groups to create relationships
  if (groupIds.length >= 3) {
    // Create a hierarchy: Group 0 -> Group 1 -> Group 2
    for (let i = 0; i < Math.min(3, groupIds.length - 1); i++) {
      const parentGroupId = groupIds[i];
      const childGroupId = groupIds[i + 1];

      // Create 1-3 relationships with different rights
      const relationshipCount = randomInt(1, 3);
      const selectedRights = randomItems(rights, relationshipCount);

      for (const right of selectedRights) {
        const relationshipId = id();
        transactions.push(
          tx.groupRelationships[relationshipId]
            .update({
              relationshipType: 'isParent',
              withRight: right,
              createdAt: faker.date.past({ years: 0.5 }),
              updatedAt: new Date(),
            })
            .link({ parentGroup: parentGroupId, childGroup: childGroupId })
        );
        totalRelationships++;
      }
    }

    // Create some additional cross-relationships
    if (groupIds.length >= 8) {
      // Structure 1: Group 0 has multiple direct children (0 -> 3, 0 -> 4)
      // This creates a "star" pattern from Group 0
      const relationshipId3 = id();
      transactions.push(
        tx.groupRelationships[relationshipId3]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
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
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[0], childGroup: groupIds[4] })
      );
      totalRelationships++;

      // Structure 2: Group 3 has its own children (3 -> 5, 3 -> 6)
      // This creates indirect relationships: 0 -> 3 -> 5 and 0 -> 3 -> 6
      const relationshipId5 = id();
      transactions.push(
        tx.groupRelationships[relationshipId5]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[3], childGroup: groupIds[5] })
      );
      totalRelationships++;

      const relationshipId6 = id();
      transactions.push(
        tx.groupRelationships[relationshipId6]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[3], childGroup: groupIds[6] })
      );
      totalRelationships++;

      // Structure 3: Group 4 also has a child (4 -> 7)
      // This creates another indirect path: 0 -> 4 -> 7
      const relationshipId7 = id();
      transactions.push(
        tx.groupRelationships[relationshipId7]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[4], childGroup: groupIds[7] })
      );
      totalRelationships++;

      // Structure 4: Create cross-links for even more complex networks
      // Group 1 is also parent of Group 5 (creating multiple paths to Group 5)
      // This means Group 5 can be reached via: 0->1->5 OR 0->3->5
      const relationshipId8 = id();
      transactions.push(
        tx.groupRelationships[relationshipId8]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[1], childGroup: groupIds[5] })
      );
      totalRelationships++;

      // Structure 5: Add some relationships with multiple rights
      // Group 2 is parent of Group 6 with multiple rights
      const multipleRights = randomItems(rights, randomInt(2, 3));
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

      // NEW: Create a group with BOTH deep upward AND downward connections
      // Make Group 3 the central node with complex relationships in both directions
      // Group 3 already has:
      //   - Parents: Group 0 (via Structure 1)
      //   - Children: Group 5, Group 6 (via Structure 2)

      // Add more parents to Group 3 to create deeper upward hierarchy
      // Create a grandparent chain: Create new implicit parents through Group 2
      // Group 2 -> Group 3 (in addition to existing 0 -> 3)
      const relationshipId9 = id();
      transactions.push(
        tx.groupRelationships[relationshipId9]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[2], childGroup: groupIds[3] })
      );
      totalRelationships++;

      // Now Group 3 has multiple parent paths:
      // - 0 -> 1 -> 2 -> 3 (deep indirect via Group 2)
      // - 0 -> 3 (direct)

      // Add more children to Group 3 to create deeper downward hierarchy
      // Group 3 -> Group 7 (Group 7 already has parent Group 4, now also has parent Group 3)
      const relationshipId10 = id();
      transactions.push(
        tx.groupRelationships[relationshipId10]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[3], childGroup: groupIds[7] })
      );
      totalRelationships++;

      // Now Group 3 has multiple child paths and levels:
      // - 3 -> 5 (direct child)
      // - 3 -> 6 (direct child)
      // - 3 -> 7 (direct child)

      // Summary for Group 3:
      // Parents (upward): Group 0 (direct), Group 2 (direct) -> creates 0->1->2->3 path
      // Children (downward): Group 5, 6, 7 (all direct)
      // This makes Group 3 a central hub with both upward and downward connections
    } else if (groupIds.length >= 5) {
      // Group 3 is parent of Group 4
      const relationshipId1 = id();
      transactions.push(
        tx.groupRelationships[relationshipId1]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[3], childGroup: groupIds[4] })
      );
      totalRelationships++;

      // Group 0 is also parent of Group 3 (creating a deeper hierarchy)
      const relationshipId2 = id();
      transactions.push(
        tx.groupRelationships[relationshipId2]
          .update({
            relationshipType: 'isParent',
            withRight: randomItem(rights),
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: new Date(),
          })
          .link({ parentGroup: groupIds[0], childGroup: groupIds[3] })
      );
      totalRelationships++;
    }
  }

  if (transactions.length > 0) {
    // Execute in batches
    const batchSize = 50;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await db.transact(batch);
    }
  }

  console.log(`✓ Created ${totalRelationships} group relationships with complex network structure`);
  if (groupIds.length >= 8) {
    console.log(`  - Multi-level hierarchies (up to 3 levels deep)`);
    console.log(`  - Multiple parent-child branches creating indirect relationships`);
    console.log(`  - Some groups reachable via multiple paths`);
    console.log(`  - Group 3 is a central hub with BOTH deep upward AND downward connections:`);
    console.log(`    • Upward: Multiple parents (Group 0 direct, Group 2 direct -> 0→1→2→3 path)`);
    console.log(`    • Downward: Multiple children (Groups 5, 6, 7)`);
  }
}

async function seedGroups(userIds: string[]) {
  console.log('Seeding groups...');
  const groupIds: string[] = [];
  const blogIds: string[] = [];
  const amendmentIds: string[] = [];
  const transactions = [];

  const mainUserId = SEED_CONFIG.mainTestUserId;

  // Create 2 groups owned by main test user
  for (let i = 0; i < 2; i++) {
    const groupId = id();
    const name = i === 0 ? 'Test Main Group' : faker.company.name();
    const abbr = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);

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
        })
        .link({ owner: mainUserId })
    );

    // Create user group entry
    const userGroupId = id();
    transactions.push(
      tx.user[userGroupId]
        .update({
          name,
          members: randomInt(10, 100),
          role: 'Owner',
          description: i === 0 ? 'Main test group for development' : faker.lorem.paragraph(),
          tags: ['community', 'test'],
          amendments: randomInt(0, 10),
          events: randomInt(0, 5),
          abbr,
        })
        .link({ user: mainUserId })
    );

    // Add main user as owner member
    const ownerMembershipId = id();
    transactions.push(
      tx.groupMemberships[ownerMembershipId]
        .update({
          role: 'admin',
          status: 'admin',
          createdAt: faker.date.past({ years: 1 }),
        })
        .link({ user: mainUserId, group: groupId })
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
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            role: randomItem(['member', 'member', 'moderator']),
            status: status,
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ user: memberId, group: groupId })
      );
    }

    // Update member count
    transactions.push(
      tx.groups[groupId].update({
        memberCount: members.length + 1,
      })
    );

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
            likes: randomInt(5, 100),
            comments: randomInt(0, 50),
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

  // Create remaining groups
  for (let i = 2; i < SEED_CONFIG.groups; i++) {
    const groupId = id();
    const ownerId = randomItem(userIds.filter(uid => uid !== mainUserId));
    const name = faker.company.name();
    const abbr = name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);

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
        })
        .link({ owner: ownerId })
    );

    // Create user group entry
    const userGroupId = id();
    transactions.push(
      tx.user[userGroupId]
        .update({
          name,
          members: randomInt(10, 100),
          role: 'Owner',
          description: faker.lorem.paragraph(),
          tags: [randomItem(['community', 'organization', 'political', 'social', 'activism'])],
          amendments: randomInt(0, 10),
          events: randomInt(0, 5),
          abbr,
        })
        .link({ user: ownerId })
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
          role: 'admin',
          status: 'admin',
          createdAt: faker.date.past({ years: 1 }),
        })
        .link({ user: ownerId, group: groupId })
    );

    // Maybe add main user as member to some groups
    if (i < 5 && !members.includes(mainUserId)) {
      const mainUserMembershipId = id();
      transactions.push(
        tx.groupMemberships[mainUserMembershipId]
          .update({
            role: randomItem(['member', 'moderator']),
            status: 'member',
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ user: mainUserId, group: groupId })
      );
      members.push(mainUserId);
    }

    for (const memberId of members) {
      const membershipId = id();
      const status = randomItem(['member', 'member', 'member', 'requested', 'invited']);
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            role: randomItem(['member', 'member', 'moderator']),
            status: status,
            createdAt: faker.date.past({ years: 0.5 }),
          })
          .link({ user: memberId, group: groupId })
      );
    }

    // Update member count
    transactions.push(
      tx.groups[groupId].update({
        memberCount: members.length + 1, // +1 for owner
      })
    );

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
            likes: randomInt(5, 100),
            comments: randomInt(0, 50),
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
          })
          .link({ user: ownerId, group: groupId })
      );

      // Add hashtags to amendment
      const amendmentHashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(amendmentId, 'amendment', amendmentHashtags));

      // Create a document for this amendment
      transactions.push(...createAmendmentDocument(amendmentId, amendmentTitle, ownerId));
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} group-related records...`);
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(
    `✓ Created ${SEED_CONFIG.groups} groups with memberships (2 owned by main test user)`
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
            role: 'member',
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
            role: 'member',
            status: 'requested',
            createdAt: faker.date.recent({ days: 30 }),
          })
          .link({ user: requestingUserId, group: groupId })
      );
      totalRequests++;
    }
  }

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
            role: 'attendee',
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
            role: 'attendee',
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
            role: 'organizer',
            status: 'admin',
            createdAt: faker.date.past({ years: 0.17 }),
          })
          .link({ user: userId, event: eventId })
      );
      totalAdmins++;
    }
  }

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
            role: 'editor',
            status: 'invited',
            createdAt: faker.date.recent({ days: 30 }),
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
            role: 'editor',
            status: 'requested',
            createdAt: faker.date.recent({ days: 30 }),
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
            role: 'reviewer',
            status: 'admin',
            createdAt: faker.date.past({ years: 0.17 }),
          })
          .link({ user: userId, amendment: amendmentId })
      );
      totalAdmins++;
    }
  }

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  // Groups 0-2: admin status (3 groups)
  // Groups 3-4: member status (2 groups)
  // Groups 5-6: requested status (2 groups)
  // Group 7: invited status (1 group)
  const first8Groups = groupIds.slice(0, Math.min(8, groupIds.length));
  for (let i = 0; i < first8Groups.length; i++) {
    const groupId = first8Groups[i];
    const membershipId = id();

    let role = 'member';
    let status = 'member';

    if (i < 3) {
      // First 3 groups: admin
      role = 'admin';
      status = 'admin';
    } else if (i < 5) {
      // Groups 3-4: regular member
      role = 'member';
      status = 'member';
    } else if (i < 7) {
      // Groups 5-6: requested
      role = 'member';
      status = 'requested';
    } else {
      // Group 7: invited
      role = 'member';
      status = 'invited';
    }

    transactions.push(
      tx.groupMemberships[membershipId]
        .update({
          role: role,
          status: status,
          createdAt: faker.date.past({ years: 1 }),
        })
        .link({ user: tobiasUserId, group: groupId })
    );
  }

  // Add Tobias as participant to events with different statuses
  // Take first 8 events if available
  // Events 0-2: admin status (3 events)
  // Events 3-4: member status (2 events)
  // Events 5-6: requested status (2 events)
  // Event 7: invited status (1 event)
  const first8Events = eventIds.slice(0, Math.min(8, eventIds.length));
  for (let i = 0; i < first8Events.length; i++) {
    const eventId = first8Events[i];
    const participantId = id();

    let role = 'attendee';
    let status = 'member';

    if (i < 3) {
      // First 3 events: admin
      role = 'organizer';
      status = 'admin';
    } else if (i < 5) {
      // Events 3-4: regular participant
      role = 'attendee';
      status = 'member';
    } else if (i < 7) {
      // Events 5-6: requested
      role = 'attendee';
      status = 'requested';
    } else {
      // Event 7: invited
      role = 'attendee';
      status = 'invited';
    }

    transactions.push(
      tx.eventParticipants[participantId]
        .update({
          role: role,
          status: status,
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ user: tobiasUserId, event: eventId })
    );
  }

  // Add Tobias as collaborator to amendments with different statuses
  // Take first 8 amendments if available
  // Amendments 0-2: admin status (3 amendments)
  // Amendments 3-4: member status (2 amendments)
  // Amendments 5-6: requested status (2 amendments)
  // Amendment 7: invited status (1 amendment)
  const first8Amendments = amendmentIds.slice(0, Math.min(8, amendmentIds.length));
  for (let i = 0; i < first8Amendments.length; i++) {
    const amendmentId = first8Amendments[i];
    const collaboratorId = id();

    let role = 'editor';
    let status = 'member';

    if (i < 3) {
      // First 3 amendments: admin
      role = 'reviewer';
      status = 'admin';
    } else if (i < 5) {
      // Amendments 3-4: regular collaborator
      role = 'editor';
      status = 'member';
    } else if (i < 7) {
      // Amendments 5-6: requested
      role = 'editor';
      status = 'requested';
    } else {
      // Amendment 7: invited
      role = 'editor';
      status = 'invited';
    }

    transactions.push(
      tx.amendmentCollaborators[collaboratorId]
        .update({
          role: role,
          status: status,
          createdAt: faker.date.past({ years: 0.5 }),
        })
        .link({ user: tobiasUserId, amendment: amendmentId })
    );
  }

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(`✓ Tobias subscriptions created:`);
  console.log(`  - Users: ${otherUsers.length}`);
  console.log(`  - Groups: ${groupIds.length}`);
  console.log(`  - Amendments: ${amendmentIds.length}`);
  console.log(`  - Events: ${eventIds.length}`);
  console.log(`  - Blogs: ${blogIds.length}`);
  console.log(`✓ Tobias memberships created:`);
  console.log(`  - Admin in first 3 groups`);
  console.log(`  - Member in groups 4-5 (2 groups)`);
  console.log(`  - Requested in groups 6-7 (2 groups)`);
  console.log(`  - Invited to group 8 (1 group)`);
  console.log(`  - Total: ${first8Groups.length} groups`);
  console.log(`✓ Tobias event participations created:`);
  console.log(`  - Admin in first 3 events`);
  console.log(`  - Participant in events 4-5 (2 events)`);
  console.log(`  - Requested in events 6-7 (2 events)`);
  console.log(`  - Invited to event 8 (1 event)`);
  console.log(`  - Total: ${first8Events.length} events`);
  console.log(`✓ Tobias amendment collaborations created:`);
  console.log(`  - Admin in first 3 amendments`);
  console.log(`  - Collaborator in amendments 4-5 (2 amendments)`);
  console.log(`  - Requested in amendments 6-7 (2 amendments)`);
  console.log(`  - Invited to amendment 8 (1 amendment)`);
  console.log(`  - Total: ${first8Amendments.length} amendments`);
}

async function seedConversationsAndMessages(
  userIds: string[],
  userToProfileMap: Map<string, string>
) {
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
      const senderProfileId = userToProfileMap.get(senderUserId);
      const messageCreatedAt = faker.date.between({
        from: createdAt,
        to: new Date(),
      });

      if (!senderProfileId) {
        console.warn(`Warning: No profile found for user ${senderUserId}`);
        continue;
      }

      transactions.push(
        tx.messages[messageId]
          .update({
            content: faker.lorem.sentences(randomInt(1, 3)),
            isRead: true, // Main user's messages are all read
            createdAt: messageCreatedAt,
            updatedAt: null,
            deletedAt: null,
          })
          .link({ conversation: conversationId, sender: senderProfileId })
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
        const senderProfileId = userToProfileMap.get(senderUserId);
        const messageCreatedAt = faker.date.between({
          from: createdAt,
          to: new Date(),
        });

        if (!senderProfileId) {
          console.warn(`Warning: No profile found for user ${senderUserId}`);
          continue;
        }

        transactions.push(
          tx.messages[messageId]
            .update({
              content: faker.lorem.sentences(randomInt(1, 3)),
              isRead: faker.datatype.boolean(0.7), // 70% read
              createdAt: messageCreatedAt,
              updatedAt: null,
              deletedAt: null,
            })
            .link({ conversation: conversationId, sender: senderProfileId })
        );
        totalMessages++;
      }

      totalConversations++;
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} conversation-related records...`);
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(
    `✓ Created ${totalConversations} conversations with ${totalMessages} messages (main user: 3 conversations)`
  );
}

async function seedEvents(userIds: string[], groupIds: string[]) {
  console.log('Seeding events...');
  const transactions = [];
  const eventIds: string[] = [];
  let totalEvents = 0;
  let totalParticipants = 0;

  for (const groupId of groupIds) {
    const eventCount = randomInt(SEED_CONFIG.eventsPerGroup.min, SEED_CONFIG.eventsPerGroup.max);

    for (let i = 0; i < eventCount; i++) {
      const eventId = id();
      const organizerId = randomItem(userIds);
      const startDate = faker.date.future({ years: 1 });
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + randomInt(1, 4));

      eventIds.push(eventId);

      // Create event
      transactions.push(
        tx.events[eventId]
          .update({
            title: faker.lorem.words(randomInt(3, 6)),
            description: faker.lorem.paragraphs(2),
            location: `${faker.location.streetAddress()}, ${faker.location.city()}`,
            startDate,
            endDate,
            isPublic: faker.datatype.boolean(0.8), // 80% public
            capacity: randomInt(20, 200),
            imageURL: faker.image.url(),
            tags: randomItems(
              ['conference', 'workshop', 'meetup', 'seminar', 'social', 'networking'],
              randomInt(1, 3)
            ),
            createdAt: faker.date.past({ years: 0.17 }),
            updatedAt: new Date(),
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
        const status = randomItem(['member', 'member', 'member', 'admin']); // Mostly members, some admins
        const role =
          participantId === organizerId
            ? 'organizer'
            : randomItem(['attendee', 'attendee', 'attendee', 'speaker']);

        transactions.push(
          tx.eventParticipants[eventParticipantId]
            .update({
              status,
              createdAt: faker.date.past({ years: 0.08 }),
              role,
            })
            .link({ user: participantId, event: eventId })
        );
        totalParticipants++;
      }

      // Add hashtags for this event
      const eventHashtags = randomItems(EVENT_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(eventId, 'event', eventHashtags));

      totalEvents++;
    }
  }

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(`✓ Created ${totalEvents} events with ${totalParticipants} participants`);
  return eventIds;
}

async function seedNotifications(userIds: string[]) {
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

  // Create 10 notifications for main user (mix of read/unread)
  for (let i = 0; i < 10; i++) {
    const notificationId = id();
    const senderId = randomItem(userIds.filter(uid => uid !== mainUserId));
    const type = randomItem(notificationTypes);

    transactions.push(
      tx.notifications[notificationId]
        .update({
          type,
          title: faker.lorem.words(randomInt(3, 5)),
          message: faker.lorem.sentence(),
          isRead: i < 4, // First 4 are read, rest are unread
          createdAt: faker.date.recent({ days: i < 4 ? 7 : 2 }), // Recent ones are unread
          relatedEntityType: randomItem(['group', 'event', 'user', 'message', 'post']),
          relatedEntityId: id(),
          actionUrl: faker.internet.url(),
        })
        .link({ recipient: mainUserId, sender: senderId })
    );
    totalNotifications++;
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

      transactions.push(
        tx.notifications[notificationId]
          .update({
            type,
            title: faker.lorem.words(randomInt(3, 5)),
            message: faker.lorem.sentence(),
            isRead: faker.datatype.boolean(0.4), // 40% read
            createdAt: faker.date.recent({ days: 7 }),
            relatedEntityType: randomItem(['group', 'event', 'user', 'message', 'post']),
            relatedEntityId: id(), // Random ID for demonstration
            actionUrl: faker.internet.url(),
          })
          .link({ recipient: userId, sender: senderId })
      );
      totalNotifications++;
    }
  }

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(`✓ Created ${totalNotifications} notifications (main user: 10, 6 unread)`);
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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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
            })
            .link({ document: docId, user: collaboratorId })
        );
      }
    }
  }

  // Execute in batches
  console.log(`  Creating ${transactions.length} document-related records...`);
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

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

  // Create meeting slots for main user and Tobias
  const usersWithSlots = [mainUserId, tobiasUserId];

  for (const userId of usersWithSlots) {
    // Create 5 available time slots (next 2 weeks)
    for (let i = 0; i < 5; i++) {
      const slotId = id();
      const startTime = faker.date.soon({ days: 14 });
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour slots

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
    }

    // Create 3 booked time slots (with bookings)
    for (let i = 0; i < 3; i++) {
      const slotId = id();
      const startTime = faker.date.soon({ days: 7 });
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      const bookerId = randomItem(userIds.filter(uid => uid !== userId));

      transactions.push(
        tx.meetingSlots[slotId]
          .update({
            startTime,
            endTime,
            isPublic: false,
            isAvailable: false, // Not available because it's booked
            title: `1-on-1 Meeting`,
            description: 'Booked',
            meetingType: 'one-on-one',
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ owner: userId })
      );
      totalSlots++;

      // Create booking
      const bookingId = id();
      transactions.push(
        tx.meetingBookings[bookingId]
          .update({
            status: 'confirmed',
            notes: faker.lorem.sentence(),
            createdAt: faker.date.past({ years: 0.04 }),
            updatedAt: new Date(),
          })
          .link({ slot: slotId, booker: bookerId })
      );
      totalBookings++;
    }

    // Create 1 upcoming public meeting slot
    const publicSlotId = id();
    const publicStartTime = faker.date.soon({ days: 3 }); // Soon in next 3 days
    const publicEndTime = new Date(publicStartTime.getTime() + 90 * 60 * 1000); // 90 minutes

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
      const bookingId = id();
      transactions.push(
        tx.meetingBookings[bookingId]
          .update({
            status: 'confirmed',
            notes: faker.lorem.sentence(),
            createdAt: faker.date.past({ years: 0.04 }),
            updatedAt: new Date(),
          })
          .link({ slot: publicSlotId, booker: bookerId })
      );
      totalBookings++;
    }

    // Create 1 past public meeting slot
    const pastPublicSlotId = id();
    const pastPublicStartTime = faker.date.recent({ days: 7 }); // Recent past
    const pastPublicEndTime = new Date(pastPublicStartTime.getTime() + 90 * 60 * 1000);

    transactions.push(
      tx.meetingSlots[pastPublicSlotId]
        .update({
          startTime: pastPublicStartTime,
          endTime: pastPublicEndTime,
          isPublic: true,
          isAvailable: false, // Past meetings are not available
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

  // Create some slots for other random users
  const otherUsersWithSlots = randomItems(
    userIds.filter(uid => uid !== mainUserId && uid !== tobiasUserId),
    3
  );

  for (const userId of otherUsersWithSlots) {
    // Create 2-3 available slots
    const slotCount = randomInt(2, 3);
    for (let i = 0; i < slotCount; i++) {
      const slotId = id();
      const startTime = faker.date.soon({ days: 10 });
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

      transactions.push(
        tx.meetingSlots[slotId]
          .update({
            startTime,
            endTime,
            isPublic: false,
            isAvailable: true,
            title: `Meeting Slot`,
            description: 'Available for booking',
            meetingType: 'one-on-one',
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ owner: userId })
      );
      totalSlots++;
    }
  }

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(`✓ Created ${totalSlots} meeting slots with ${totalBookings} bookings`);
  console.log(`  Main user: 10 slots (5 available, 3 booked, 2 public meetings)`);
  console.log(`  Tobias: 10 slots (5 available, 3 booked, 2 public meetings)`);
}

async function cleanDatabase() {
  console.log('🗑️  Cleaning existing data (deleting all entities)...\n');

  try {
    // Query all entities to delete (including $users)
    const query = {
      $users: {},
      profiles: {},
      stats: {},
      statements: {},
      blogs: {},
      amendments: {},
      user: {},
      groups: {},
      groupMemberships: {},
      groupRelationships: {}, // New: include group relationships
      follows: {},
      subscribers: {}, // New: include subscribers
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
      hashtags: {}, // New: include hashtags
      links: {}, // New: include links
      payments: {}, // New: include payments
      meetingSlots: {}, // New: include meeting slots
      meetingBookings: {}, // New: include meeting bookings
    };

    const data = await db.query(query);
    const deleteTransactions = [];

    // Delete all entities (including $users)
    const entitiesToDelete = [
      'meetingBookings', // Delete meeting bookings first
      'meetingSlots', // Delete meeting slots
      'hashtags', // Delete hashtags first (they link to other entities)
      'links', // Delete links
      'payments', // Delete payments
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
      'eventParticipants',
      'events',
      'messages',
      'conversationParticipants',
      'conversations',
      'subscribers', // Delete subscribers
      'follows',
      'groupRelationships', // New: include group relationships
      'groupMemberships',
      'groups',
      'user',
      'amendments',
      'blogs',
      'statements',
      'stats',
      'profiles',
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

// Main seed function
async function seed() {
  console.log('\n🌱 Starting database seed...\n');
  console.log(`App ID: ${APP_ID}\n`);

  try {
    // Clean existing data first
    await cleanDatabase();

    // Seed in order due to dependencies
    const {
      userIds,
      userToProfileMap,
      blogIds: userBlogIds,
      amendmentIds: userAmendmentIds,
    } = await seedUsers();
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
    await seedConversationsAndMessages(userIds, userToProfileMap);
    const eventIds = await seedEvents(userIds, groupIds);
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
    await seedNotifications(userIds);
    await seedTodos(userIds, groupIds);
    await seedDocuments(userIds); // New: seed documents
    await seedMeetingSlots(userIds); // New: seed meeting slots

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
    console.log(`  - Hashtags for all users, groups, events, and amendments`);
    console.log(`  - Follow relationships (legacy) - main user: 10 following, 5 followers`);
    console.log(`  - Subscriber relationships (new) - main user: 10 subscriptions, 5 subscribers`);
    console.log(`  - Conversations and messages (main user: 3 conversations)`);
    console.log(`  - Events and participants`);
    console.log(`  - Agenda items with elections and voting system (linked to positions)`);
    console.log(`  - Notifications (main user: 10 total, 6 unread)`);
    console.log(`  - Todos and assignments (main user: 5 todos)`);
    console.log(`  - Documents with collaborators (main user: 2 documents)`);
    console.log(`  - Meeting slots and bookings (main user & Tobias: 10 slots each)\n`);
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
