/**
 * Amendments Seeder
 * Creates amendment proposals for groups
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems, randomVisibility } from '../helpers/random.helpers';
import { createHashtagTransactions, createAmendmentDocument } from '../helpers/entity.helpers';
import { AMENDMENT_HASHTAGS, SEED_CONFIG } from '../config/seed.config';
import { DEFAULT_AMENDMENT_ROLES } from '../../db/rbac/constants';

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
    const mainUserId = SEED_CONFIG.mainTestUserId;
    const tobiasUserId = SEED_CONFIG.tobiasUserId;

    // Store amendments for cloning
    const amendmentsToClone: { id: string; title: string; ownerId: string }[] = [];

    // Create amendments for each group (2-4 amendments per group)
    for (const groupId of groupIds) {
      const amendmentCount = randomInt(2, 4);
      const ownerId = randomItem(userIds);

      for (let j = 0; j < amendmentCount; j++) {
        const amendmentId = id();
        amendmentIds.push(amendmentId);
        const amendmentTitle = faker.lorem.sentence();

        // Store for potential cloning (50% chance to be cloned later)
        if (Math.random() < 0.5) {
          amendmentsToClone.push({ id: amendmentId, title: amendmentTitle, ownerId });
        }

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

        // Determine workflow status based on amendment lifecycle
        const workflowStatus = randomItem([
          'collaborative_editing',
          'internal_suggesting',
          'internal_voting',
          'viewing',
          'event_suggesting',
          'event_voting',
          'passed',
          'rejected',
        ] as const);

        // Only set currentEventId if in event phase
        const currentEventId = ['event_suggesting', 'event_voting'].includes(workflowStatus)
          ? targetEventId
          : undefined;

        // Determine supporting groups (2-5 random groups)
        const supportingGroupsCount = randomInt(2, 5);
        const supportingGroups = randomItems(
          groupIds,
          Math.min(supportingGroupsCount, groupIds.length)
        );

        transactions.push(
          tx.amendments[amendmentId]
            .update({
              title: amendmentTitle,
              subtitle: faker.lorem.sentence(),
              status: randomItem(['Passed', 'Rejected', 'Under Review', 'Drafting'] as const),
              workflowStatus,
              currentEventId,
              supporters: randomInt(10, 500),
              supporterGroups: supportingGroups,
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

        // Create amendment roles
        const amendmentRoleIds: Record<string, string> = {};
        for (const roleDef of DEFAULT_AMENDMENT_ROLES) {
          const roleId = id();
          amendmentRoleIds[roleDef.name] = roleId;

          transactions.push(
            tx.roles[roleId]
              .update({
                name: roleDef.name,
                description: roleDef.description,
                scope: 'amendment',
                createdAt: faker.date.past({ years: 0.5 }),
                updatedAt: new Date(),
              })
              .link({ amendment: amendmentId })
          );

          // Create action rights for this role
          for (const perm of roleDef.permissions) {
            const actionRightId = id();
            transactions.push(
              tx.actionRights[actionRightId]
                .update({
                  resource: perm.resource,
                  action: perm.action,
                })
                .link({ roles: [roleId], amendment: amendmentId })
            );
          }
        }

        // Create amendmentCollaborator to link user to amendment (as owner/admin)
        const collaboratorId = id();
        transactions.push(
          tx.amendmentCollaborators[collaboratorId]
            .update({
              status: 'admin', // Owner is admin
              createdAt: faker.date.past({ years: 1 }),
              visibility: randomVisibility(),
            })
            .link({
              amendment: amendmentId,
              user: ownerId,
              role: amendmentRoleIds['Author'],
            })
        );

        // Always add Tobias as a Collaborator with manage rights (if not the owner)
        if (tobiasUserId && userIds.includes(tobiasUserId) && ownerId !== tobiasUserId) {
          const tobiasCollabId = id();
          // Give Tobias Author role (manage rights) on 50% of amendments, otherwise Collaborator
          const tobiasRole = Math.random() < 0.5 ? 'Author' : 'Collaborator';
          transactions.push(
            tx.amendmentCollaborators[tobiasCollabId]
              .update({
                status: tobiasRole === 'Author' ? 'admin' : 'member',
                createdAt: faker.date.past({ years: 1 }),
                visibility: randomVisibility(),
              })
              .link({
                amendment: amendmentId,
                user: tobiasUserId,
                role: amendmentRoleIds[tobiasRole],
              })
          );
        }

        // Add some random collaborators (2-4 collaborators per amendment)
        const collaboratorCount = randomInt(2, 4);
        const potentialCollaborators = userIds.filter(
          uid => uid !== ownerId && uid !== tobiasUserId
        );
        const selectedCollaborators = randomItems(potentialCollaborators, collaboratorCount);

        for (const collaboratorUserId of selectedCollaborators) {
          const colId = id();
          // 30% chance to be Author (with manage rights), 70% Collaborator
          const roleType = Math.random() < 0.3 ? 'Author' : 'Collaborator';
          transactions.push(
            tx.amendmentCollaborators[colId]
              .update({
                status: roleType === 'Author' ? 'admin' : 'member',
                createdAt: faker.date.past({ years: 1 }),
                visibility: randomVisibility(),
              })
              .link({
                amendment: amendmentId,
                user: collaboratorUserId,
                role: amendmentRoleIds[roleType],
              })
          );
        }

        // Link amendment to group
        transactions.push(tx.amendments[amendmentId].link({ groups: groupId }));

        // Add group supporters links (already determined above)
        for (const supportingGroupId of supportingGroups) {
          transactions.push(
            tx.amendments[amendmentId].link({ groupSupporters: supportingGroupId })
          );
        }

        // Create support confirmations for some supporter groups (30% chance each)
        // This simulates amendments where changes have been made and supporters need to confirm
        for (const supportingGroupId of supportingGroups) {
          if (Math.random() < 0.3) {
            const confirmationId = id();
            const confirmationStatus = randomItem(['pending', 'confirmed', 'declined'] as const);
            const now = Date.now();

            transactions.push(
              tx.supportConfirmations[confirmationId]
                .update({
                  status: confirmationStatus,
                  changeRequestId: '', // Will be linked to a change request if available
                  originalVersion: { content: faker.lorem.paragraphs(3) },
                  createdAt: now - randomInt(1, 7) * 24 * 60 * 60 * 1000, // 1-7 days ago
                  respondedAt:
                    confirmationStatus !== 'pending'
                      ? now - randomInt(0, 3) * 24 * 60 * 60 * 1000
                      : undefined,
                })
                .link({
                  amendment: amendmentId,
                  group: supportingGroupId,
                })
            );
          }
        }

        // Track links
        userLinks++;
        groupLinks++;

        // Add hashtags
        const amendmentHashtags = randomItems(AMENDMENT_HASHTAGS, randomInt(2, 4));
        transactions.push(
          ...createHashtagTransactions(amendmentId, 'amendment', amendmentHashtags)
        );

        // Add document
        transactions.push(
          ...createAmendmentDocument(amendmentId, amendmentTitle, mainUserId, workflowStatus)
        );

        // Add change requests (2-5 per amendment if in suggesting/voting phase)
        if (
          ['internal_suggesting', 'internal_voting', 'event_suggesting', 'event_voting'].includes(
            workflowStatus
          )
        ) {
          const changeRequestCount = randomInt(2, 5);
          const isEventPhase = ['event_suggesting', 'event_voting'].includes(workflowStatus);

          for (let k = 0; k < changeRequestCount; k++) {
            const changeRequestId = id();
            const proposedChange = faker.lorem.paragraphs(randomInt(1, 3));
            const originalText = faker.lorem.paragraphs(randomInt(1, 3));

            // Calculate character count (simple diff length approximation)
            const characterCount =
              Math.abs(proposedChange.length - originalText.length) +
              Math.floor(Math.random() * 50); // Add some variation

            const crStatus = randomItem(['proposed', 'pending', 'accepted', 'rejected'] as const);
            const source = isEventPhase ? 'event_participant' : 'collaborator';
            const creatorId = isEventPhase
              ? randomItem(userIds)
              : randomItem(selectedCollaborators.concat([ownerId]));

            transactions.push(
              tx.changeRequests[changeRequestId]
                .update({
                  title: faker.lorem.sentence(),
                  description: faker.lorem.sentences(2),
                  proposedChange,
                  justification: faker.lorem.paragraph(),
                  status: crStatus,
                  characterCount,
                  source,
                  sourceEventId: isEventPhase ? currentEventId : undefined,
                  votingOrder: k, // Sequential order
                  requiresVoting: workflowStatus.includes('voting'),
                  votingThreshold: 50,
                  createdAt: faker.date.recent({ days: 30 }),
                  updatedAt: new Date(),
                })
                .link({
                  amendment: amendmentId,
                  creator: creatorId,
                })
            );

            // Add votes on change requests if in voting phase
            if (workflowStatus.includes('voting') && crStatus !== 'proposed') {
              const voteCount = randomInt(3, 8);
              const voters = randomItems(userIds, voteCount);

              for (const voterId of voters) {
                const voteId = id();
                transactions.push(
                  tx.changeRequestVotes[voteId]
                    .update({
                      vote: randomItem(['accept', 'reject', 'abstain'] as const),
                      createdAt: faker.date.recent({ days: 10 }),
                      updatedAt: faker.date.recent({ days: 5 }),
                    })
                    .link({
                      changeRequest: changeRequestId,
                      voter: voterId,
                    })
                );
              }
            }
          }
        }

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

        // Create voting session if in event_voting phase
        if (workflowStatus === 'event_voting' && currentEventId) {
          const sessionId = id();
          const now = Date.now();
          const votingDuration = randomInt(15, 60) * 60 * 1000; // 15-60 minutes

          transactions.push(
            tx.amendmentVotingSessions[sessionId]
              .update({
                votingType: 'event',
                status: randomItem(['pending', 'active', 'completed'] as const),
                votingStartTime: now,
                votingEndTime: now + votingDuration,
                votingIntervalMinutes: randomInt(15, 60),
                currentChangeRequestIndex: randomInt(0, 3),
                autoClose: faker.datatype.boolean(0.5),
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .link({
                amendment: amendmentId,
                event: currentEventId,
                agendaItem: pathSegmentIds[0], // Link to first agenda item
              })
          );
        } else if (workflowStatus === 'internal_voting') {
          // Create internal voting session
          const sessionId = id();
          const now = Date.now();
          const votingDuration = randomInt(24, 72) * 60 * 60 * 1000; // 1-3 days

          transactions.push(
            tx.amendmentVotingSessions[sessionId]
              .update({
                votingType: 'internal',
                status: randomItem(['pending', 'active', 'completed'] as const),
                votingStartTime: now,
                votingEndTime: now + votingDuration,
                votingIntervalMinutes: randomInt(60, 180),
                currentChangeRequestIndex: randomInt(0, 2),
                autoClose: faker.datatype.boolean(0.3),
                createdAt: new Date(),
                updatedAt: new Date(),
              })
              .link({
                amendment: amendmentId,
              })
          );
        }

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

    // Create clones (1-3 clones from random amendments in the collection)
    let clonesCreated = 0;
    const cloneCount = Math.min(randomInt(1, 3), amendmentsToClone.length);

    for (let i = 0; i < cloneCount; i++) {
      const originalAmendment = randomItem(amendmentsToClone);
      const cloneId = id();
      const cloneOwnerId = randomItem(userIds);

      amendmentIds.push(cloneId);

      // Clone the amendment with modified title
      transactions.push(
        tx.amendments[cloneId]
          .update({
            title: `${originalAmendment.title} (Clone)`,
            subtitle: faker.lorem.sentence(),
            status: 'Drafting',
            supporters: 0,
            date: new Date().toISOString(),
            code: `AMN-${faker.string.alphanumeric(6).toUpperCase()}`,
            tags: [randomItem(['policy', 'reform', 'legislation', 'amendment', 'proposal'])],
            visibility: randomVisibility(),
          })
          .link({
            clonedFrom: originalAmendment.id,
          })
      );

      // Create roles for the clone
      const cloneRoleIds: Record<string, string> = {};
      for (const roleDef of DEFAULT_AMENDMENT_ROLES) {
        const roleId = id();
        cloneRoleIds[roleDef.name] = roleId;

        transactions.push(
          tx.roles[roleId]
            .update({
              name: roleDef.name,
              description: roleDef.description,
              scope: 'amendment',
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .link({ amendment: cloneId })
        );

        // Create action rights for this role
        for (const perm of roleDef.permissions) {
          const actionRightId = id();
          transactions.push(
            tx.actionRights[actionRightId]
              .update({
                resource: perm.resource,
                action: perm.action,
              })
              .link({ roles: [roleId], amendment: cloneId })
          );
        }
      }

      // Add clone owner as admin collaborator
      const collaboratorId = id();
      transactions.push(
        tx.amendmentCollaborators[collaboratorId]
          .update({
            status: 'admin',
            createdAt: new Date(),
            visibility: randomVisibility(),
          })
          .link({
            amendment: cloneId,
            user: cloneOwnerId,
            role: cloneRoleIds['Author'],
          })
      );

      // Clone the document (find original document and create a copy)
      transactions.push(
        ...createAmendmentDocument(
          cloneId,
          `${originalAmendment.title} (Clone)`,
          cloneOwnerId,
          'collaborative_editing'
        )
      );

      clonesCreated++;
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
    console.log(`  - Clones created: ${clonesCreated}`);
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
