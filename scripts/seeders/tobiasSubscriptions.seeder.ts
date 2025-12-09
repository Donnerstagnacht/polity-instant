/**
 * Tobias Subscriptions Seeder
 * Seeds comprehensive subscriptions and memberships for Tobias test user
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG } from '../config/seed.config';

export const tobiasSubscriptionsSeeder: EntitySeeder = {
  name: 'tobiasSubscriptions',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const groupIds = context.groupIds || [];
    const eventIds = context.eventIds || [];
    const amendmentIds = context.amendmentIds || [];
    const blogIds = context.blogIds || [];

    console.log('Seeding comprehensive subscriptions and memberships for Tobias...');
    const transactions = [];
    const tobiasUserId = SEED_CONFIG.tobiasUserId;

    // Initialize link counters
    let tobiasSubscribersToUsers = 0;
    let tobiasSubscribersToGroups = 0;
    let tobiasSubscribersToAmendments = 0;
    let tobiasSubscribersToEvents = 0;
    let tobiasSubscribersToBlogs = 0;

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
      tobiasSubscribersToUsers++;
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
      tobiasSubscribersToGroups++;
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
      tobiasSubscribersToAmendments++;
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
      tobiasSubscribersToEvents++;
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
      tobiasSubscribersToBlogs++;
    }

    // Execute in batches
    if (transactions.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
      }
    }

    const totalSubscriptions =
      otherUsers.length + groupIds.length + amendmentIds.length + eventIds.length + blogIds.length;
    console.log(`✓ Created ${totalSubscriptions} subscriptions for Tobias user`);
    console.log(`  - ${otherUsers.length} user subscriptions`);
    console.log(`  - ${groupIds.length} group subscriptions`);
    console.log(`  - ${amendmentIds.length} amendment subscriptions`);
    console.log(`  - ${eventIds.length} event subscriptions`);
    console.log(`  - ${blogIds.length} blog subscriptions`);

    return {
      ...context,
      linkCounts: {
        ...(context.linkCounts || {}),
        tobiasSubscribersToUsers,
        tobiasSubscribersToGroups,
        tobiasSubscribersToAmendments,
        tobiasSubscribersToEvents,
        tobiasSubscribersToBlogs,
      },
    };
  },
};
