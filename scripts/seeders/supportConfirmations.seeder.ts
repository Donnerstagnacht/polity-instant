/**
 * Support Confirmations Seeder
 * Seeds support confirmation requests for groups supporting amendments
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

export const supportConfirmationsSeeder: EntitySeeder = {
  name: 'supportConfirmations',
  dependencies: ['users', 'groups', 'amendments'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const groupIds = context.groupIds || [];

    console.log('Seeding support confirmations...');
    const transactions = [];
    let totalConfirmations = 0;

    // Query amendments with group supporters
    const amendmentsQuery = await db.query({
      amendments: {
        groupSupporters: {},
        changeRequests: {},
        document: {},
      },
    });

    const amendmentsWithSupporters = (amendmentsQuery?.amendments || []).filter(
      (amendment: any) =>
        amendment.groupSupporters?.length > 0 && amendment.changeRequests?.length > 0
    );

    const confirmationStatuses = ['pending', 'confirmed', 'declined'];

    // Create support confirmations for some amendments
    const amendmentsToProcess = randomItems(
      amendmentsWithSupporters,
      Math.min(amendmentsWithSupporters.length, randomInt(3, 10))
    );

    for (const amendment of amendmentsToProcess as any[]) {
      const supportingGroups = amendment.groupSupporters || [];
      const changeRequests = amendment.changeRequests || [];

      if (supportingGroups.length === 0 || changeRequests.length === 0) continue;

      // Pick a random change request that triggered the confirmation
      const changeRequest = randomItem(changeRequests) as any;

      // Create confirmations for each supporting group
      for (const group of supportingGroups as any[]) {
        // Only create confirmations for some groups
        if (faker.datatype.boolean(0.6)) {
          const confirmationId = id();
          const status = randomItem(confirmationStatuses);
          const createdAt = faker.date.recent({ days: 14 }).getTime();

          const confirmationTx = tx.supportConfirmations[confirmationId]
            .update({
              status,
              changeRequestId: changeRequest.id,
              originalVersion: amendment.document?.content || {},
              createdAt,
              respondedAt:
                status !== 'pending' ? createdAt + randomInt(3600000, 86400000 * 3) : undefined,
            })
            .link({
              amendment: amendment.id,
              group: group.id,
              changeRequest: changeRequest.id,
            });

          transactions.push(confirmationTx);
          totalConfirmations++;
        }
      }
    }

    // Execute transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await db.transact(batch);
    }

    console.log(`  Created ${totalConfirmations} support confirmations`);

    return context;
  },
};
