import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG, GROUP_HASHTAGS } from '../config/seed.config';
import { randomInt, randomItem, randomItems, randomVisibility } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';
import { createHashtagTransactions } from '../helpers/entity.helpers';

export const groupsSeeder: EntitySeeder = {
  name: 'groups',
  dependencies: ['users'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding groups...');
    const { db, userIds } = context;
    const groupIds: string[] = [];
    const conversationIds: string[] = [...(context.conversationIds || [])];
    const transactions = [];
    const mainUserId = SEED_CONFIG.mainTestUserId;

    // Link counters
    let groupsToOwners = 0;
    let rolesToGroups = 0;
    let actionRightsToRoles = 0;
    let actionRightsToGroups = 0;
    let groupMembershipsToUsers = 0;
    let groupMembershipsToGroups = 0;
    let groupMembershipsToRoles = 0;
    let conversationsToGroups = 0;
    let conversationsToRequestedBy = 0;
    let conversationParticipantsToConversations = 0;
    let conversationParticipantsToUsers = 0;
    let messagesToConversations = 0;
    let messagesToSenders = 0;

    // Define conversation and admin rights once for reuse across all groups
    const conversationRights = [
      { resource: 'messages', action: 'create' },
      { resource: 'messages', action: 'read' },
      { resource: 'messages', action: 'update' },
      { resource: 'messages', action: 'delete' },
    ];

    const adminRights = [
      { resource: 'groupNotifications', action: 'manageNotifications' },
      { resource: 'groupMemberships', action: 'manage' },
      { resource: 'groupRoles', action: 'manage' },
      { resource: 'groups', action: 'manage' },
      { resource: 'groupRelationships', action: 'manage' },
      { resource: 'groupTodos', action: 'manage' },
      { resource: 'groupLinks', action: 'manage' },
      { resource: 'groupPayments', action: 'manage' },
      { resource: 'groupDocuments', action: 'manage' },
      { resource: 'groupPositions', action: 'manage' },
    ];

    // Track users who have received Board Member roles to ensure everyone gets at least one
    const usersWithBoardMemberRole = new Set<string>();
    
    // Track all group memberships to avoid duplicates in invitations seeder
    const groupMemberships = new Map<string, Set<string>>(); // groupId -> Set of userIds

    // Create groups owned by main test user
    for (let i = 0; i < 2; i++) {
      const groupId = id();
      const name = i === 0 ? 'Test Main Group' : faker.company.name();
      groupIds.push(groupId);

      // Create group
      transactions.push(
        tx.groups[groupId]
          .update({
            name,
            description: i === 0 ? 'Main test group for development' : faker.lorem.paragraph(),
            isPublic: true,
            memberCount: 0,
            location: faker.location.city(),
            region: faker.location.state(),
            country: faker.location.country(),
            imageURL: faker.image.url(),
            whatsapp: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }) || '',
            instagram:
              faker.helpers.maybe(() => `@${faker.internet.displayName()}`, { probability: 0.7 }) ||
              '',
            twitter:
              faker.helpers.maybe(() => `@${faker.internet.displayName()}`, { probability: 0.7 }) ||
              '',
            facebook: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.5 }) || '',
            snapchat:
              faker.helpers.maybe(() => faker.internet.displayName(), { probability: 0.3 }) || '',
            createdAt: faker.date.past({ years: 1 }),
            updatedAt: new Date(),
            visibility: 'public',
          })
          .link({ owner: mainUserId })
      );
      groupsToOwners++;

      // Create roles for this group
      const boardMemberRoleId = id();
      const memberRoleId = id();

      transactions.push(
        tx.roles[boardMemberRoleId]
          .update({
            name: 'Board Member',
            description: 'Board member with administrative access',
            scope: 'group',
          })
          .link({ group: groupId }),
        tx.roles[memberRoleId]
          .update({
            name: 'Member',
            description: 'Regular group member',
            scope: 'group',
          })
          .link({ group: groupId })
      );

      // Add conversation rights to both roles
      for (const right of conversationRights) {
        const boardRightId = id();
        const memberRightId = id();

        transactions.push(
          tx.actionRights[boardRightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: boardMemberRoleId, group: groupId }),
          tx.actionRights[memberRightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: memberRoleId, group: groupId })
        );
        actionRightsToRoles += 2;
        actionRightsToGroups += 2;
      }

      // Add admin rights to board member role
      for (const right of adminRights) {
        const rightId = id();
        transactions.push(
          tx.actionRights[rightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: boardMemberRoleId, group: groupId })
        );
        actionRightsToRoles++;
        actionRightsToGroups++;
      }

      // Add main user as owner member
      const ownerMembershipId = id();
      transactions.push(
        tx.groupMemberships[ownerMembershipId]
          .update({
            status: 'member',
            createdAt: faker.date.past({ years: 1 }),
            visibility: 'public',
          })
          .link({ user: mainUserId, group: groupId, role: boardMemberRoleId })
      );
      groupMembershipsToUsers++;
      groupMembershipsToGroups++;
      groupMembershipsToRoles++;
      usersWithBoardMemberRole.add(mainUserId); // Track main user has board member role
      
      // Track membership
      if (!groupMemberships.has(groupId)) {
        groupMemberships.set(groupId, new Set());
      }
      groupMemberships.get(groupId)!.add(mainUserId);

      // Add some members to main user's groups
      const memberCount = randomInt(5, 8);
      const members = randomItems(
        userIds.filter(uid => uid !== mainUserId),
        memberCount
      );

      for (let idx = 0; idx < members.length; idx++) {
        const memberId = members[idx];
        const membershipId = id();
        
        // Prioritize giving Board Member role to users who don't have one yet
        const needsBoardMemberRole = !usersWithBoardMemberRole.has(memberId);
        const roleId = needsBoardMemberRole ? boardMemberRoleId : (idx % 3 === 0 ? boardMemberRoleId : memberRoleId);
        
        // Board Members always have 'member' status, regular members can be invited/requested
        const status = roleId === boardMemberRoleId 
          ? 'member' as const
          : randomItem(['member', 'member', 'member', 'requested', 'invited'] as const);
        
        if (roleId === boardMemberRoleId) {
          usersWithBoardMemberRole.add(memberId);
        }
        
        transactions.push(
          tx.groupMemberships[membershipId]
            .update({
              status: status,
              createdAt: faker.date.past({ years: 0.5 }),
            })
            .link({ user: memberId, group: groupId, role: roleId })
        );
        groupMembershipsToUsers++;
        groupMembershipsToGroups++;
        groupMembershipsToRoles++;
        
        // Track membership
        groupMemberships.get(groupId)!.add(memberId);
      }

      // Update member count
      transactions.push(tx.groups[groupId].update({ memberCount: members.length + 1 }));

      // Create group conversation
      const conversationId = id();
      conversationIds.push(conversationId);
      const groupCreatedAt = faker.date.past({ years: 1 });

      transactions.push(
        tx.conversations[conversationId]
          .update({
            type: 'group',
            name: name,
            status: 'accepted',
            createdAt: groupCreatedAt,
            lastMessageAt: groupCreatedAt,
          })
          .link({ group: groupId, requestedBy: mainUserId })
      );
      conversationsToGroups++;
      conversationsToRequestedBy++;

      // Add owner as conversation participant
      const ownerParticipantId = id();
      transactions.push(
        tx.conversationParticipants[ownerParticipantId]
          .update({
            joinedAt: groupCreatedAt,
            lastReadAt: faker.date.recent({ days: 1 }),
          })
          .link({ conversation: conversationId, user: mainUserId })
      );
      conversationParticipantsToConversations++;
      conversationParticipantsToUsers++;

      // Add all group members as conversation participants
      for (const memberId of members) {
        const participantId = id();
        transactions.push(
          tx.conversationParticipants[participantId]
            .update({
              joinedAt: groupCreatedAt,
              lastReadAt: faker.date.recent({ days: 2 }),
            })
            .link({ conversation: conversationId, user: memberId })
        );
        conversationParticipantsToConversations++;
        conversationParticipantsToUsers++;
      }

      // Add messages from different group members
      const allParticipants = [mainUserId, ...members];
      const messageCount = randomInt(10, 20);
      for (let j = 0; j < messageCount; j++) {
        const messageId = id();
        const senderUserId = randomItem(allParticipants);
        const messageCreatedAt = faker.date.between({
          from: groupCreatedAt,
          to: new Date(),
        });

        transactions.push(
          tx.messages[messageId]
            .update({
              content: faker.lorem.sentences(randomInt(1, 3)),
              isRead: faker.datatype.boolean(0.8),
              createdAt: messageCreatedAt,
              updatedAt: null,
              deletedAt: null,
            })
            .link({ conversation: conversationId, sender: senderUserId })
        );
        messagesToConversations++;
        messagesToSenders++;
      }

      // Add hashtags for this group
      const groupHashtags = randomItems(GROUP_HASHTAGS, randomInt(3, 5));
      transactions.push(...createHashtagTransactions(groupId, 'group', groupHashtags));
    }

    // Create random additional groups
    const numGroups = randomInt(SEED_CONFIG.groups.min - 2, SEED_CONFIG.groups.max - 2);
    for (let i = 0; i < numGroups; i++) {
      const groupId = id();
      const ownerId = randomItem(userIds);
      groupIds.push(groupId);

      transactions.push(
        tx.groups[groupId]
          .update({
            name: faker.company.name(),
            description: faker.lorem.paragraph(),
            isPublic: faker.datatype.boolean(0.8),
            memberCount: 0,
            location: faker.location.city(),
            region: faker.location.state(),
            country: faker.location.country(),
            imageURL: faker.image.url(),
            whatsapp: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.5 }) || '',
            instagram:
              faker.helpers.maybe(() => `@${faker.internet.displayName()}`, { probability: 0.5 }) ||
              '',
            twitter:
              faker.helpers.maybe(() => `@${faker.internet.displayName()}`, { probability: 0.5 }) ||
              '',
            facebook: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.3 }) || '',
            snapchat:
              faker.helpers.maybe(() => faker.internet.displayName(), { probability: 0.2 }) || '',
            createdAt: faker.date.past({ years: 2 }),
            updatedAt: faker.date.recent({ days: 30 }),
            visibility: randomVisibility(),
          })
          .link({ owner: ownerId })
      );
      groupsToOwners++;

      // Create roles for this group
      const boardMemberRoleId = id();
      const memberRoleId = id();

      transactions.push(
        tx.roles[boardMemberRoleId]
          .update({
            name: 'Board Member',
            description: 'Board member with administrative access',
            scope: 'group',
          })
          .link({ group: groupId }),
        tx.roles[memberRoleId]
          .update({
            name: 'Member',
            description: 'Regular group member',
            scope: 'group',
          })
          .link({ group: groupId })
      );
      rolesToGroups += 2;

      // Add conversation rights to both roles
      for (const right of conversationRights) {
        const boardRightId = id();
        const memberRightId = id();

        transactions.push(
          tx.actionRights[boardRightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: boardMemberRoleId, group: groupId }),
          tx.actionRights[memberRightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: memberRoleId, group: groupId })
        );
        actionRightsToRoles += 2;
        actionRightsToGroups += 2;
      }

      // Add admin rights to board member role
      for (const right of adminRights) {
        const rightId = id();
        transactions.push(
          tx.actionRights[rightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: boardMemberRoleId, group: groupId })
        );
        actionRightsToRoles++;
        actionRightsToGroups++;
      }

      // Add owner as member
      const ownerMembershipId = id();
      transactions.push(
        tx.groupMemberships[ownerMembershipId]
          .update({
            status: 'member',
            createdAt: faker.date.past({ years: 1 }),
            visibility: randomVisibility(),
          })
          .link({ user: ownerId, group: groupId, role: boardMemberRoleId })
      );
      groupMembershipsToUsers++;
      groupMembershipsToGroups++;
      groupMembershipsToRoles++;
      usersWithBoardMemberRole.add(ownerId); // Track owner has board member role
      
      // Track membership
      if (!groupMemberships.has(groupId)) {
        groupMemberships.set(groupId, new Set());
      }
      groupMemberships.get(groupId)!.add(ownerId);

      // Add random members
      const memberCount = randomInt(3, 10);
      const members = randomItems(
        userIds.filter(uid => uid !== ownerId),
        memberCount
      );

      for (let idx = 0; idx < members.length; idx++) {
        const memberId = members[idx];
        const membershipId = id();
        
        // Prioritize giving Board Member role to users who don't have one yet
        const needsBoardMemberRole = !usersWithBoardMemberRole.has(memberId);
        const roleId = needsBoardMemberRole ? boardMemberRoleId : (idx % 3 === 0 ? boardMemberRoleId : memberRoleId);
        
        // Board Members always have 'member' status, regular members can be invited/requested
        const status = roleId === boardMemberRoleId 
          ? 'member' as const
          : randomItem(['member', 'member', 'requested', 'invited'] as const);
        
        if (roleId === boardMemberRoleId) {
          usersWithBoardMemberRole.add(memberId);
        }
        
        transactions.push(
          tx.groupMemberships[membershipId]
            .update({
              status: status,
              createdAt: faker.date.past({ years: 0.5 }),
              visibility: randomVisibility(),
            })
            .link({
              user: memberId,
              group: groupId,
              role: roleId,
            })
        );
        groupMembershipsToUsers++;
        groupMembershipsToGroups++;
        groupMembershipsToRoles++;
        
        // Track membership
        groupMemberships.get(groupId)!.add(memberId);
      }

      // Update member count
      transactions.push(tx.groups[groupId].update({ memberCount: members.length + 1 }));

      // Add hashtags
      const groupHashtags = randomItems(GROUP_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(groupId, 'group', groupHashtags));
    }

    // Batch transact
    await batchTransact(db, transactions);
    
    // Verify all users have at least one Board Member role
    const usersWithoutBoardMemberRole = userIds.filter(uid => !usersWithBoardMemberRole.has(uid));
    if (usersWithoutBoardMemberRole.length > 0) {
      console.log(`⚠️  Warning: ${usersWithoutBoardMemberRole.length} users without Board Member role`);
    }
    
    console.log(`✅ Seeded ${groupIds.length} groups`);
    console.log(`   🎯 ${usersWithBoardMemberRole.size}/${userIds.length} users have Board Member role in at least one group`);
    console.log(`   Links created:`);
    console.log(`   - Groups to Owners: ${groupsToOwners}`);
    console.log(`   - Roles to Groups: ${rolesToGroups}`);
    console.log(`   - Action Rights to Roles: ${actionRightsToRoles}`);
    console.log(`   - Action Rights to Groups: ${actionRightsToGroups}`);
    console.log(`   - Group Memberships to Users: ${groupMembershipsToUsers}`);
    console.log(`   - Group Memberships to Groups: ${groupMembershipsToGroups}`);
    console.log(`   - Group Memberships to Roles: ${groupMembershipsToRoles}`);
    console.log(`   - Conversations to Groups: ${conversationsToGroups}`);
    console.log(`   - Conversations to Requested By: ${conversationsToRequestedBy}`);
    console.log(
      `   - Conversation Participants to Conversations: ${conversationParticipantsToConversations}`
    );
    console.log(`   - Conversation Participants to Users: ${conversationParticipantsToUsers}`);
    console.log(`   - Messages to Conversations: ${messagesToConversations}`);
    console.log(`   - Messages to Senders: ${messagesToSenders}`);

    return {
      ...context,
      groupIds,
      conversationIds,
      groupMemberships, // Track memberships to avoid duplicates in invitations seeder
      linkCounts: {
        ...context.linkCounts,
        groupsToOwners: (context.linkCounts?.groupsToOwners || 0) + groupsToOwners,
        rolesToGroups: (context.linkCounts?.rolesToGroups || 0) + rolesToGroups,
        actionRightsToRoles: (context.linkCounts?.actionRightsToRoles || 0) + actionRightsToRoles,
        actionRightsToGroups:
          (context.linkCounts?.actionRightsToGroups || 0) + actionRightsToGroups,
        groupMembershipsToUsers:
          (context.linkCounts?.groupMembershipsToUsers || 0) + groupMembershipsToUsers,
        groupMembershipsToGroups:
          (context.linkCounts?.groupMembershipsToGroups || 0) + groupMembershipsToGroups,
        groupMembershipsToRoles:
          (context.linkCounts?.groupMembershipsToRoles || 0) + groupMembershipsToRoles,
        conversationsToGroups:
          (context.linkCounts?.conversationsToGroups || 0) + conversationsToGroups,
        conversationsToRequestedBy:
          (context.linkCounts?.conversationsToRequestedBy || 0) + conversationsToRequestedBy,
        conversationParticipantsToConversations:
          (context.linkCounts?.conversationParticipantsToConversations || 0) +
          conversationParticipantsToConversations,
        conversationParticipantsToUsers:
          (context.linkCounts?.conversationParticipantsToUsers || 0) +
          conversationParticipantsToUsers,
        messagesToConversations:
          (context.linkCounts?.messagesToConversations || 0) + messagesToConversations,
        messagesToSenders: (context.linkCounts?.messagesToSenders || 0) + messagesToSenders,
      },
    };
  },
};
