// suggestion-utils.ts
// Utilities for handling suggestion IDs and counters

/**
 * Computes the next suggestion ID (CR-x format) from existing discussions.
 * Finds the max existing CR-x number and increments by 1.
 */
export function getNextSuggestionIdFromDiscussions(
  discussions: Array<{ crId?: string }>
): string {
  let maxCounter = 0;
  for (const d of discussions) {
    if (d.crId) {
      const num = parseSuggestionId(d.crId);
      if (num !== null && num > maxCounter) {
        maxCounter = num;
      }
    }
  }
  return `CR-${maxCounter + 1}`;
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
 * Gets the current max suggestion counter from existing discussions
 */
export function getCurrentSuggestionCounter(
  discussions: Array<{ crId?: string }>
): number {
  let maxCounter = 0;
  for (const d of discussions) {
    if (d.crId) {
      const num = parseSuggestionId(d.crId);
      if (num !== null && num > maxCounter) {
        maxCounter = num;
      }
    }
  }
  return maxCounter;
}
