import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG, USER_HASHTAGS, ARIA_KAI_EMAIL } from '../config/seed.config';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';
import { createHashtagTransactions } from '../helpers/entity.helpers';
import { ARIA_KAI_USER_ID, ARIA_KAI_WELCOME_MESSAGE } from '../../e2e/aria-kai';

export const usersSeeder: EntitySeeder = {
  name: 'users',
  dependencies: [],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding users...');
    const { db } = context;
    const userIds: string[] = [];
    const conversationIds: string[] = [];
    const messageIds: string[] = [];
    const transactions = [];

    // Time constants for consistent timestamps
    const now = Date.now();
    const threeYearsAgo = now - 3 * 365 * 24 * 60 * 60 * 1000;

    // Initialize link tracking counters
    let statsToUsers = 0;
    let statementsToUsers = 0;
    let hashtagsToUsers = 0;
    let directConversationsToRequestedBy = 0;
    let directParticipantsToConversations = 0;
    let directParticipantsToUsers = 0;
    let directMessagesToConversations = 0;
    let directMessagesToSenders = 0;

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
      statsToUsers++;
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
    statementsToUsers++;

    // Add hashtags for main user
    const mainUserHashtags = randomItems(USER_HASHTAGS, 2);
    transactions.push(...createHashtagTransactions(mainUserId, 'user', mainUserHashtags));
    hashtagsToUsers += mainUserHashtags.length;

    // Create Aria & Kai welcome conversation for main user
    const mainUserConversationId = id();
    const mainUserMessageId = id();
    conversationIds.push(mainUserConversationId);
    messageIds.push(mainUserMessageId);

    transactions.push(
      tx.conversations[mainUserConversationId].update({
        lastMessageAt: now,
        createdAt: now,
        type: 'direct',
        status: 'accepted',
      }),
      tx.conversations[mainUserConversationId].link({
        requestedBy: ARIA_KAI_USER_ID,
      }),
      tx.conversationParticipants[id()]
        .update({
          lastReadAt: null,
          joinedAt: now,
          leftAt: null,
        })
        .link({ user: mainUserId, conversation: mainUserConversationId }),
      tx.conversationParticipants[id()]
        .update({
          lastReadAt: now,
          joinedAt: now,
          leftAt: null,
        })
        .link({ user: ARIA_KAI_USER_ID, conversation: mainUserConversationId }),
      tx.messages[mainUserMessageId]
        .update({
          content: ARIA_KAI_WELCOME_MESSAGE,
          isRead: false,
          createdAt: now,
          updatedAt: null,
          deletedAt: null,
        })
        .link({ conversation: mainUserConversationId, sender: ARIA_KAI_USER_ID })
    );

    directConversationsToRequestedBy++;
    directParticipantsToConversations += 2;
    directParticipantsToUsers += 2;
    directMessagesToConversations++;
    directMessagesToSenders++;

    // Create Tobias's user account
    const tobiasUserId = SEED_CONFIG.tobiasUserId;
    userIds.push(tobiasUserId);

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

    // Add stats and statement for Tobias
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
      statsToUsers++;
    }

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
    statementsToUsers++;

    const tobiasHashtags = randomItems(USER_HASHTAGS, 2);
    transactions.push(...createHashtagTransactions(tobiasUserId, 'user', tobiasHashtags));
    hashtagsToUsers += tobiasHashtags.length;

    // Create Aria & Kai welcome conversation for Tobias
    const tobiasConversationId = id();
    const tobiasMessageId = id();
    conversationIds.push(tobiasConversationId);
    messageIds.push(tobiasMessageId);

    transactions.push(
      tx.conversations[tobiasConversationId].update({
        lastMessageAt: now,
        createdAt: now,
        type: 'direct',
        status: 'accepted',
      }),
      tx.conversations[tobiasConversationId].link({
        requestedBy: ARIA_KAI_USER_ID,
      }),
      tx.conversationParticipants[id()]
        .update({
          lastReadAt: null,
          joinedAt: now,
          leftAt: null,
        })
        .link({ user: tobiasUserId, conversation: tobiasConversationId }),
      tx.conversationParticipants[id()]
        .update({
          lastReadAt: now,
          joinedAt: now,
          leftAt: null,
        })
        .link({ user: ARIA_KAI_USER_ID, conversation: tobiasConversationId }),
      tx.messages[tobiasMessageId]
        .update({
          content: ARIA_KAI_WELCOME_MESSAGE,
          isRead: false,
          createdAt: now,
          updatedAt: null,
          deletedAt: null,
        })
        .link({ conversation: tobiasConversationId, sender: ARIA_KAI_USER_ID })
    );

    directConversationsToRequestedBy++;
    directParticipantsToConversations += 2;
    directParticipantsToUsers += 2;
    directMessagesToConversations++;
    directMessagesToSenders++;

    // Create Aria & Kai assistant user (must be created first for conversations)
    const ariaKaiUserId = SEED_CONFIG.ariaKaiUserId;

    userIds.push(ariaKaiUserId);

    transactions.push(
      tx.$users[ariaKaiUserId].update({
        email: ARIA_KAI_EMAIL,
        imageURL: faker.image.avatar(),
        type: 'user',
        name: 'Aria & Kai',
        subtitle: 'Your Personal Assistants',
        avatar: faker.image.avatar(),
        bio: 'We are your personal assistants, here to help you navigate Polity.',
        handle: 'ariakai',
        createdAt: threeYearsAgo,
        updatedAt: now,
        lastSeenAt: now,
        about: 'Aria & Kai are your personal AI assistants.',
        contactEmail: ARIA_KAI_EMAIL,
        visibility: 'public',
      })
    );

    // Add stats for Aria & Kai
    for (let j = 0; j < 3; j++) {
      const statId = id();
      transactions.push(
        tx.stats[statId]
          .update({
            label: ['Conversations', 'Messages Sent', 'Users Helped'][j],
            value: randomInt(100, 1000),
            unit: 'count',
          })
          .link({ user: ariaKaiUserId })
      );
      statsToUsers++;
    }

    // Create random additional users
    const numUsers = randomInt(SEED_CONFIG.users.min, SEED_CONFIG.users.max);
    for (let i = 0; i < numUsers; i++) {
      const userId = id();
      userIds.push(userId);

      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      const fullName = `${firstName} ${lastName}`;
      const handle = `${firstName.toLowerCase()}${lastName.toLowerCase()}${randomInt(1, 999)}`;

      transactions.push(
        tx.$users[userId].update({
          email: faker.internet.email({ firstName, lastName }),
          imageURL: faker.image.avatar(),
          type: 'user',
          name: fullName,
          subtitle: faker.person.jobTitle(),
          avatar: faker.image.avatar(),
          bio: faker.lorem.sentence(),
          handle,
          createdAt: faker.date.past({ years: 2 }),
          updatedAt: faker.date.recent({ days: 30 }),
          lastSeenAt: faker.date.recent({ days: 7 }),
          about: faker.lorem.paragraph(),
          contactEmail: faker.internet.email({ firstName, lastName }),
          contactTwitter: `@${handle}`,
          contactWebsite: faker.internet.url(),
          contactLocation: faker.location.city(),
          visibility: randomItem(['public', 'authenticated', 'private'] as const),
        })
      );

      // Add stats
      const numStats = randomInt(3, 5);
      for (let j = 0; j < numStats; j++) {
        const statId = id();
        transactions.push(
          tx.stats[statId]
            .update({
              label: randomItem(['Posts', 'Subscribers', 'Following', 'Groups', 'Events']),
              value: randomInt(0, 100),
              unit: 'count',
            })
            .link({ user: userId })
        );
        statsToUsers++;
      }

      // Add a statement (50% chance)
      if (Math.random() > 0.5) {
        const statementId = id();
        transactions.push(
          tx.statements[statementId]
            .update({
              text: faker.lorem.sentence(),
              tag: randomItem(['politics', 'technology', 'environment', 'education']),
              visibility: randomItem(['public', 'authenticated', 'private'] as const),
            })
            .link({ user: userId })
        );
        statementsToUsers++;
      }

      // Add hashtags
      const numHashtags = randomInt(1, 3);
      const userHashtags = randomItems(USER_HASHTAGS, numHashtags);
      transactions.push(...createHashtagTransactions(userId, 'user', userHashtags));
      hashtagsToUsers += userHashtags.length;

      // Create Aria & Kai welcome conversation for this user
      const userConversationId = id();
      const userMessageId = id();
      conversationIds.push(userConversationId);
      messageIds.push(userMessageId);

      transactions.push(
        tx.conversations[userConversationId].update({
          lastMessageAt: now,
          createdAt: now,
          type: 'direct',
          status: 'accepted',
        }),
        tx.conversations[userConversationId].link({
          requestedBy: ARIA_KAI_USER_ID,
        }),
        tx.conversationParticipants[id()]
          .update({
            lastReadAt: null,
            joinedAt: now,
            leftAt: null,
          })
          .link({ user: userId, conversation: userConversationId }),
        tx.conversationParticipants[id()]
          .update({
            lastReadAt: now,
            joinedAt: now,
            leftAt: null,
          })
          .link({ user: ARIA_KAI_USER_ID, conversation: userConversationId }),
        tx.messages[userMessageId]
          .update({
            content: ARIA_KAI_WELCOME_MESSAGE,
            isRead: false,
            createdAt: now,
            updatedAt: null,
            deletedAt: null,
          })
          .link({ conversation: userConversationId, sender: ARIA_KAI_USER_ID })
      );

      directConversationsToRequestedBy++;
      directParticipantsToConversations += 2;
      directParticipantsToUsers += 2;
      directMessagesToConversations++;
      directMessagesToSenders++;
    }

    // Batch transact
    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${userIds.length} users`);
    console.log(`✅ Created ${conversationIds.length} Aria & Kai welcome conversations`);

    return {
      ...context,
      userIds,
      conversationIds: [...(context.conversationIds || []), ...conversationIds],
      messageIds: [...(context.messageIds || []), ...messageIds],
      linkCounts: {
        ...(context.linkCounts || {}),
        statsToUsers,
        statementsToUsers,
        hashtagsToUsers,
        directConversationsToRequestedBy:
          (context.linkCounts?.directConversationsToRequestedBy || 0) +
          directConversationsToRequestedBy,
        directParticipantsToConversations:
          (context.linkCounts?.directParticipantsToConversations || 0) +
          directParticipantsToConversations,
        directParticipantsToUsers:
          (context.linkCounts?.directParticipantsToUsers || 0) + directParticipantsToUsers,
        directMessagesToConversations:
          (context.linkCounts?.directMessagesToConversations || 0) + directMessagesToConversations,
        directMessagesToSenders:
          (context.linkCounts?.directMessagesToSenders || 0) + directMessagesToSenders,
      },
    };
  },
};
