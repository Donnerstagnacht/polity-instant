import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const paymentsSeeder: EntitySeeder = {
  name: 'payments',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding payments...');
    const { db, userIds, groupIds } = context;
    const paymentIds: string[] = [];
    const transactions = [];
    let paymentsToPayerGroups = 0;
    let paymentsToReceiverGroups = 0;
    let paymentsToPayerUsers = 0;
    let paymentsToReceiverUsers = 0;

    for (const groupId of groupIds) {
      const numPayments = randomInt(5, 15);

      for (let i = 0; i < numPayments; i++) {
        const paymentId = id();
        paymentIds.push(paymentId);

        const isIncome = faker.datatype.boolean();
        const payerUserId = randomItem(userIds);
        const receiverUserId = randomItem(userIds.filter(id => id !== payerUserId));

        transactions.push(
          tx.payments[paymentId]
            .update({
              amount: randomInt(10, 1000),
              label: faker.finance.transactionDescription(),
              type: isIncome ? 'income' : 'expenditure',
              createdAt: faker.date.past({ years: 0.5 }),
            })
            .link({
              ...(isIncome ? { receiverGroup: groupId } : { payerGroup: groupId }),
              payerUser: payerUserId,
              receiverUser: receiverUserId,
            })
        );
        if (isIncome) {
          paymentsToReceiverGroups++;
        } else {
          paymentsToPayerGroups++;
        }
        paymentsToPayerUsers++;
        paymentsToReceiverUsers++;
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${paymentIds.length} payments`);
    console.log(`  - Payment-to-payer-group links: ${paymentsToPayerGroups}`);
    console.log(`  - Payment-to-receiver-group links: ${paymentsToReceiverGroups}`);
    console.log(`  - Payment-to-payer-user links: ${paymentsToPayerUsers}`);
    console.log(`  - Payment-to-receiver-user links: ${paymentsToReceiverUsers}`);

    return {
      ...context,
      paymentIds,
      linkCounts: {
        ...context.linkCounts,
        paymentsToPayerGroups:
          (context.linkCounts?.paymentsToPayerGroups || 0) + paymentsToPayerGroups,
        paymentsToReceiverGroups:
          (context.linkCounts?.paymentsToReceiverGroups || 0) + paymentsToReceiverGroups,
        paymentsToPayerUsers:
          (context.linkCounts?.paymentsToPayerUsers || 0) + paymentsToPayerUsers,
        paymentsToReceiverUsers:
          (context.linkCounts?.paymentsToReceiverUsers || 0) + paymentsToReceiverUsers,
      },
    };
  },
};
