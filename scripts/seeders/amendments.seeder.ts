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
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const groupIds = context.groupIds || [];
    const eventIds = context.eventIds || [];
    const amendmentIds: string[] = [...(context.amendmentIds || [])];
    const amendmentPathIds: string[] = [];
    const amendmentVoteIds: string[] = [];
    const transactions = [];
    let userLinks = 0;
    let groupLinks = 0;
    let pathsCreated = 0;
    let agendaItemsCreated = 0;
    let amendmentVotesCreated = 0;

    // Link counters for amendment targets
    let amendmentTargetsAgendaItemsToEvents = 0;
    let amendmentTargetsAgendaItemsToCreators = 0;
    let amendmentTargetsAgendaItemsToAmendments = 0;
    let amendmentTargetsAmendmentVotesToAgendaItems = 0;
    let amendmentTargetsAmendmentVotesToCreators = 0;
    let amendmentTargetsAmendmentVoteEntriesToAmendmentVotes = 0;
    let amendmentTargetsAmendmentVoteEntriesToVoters = 0;
    let amendmentPathsToAmendments = 0;

    console.log('Seeding amendments with targets and paths...');

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

        // === Create target group and event FIRST ===
        const targetGroupId = randomItem(groupIds);
        const targetEventId = randomItem(eventIds); // Pick any event as target

        // Create amendment entity with target links in one transaction
        // Add video URL for some amendments (30% probability)
        const hasVideo = Math.random() < 0.3;
        const videoURL = hasVideo
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          : undefined;
        const videoThumbnailURL = hasVideo
          ? 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg'
          : undefined;

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
              videoURL,
              videoThumbnailURL,
            })
            .link({
              targetGroup: targetGroupId,
              targetEvent: targetEventId,
            })
        );

        // Create amendmentCollaborator to link user to amendment (as owner/admin)
        const collaboratorId = id();
        transactions.push(
          tx.amendmentCollaborators[collaboratorId]
            .update({
              status: 'admin', // Owner is admin
              createdAt: faker.date.past({ years: 1 }),
              visibility: randomVisibility(),
            })
            .link({ amendment: amendmentId, user: ownerId })
        );

        // Link amendment to group
        transactions.push(tx.amendments[amendmentId].link({ groups: groupId }));

        // Track links
        userLinks++;
        groupLinks++;

        // Add hashtags
        const amendmentHashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
        transactions.push(
          ...createHashtagTransactions(amendmentId, 'amendment', amendmentHashtags)
        );

        // Add document
        transactions.push(...createAmendmentDocument(amendmentId, amendmentTitle, mainUserId));

        // === Create amendment path leading to target ===
        // Create a path (2-3 groups in the path)
        const pathLength = randomInt(2, 3);
        const pathGroups = randomItems(groupIds, pathLength);
        // Ensure target group is last
        pathGroups[pathGroups.length - 1] = targetGroupId;

        // For each group in the path, assign an event and create agenda items + votes
        const pathSegmentIds: string[] = [];
        const groupEvents = pathGroups.map((gId, idx) => {
          // For the last group (target), use the targetEvent
          if (idx === pathGroups.length - 1) {
            return targetEventId;
          }
          // For other groups, assign with 70% probability
          const groupEvs = eventIds.filter(() => Math.random() > 0.3);
          return randomItem(groupEvs);
        });

        for (let i = 0; i < pathGroups.length; i++) {
          const pathGroupId = pathGroups[i];
          const eventId = groupEvents[i];
          const isFirst = i === 0;

          if (eventId) {
            // Create agenda item for this event
            const agendaItemId = id();
            const amendmentVoteId = id();
            amendmentVoteIds.push(amendmentVoteId);

            // First event gets 'forward_confirmed', others get 'previous_decision_outstanding'
            const forwardingStatus = isFirst
              ? 'forward_confirmed'
              : 'previous_decision_outstanding';

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
                  creator: ownerId,
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
                  creator: ownerId,
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

            // Create path segment entity with links to group, event, agendaItem, amendmentVote
            const segmentId = id();
            pathSegmentIds.push(segmentId);

            transactions.push(
              tx.amendmentPathSegments[segmentId]
                .update({
                  order: i,
                  forwardingStatus,
                  createdAt: new Date(),
                })
                .link({
                  group: pathGroupId,
                  event: eventId,
                  agendaItem: agendaItemId,
                  amendmentVote: amendmentVoteId,
                })
            );
          } else {
            // No event for this group - create segment without event/agendaItem/vote
            const segmentId = id();
            pathSegmentIds.push(segmentId);

            transactions.push(
              tx.amendmentPathSegments[segmentId]
                .update({
                  order: i,
                  forwardingStatus: 'previous_decision_outstanding',
                  createdAt: new Date(),
                })
                .link({
                  group: pathGroupId,
                })
            );
          }
        }

        // Create amendment path (without pathData JSON)
        const pathId = id();
        amendmentPathIds.push(pathId);
        transactions.push(
          tx.amendmentPaths[pathId]
            .update({
              pathLength: pathGroups.length,
              createdAt: new Date(),
            })
            .link({
              amendment: amendmentId,
              user: ownerId, // Link to the user whose network was used
            })
        );

        // Link all path segments to the path
        for (const segmentId of pathSegmentIds) {
          transactions.push(
            tx.amendmentPathSegments[segmentId].link({
              path: pathId,
            })
          );
        }

        pathsCreated++;
        amendmentPathsToAmendments++;

        // Link amendment to target group and target event
        if (targetEventId) {
          transactions.push(
            tx.amendments[amendmentId].link({
              targetGroup: targetGroupId,
              targetEvent: targetEventId,
            })
          );
        } else {
          // Fallback: only link target group if no event available
          transactions.push(
            tx.amendments[amendmentId].link({
              targetGroup: targetGroupId,
            })
          );
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

    console.log(`✓ Created ${amendmentIds.length} amendments (all with targets and paths)`);
    console.log(`  - User links: ${userLinks}`);
    console.log(`  - Group links: ${groupLinks}`);
    console.log(`  - Amendment paths: ${pathsCreated}`);
    console.log(`  - Agenda items: ${agendaItemsCreated}`);
    console.log(`  - Amendment votes: ${amendmentVotesCreated}`);

    return {
      ...context,
      amendmentIds,
      amendmentPathIds,
      amendmentVoteIds,
      linkCounts: {
        ...context.linkCounts,
        amendmentsToUsers: (context.linkCounts?.amendmentsToUsers || 0) + userLinks,
        amendmentsToGroups: (context.linkCounts?.amendmentsToGroups || 0) + groupLinks,
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
