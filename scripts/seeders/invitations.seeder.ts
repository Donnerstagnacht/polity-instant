/**
 * Invitations Seeder
 * Seeds pending invitations and requests for:
 * - Group memberships
 * - Event participation
 * - Amendment collaboration
 */

import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import type { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';

// Helper function for random visibility
function randomVisibility(): 'public' | 'authenticated' | 'private' {
  const visibilities: ('public' | 'authenticated' | 'private')[] = [
    'public',
    'authenticated',
    'private',
  ];
  return randomItem(visibilities);
}

export const invitationsSeeder: EntitySeeder = {
  name: 'invitations',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    const { db } = context;
    const userIds = context.userIds || [];
    const groupIds = context.groupIds || [];
    const eventIds = context.eventIds || [];
    const amendmentIds = context.amendmentIds || [];

    const transactions = [];
    const invitationIds: string[] = [];
    const requestIds: string[] = [];
    let totalGroupInvitations = 0;
    let totalGroupRequests = 0;
    let totalEventInvitations = 0;
    let totalEventRequests = 0;
    let totalEventAdmins = 0;
    let totalAmendmentInvitations = 0;
    let totalAmendmentRequests = 0;
    let totalAmendmentAdmins = 0;

    // Link counters
    let groupInvitationsToUsers = 0;
    let groupInvitationsToGroups = 0;
    let groupRequestsToUsers = 0;
    let groupRequestsToGroups = 0;
    let eventInvitationsToUsers = 0;
    let eventInvitationsToEvents = 0;
    let eventRequestsToUsers = 0;
    let eventRequestsToEvents = 0;
    let eventAdminsToUsers = 0;
    let eventAdminsToEvents = 0;
    let amendmentInvitationsToUsers = 0;
    let amendmentInvitationsToAmendments = 0;
    let amendmentRequestsToUsers = 0;
    let amendmentRequestsToAmendments = 0;
    let amendmentAdminsToUsers = 0;
    let amendmentAdminsToAmendments = 0;

    // 1. Seed group invitations and requests
    console.log('Seeding group invitations and requests...');
    for (const groupId of groupIds) {
      // Get users who might not already be members
      const availableUsers = userIds.filter(() => {
        // Simple filter - in production this would check existing memberships
        return Math.random() > 0.3; // 70% chance a user is available
      });

      // Add 2-4 invitations
      const invitationCount = randomInt(2, 4);
      const invitedUsers = randomItems(availableUsers, invitationCount);

      for (const invitedUserId of invitedUsers) {
        const membershipId = id();
        invitationIds.push(membershipId);
        transactions.push(
          tx.groupMemberships[membershipId]
            .update({
              status: 'invited',
              createdAt: faker.date.recent({ days: 30 }),
            })
            .link({ user: invitedUserId, group: groupId })
        );
        totalGroupInvitations++;
        groupInvitationsToUsers++;
        groupInvitationsToGroups++;
      }

      // Add 2-4 requests (from different users)
      const requestCount = randomInt(2, 4);
      const requestingUsers = randomItems(
        availableUsers.filter(u => !invitedUsers.includes(u)),
        requestCount
      );

      for (const requestingUserId of requestingUsers) {
        const membershipId = id();
        requestIds.push(membershipId);
        transactions.push(
          tx.groupMemberships[membershipId]
            .update({
              status: 'requested',
              createdAt: faker.date.recent({ days: 30 }),
            })
            .link({ user: requestingUserId, group: groupId })
        );
        totalGroupRequests++;
        groupRequestsToUsers++;
        groupRequestsToGroups++;
      }
    }

    console.log(
      `✓ Created ${totalGroupInvitations} group invitations and ${totalGroupRequests} group requests`
    );

    // 2. Seed event participation requests and invites
    console.log('Seeding event participation requests and invitations...');
    for (const eventId of eventIds) {
      // Get users who might not already be participants
      const availableUsers = userIds.filter(() => {
        // Simple filter - in production this would check existing participants
        return Math.random() > 0.3; // 70% chance a user is available
      });

      // Add 2-4 invitations
      const invitationCount = randomInt(2, 4);
      const invitedUsers = randomItems(availableUsers, invitationCount);

      for (const invitedUserId of invitedUsers) {
        const participantId = id();
        invitationIds.push(participantId);
        transactions.push(
          tx.eventParticipants[participantId]
            .update({
              status: 'invited',
              createdAt: faker.date.recent({ days: 30 }),
            })
            .link({ user: invitedUserId, event: eventId })
        );
        totalEventInvitations++;
        eventInvitationsToUsers++;
        eventInvitationsToEvents++;
      }

      // Add 2-4 requests (from different users)
      const requestCount = randomInt(2, 4);
      const requestingUsers = randomItems(
        availableUsers.filter(u => !invitedUsers.includes(u)),
        requestCount
      );

      for (const requestingUserId of requestingUsers) {
        const participantId = id();
        requestIds.push(participantId);
        transactions.push(
          tx.eventParticipants[participantId]
            .update({
              status: 'requested',
              createdAt: faker.date.recent({ days: 30 }),
            })
            .link({ user: requestingUserId, event: eventId })
        );
        totalEventRequests++;
        eventRequestsToUsers++;
        eventRequestsToEvents++;
      }

      // Add 1-2 admin participants
      const adminCount = randomInt(1, 2);
      const adminUsers = randomItems(
        availableUsers.filter(u => !invitedUsers.includes(u) && !requestingUsers.includes(u)),
        adminCount
      );

      for (const userId of adminUsers) {
        const participantId = id();
        transactions.push(
          tx.eventParticipants[participantId]
            .update({
              status: 'member',
              createdAt: faker.date.past({ years: 0.17 }),
            })
            .link({ user: userId, event: eventId })
        );
        totalEventAdmins++;
        eventAdminsToUsers++;
        eventAdminsToEvents++;
      }
    }

    console.log(
      `✓ Created ${totalEventInvitations} event invitations, ${totalEventRequests} event requests, and ${totalEventAdmins} event admins`
    );

    // 3. Seed amendment collaboration requests and invitations
    console.log('Seeding amendment collaboration requests and invitations...');
    for (const amendmentId of amendmentIds) {
      // Get users who might not already be collaborators
      const availableUsers = userIds.filter(() => {
        // Simple filter - in production this would check existing collaborators
        return Math.random() > 0.3; // 70% chance a user is available
      });

      // Add 2-4 invitations
      const invitationCount = randomInt(2, 4);
      const invitedUsers = randomItems(availableUsers, invitationCount);

      for (const invitedUserId of invitedUsers) {
        const collaboratorId = id();
        invitationIds.push(collaboratorId);
        transactions.push(
          tx.amendmentCollaborators[collaboratorId]
            .update({
              status: 'invited',
              createdAt: faker.date.recent({ days: 30 }),
              visibility: randomVisibility(),
            })
            .link({ user: invitedUserId, amendment: amendmentId })
        );
        totalAmendmentInvitations++;
        amendmentInvitationsToUsers++;
        amendmentInvitationsToAmendments++;
      }

      // Add 2-4 requests (from different users)
      const requestCount = randomInt(2, 4);
      const requestingUsers = randomItems(
        availableUsers.filter(u => !invitedUsers.includes(u)),
        requestCount
      );

      for (const requestingUserId of requestingUsers) {
        const collaboratorId = id();
        requestIds.push(collaboratorId);
        transactions.push(
          tx.amendmentCollaborators[collaboratorId]
            .update({
              status: 'requested',
              createdAt: faker.date.recent({ days: 30 }),
              visibility: randomVisibility(),
            })
            .link({ user: requestingUserId, amendment: amendmentId })
        );
        totalAmendmentRequests++;
        amendmentRequestsToUsers++;
        amendmentRequestsToAmendments++;
      }

      // Add 1-2 admin collaborators
      const adminCount = randomInt(1, 2);
      const adminUsers = randomItems(
        availableUsers.filter(u => !invitedUsers.includes(u) && !requestingUsers.includes(u)),
        adminCount
      );

      for (const userId of adminUsers) {
        const collaboratorId = id();
        transactions.push(
          tx.amendmentCollaborators[collaboratorId]
            .update({
              status: 'member',
              createdAt: faker.date.past({ years: 0.17 }),
              visibility: randomVisibility(),
            })
            .link({ user: userId, amendment: amendmentId })
        );
        totalAmendmentAdmins++;
        amendmentAdminsToUsers++;
        amendmentAdminsToAmendments++;
      }
    }

    console.log(
      `✓ Created ${totalAmendmentInvitations} amendment invitations, ${totalAmendmentRequests} amendment requests, and ${totalAmendmentAdmins} amendment admins`
    );

    // Execute all transactions in batches
    if (transactions.length > 0) {
      const batchSize = 20;
      for (let i = 0; i < transactions.length; i += batchSize) {
        const batch = transactions.slice(i, i + batchSize);
        await db.transact(batch);
      }
    }

    console.log(
      `✓ Created total of ${totalGroupInvitations + totalEventInvitations + totalAmendmentInvitations} invitations and ${totalGroupRequests + totalEventRequests + totalAmendmentRequests} requests`
    );

    // Log link counts
    console.log('\n📊 Link Counts:');
    console.log(
      `  Group Invitations: ${groupInvitationsToUsers} to users, ${groupInvitationsToGroups} to groups`
    );
    console.log(
      `  Group Requests: ${groupRequestsToUsers} to users, ${groupRequestsToGroups} to groups`
    );
    console.log(
      `  Event Invitations: ${eventInvitationsToUsers} to users, ${eventInvitationsToEvents} to events`
    );
    console.log(
      `  Event Requests: ${eventRequestsToUsers} to users, ${eventRequestsToEvents} to events`
    );
    console.log(`  Event Admins: ${eventAdminsToUsers} to users, ${eventAdminsToEvents} to events`);
    console.log(
      `  Amendment Invitations: ${amendmentInvitationsToUsers} to users, ${amendmentInvitationsToAmendments} to amendments`
    );
    console.log(
      `  Amendment Requests: ${amendmentRequestsToUsers} to users, ${amendmentRequestsToAmendments} to amendments`
    );
    console.log(
      `  Amendment Admins: ${amendmentAdminsToUsers} to users, ${amendmentAdminsToAmendments} to amendments`
    );

    const totalLinks =
      groupInvitationsToUsers +
      groupInvitationsToGroups +
      groupRequestsToUsers +
      groupRequestsToGroups +
      eventInvitationsToUsers +
      eventInvitationsToEvents +
      eventRequestsToUsers +
      eventRequestsToEvents +
      eventAdminsToUsers +
      eventAdminsToEvents +
      amendmentInvitationsToUsers +
      amendmentInvitationsToAmendments +
      amendmentRequestsToUsers +
      amendmentRequestsToAmendments +
      amendmentAdminsToUsers +
      amendmentAdminsToAmendments;

    console.log(`  Total Links: ${totalLinks}`);

    return {
      ...context,
      invitationIds,
      requestIds,
      linkCounts: {
        ...(context.linkCounts || {}),
        groupInvitationsToUsers:
          (context.linkCounts?.groupInvitationsToUsers || 0) + groupInvitationsToUsers,
        groupInvitationsToGroups:
          (context.linkCounts?.groupInvitationsToGroups || 0) + groupInvitationsToGroups,
        groupRequestsToUsers:
          (context.linkCounts?.groupRequestsToUsers || 0) + groupRequestsToUsers,
        groupRequestsToGroups:
          (context.linkCounts?.groupRequestsToGroups || 0) + groupRequestsToGroups,
        eventInvitationsToUsers:
          (context.linkCounts?.eventInvitationsToUsers || 0) + eventInvitationsToUsers,
        eventInvitationsToEvents:
          (context.linkCounts?.eventInvitationsToEvents || 0) + eventInvitationsToEvents,
        eventRequestsToUsers:
          (context.linkCounts?.eventRequestsToUsers || 0) + eventRequestsToUsers,
        eventRequestsToEvents:
          (context.linkCounts?.eventRequestsToEvents || 0) + eventRequestsToEvents,
        eventAdminsToUsers: (context.linkCounts?.eventAdminsToUsers || 0) + eventAdminsToUsers,
        eventAdminsToEvents: (context.linkCounts?.eventAdminsToEvents || 0) + eventAdminsToEvents,
        amendmentInvitationsToUsers:
          (context.linkCounts?.amendmentInvitationsToUsers || 0) + amendmentInvitationsToUsers,
        amendmentInvitationsToAmendments:
          (context.linkCounts?.amendmentInvitationsToAmendments || 0) +
          amendmentInvitationsToAmendments,
        amendmentRequestsToUsers:
          (context.linkCounts?.amendmentRequestsToUsers || 0) + amendmentRequestsToUsers,
        amendmentRequestsToAmendments:
          (context.linkCounts?.amendmentRequestsToAmendments || 0) + amendmentRequestsToAmendments,
        amendmentAdminsToUsers:
          (context.linkCounts?.amendmentAdminsToUsers || 0) + amendmentAdminsToUsers,
        amendmentAdminsToAmendments:
          (context.linkCounts?.amendmentAdminsToAmendments || 0) + amendmentAdminsToAmendments,
      },
    };
  },
};
