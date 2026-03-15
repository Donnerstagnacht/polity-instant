/**
 * Utility functions for extracting suggestion content from document nodes
 */

import type { Value, TElement, Descendant } from 'platejs';

/** Properties diff for a Plate suggestion (subset of TElement properties) */
export type SuggestionProperties = Record<string, string | number | boolean | null | undefined>;

export interface SuggestionContent {
  type: string;
  text: string;
  newText: string;
  properties: SuggestionProperties;
  newProperties: SuggestionProperties;
}

/**
 * Extract suggestion text and metadata from document content
 */
export function extractSuggestionContent(
  discussionId: string,
  documentContent: Value | undefined
): SuggestionContent {
  if (!documentContent || !Array.isArray(documentContent)) {
    return { type: 'unknown', text: '', newText: '', properties: {}, newProperties: {} };
  }

  let type = 'unknown';
  let text = '';
  let newText = '';
  let properties: SuggestionProperties = {};
  let newProperties: SuggestionProperties = {};

  // Recursively search through the document content for suggestion marks
  const searchNodes = (nodes: Descendant[]): void => {
    for (const node of nodes) {
      if (node && typeof node === 'object') {
        // Look for suggestion_* properties
        const suggestionKeys = Object.keys(node).filter(key => key.startsWith('suggestion_'));

        for (const key of suggestionKeys) {
          const suggestionData = node[key] as { id?: string; type?: string; properties?: SuggestionProperties; newProperties?: SuggestionProperties } | undefined;
          if (suggestionData && suggestionData.id === discussionId) {
            type = suggestionData.type || type;

            // Extract text based on type
            if (node.text) {
              if (suggestionData.type === 'insert') {
                newText += node.text;
              } else if (suggestionData.type === 'remove') {
                text += node.text;
              } else if (suggestionData.type === 'replace') {
                newText += node.text;
              } else if (suggestionData.type === 'update') {
                newText += node.text;
                // For update type, store the property changes
                if (suggestionData.properties) {
                  properties = { ...properties, ...suggestionData.properties };
                }
                if (suggestionData.newProperties) {
                  newProperties = { ...newProperties, ...suggestionData.newProperties };
                }
              }
            }
          }
        }

        // Recursively search children
        if (node.children && Array.isArray(node.children)) {
          searchNodes(node.children);
        }
      }
    }
  };

  searchNodes(documentContent);
  return { type, text, newText, properties, newProperties };
}
