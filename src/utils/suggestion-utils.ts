// suggestion-utils.ts
// Utilities for handling suggestion IDs and counters

import { db, tx } from '../../db/db';

/**
 * Generates the next suggestion ID (CR-x format) for a document
 * and updates the document's suggestion counter
 */
export async function getNextSuggestionId(documentId: string): Promise<string> {
  // Get current document data
  const { data } = await db.queryOnce({
    documents: {
      $: { where: { id: documentId } },
    },
  });

  const document = data?.documents?.[0];
  if (!document) {
    throw new Error(`Document with ID ${documentId} not found`);
  }

  // Get current counter value, defaulting to 0 if not set
  const currentCounter = document.suggestionCounter ?? 0;
  const nextCounter = currentCounter + 1;

  // Update the counter in the database
  await db.transact([
    tx.documents[documentId].update({
      suggestionCounter: nextCounter,
    }),
  ]);

  // Return the formatted suggestion ID
  return `CR-${nextCounter}`;
}

/**
 * Parses a suggestion ID to extract the numeric part
 * Returns null if the format is invalid
 */
export function parseSuggestionId(suggestionId: string): number | null {
  const match = suggestionId.match(/^CR-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Formats a suggestion counter number into a suggestion ID
 */
export function formatSuggestionId(counter: number): string {
  return `CR-${counter}`;
}

/**
 * Validates if a string is a valid suggestion ID format
 */
export function isValidSuggestionId(suggestionId: string): boolean {
  return /^CR-\d+$/.test(suggestionId);
}

/**
 * Gets the current suggestion counter for a document without incrementing it
 */
export async function getCurrentSuggestionCounter(documentId: string): Promise<number> {
  const { data } = await db.queryOnce({
    documents: {
      $: { where: { id: documentId } },
    },
  });

  const document = data?.documents?.[0];
  if (!document) {
    throw new Error(`Document with ID ${documentId} not found`);
  }

  return document.suggestionCounter ?? 0;
}
