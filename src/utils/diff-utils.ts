/**
 * Diff Calculation Utilities
 *
 * Calculate character changes for change requests.
 */

/**
 * Calculate the total character difference between two strings
 * using simple diff length (insertions + deletions)
 *
 * @param oldText - Original text
 * @param newText - Modified text
 * @returns Total number of characters changed (additions + deletions)
 */
export function calculateCharacterCount(oldText: string, newText: string): number {
  // Simple Levenshtein-like approach: count insertions and deletions
  const oldLength = oldText.length;
  const newLength = newText.length;

  // Create a 2D array for dynamic programming
  const dp: number[][] = Array(oldLength + 1)
    .fill(null)
    .map(() => Array(newLength + 1).fill(0));

  // Initialize base cases
  for (let i = 0; i <= oldLength; i++) {
    dp[i][0] = i; // All deletions
  }
  for (let j = 0; j <= newLength; j++) {
    dp[0][j] = j; // All insertions
  }

  // Fill the DP table
  for (let i = 1; i <= oldLength; i++) {
    for (let j = 1; j <= newLength; j++) {
      if (oldText[i - 1] === newText[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; // No change needed
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // Deletion
          dp[i][j - 1] + 1, // Insertion
          dp[i - 1][j - 1] + 1 // Substitution
        );
      }
    }
  }

  return dp[oldLength][newLength];
}

/**
 * Calculate character count from Plate editor content
 *
 * @param oldContent - Original Plate content (array of nodes)
 * @param newContent - Modified Plate content (array of nodes)
 * @returns Total character count
 */
export function calculateCharacterCountFromPlateContent(
  oldContent: any[],
  newContent: any[]
): number {
  const oldText = extractTextFromPlateContent(oldContent);
  const newText = extractTextFromPlateContent(newContent);
  return calculateCharacterCount(oldText, newText);
}

/**
 * Extract plain text from Plate editor content
 *
 * @param content - Plate content nodes
 * @returns Plain text string
 */
export function extractTextFromPlateContent(content: any[]): string {
  if (!content || !Array.isArray(content)) {
    return '';
  }

  let text = '';

  for (const node of content) {
    if (node.text !== undefined) {
      text += node.text;
    } else if (node.children && Array.isArray(node.children)) {
      text += extractTextFromPlateContent(node.children);
    }
  }

  return text;
}

/**
 * Calculate diff statistics
 *
 * @param oldText - Original text
 * @param newText - Modified text
 * @returns Object with insertions, deletions, and total count
 */
export function calculateDiffStats(
  oldText: string,
  newText: string
): {
  insertions: number;
  deletions: number;
  total: number;
} {
  const oldLength = oldText.length;
  const newLength = newText.length;

  // Simple approximation: difference in lengths
  const diff = newLength - oldLength;
  const insertions = diff > 0 ? diff : 0;
  const deletions = diff < 0 ? -diff : 0;

  // Use Levenshtein for actual changes
  const totalChanges = calculateCharacterCount(oldText, newText);

  return {
    insertions,
    deletions,
    total: totalChanges,
  };
}
