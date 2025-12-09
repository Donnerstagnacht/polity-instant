import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG } from '../config/seed.config';
import { randomInt, randomItem, randomItems } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const conversationsSeeder: EntitySeeder = {
  name: 'conversations',
  dependencies: ['users'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding conversations and messages...');
    const { db, userIds } = context;
    const conversationIds: string[] = [...(context.conversationIds || [])];
    const messageIds: string[] = [];
    const transactions = [];
    let directConversationsToRequestedBy = 0;
    let directParticipantsToConversations = 0;
    let directParticipantsToUsers = 0;
    let directMessagesToConversations = 0;
    let directMessagesToSenders = 0;

    const mainUserId = SEED_CONFIG.mainTestUserId;

    // Create direct message conversations for main user
    const numConversations = randomInt(
      SEED_CONFIG.conversationsPerUser.min,
      SEED_CONFIG.conversationsPerUser.max
    );

    const conversationPartners = randomItems(
      userIds.filter(id => id !== mainUserId),
      numConversations
    );

    for (const partnerId of conversationPartners) {
      const conversationId = id();
      conversationIds.push(conversationId);
      const createdAt = faker.date.past({ years: 0.5 });

      transactions.push(
        tx.conversations[conversationId]
          .update({
            type: 'direct',
            status: 'accepted',
            createdAt,
            lastMessageAt: faker.date.recent({ days: 7 }),
          })
          .link({ requestedBy: mainUserId })
      );
      directConversationsToRequestedBy++;

      // Add participants
      transactions.push(
        tx.conversationParticipants[id()]
          .update({
            joinedAt: createdAt,
            lastReadAt: faker.date.recent({ days: 1 }),
          })
          .link({ conversation: conversationId, user: mainUserId })
      );
      directParticipantsToConversations++;
      directParticipantsToUsers++;

      transactions.push(
        tx.conversationParticipants[id()]
          .update({
            joinedAt: createdAt,
            lastReadAt: faker.date.recent({ days: 2 }),
          })
          .link({ conversation: conversationId, user: partnerId })
      );
      directParticipantsToConversations++;
      directParticipantsToUsers++;

      // Add messages
      const numMessages = randomInt(
        SEED_CONFIG.messagesPerConversation.min,
        SEED_CONFIG.messagesPerConversation.max
      );

      for (let i = 0; i < numMessages; i++) {
        const messageId = id();
        messageIds.push(messageId);
        const senderId = randomItem([mainUserId, partnerId]);

        transactions.push(
          tx.messages[messageId]
            .update({
              content: faker.lorem.sentences(randomInt(1, 3)),
              isRead: faker.datatype.boolean(0.7),
              createdAt: faker.date.between({ from: createdAt, to: new Date() }),
              updatedAt: null,
              deletedAt: null,
            })
            .link({ conversation: conversationId, sender: senderId })
        );
        directMessagesToConversations++;
        directMessagesToSenders++;
      }
    }

    await batchTransact(db, transactions);
    console.log(
      `✅ Seeded ${conversationIds.length} conversations with ${messageIds.length} messages`
    );
    console.log(
      `  - Direct conversation-to-requestedBy links: ${directConversationsToRequestedBy}`
    );
    console.log(
      `  - Direct participant-to-conversation links: ${directParticipantsToConversations}`
    );
    console.log(`  - Direct participant-to-user links: ${directParticipantsToUsers}`);
    console.log(`  - Direct message-to-conversation links: ${directMessagesToConversations}`);
    console.log(`  - Direct message-to-sender links: ${directMessagesToSenders}`);

    return {
      ...context,
      conversationIds,
      messageIds,
      linkCounts: {
        ...context.linkCounts,
        directConversationsToRequestedBy:
          (context.linkCounts?.directConversationsToRequestedBy || 0) +
          directConversationsToRequestedBy,
        directParticipantsToConversations:
          (context.linkCounts?.directParticipantsToConversations || 0) +
          directParticipantsToConversations,
        directParticipantsToUsers:
          (context.linkCounts?.directParticipantsToUsers || 0) + directParticipantsToUsers,
        directMessagesToConversations:
          (context.linkCounts?.directMessagesToConversations || 0) + directMessagesToConversations,
        directMessagesToSenders:
          (context.linkCounts?.directMessagesToSenders || 0) + directMessagesToSenders,
      },
    };
  },
};
