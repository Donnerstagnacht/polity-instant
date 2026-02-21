import { id } from './id.helper';
import { faker } from '@faker-js/faker';
import type { InsertOp } from './transaction.helpers';

/**
 * Entity-specific helper functions
 */

/**
 * Creates hashtag row operations and links them to the specified entity
 */
export function createHashtagRows(
  entityId: string,
  entityType: 'user' | 'group' | 'amendment' | 'event' | 'blog',
  tags: string[]
): InsertOp[] {
  const ops: InsertOp[] = [];

  for (const tag of tags) {
    const hashtagId = id();
    const linkKey = `${entityType}Id`;

    ops.push({
      table: 'hashtags',
      row: {
        id: hashtagId,
        tag,
        createdAt: new Date(),
        [linkKey]: entityId,
      },
    });
  }

  return ops;
}

/**
 * Creates a structured document for an amendment
 */
export function createAmendmentDocumentRows(
  amendmentId: string,
  amendmentTitle: string,
  ownerId: string,
  workflowStatus?: string
): InsertOp[] {
  const ops: InsertOp[] = [];
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

  // Map workflow status to editing mode
  const getEditingMode = (wfStatus?: string) => {
    if (!wfStatus) return 'edit';
    const mapping: Record<string, string> = {
      collaborative_editing: 'edit',
      internal_suggesting: 'suggest',
      internal_voting: 'vote',
      viewing: 'view',
      event_suggesting: 'suggest',
      event_voting: 'vote',
      passed: 'view',
      rejected: 'view',
    };
    return mapping[wfStatus] || 'edit';
  };

  // Create the document
  ops.push({
    table: 'documents',
    row: {
      id: documentId,
      title: amendmentTitle,
      content: documentContent,
      editingMode: getEditingMode(workflowStatus),
      suggestionCounter: 0,
      createdAt: faker.date.past({ years: 0.5 }),
      updatedAt: faker.date.recent({ days: 7 }),
      isPublic: true,
      tags: ['amendment', 'proposal', 'policy'],
      ownerId,
    },
  });

  // Link the document to the amendment
  ops.push({
    table: 'amendments',
    row: {
      id: amendmentId,
      documentId,
    },
  });

  return ops;
}
