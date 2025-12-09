import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG } from '../config/seed.config';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const subscriptionsSeeder: EntitySeeder = {
  name: 'subscriptions',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding subscriptions...');
    const { db, userIds, groupIds, eventIds, amendmentIds } = context;
    const transactions = [];
    const subscriptionIds: string[] = [];

    // Link counters
    let subscriptionsToSubscribers = 0;
    let subscriptionsToSubscribedUsers = 0;
    let subscriptionsToSubscribedGroups = 0;
    let subscriptionsToSubscribedEvents = 0;
    let subscriptionsToSubscribedAmendments = 0;

    const mainUserId = SEED_CONFIG.mainTestUserId;

    // Main user subscriptions
    const mainUserSubscribedUsers = randomItems(
      userIds.filter(id => id !== mainUserId),
      10
    );
    for (const subscribedId of mainUserSubscribedUsers) {
      const subscriptionId = id();
      subscriptionIds.push(subscriptionId);
      transactions.push(
        tx.subscriptions[subscriptionId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
            notificationsEnabled: faker.datatype.boolean(0.8),
          })
          .link({ subscriber: mainUserId, subscribedToUser: subscribedId })
      );
      subscriptionsToSubscribers++;
      subscriptionsToSubscribedUsers++;
    }

    // Main user group subscriptions
    const mainUserSubscribedGroups = randomItems(groupIds, randomInt(3, 5));
    for (const groupId of mainUserSubscribedGroups) {
      const subscriptionId = id();
      subscriptionIds.push(subscriptionId);
      transactions.push(
        tx.subscriptions[subscriptionId]
          .update({
            createdAt: faker.date.past({ years: 0.5 }),
            notificationsEnabled: faker.datatype.boolean(0.8),
          })
          .link({ subscriber: mainUserId, subscribedToGroup: groupId })
      );
      subscriptionsToSubscribers++;
      subscriptionsToSubscribedGroups++;
    }

    // Main user event subscriptions
    if (eventIds.length > 0) {
      const mainUserSubscribedEvents = randomItems(eventIds, randomInt(2, 4));
      for (const eventId of mainUserSubscribedEvents) {
        const subscriptionId = id();
        subscriptionIds.push(subscriptionId);
        transactions.push(
          tx.subscriptions[subscriptionId]
            .update({
              createdAt: faker.date.past({ years: 0.5 }),
              notificationsEnabled: faker.datatype.boolean(0.8),
            })
            .link({ subscriber: mainUserId, subscribedToEvent: eventId })
        );
        subscriptionsToSubscribers++;
        subscriptionsToSubscribedEvents++;
      }
    }

    // Main user amendment subscriptions
    if (amendmentIds.length > 0) {
      const mainUserSubscribedAmendments = randomItems(amendmentIds, randomInt(3, 6));
      for (const amendmentId of mainUserSubscribedAmendments) {
        const subscriptionId = id();
        subscriptionIds.push(subscriptionId);
        transactions.push(
          tx.subscriptions[subscriptionId]
            .update({
              createdAt: faker.date.past({ years: 0.5 }),
              notificationsEnabled: faker.datatype.boolean(0.8),
            })
            .link({ subscriber: mainUserId, subscribedToAmendment: amendmentId })
        );
        subscriptionsToSubscribers++;
        subscriptionsToSubscribedAmendments++;
      }
    }

    // Random subscriptions for other users
    for (const userId of userIds.filter(id => id !== mainUserId)) {
      // User subscriptions
      const numUserSubs = randomInt(1, 5);
      const subscribedUsers = randomItems(
        userIds.filter(id => id !== userId),
        numUserSubs
      );
      for (const subscribedId of subscribedUsers) {
        const subscriptionId = id();
        subscriptionIds.push(subscriptionId);
        transactions.push(
          tx.subscriptions[subscriptionId]
            .update({
              createdAt: faker.date.past({ years: 0.5 }),
              notificationsEnabled: faker.datatype.boolean(0.7),
            })
            .link({ subscriber: userId, subscribedToUser: subscribedId })
        );
        subscriptionsToSubscribers++;
        subscriptionsToSubscribedUsers++;
      }

      // Group subscriptions
      if (groupIds.length > 0 && Math.random() > 0.3) {
        const subscribedGroup = randomItem(groupIds);
        const subscriptionId = id();
        subscriptionIds.push(subscriptionId);
        transactions.push(
          tx.subscriptions[subscriptionId]
            .update({
              createdAt: faker.date.past({ years: 0.5 }),
              notificationsEnabled: faker.datatype.boolean(0.7),
            })
            .link({ subscriber: userId, subscribedToGroup: subscribedGroup })
        );
        subscriptionsToSubscribers++;
        subscriptionsToSubscribedGroups++;
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${subscriptionIds.length} subscriptions`);
    console.log(`   Links created:`);
    console.log(`   - subscriptionsToSubscribers: ${subscriptionsToSubscribers}`);
    console.log(`   - subscriptionsToSubscribedUsers: ${subscriptionsToSubscribedUsers}`);
    console.log(`   - subscriptionsToSubscribedGroups: ${subscriptionsToSubscribedGroups}`);
    console.log(`   - subscriptionsToSubscribedEvents: ${subscriptionsToSubscribedEvents}`);
    console.log(`   - subscriptionsToSubscribedAmendments: ${subscriptionsToSubscribedAmendments}`);

    return {
      ...context,
      subscriptionIds,
      linkCounts: {
        ...context.linkCounts,
        subscriptionsToSubscribers:
          (context.linkCounts?.subscriptionsToSubscribers || 0) + subscriptionsToSubscribers,
        subscriptionsToSubscribedUsers:
          (context.linkCounts?.subscriptionsToSubscribedUsers || 0) +
          subscriptionsToSubscribedUsers,
        subscriptionsToSubscribedGroups:
          (context.linkCounts?.subscriptionsToSubscribedGroups || 0) +
          subscriptionsToSubscribedGroups,
        subscriptionsToSubscribedEvents:
          (context.linkCounts?.subscriptionsToSubscribedEvents || 0) +
          subscriptionsToSubscribedEvents,
        subscriptionsToSubscribedAmendments:
          (context.linkCounts?.subscriptionsToSubscribedAmendments || 0) +
          subscriptionsToSubscribedAmendments,
      },
    };
  },
};
