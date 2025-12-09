/**
 * Amendment Targets Seeder
 * Links amendments to target groups and events.
 * Creates amendment paths with agenda items and votes for each step.
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

export const amendmentTargetsSeeder: EntitySeeder = {
  name: 'amendmentTargets',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const groupIds = context.groupIds || [];
    const eventIds = context.eventIds || [];
    const amendmentIds = context.amendmentIds || [];

    console.log('Seeding amendment targets with paths, agenda items, and votes for each step...');
    const transactions = [];
    let totalAssigned = 0;
    let pathsCreated = 0;
    let agendaItemsCreated = 0;
    let amendmentVotesCreated = 0;

    // Link counters
    let amendmentTargetsAgendaItemsToEvents = 0;
    let amendmentTargetsAgendaItemsToCreators = 0;
    let amendmentTargetsAgendaItemsToAmendments = 0;
    let amendmentTargetsAmendmentVotesToAgendaItems = 0;
    let amendmentTargetsAmendmentVotesToCreators = 0;
    let amendmentTargetsAmendmentVoteEntriesToAmendmentVotes = 0;
    let amendmentTargetsAmendmentVoteEntriesToVoters = 0;
    let amendmentPathsToAmendments = 0;

    const amendmentPathIds: string[] = [];
    const amendmentVoteIds: string[] = [];

    // Assign target group and event to ~60% of amendments
    const amendmentsToUpdate = randomItems(amendmentIds, Math.floor(amendmentIds.length * 0.6));

    for (const amendmentId of amendmentsToUpdate) {
      const targetGroupId = randomItem(groupIds);
      const amendmentOwner = randomItem(userIds);

      // Create a mock path (2-3 groups in the path)
      const pathLength = randomInt(2, 3);
      const pathGroups = randomItems(groupIds, pathLength);
      // Ensure target group is last
      if (!pathGroups.includes(targetGroupId)) {
        pathGroups[pathGroups.length - 1] = targetGroupId;
      }

      // For each group in the path, assign an event and create agenda items + votes
      const pathData = [];
      const groupEvents = pathGroups.map(() => {
        // Find future events for this group
        const groupEvs = eventIds.filter(() => Math.random() > 0.3); // Randomly assign some events
        return randomItem(groupEvs);
      });

      for (let i = 0; i < pathGroups.length; i++) {
        const groupId = pathGroups[i];
        const eventId = groupEvents[i];
        const isFirst = i === 0;

        if (eventId) {
          // Create agenda item for this event
          const agendaItemId = id();
          const amendmentVoteId = id();
          amendmentVoteIds.push(amendmentVoteId);

          // First event gets 'forward_confirmed', others get 'previous_decision_outstanding'
          const forwardingStatus = isFirst ? 'forward_confirmed' : 'previous_decision_outstanding';

          transactions.push(
            tx.agendaItems[agendaItemId]
              .update({
                title: `Amendment Discussion`,
                description: 'Discussion and voting on amendment proposal',
                type: 'amendment',
                status: 'pending',
                forwardingStatus: forwardingStatus,
                order: randomInt(1, 10),
                createdAt: faker.date.recent({ days: 30 }),
                updatedAt: new Date(),
              })
              .link({
                event: eventId,
                creator: amendmentOwner,
                amendment: amendmentId,
              })
          );
          agendaItemsCreated++;
          amendmentTargetsAgendaItemsToEvents++;
          amendmentTargetsAgendaItemsToCreators++;
          amendmentTargetsAgendaItemsToAmendments++;

          // Create amendment vote linked to the agenda item
          const voteStatus = isFirst ? randomItem(['pending', 'active']) : 'pending';
          transactions.push(
            tx.amendmentVotes[amendmentVoteId]
              .update({
                title: 'Amendment Proposal Vote',
                description: 'Vote on the proposed amendment',
                proposedText: faker.lorem.paragraph(),
                originalText: faker.lorem.paragraph(),
                status: voteStatus,
                createdAt: faker.date.recent({ days: 30 }),
                updatedAt: new Date(),
                votingStartTime:
                  voteStatus === 'active' ? faker.date.recent({ days: 2 }) : undefined,
                votingEndTime: voteStatus === 'active' ? faker.date.soon({ days: 7 }) : undefined,
              })
              .link({
                agendaItem: agendaItemId,
                creator: amendmentOwner,
              })
          );
          amendmentVotesCreated++;
          amendmentTargetsAmendmentVotesToAgendaItems++;
          amendmentTargetsAmendmentVotesToCreators++;

          // Add some vote entries if the vote is active
          if (voteStatus === 'active') {
            const numVotes = randomInt(5, 15);
            const voters = randomItems(userIds, numVotes);
            const voteOptions = ['accept', 'reject', 'abstain'];

            for (const voterId of voters) {
              const voteEntryId = id();
              transactions.push(
                tx.amendmentVoteEntries[voteEntryId]
                  .update({
                    vote: randomItem(voteOptions),
                    createdAt: faker.date.recent({ days: 5 }),
                    updatedAt: faker.date.recent({ days: 2 }),
                  })
                  .link({
                    amendmentVote: amendmentVoteId,
                    voter: voterId,
                  })
              );
              amendmentTargetsAmendmentVoteEntriesToAmendmentVotes++;
              amendmentTargetsAmendmentVoteEntriesToVoters++;
            }
          }

          // Add to path data
          pathData.push({
            groupId,
            groupName: `Group ${i + 1}`,
            eventId,
            eventTitle: `Event ${i + 1}`,
            eventStartDate: faker.date.future({ years: 0.5 }),
            agendaItemId,
            amendmentVoteId,
            forwardingStatus,
          });
        } else {
          // No event for this group
          pathData.push({
            groupId,
            groupName: `Group ${i + 1}`,
            eventId: null,
            eventTitle: 'No upcoming event',
            eventStartDate: null,
            agendaItemId: null,
            amendmentVoteId: null,
            forwardingStatus: 'previous_decision_outstanding',
          });
        }
      }

      // Create amendment path
      const pathId = id();
      amendmentPathIds.push(pathId);
      transactions.push(
        tx.amendmentPaths[pathId]
          .update({
            pathData,
            pathLength: pathData.length,
            createdAt: new Date(),
          })
          .link({
            amendment: amendmentId,
          })
      );
      pathsCreated++;
      amendmentPathsToAmendments++;

      // Update amendment with timestamp
      transactions.push(
        tx.amendments[amendmentId].update({
          updatedAt: new Date(),
        })
      );
      totalAssigned++;
    }

    // Execute in batches
    if (transactions.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
      }
    }

    console.log(`✓ Assigned targets to ${totalAssigned} amendments`);
    console.log(`✓ Created ${agendaItemsCreated} agenda items across all path events`);
    console.log(`✓ Created ${amendmentVotesCreated} amendment votes`);
    console.log(`✓ Created ${pathsCreated} amendment paths`);
    console.log(`  ${amendmentIds.length - totalAssigned} amendments without targets (drafts)`);

    return {
      ...context,
      amendmentPathIds,
      amendmentVoteIds,
      linkCounts: {
        ...(context.linkCounts || {}),
        amendmentTargetsAgendaItemsToEvents,
        amendmentTargetsAgendaItemsToCreators,
        amendmentTargetsAgendaItemsToAmendments,
        amendmentTargetsAmendmentVotesToAgendaItems,
        amendmentTargetsAmendmentVotesToCreators,
        amendmentTargetsAmendmentVoteEntriesToAmendmentVotes,
        amendmentTargetsAmendmentVoteEntriesToVoters,
        amendmentPathsToAmendments,
      },
    };
  },
};
