import { id, tx } from '@instantdb/admin';
import { faker } from '@faker-js/faker';

/**
 * Entity-specific helper functions
 */

/**
 * Creates hashtag entities and links them to the specified entity
 */
export function createHashtagTransactions(
  entityId: string,
  entityType: 'user' | 'group' | 'amendment' | 'event' | 'blog',
  tags: string[]
): any[] {
  const transactions = [];

  for (const tag of tags) {
    const hashtagId = id();
    const linkKey = entityType;

    transactions.push(
      tx.hashtags[hashtagId]
        .update({
          tag,
          createdAt: new Date(),
        })
        .link({ [linkKey]: entityId })
    );
  }

  return transactions;
}

/**
 * Creates a structured document for an amendment
 */
export function createAmendmentDocument(
  amendmentId: string,
  amendmentTitle: string,
  ownerId: string
): any[] {
  const transactions = [];
  const documentId = id();

  // Create document content based on amendment
  const documentContent = [
    { type: 'h1', children: [{ text: amendmentTitle }] },
    { type: 'h2', children: [{ text: 'Summary' }] },
    {
      type: 'p',
      children: [
        {
          text: 'This is the full text of the amendment. Edit this document to modify the amendment text.',
        },
      ],
    },
    { type: 'h2', children: [{ text: 'Proposed Changes' }] },
    { type: 'p', children: [{ text: faker.lorem.paragraphs(2) }] },
    { type: 'h2', children: [{ text: 'Rationale' }] },
    { type: 'p', children: [{ text: faker.lorem.paragraphs(1) }] },
  ];

  // Create the document
  transactions.push(
    tx.documents[documentId]
      .update({
        title: amendmentTitle,
        content: documentContent,
        createdAt: faker.date.past({ years: 0.5 }),
        updatedAt: faker.date.recent({ days: 7 }),
        isPublic: true,
        tags: ['amendment', 'proposal', 'policy'],
      })
      .link({ owner: ownerId })
  );

  // Link the document to the amendment
  transactions.push(tx.amendments[amendmentId].link({ document: documentId }));

  return transactions;
}
