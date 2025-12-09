import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';
import { EntitySeeder, SeedContext } from '../types/seeder.types';
import { randomInt, randomItem } from '../helpers/random.helpers';
import { batchTransact } from '../helpers/transaction.helpers';

export const documentsSeeder: EntitySeeder = {
  name: 'documents',
  dependencies: ['users'],

  async seed(context: SeedContext): Promise<SeedContext> {
    console.log('Seeding documents...');
    const { db, userIds } = context;
    const documentIds: string[] = [];
    const transactions = [];

    const numDocuments = randomInt(10, 20);

    for (let i = 0; i < numDocuments; i++) {
      const documentId = id();
      documentIds.push(documentId);
      const ownerId = randomItem(userIds);

      const documentContent = [
        { type: 'h1', children: [{ text: faker.lorem.sentence() }] },
        { type: 'p', children: [{ text: faker.lorem.paragraph() }] },
        { type: 'h2', children: [{ text: faker.lorem.words(3) }] },
        { type: 'p', children: [{ text: faker.lorem.paragraphs(2) }] },
      ];

      transactions.push(
        tx.documents[documentId]
          .update({
            title: faker.lorem.sentence(),
            content: documentContent,
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: faker.date.recent({ days: 7 }),
            isPublic: faker.datatype.boolean(0.7),
            tags: [randomItem(['policy', 'proposal', 'notes', 'draft', 'report'])],
          })
          .link({ owner: ownerId })
      );
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${documentIds.length} documents`);

    return { ...context, documentIds };
  },
};
