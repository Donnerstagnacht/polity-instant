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
              group: groupId,
              payerUser: payerUserId,
              receiverUser: receiverUserId,
            })
        );
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${paymentIds.length} payments`);

    return { ...context, paymentIds };
  },
};
