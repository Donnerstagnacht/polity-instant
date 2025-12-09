import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { SEED_CONFIG } from '../config/seed.config';
import { randomInt, randomItem, randomVisibility } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const todosSeeder: EntitySeeder = {
  name: 'todos',
  dependencies: ['users', 'groups'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding todos...');
    const { db, userIds, groupIds } = context;
    const todoIds: string[] = [];
    const transactions = [];

    for (const userId of userIds) {
      const numTodos = randomInt(SEED_CONFIG.todosPerUser.min, SEED_CONFIG.todosPerUser.max);

      for (let i = 0; i < numTodos; i++) {
        const todoId = id();
        todoIds.push(todoId);

        const status = randomItem(['todo', 'in_progress', 'done'] as const);
        const priority = randomItem(['low', 'medium', 'high'] as const);
        const hasGroup = Math.random() > 0.6;

        const todoTx = tx.todos[todoId].update({
          title: faker.lorem.sentence(),
          description: faker.lorem.paragraph(),
          status,
          priority,
          dueDate: faker.date.future({ years: 0.2 }).toISOString(),
          completedAt: status === 'done' ? faker.date.recent({ days: 7 }).toISOString() : null,
          tags: [randomItem(['work', 'personal', 'urgent', 'meeting', 'review'])],
          createdAt: faker.date.past({ years: 0.3 }),
          updatedAt: faker.date.recent({ days: 7 }),
          visibility: randomVisibility(),
        });

        if (hasGroup) {
          transactions.push(todoTx.link({ creator: userId, group: randomItem(groupIds) }));
        } else {
          transactions.push(todoTx.link({ creator: userId }));
        }
      }
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${todoIds.length} todos`);

    return { ...context, todoIds };
  },
};
