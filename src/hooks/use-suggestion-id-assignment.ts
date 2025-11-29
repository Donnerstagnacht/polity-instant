// use-suggestion-id-assignment.ts
// Hook for automatically assigning CR-x IDs to suggestions

import React from 'react';
import { getNextSuggestionId } from '../utils/suggestion-utils';
import type { TDiscussion } from '../components/kit-platejs/discussion-kit';

interface UseSuggestionIdAssignmentProps {
  documentId: string;
  discussions: TDiscussion[];
  onDiscussionsUpdate: (discussions: TDiscussion[]) => void;
  suggestions?: any[]; // Optional: resolved suggestions from PlateJS
}

/**
 * Hook that automatically assigns CR-x IDs to suggestions that don't have them
 * Should be called whenever discussions change in the editor
 */
export function useSuggestionIdAssignment({
  documentId,
  discussions,
  onDiscussionsUpdate,
}: UseSuggestionIdAssignmentProps) {
  const processedDiscussions = React.useRef(new Set<string>());

  const assignMissingIds = React.useCallback(async () => {
    if (!documentId || !discussions || discussions.length === 0) return;

    // Find discussions that don't have crId assigned yet
    const discussionsNeedingIds = discussions.filter(
      discussion => !discussion.crId && !processedDiscussions.current.has(discussion.id)
    );

    if (discussionsNeedingIds.length === 0) return;

    // Sort by creation date to maintain chronological order for ID assignment
    discussionsNeedingIds.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    try {
      // Assign IDs one by one to maintain order
      const updatedDiscussions = [...discussions];

      for (const discussion of discussionsNeedingIds) {
        try {
          const crId = await getNextSuggestionId(documentId);
          const index = updatedDiscussions.findIndex(d => d.id === discussion.id);

          if (index !== -1) {
            updatedDiscussions[index] = {
              ...updatedDiscussions[index],
              crId,
            };

            // Mark as processed to avoid re-processing
            processedDiscussions.current.add(discussion.id);
          }
        } catch (error) {
          console.error(`Failed to assign ID to suggestion ${discussion.id}:`, error);
          // Continue with next suggestion even if one fails
        }
      }

      // Update discussions with the new IDs if any were assigned
      if (discussionsNeedingIds.some(d => processedDiscussions.current.has(d.id))) {
        onDiscussionsUpdate(updatedDiscussions);
      }
    } catch (error) {
      console.error('Failed to assign suggestion IDs:', error);
    }
  }, [documentId, discussions, onDiscussionsUpdate]);

  // Run the assignment whenever discussions change
  React.useEffect(() => {
    assignMissingIds();
  }, [assignMissingIds]);

  // Clean up processed discussions when component unmounts or documentId changes
  React.useEffect(() => {
    return () => {
      processedDiscussions.current.clear();
    };
  }, [documentId]);

  return {
    assignMissingIds,
  };
}
