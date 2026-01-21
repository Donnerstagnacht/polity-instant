import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const notificationsSeeder: EntitySeeder = {
  name: 'notifications',
  dependencies: ['users', 'groups', 'events'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding notifications...');
    const { db, userIds, groupIds, eventIds, amendmentIds } = context;
    const notificationIds: string[] = [];
    const transactions = [];

    // Link counters
    let notificationsToRecipients = 0;
    let notificationsToSenders = 0;
    let notificationsToRelatedGroups = 0;
    let notificationsToRelatedEvents = 0;
    let notificationsToRelatedAmendments = 0;
    let notificationsToRelatedUsers = 0;

    const notificationTypes = [
      'group_invitation',
      'group_request_approved',
      'event_invitation',
      'event_agenda_item_transferred',
      'amendment_collaboration',
      'new_follower',
      'new_comment',
      'new_like',
      'mention',
    ];

    for (const userId of userIds) {
      const numNotifications = randomInt(2, 7);

      for (let i = 0; i < numNotifications; i++) {
        const notificationId = id();
        notificationIds.push(notificationId);

        const type = randomItem(notificationTypes);
        const senderId = randomItem(userIds.filter(id => id !== userId));
        const relatedUserId = Math.random() > 0.5 ? randomItem(userIds) : null;

        let notifTx = tx.notifications[notificationId].update({
          type,
          title: faker.lorem.sentence(),
          message: faker.lorem.sentence(),
          isRead: faker.datatype.boolean(0.4),
          createdAt: faker.date.recent({ days: 30 }),
        });

        // Add links based on type
        if (type.includes('group') && groupIds.length > 0) {
          notifTx = notifTx.link({
            recipient: userId,
            sender: senderId,
            relatedGroup: randomItem(groupIds),
          });
          notificationsToRecipients++;
          notificationsToSenders++;
          notificationsToRelatedGroups++;
        } else if (type.includes('event') && eventIds.length > 0) {
          notifTx = notifTx.link({
            recipient: userId,
            sender: senderId,
            relatedEvent: randomItem(eventIds),
          });
          notificationsToRecipients++;
          notificationsToSenders++;
          notificationsToRelatedEvents++;
        } else if (type.includes('amendment') && amendmentIds.length > 0) {
          notifTx = notifTx.link({
            recipient: userId,
            sender: senderId,
            relatedAmendment: randomItem(amendmentIds),
          });
          notificationsToRecipients++;
          notificationsToSenders++;
          notificationsToRelatedAmendments++;
        } else {
          if (relatedUserId) {
            notifTx = notifTx.link({
              recipient: userId,
              sender: senderId,
              relatedUser: relatedUserId,
            });
            notificationsToRecipients++;
            notificationsToSenders++;
            notificationsToRelatedUsers++;
          } else {
            notifTx = notifTx.link({ recipient: userId, sender: senderId });
            notificationsToRecipients++;
            notificationsToSenders++;
          }
        }

        transactions.push(notifTx);
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${notificationIds.length} notifications`);
    console.log(`   - notificationsToRecipients: ${notificationsToRecipients}`);
    console.log(`   - notificationsToSenders: ${notificationsToSenders}`);
    console.log(`   - notificationsToRelatedGroups: ${notificationsToRelatedGroups}`);
    console.log(`   - notificationsToRelatedEvents: ${notificationsToRelatedEvents}`);
    console.log(`   - notificationsToRelatedAmendments: ${notificationsToRelatedAmendments}`);
    console.log(`   - notificationsToRelatedUsers: ${notificationsToRelatedUsers}`);

    return {
      ...context,
      notificationIds,
      linkCounts: {
        ...(context.linkCounts || {}),
        notificationsToRecipients:
          (context.linkCounts?.notificationsToRecipients || 0) + notificationsToRecipients,
        notificationsToSenders:
          (context.linkCounts?.notificationsToSenders || 0) + notificationsToSenders,
        notificationsToRelatedGroups:
          (context.linkCounts?.notificationsToRelatedGroups || 0) + notificationsToRelatedGroups,
        notificationsToRelatedEvents:
          (context.linkCounts?.notificationsToRelatedEvents || 0) + notificationsToRelatedEvents,
        notificationsToRelatedAmendments:
          (context.linkCounts?.notificationsToRelatedAmendments || 0) +
          notificationsToRelatedAmendments,
        notificationsToRelatedUsers:
          (context.linkCounts?.notificationsToRelatedUsers || 0) + notificationsToRelatedUsers,
      },
    };
  },
};
