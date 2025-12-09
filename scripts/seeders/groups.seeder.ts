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
      const conversationRights = [
        { resource: 'messages', action: 'create' },
        { resource: 'messages', action: 'read' },
        { resource: 'messages', action: 'update' },
        { resource: 'messages', action: 'delete' },
      ];

      for (const right of conversationRights) {
        const boardRightId = id();
        const memberRightId = id();

        transactions.push(
          tx.actionRights[boardRightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: boardMemberRoleId, groupId: groupId }),
          tx.actionRights[memberRightId]
            .update({ resource: right.resource, action: right.action })
            .link({ roles: memberRoleId, groupId: groupId })
        );
      }

      // Add manageNotifications right to board member role
      const manageNotificationsRightId = id();
      transactions.push(
        tx.actionRights[manageNotificationsRightId]
          .update({ resource: 'notifications', action: 'manageNotifications' })
          .link({ roles: boardMemberRoleId, groupId: groupId })
      );

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

      // Add some members to main user's groups
      const memberCount = randomInt(5, 8);
      const members = randomItems(
        userIds.filter(uid => uid !== mainUserId),
        memberCount
      );

      for (const memberId of members) {
        const membershipId = id();
        const status = randomItem(['member', 'member', 'member', 'requested', 'invited'] as const);
        const roleId = randomItem([memberRoleId, memberRoleId, boardMemberRoleId]);
        transactions.push(
          tx.groupMemberships[membershipId]
            .update({
              status: status,
              createdAt: faker.date.past({ years: 0.5 }),
            })
            .link({ user: memberId, group: groupId, role: roleId })
        );
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

      // Add random members
      const memberCount = randomInt(3, 10);
      const members = randomItems(
        userIds.filter(uid => uid !== ownerId),
        memberCount
      );

      for (const memberId of members) {
        const membershipId = id();
        transactions.push(
          tx.groupMemberships[membershipId]
            .update({
              status: randomItem(['member', 'member', 'requested', 'invited'] as const),
              createdAt: faker.date.past({ years: 0.5 }),
              visibility: randomVisibility(),
            })
            .link({
              user: memberId,
              group: groupId,
              role: randomItem([memberRoleId, boardMemberRoleId]),
            })
        );
      }

      // Update member count
      transactions.push(tx.groups[groupId].update({ memberCount: members.length + 1 }));

      // Add hashtags
      const groupHashtags = randomItems(GROUP_HASHTAGS, randomInt(2, 4));
      transactions.push(...createHashtagTransactions(groupId, 'group', groupHashtags));
    }

    // Batch transact
    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${groupIds.length} groups`);

    return {
      ...context,
      groupIds,
      conversationIds,
    };
  },
};
