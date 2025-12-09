import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG } from '../config/seed.config';
import { randomInt, randomItem } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const positionsSeeder: EntitySeeder = {
  name: 'positions',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding positions...');
    const { db, userIds, groupIds } = context;
    const positionIds: string[] = [];
    const transactions = [];

    const positionTitles = [
      'President',
      'Vice President',
      'Secretary',
      'Treasurer',
      'Board Member',
      'Communications Director',
      'Policy Advisor',
      'Event Coordinator',
    ];

    for (const groupId of groupIds) {
      const numPositions = randomInt(
        SEED_CONFIG.positionsPerGroup.min,
        SEED_CONFIG.positionsPerGroup.max
      );

      for (let i = 0; i < numPositions; i++) {
        const positionId = id();
        positionIds.push(positionId);

        const title = randomItem(positionTitles);
        const holderUserId = Math.random() > 0.3 ? randomItem(userIds) : null;

        const positionTx = tx.positions[positionId].update({
          title,
          description: faker.lorem.sentence(),
          responsibilities: faker.lorem.paragraph(),
          term: randomItem([1, 2, 3, 4]), // Term in years as a number
          firstTermStart: faker.date.past({ years: 1 }),
          isElected: faker.datatype.boolean(),
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent({ days: 30 }),
        });

        if (holderUserId) {
          transactions.push(positionTx.link({ group: groupId, holder: holderUserId }));
        } else {
          transactions.push(positionTx.link({ group: groupId }));
        }
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${positionIds.length} positions`);

    return { ...context, positionIds };
  },
};
