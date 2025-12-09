/**
 * Amendments Seeder
 * Creates amendment proposals for groups
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems, randomVisibility } from '../helpers/random.helpers';
import { createHashtagTransactions, createAmendmentDocument } from '../helpers/entity.helpers';
import { AMENDMENT_HASHTAGS } from '../config/seed.config';

export const amendmentsSeeder: EntitySeeder = {
  name: 'amendments',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const groupIds = context.groupIds || [];
    const amendmentIds: string[] = [...(context.amendmentIds || [])];
    const transactions = [];

    console.log('Seeding amendments...');

    // Get the main user (first user)
    const mainUserId = userIds[0];

    // Create amendments for each group (2-4 amendments per group)
    for (const groupId of groupIds) {
      const amendmentCount = randomInt(2, 4);
      const ownerId = randomItem(userIds);

      for (let j = 0; j < amendmentCount; j++) {
        const amendmentId = id();
        amendmentIds.push(amendmentId);
        const amendmentTitle = faker.lorem.sentence();

        transactions.push(
          tx.amendments[amendmentId]
            .update({
              title: amendmentTitle,
              subtitle: faker.lorem.sentence(),
              status: randomItem(['Passed', 'Rejected', 'Under Review', 'Drafting'] as const),
              supporters: randomInt(10, 500),
              date: faker.date.past({ years: 1 }).toISOString(),
              code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
              tags: [randomItem(['policy', 'reform', 'legislation', 'amendment', 'proposal'])],
              visibility: randomVisibility(),
            })
            .link({ user: ownerId, group: groupId })
        );

        // Add hashtags
        const amendmentHashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
        transactions.push(
          ...createHashtagTransactions(amendmentId, 'amendment', amendmentHashtags)
        );

        // Add document
        transactions.push(...createAmendmentDocument(amendmentId, amendmentTitle, mainUserId));
      }
    }

    // Execute in batches
    if (transactions.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
      }
    }

    console.log(`✓ Created ${amendmentIds.length} amendments`);

    return {
      ...context,
      amendmentIds,
    };
  },
};
