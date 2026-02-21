/**
 * Event Voting Sessions Seeder
 * Seeds event voting sessions for amendments at events
 */

import { id } from '../helpers/id.helper';
import { tx } from '../helpers/compat';
import { batchTransact } from '../helpers/transaction.helpers';
import type { InsertOp } from '../helpers/transaction.helpers';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

export const eventVotingSessionsSeeder: EntitySeeder = {
  name: 'eventVotingSessions',
  dependencies: ['users', 'events', 'agendaAndVoting'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const eventIds = context.eventIds || [];

    console.log('Seeding event voting sessions...');
    const transactions: InsertOp[] = [];
    let totalVotingSessions = 0;
    let totalEventVotes = 0;

    const voteTypes = ['accept', 'reject', 'abstain'];

    // Query agenda items to create voting sessions for
    const { data: agendaItemsRaw } = await db.from('agendaItems').select('*');

    const agendaItemsWithAmendments = (agendaItemsRaw || []).filter(
      (item: any) => item.amendmentId
    );

    // Create voting sessions for some agenda items with amendments
    const itemsToProcess = randomItems(
      agendaItemsWithAmendments,
      Math.min(agendaItemsWithAmendments.length, randomInt(3, 8))
    );

    for (const agendaItem of itemsToProcess as any[]) {
      const eventId = agendaItem.eventId;
      const amendmentId = agendaItem.amendmentId;

      if (!eventId || !amendmentId) continue;

      const sessionId = id();
      const sessionPhase = randomItem(['introduction', 'voting', 'completed']);
      const timeLimit = randomInt(60, 300); // 1-5 minutes in seconds
      const majorityType = randomItem(['simple', 'absolute', 'two_thirds']);
      const votingType = 'amendment';

      const startedAt =
        sessionPhase !== 'introduction' ? faker.date.recent({ days: 7 }) : undefined;
      const endedAt = sessionPhase === 'completed' ? faker.date.recent({ days: 1 }) : undefined;

      transactions.push(
        tx.eventVotingSessions[sessionId]
          .update({
            phase: sessionPhase,
            votingType,
            timeLimit,
            majorityType,
            targetEntityType: 'amendment',
            targetEntityId: amendmentId,
            ...(startedAt ? { startedAt } : {}),
            ...(endedAt ? { endedAt } : {}),
            createdAt: faker.date.past({ years: 0.1 }),
            updatedAt: new Date(),
          })
          .link({
            event: eventId,
            agendaItem: agendaItem.id,
            amendment: amendmentId,
          })
      );
      totalVotingSessions++;

      // Create votes for voting/completed sessions
      if (sessionPhase === 'voting' || sessionPhase === 'completed') {
        const voterCount = randomInt(3, Math.min(10, userIds.length));
        const voters = randomItems(userIds, voterCount);

        for (const voterId of voters) {
          const voteId = id();
          const voteType = randomItem(voteTypes);

          transactions.push(
            tx.eventVotes[voteId]
              .update({
                vote: voteType,
                createdAt: faker.date.recent({ days: 1 }),
              })
              .link({
                session: sessionId,
                voter: voterId,
              })
          );
          totalEventVotes++;
        }
      }
    }

    // Execute transactions in batches
    const batchSize = 100;
    for (let i = 0; i < transactions.length; i += batchSize) {
      const batch = transactions.slice(i, i + batchSize);
      await batchTransact(db, batch);
    }

    console.log(`  Created ${totalVotingSessions} event voting sessions`);
    console.log(`  Created ${totalEventVotes} event votes`);

    return context;
  },
};
