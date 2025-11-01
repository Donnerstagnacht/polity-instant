// ensure-suggestion-discussions.ts
// Utility to ensure all suggestions have corresponding discussions with CR IDs

import type { PlateEditor } from 'platejs/react';
import type { TDiscussion } from '../components/kit-platejs/discussion-kit';
import { getNextSuggestionId } from './suggestion-utils';
import { discussionPlugin } from '../components/kit-platejs/discussion-kit';

/**
 * Ensures that all resolved suggestions have corresponding discussions with CR IDs
 * This function should be called after resolving suggestions to guarantee they have IDs
 */
export async function ensureSuggestionDiscussions(
  editor: PlateEditor,
  resolvedSuggestions: any[],
  documentId: string
): Promise<any[]> {
  if (!documentId || resolvedSuggestions.length === 0) {
    return resolvedSuggestions;
  }

  const discussions = editor.getOption(discussionPlugin, 'discussions') || [];
  const updatedSuggestions = [...resolvedSuggestions];
  // Removed unused variable 'needsUpdate' to fix eslint error

  for (let i = 0; i < updatedSuggestions.length; i++) {
    const suggestion = updatedSuggestions[i];

    // Check if this suggestion already has a crId
    if (suggestion.crId) {
      continue;
    }

    // Find or create discussion for this suggestion
    let discussion = discussions.find(
      (d: TDiscussion) =>
        d.id === suggestion.suggestionId || d.id === suggestion.keyId?.replace?.('suggestion_', '')
    );

    if (!discussion) {
      // Create new discussion for this suggestion
      const crId = await getNextSuggestionId(documentId);
      const discussionId =
        suggestion.keyId?.replace?.('suggestion_', '') || suggestion.suggestionId;

      discussion = {
        id: discussionId,
        comments: [],
        createdAt: suggestion.createdAt || new Date(),
        isResolved: false,
        userId: suggestion.userId,
        crId,
      };

      // Add to discussions
      const updatedDiscussions = [...discussions, discussion];
      editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);
    } else if (discussion && !discussion.crId) {
      // Discussion exists but doesn't have crId - assign one
      const crId = await getNextSuggestionId(documentId);
      discussion.crId = crId;

      // Update discussions
      const updatedDiscussions = discussions.map((d: TDiscussion) =>
        discussion && d.id === discussion.id ? { ...d, crId } : d
      );
      editor.setOption(discussionPlugin, 'discussions', updatedDiscussions);
    }

    // Update the suggestion with the crId
    updatedSuggestions[i] = {
      ...suggestion,
      crId: discussion.crId,
    };
  }

  return updatedSuggestions;
}
