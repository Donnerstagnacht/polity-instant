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
    let documentsToOwners = 0;

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

      // Add editingMode for workflow compatibility
      const editingMode = randomItem(['edit', 'view', 'suggest', 'vote'] as const);

      transactions.push(
        tx.documents[documentId]
          .update({
            title: faker.lorem.sentence(),
            content: documentContent,
            editingMode,
            suggestionCounter: 0,
            createdAt: faker.date.past({ years: 0.5 }),
            updatedAt: faker.date.recent({ days: 7 }),
            isPublic: faker.datatype.boolean(0.7),
            tags: [randomItem(['policy', 'proposal', 'notes', 'draft', 'report'])],
          })
          .link({ owner: ownerId })
      );
      documentsToOwners++;
    }

    await batchTransact(db, transactions);
    console.log(`✅ Seeded ${documentIds.length} documents`);
    console.log(`  - Document-to-owner links: ${documentsToOwners}`);

    return {
      ...context,
      documentIds,
      linkCounts: {
        ...context.linkCounts,
        documentsToOwners: (context.linkCounts?.documentsToOwners || 0) + documentsToOwners,
      },
    };
  },
};
