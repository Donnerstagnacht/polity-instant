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
    let positionsToGroups = 0;
    let positionsToHolders = 0;

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
          term: randomItem([1, 2, 3, 4]), // Term in years as a number
          firstTermStart: faker.date.past({ years: 1 }),
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent({ days: 30 }),
        });

        if (holderUserId) {
          transactions.push(positionTx.link({ group: groupId, currentHolder: holderUserId }));
          
          // Create holder history entry
          const historyId = id();
          const startDate = faker.date.past({ years: 1 });
          transactions.push(
            tx.positionHolderHistory[historyId]
              .update({
                startDate,
                endDate: null,
                reason: randomItem(['elected', 'appointed']),
                createdAt: startDate,
              })
              .link({ position: positionId, holder: holderUserId })
          );
          
          positionsToGroups++;
          positionsToHolders++;
        } else {
          transactions.push(positionTx.link({ group: groupId }));
          positionsToGroups++;
        }
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${positionIds.length} positions`);
    console.log(`  - Position-to-group links: ${positionsToGroups}`);
    console.log(`  - Position-to-holder links: ${positionsToHolders}`);

    return {
      ...context,
      positionIds,
      linkCounts: {
        ...context.linkCounts,
        positionsToGroups: (context.linkCounts?.positionsToGroups || 0) + positionsToGroups,
        positionsToHolders: (context.linkCounts?.positionsToHolders || 0) + positionsToHolders,
      },
    };
  },
};
