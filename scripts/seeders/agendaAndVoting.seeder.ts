/**
 * Agenda and Voting Seeder
 * Seeds agenda items, elections, and voting systems for events
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

export const agendaAndVotingSeeder: EntitySeeder = {
  name: 'agendaAndVoting',
  dependencies: ['users', 'groups', 'events', 'positions', 'eventPositions'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const eventIds = context.eventIds || [];
    const positionIds = context.positionIds || [];
    const amendmentIds = context.amendmentIds || [];

    console.log('Seeding agenda items and voting system...');
    const transactions = [];
    let totalAgendaItems = 0;
    let totalElections = 0;
    let totalAmendmentVotes = 0;
    let totalChangeRequests = 0;
    let totalVotes = 0;

    // Link tracking counters
    let agendaItemsToCreators = 0;
    let agendaItemsToEvents = 0;
    let agendaItemsToAmendments = 0;
    let electionsToAgendaItems = 0;
    let electionsToPositions = 0;
    let electionCandidatesToElections = 0;
    let electionCandidatesToUsers = 0;
    let electionVotesToElections = 0;
    let electionVotesToVoters = 0;
    let electionVotesToCandidates = 0;
    let agendaAmendmentVotesToAgendaItems = 0;
    let changeRequestsToAmendmentVotes = 0;
    let changeRequestsToCreators = 0;
    let changeRequestVotesToChangeRequests = 0;
    let changeRequestVotesToVoters = 0;
    let agendaAmendmentVoteEntriesToAmendmentVotes = 0;
    let agendaAmendmentVoteEntriesToVoters = 0;

    const agendaTypes = ['election', 'vote', 'speech', 'discussion'];
    const voteStatuses = ['planned', 'active', 'completed'];
    const majorityTypes = ['relative', 'absolute'];

    // Query event positions that need elections created
    const eventPositionsQuery = await db.query({
      eventPositions: {},
    });
    const allEventPositions = eventPositionsQuery?.eventPositions || [];

    for (const eventId of eventIds) {
      let orderCounter = 1;

      // Create elections for event positions with createElectionOnAgenda=true
      const eventPositionsForThisEvent = allEventPositions.filter(
        (p: any) => p.event?.id === eventId && p.createElectionOnAgenda === true
      );

      for (const eventPosition of eventPositionsForThisEvent) {
        const agendaItemId = id();
        const creatorId = randomItem(userIds);
        const startTime = faker.date.future({ years: 0.5 });

        // Create agenda item for the election
        transactions.push(
          tx.agendaItems[agendaItemId]
            .update({
              title: `Wahl: ${eventPosition.title}`,
              description: eventPosition.description || `Election for ${eventPosition.title}`,
              type: 'election',
              scheduledTime: startTime.toISOString(),
              duration: randomInt(15, 45), // 15-45 minutes for elections
              status: 'planned',
              order: orderCounter++,
              createdAt: faker.date.past({ years: 0.08 }),
              updatedAt: new Date(),
            })
            .link({ creator: creatorId, event: eventId })
        );
        totalAgendaItems++;
        agendaItemsToCreators++;
        agendaItemsToEvents++;

        // Create the election linked to this event position
        const electionId = id();
        const majorityType = randomItem(majorityTypes);

        const electionTx = tx.elections[electionId]
          .update({
            title: `${eventPosition.title} Wahl`,
            description: eventPosition.description || `Election for ${eventPosition.title}`,
            majorityType,
            isMultipleChoice: false,
            status: 'planned',
            votingStartTime: startTime,
            votingEndTime: new Date(startTime.getTime() + randomInt(30, 60) * 60000),
            createdAt: faker.date.past({ years: 0.08 }),
            updatedAt: new Date(),
          })
          .link({ agendaItem: agendaItemId, eventPosition: eventPosition.id });

        transactions.push(electionTx);
        totalElections++;
        electionsToAgendaItems++;

        // Add election candidates
        const candidateCount = Math.min(randomInt(2, 4), userIds.length);
        const candidates = randomItems(userIds, candidateCount);

        for (const candidateUserId of candidates) {
          const candidateId = id();
          transactions.push(
            tx.electionCandidates[candidateId]
              .update({
                name: faker.person.fullName(),
                description: faker.lorem.sentence(),
                order: faker.number.int({ min: 1, max: 10 }),
                createdAt: faker.date.past({ years: 0.08 }),
              })
              .link({ election: electionId, user: candidateUserId })
          );
          electionCandidatesToElections++;
          electionCandidatesToUsers++;
        }
      }

      const agendaItemCount = randomInt(2, 5); // 2-5 agenda items per event

      for (let i = 0; i < agendaItemCount; i++) {
        const agendaItemId = id();
        const creatorId = randomItem(userIds);
        const type = randomItem(agendaTypes);
        const startTime = faker.date.future({ years: 0.5 });
        const status = randomItem(voteStatuses);
        const amendmentId =
          type === 'vote' && amendmentIds.length > 0 ? randomItem(amendmentIds) : undefined;

        // Add activation and completion timestamps based on status
        const isCompleted = status === 'completed';
        const isActive = status === 'active';
        const activatedAt = isActive || isCompleted ? faker.date.recent({ days: 7 }) : undefined;
        const completedAt = isCompleted ? faker.date.recent({ days: 3 }) : undefined;

        // Create agenda item
        transactions.push(
          tx.agendaItems[agendaItemId]
            .update({
              title: faker.lorem.words(randomInt(3, 6)),
              description: faker.lorem.paragraph(),
              type,
              scheduledTime: startTime.toISOString(),
              duration: randomInt(15, 120), // 15-120 minutes
              status,
              order: orderCounter++,
              createdAt: faker.date.past({ years: 0.08 }),
              updatedAt: new Date(),
              ...(activatedAt ? { activatedAt } : {}),
              ...(completedAt ? { completedAt } : {}),
            })
            .link({
              creator: creatorId,
              event: eventId,
              ...(amendmentId ? { amendment: amendmentId } : {}),
            })
        );
        if (amendmentId) {
          agendaItemsToAmendments++;
        }
        totalAgendaItems++;
        agendaItemsToCreators++;
        agendaItemsToEvents++;

        // Create elections for election-type agenda items
        if (type === 'election' || faker.datatype.boolean(0.3)) {
          const electionId = id();
          const majorityType = randomItem(majorityTypes);
          const positionId = randomItem(positionIds);

          const electionTx = tx.elections[electionId]
            .update({
              title: `${faker.lorem.words(2)} Wahl`,
              description: faker.lorem.sentence(),
              majorityType,
              isMultipleChoice: faker.datatype.boolean(0.3),
              status: randomItem(voteStatuses),
              votingStartTime: startTime,
              votingEndTime: new Date(startTime.getTime() + randomInt(30, 180) * 60000),
              createdAt: faker.date.past({ years: 0.08 }),
              updatedAt: new Date(),
            })
            .link({ agendaItem: agendaItemId, position: positionId });

          transactions.push(electionTx);
          totalElections++;
          electionsToAgendaItems++;
          electionsToPositions++;

          // Add election candidates
          const candidateCount = randomInt(2, 5);
          const candidates = randomItems(userIds, candidateCount);

          for (const candidateUserId of candidates) {
            const candidateId = id();
            transactions.push(
              tx.electionCandidates[candidateId]
                .update({
                  name: faker.person.fullName(),
                  description: faker.lorem.sentence(),
                  order: candidates.indexOf(candidateUserId) + 1,
                  createdAt: faker.date.past({ years: 0.04 }),
                })
                .link({ election: electionId, user: candidateUserId })
            );
            electionCandidatesToElections++;
            electionCandidatesToUsers++;
          }

          // Add election votes
          if (faker.datatype.boolean(0.6)) {
            const voterCount = randomInt(3, Math.min(8, userIds.length));
            const voters = randomItems(userIds, voterCount);

            for (const voterId of voters) {
              const voteId = id();
              const votedCandidateId = randomItem(candidates);

              transactions.push(
                tx.electionVotes[voteId]
                  .update({
                    createdAt: faker.date.recent({ days: 30 }),
                  })
                  .link({
                    election: electionId,
                    voter: voterId,
                    candidate: votedCandidateId,
                  })
              );
              totalVotes++;
              electionVotesToElections++;
              electionVotesToVoters++;
              electionVotesToCandidates++;
            }
          }
        }

        // Create amendment votes for vote-type agenda items
        if (type === 'vote' || faker.datatype.boolean(0.4)) {
          const amendmentVoteId = id();

          transactions.push(
            tx.amendmentVotes[amendmentVoteId]
              .update({
                title: `Abstimmung: ${faker.lorem.words(3)}`,
                description: faker.lorem.paragraph(),
                originalText: faker.lorem.paragraphs(2),
                proposedText: faker.lorem.paragraphs(2),
                status: randomItem(voteStatuses),
                votingStartTime: startTime,
                votingEndTime: new Date(startTime.getTime() + randomInt(30, 120) * 60000),
                createdAt: faker.date.past({ years: 0.08 }),
                updatedAt: new Date(),
              })
              .link({ agendaItem: agendaItemId })
          );
          totalAmendmentVotes++;
          agendaAmendmentVotesToAgendaItems++;

          // Add change requests
          const changeRequestCount = randomInt(0, 3);
          for (let k = 0; k < changeRequestCount; k++) {
            const changeRequestId = id();
            const submitterId = randomItem(userIds);

            transactions.push(
              tx.changeRequests[changeRequestId]
                .update({
                  title: `Änderungsantrag ${k + 1}`,
                  description: faker.lorem.sentence(),
                  proposedChange: faker.lorem.paragraph(),
                  status: randomItem(['pending', 'approved', 'rejected']),
                  createdAt: faker.date.past({ years: 0.04 }),
                  updatedAt: new Date(),
                })
                .link({ amendmentVote: amendmentVoteId, creator: submitterId })
            );
            totalChangeRequests++;
            changeRequestsToAmendmentVotes++;
            changeRequestsToCreators++;

            // Add votes on change requests
            if (faker.datatype.boolean(0.5)) {
              const voterCount = randomInt(2, 6);
              const voters = randomItems(userIds, voterCount);

              for (const voterId of voters) {
                const voteId = id();
                transactions.push(
                  tx.changeRequestVotes[voteId]
                    .update({
                      vote: randomItem(['yes', 'no', 'abstain']),
                      createdAt: faker.date.recent({ days: 14 }),
                    })
                    .link({ changeRequest: changeRequestId, voter: voterId })
                );
                totalVotes++;
                changeRequestVotesToChangeRequests++;
                changeRequestVotesToVoters++;
              }
            }
          }

          // Add amendment vote entries
          if (faker.datatype.boolean(0.7)) {
            const voterCount = randomInt(5, Math.min(12, userIds.length));
            const voters = randomItems(userIds, voterCount);

            for (const voterId of voters) {
              const voteEntryId = id();

              transactions.push(
                tx.amendmentVoteEntries[voteEntryId]
                  .update({
                    vote: randomItem(['yes', 'yes', 'no', 'abstain']),
                    createdAt: faker.date.recent({ days: 30 }),
                  })
                  .link({ amendmentVote: amendmentVoteId, voter: voterId })
              );
              totalVotes++;
              agendaAmendmentVoteEntriesToAmendmentVotes++;
              agendaAmendmentVoteEntriesToVoters++;
            }
          }
        }
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

    console.log(`✓ Created ${totalAgendaItems} agenda items with:`);
    console.log(`  - ${totalElections} elections`);
    console.log(`  - ${totalAmendmentVotes} amendment votes`);
    console.log(`  - ${totalChangeRequests} change requests`);
    console.log(`  - ${totalVotes} total votes across all voting types`);

    return {
      ...context,
      linkCounts: {
        ...(context.linkCounts || {}),
        agendaItemsToCreators,
        agendaItemsToEvents,
        agendaItemsToAmendments,
        electionsToAgendaItems,
        electionsToPositions,
        electionCandidatesToElections,
        electionCandidatesToUsers,
        electionVotesToElections,
        electionVotesToVoters,
        electionVotesToCandidates,
        agendaAmendmentVotesToAgendaItems,
        changeRequestsToAmendmentVotes,
        changeRequestsToCreators,
        changeRequestVotesToChangeRequests,
        changeRequestVotesToVoters,
        agendaAmendmentVoteEntriesToAmendmentVotes,
        agendaAmendmentVoteEntriesToVoters,
      },
    };
  },
};
