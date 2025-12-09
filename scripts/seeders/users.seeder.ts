import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG, USER_HASHTAGS, ARIA_KAI_EMAIL } from '../config/seed.config';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';
import { createHashtagTransactions } from '../helpers/entity.helpers';

export const usersSeeder: EntitySeeder = {
  name: 'users',
  dependencies: [],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding users...');
    const { db } = context;
    const userIds: string[] = [];
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

    const tobiasHashtags = randomItems(USER_HASHTAGS, 2);
    transactions.push(...createHashtagTransactions(tobiasUserId, 'user', tobiasHashtags));

    // Create Aria & Kai assistant user
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
        createdAt: faker.date.past({ years: 3 }),
        updatedAt: new Date(),
        lastSeenAt: new Date(),
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
      }

      // Add hashtags
      const numHashtags = randomInt(1, 3);
      const userHashtags = randomItems(USER_HASHTAGS, numHashtags);
      transactions.push(...createHashtagTransactions(userId, 'user', userHashtags));
    }

    // Batch transact
    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${userIds.length} users`);

    return { ...context, userIds };
  },
};
