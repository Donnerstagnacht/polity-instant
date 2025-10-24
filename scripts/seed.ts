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

// Seed data generators
async function seedUsers() {
  console.log('Seeding users...');
  const userIds: string[] = [];
  const userToProfileMap = new Map<string, string>(); // Map user IDs to profile IDs
  const transactions = [];

  // First, ensure the main test user exists and update it
  const mainUserId = SEED_CONFIG.mainTestUserId;
  userIds.push(mainUserId);

  // Update main user (will create if doesn't exist, update if it does)
  transactions.push(
    tx.$users[mainUserId].update({
      email: 'test@polity.app',
      imageURL: faker.image.avatar(),
      type: 'user',
    })
  );

  // Create or update profile for main user
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
      })
      .link({ user: mainUserId })
  );

  // Add some stats for main user
  for (let j = 0; j < 5; j++) {
    const statId = id();
    transactions.push(
      tx.stats[statId]
        .update({
          label: ['Posts', 'Followers', 'Following', 'Groups', 'Events'][j],
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

  // Add a blog post for main user
  const blogId = id();
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

  // Now create other users
  for (let i = 0; i < SEED_CONFIG.users; i++) {
    const userId = id();
    const email = faker.internet.email().toLowerCase();
    const handle = faker.internet.username().toLowerCase();
    const name = faker.person.fullName();

    userIds.push(userId);

    // Create user
    transactions.push(
      tx.$users[userId].update({
        email,
        imageURL: faker.image.avatar(),
        type: 'user',
      })
    );

    // Create profile
    const profileId = id();
    userToProfileMap.set(userId, profileId); // Track profile ID for this user
    transactions.push(
      tx.profiles[profileId]
        .update({
          name,
          subtitle: faker.person.jobTitle(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.paragraph(),
          handle,
          isActive: faker.datatype.boolean(0.9), // 90% active
          createdAt: faker.date.past({ years: 2 }),
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
            label: randomItem(['Posts', 'Followers', 'Following', 'Groups', 'Events']),
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
    }

    // Add some amendments
    const amendmentCount = randomInt(0, 2);
    for (let j = 0; j < amendmentCount; j++) {
      const amendmentId = id();
      transactions.push(
        tx.amendments[amendmentId]
          .update({
            title: faker.lorem.sentence(),
            subtitle: faker.lorem.sentence(),
            status: randomItem(['Passed', 'Rejected', 'Under Review', 'Drafting']),
            supporters: randomInt(10, 1000),
            date: faker.date.past({ years: 1 }).toISOString(),
            code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
            tags: [randomItem(['policy', 'reform', 'legislation', 'amendment', 'proposal'])],
          })
          .link({ user: userId })
      );
    }
  }

  // Execute in batches to avoid timeout
  console.log(`  Creating ${transactions.length} user-related records...`);
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(`✓ Created 1 main test user + ${SEED_CONFIG.users} additional users with profiles`);
  return { userIds, userToProfileMap };
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
    if (groupIds.length >= 5) {
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

  console.log(`✓ Created ${totalRelationships} group relationships`);
}

async function seedGroups(userIds: string[]) {
  console.log('Seeding groups...');
  const groupIds: string[] = [];
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
          role: 'owner',
          joinedAt: faker.date.past({ years: 1 }),
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
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            role: randomItem(['admin', 'member', 'member', 'member']),
            joinedAt: faker.date.past({ years: 0.5 }),
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
          role: 'owner',
          joinedAt: faker.date.past({ years: 1 }),
        })
        .link({ user: ownerId, group: groupId })
    );

    // Maybe add main user as member to some groups
    if (i < 5 && !members.includes(mainUserId)) {
      const mainUserMembershipId = id();
      transactions.push(
        tx.groupMemberships[mainUserMembershipId]
          .update({
            role: randomItem(['admin', 'member']),
            joinedAt: faker.date.past({ years: 0.5 }),
          })
          .link({ user: mainUserId, group: groupId })
      );
      members.push(mainUserId);
    }

    for (const memberId of members) {
      const membershipId = id();
      transactions.push(
        tx.groupMemberships[membershipId]
          .update({
            role: randomItem(['admin', 'member', 'member', 'member']), // More members than admins
            joinedAt: faker.date.past({ years: 0.5 }),
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
  return groupIds;
}

async function seedFollows(userIds: string[]) {
  console.log('Seeding follows...');
  const transactions = [];
  let totalFollows = 0;

  const mainUserId = SEED_CONFIG.mainTestUserId;

  // Make main user follow 10 random users
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

  // Make 5 random users follow the main user
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

  // Create follows for other users
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

  // Execute in batches
  const batchSize = 50;
  for (let i = 0; i < transactions.length; i += batchSize) {
    const batch = transactions.slice(i, i + batchSize);
    await db.transact(batch);
  }

  console.log(
    `✓ Created ${totalFollows} follow relationships (main user: 10 following, 5 followers)`
  );
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
        const status = randomItem(['going', 'going', 'going', 'maybe', 'declined']); // More "going"
        const role =
          participantId === organizerId
            ? 'organizer'
            : randomItem(['attendee', 'attendee', 'attendee', 'speaker']);

        transactions.push(
          tx.eventParticipants[eventParticipantId]
            .update({
              status,
              joinedAt: faker.date.past({ years: 0.08 }),
              role,
            })
            .link({ user: participantId, event: eventId })
        );
        totalParticipants++;
      }

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
    const todoTx = tx.todos[todoId].update({
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
      todoTx.link({ creator: mainUserId, group: groupId });
    } else {
      todoTx.link({ creator: mainUserId });
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
      const todoTx = tx.todos[todoId].update({
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
        todoTx.link({ creator: userId, group: groupId });
      } else {
        todoTx.link({ creator: userId });
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
    `✓ Created ${totalTodos} todos with ${totalAssignments} assignments (main user: 5 todos)`
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

// Delete all data except $users
async function cleanDatabase() {
  console.log('🗑️  Cleaning existing data (keeping $users)...\n');

  try {
    // Query all entities to delete (excluding $users and $files)
    const query = {
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
    };

    const data = await db.query(query);
    const deleteTransactions = [];

    // Delete all entities
    const entitiesToDelete = [
      'profiles',
      'stats',
      'statements',
      'blogs',
      'amendments',
      'user',
      'groups',
      'groupMemberships',
      'groupRelationships', // New: include group relationships
      'follows',
      'conversations',
      'conversationParticipants',
      'messages',
      'events',
      'eventParticipants',
      'notifications',
      'todos',
      'todoAssignments',
      'magicCodes',
      'agendaItems',
      'elections',
      'electionCandidates',
      'electionVotes',
      'amendmentVotes',
      'changeRequests',
      'changeRequestVotes',
      'amendmentVoteEntries',
      'positions',
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
    const { userIds, userToProfileMap } = await seedUsers();
    const groupIds = await seedGroups(userIds);
    await seedGroupRelationships(groupIds); // New: seed group relationships
    const positionIds = await seedPositions(groupIds); // New: seed positions
    await seedFollows(userIds);
    await seedConversationsAndMessages(userIds, userToProfileMap);
    const eventIds = await seedEvents(userIds, groupIds);
    await seedAgendaAndVoting(userIds, eventIds, positionIds); // Pass positionIds
    await seedNotifications(userIds);
    await seedTodos(userIds, groupIds);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Summary:');
    console.log(`  - 1 main test user (${SEED_CONFIG.mainTestUserId})`);
    console.log(`  - ${SEED_CONFIG.users} additional users`);
    console.log(`  - ${SEED_CONFIG.groups} groups (2 owned by main user)`);
    console.log(`  - Group relationships with hierarchical structure`);
    console.log(`  - Positions across all groups`);
    console.log(`  - Follow relationships (main user: 10 following, 5 followers)`);
    console.log(`  - Conversations and messages (main user: 3 conversations)`);
    console.log(`  - Events and participants`);
    console.log(`  - Agenda items with elections and voting system (linked to positions)`);
    console.log(`  - Notifications (main user: 10 total, 6 unread)`);
    console.log(`  - Todos and assignments (main user: 5 todos)\n`);
    console.log('Main test user details:');
    console.log(`  - ID: ${SEED_CONFIG.mainTestUserId}`);
    console.log(`  - Email: test@polity.app`);
    console.log(`  - Handle: @testuser`);
    console.log(`  - Owns 2 groups`);
    console.log(`  - Member of ~3 additional groups\n`);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed
seed();
