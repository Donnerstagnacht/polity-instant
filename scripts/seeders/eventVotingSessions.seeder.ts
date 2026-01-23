/**
 * Event Voting Sessions Seeder
 * Seeds event voting sessions for amendments at events
 */

import { id, tx } from '@instantdb/admin';
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
    const transactions = [];
    let totalVotingSessions = 0;
    let totalEventVotes = 0;

    const voteTypes = ['accept', 'reject', 'abstain'];

    // Query agenda items to create voting sessions for
    const agendaQuery = await db.query({
      agendaItems: {
        event: {},
        amendment: {},
      },
    });

    const agendaItemsWithAmendments = (agendaQuery?.agendaItems || []).filter(
      (item: any) => item.amendment?.id
    );

    // Create voting sessions for some agenda items with amendments
    const itemsToProcess = randomItems(
      agendaItemsWithAmendments,
      Math.min(agendaItemsWithAmendments.length, randomInt(3, 8))
    );

    for (const agendaItem of itemsToProcess as any[]) {
      const eventId = agendaItem.event?.id;
      const amendmentId = agendaItem.amendment?.id;

      if (!eventId || !amendmentId) continue;

      const sessionId = id();
      const createdById = randomItem(userIds);
      const sessionPhase = randomItem(['setup', 'introduction', 'voting', 'closed']);
      const duration = randomInt(60, 300); // 1-5 minutes
      const quorumPercentage = randomItem([50, 60, 67, 75]);
      const passThreshold = randomItem([50, 60, 67]);

      const startedAt =
        sessionPhase !== 'setup' ? faker.date.recent({ days: 7 }).getTime() : undefined;
      const closedAt =
        sessionPhase === 'closed'
          ? startedAt! + duration * 1000 + randomInt(1000, 10000)
          : undefined;

      transactions.push(
        tx.eventVotingSessions[sessionId]
          .update({
            phase: sessionPhase,
            duration,
            quorumPercentage,
            passThreshold,
            startedAt,
            closedAt,
            createdAt: faker.date.past({ years: 0.1 }).getTime(),
          })
          .link({
            event: eventId,
            agendaItem: agendaItem.id,
            amendment: amendmentId,
            createdBy: createdById,
          })
      );
      totalVotingSessions++;

      // Create votes for voting/closed sessions
      if (sessionPhase === 'voting' || sessionPhase === 'closed') {
        const voterCount = randomInt(3, Math.min(10, userIds.length));
        const voters = randomItems(userIds, voterCount);

        for (const voterId of voters) {
          const voteId = id();
          const voteType = randomItem(voteTypes);

          transactions.push(
            tx.eventVotes[voteId]
              .update({
                voteType,
                votedAt: faker.date.recent({ days: 1 }).getTime(),
              })
              .link({
                session: sessionId,
                user: voterId,
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
      await db.transact(batch);
    }

    console.log(`  Created ${totalVotingSessions} event voting sessions`);
    console.log(`  Created ${totalEventVotes} event votes`);

    return context;
  },
};
