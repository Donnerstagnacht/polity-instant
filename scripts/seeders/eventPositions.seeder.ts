import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const eventPositionsSeeder: EntitySeeder = {
  name: 'eventPositions',
  dependencies: ['users', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding event positions...');
    const { db, userIds, eventIds } = context;
    const eventPositionIds: string[] = [];
    const transactions = [];
    let eventPositionsToEvents = 0;
    let eventPositionHoldersCount = 0;

    const positionTitles = [
      'Session Chair',
      'Conference President',
      'Counting Committee',
      'Protocol Writer',
      'Timekeeper',
      'Technical Coordinator',
      'Facilitator',
      'Moderator',
    ];

    const positionDescriptions = [
      'Leads the session and ensures agenda adherence',
      'Oversees the entire event and represents participants',
      'Responsible for counting and verifying votes',
      'Documents proceedings and decisions',
      'Manages speaking times and agenda schedule',
      'Handles technical aspects and equipment',
      'Guides discussions and ensures participation',
      'Moderates debates and Q&A sessions',
    ];

    for (const eventId of eventIds) {
      const numPositions = randomInt(1, 3); // 1-3 positions per event

      for (let i = 0; i < numPositions; i++) {
        const positionId = id();
        eventPositionIds.push(positionId);

        const titleIndex = randomInt(0, positionTitles.length - 1);
        const capacity = randomItem([1, 1, 1, 2, 3]); // Mostly 1, occasionally 2-3
        const createElection = Math.random() < 0.5; // 50% chance of creating election

        const positionTx = tx.eventPositions[positionId].update({
          title: positionTitles[titleIndex],
          description: positionDescriptions[titleIndex],
          capacity,
          createElectionOnAgenda: createElection,
          createdAt: faker.date.past({ years: 1 }),
          updatedAt: faker.date.recent({ days: 30 }),
        });

        transactions.push(positionTx.link({ event: eventId }));
        eventPositionsToEvents++;

        // 60% chance of having holders (but not more than capacity)
        if (Math.random() < 0.6) {
          const numHolders = randomInt(1, Math.min(capacity, 2));
          const selectedHolders = faker.helpers.shuffle([...userIds]).slice(0, numHolders);

          for (const userId of selectedHolders) {
            const holderId = id();
            transactions.push(
              tx.eventPositionHolders[holderId]
                .update({
                  createdAt: faker.date.recent({ days: 60 }),
                })
                .link({
                  position: positionId,
                  user: userId,
                })
            );
            eventPositionHoldersCount++;
          }
        }
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${eventPositionIds.length} event positions`);
    console.log(`  - EventPosition-to-event links: ${eventPositionsToEvents}`);
    console.log(`  - EventPositionHolder links: ${eventPositionHoldersCount}`);

    return {
      ...context,
      eventPositionIds,
      linkCounts: {
        ...context.linkCounts,
        eventPositionsToEvents:
          (context.linkCounts?.eventPositionsToEvents || 0) + eventPositionsToEvents,
        eventPositionHoldersCount:
          (context.linkCounts?.eventPositionHoldersCount || 0) + eventPositionHoldersCount,
      },
    };
  },
};
