/**
 * Editor Operations Utilities
 *
 * Common operations for the unified editor.
 */

import { db, tx, id as generateId } from '@db/db';
import { toast } from 'sonner';
import { createVersion } from './version-utils';
import type { EditorEntityType, TDiscussion, EditorMode } from '../types';

/**
 * Handle suggestion accepted - create a version and update discussions
 */
export async function handleSuggestionAccepted(
  entityType: EditorEntityType,
  entityId: string,
  userId: string,
  content: any[],
  discussions: TDiscussion[],
  suggestion: any,
  editingMode?: EditorMode,
  amendmentId?: string,
  amendmentTitle?: string
): Promise<{ updatedDiscussions: TDiscussion[] }> {
  // In vote mode, suggestions cannot be accepted directly
  if (editingMode === 'vote') {
    toast.error(
      'This document is in voting mode. Changes must be approved by vote on the Change Requests page.'
    );
    return { updatedDiscussions: discussions };
  }

  try {
    // Use the suggestion's crId as the version title if available
    const versionTitle = suggestion?.crId ? `${suggestion.crId} accepted` : undefined;

    await createVersion({
      entityType,
      entityId,
      userId,
      content,
      creationType: 'suggestion_accepted',
      title: versionTitle,
    });

    // Find the discussion for this suggestion (cast to any for dynamic properties)
    const discussion = discussions.find(
      (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
    ) as any;

    // Update discussion status
    const updatedDiscussions = discussions.map((d: any) => {
      if (d.id === suggestion.suggestionId || d.id === suggestion.id) {
        return { ...d, status: 'accepted' };
      }
      return d;
    });

    // For amendments, create a changeRequest entity
    if (entityType === 'amendment' && discussion && amendmentId) {
      const changeRequestId = generateId();

      await db.transact([
        tx.changeRequests[changeRequestId]
          .update({
            title: discussion.crId || 'Change Request',
            description: discussion.description || '',
            proposedChange: discussion.proposedChange || '',
            justification: discussion.justification || '',
            status: 'accepted',
            createdAt: discussion.createdAt || Date.now(),
            updatedAt: Date.now(),
          })
          .link({ creator: userId })
          .link({ amendment: amendmentId }),
      ]);
    }

    return { updatedDiscussions };
  } catch (error) {
    console.error('Failed to accept suggestion:', error);
    toast.error('Failed to accept suggestion');
    return { updatedDiscussions: discussions };
  }
}

/**
 * Handle suggestion declined - create a version and update discussions
 */
export async function handleSuggestionDeclined(
  entityType: EditorEntityType,
  entityId: string,
  userId: string,
  content: any[],
  discussions: TDiscussion[],
  suggestion: any,
  editingMode?: EditorMode,
  amendmentId?: string,
  amendmentTitle?: string
): Promise<{ updatedDiscussions: TDiscussion[] }> {
  // In vote mode, suggestions cannot be declined directly
  if (editingMode === 'vote') {
    toast.error(
      'This document is in voting mode. Changes must be declined by vote on the Change Requests page.'
    );
    return { updatedDiscussions: discussions };
  }

  try {
    // Use the suggestion's crId as the version title if available
    const versionTitle = suggestion?.crId ? `${suggestion.crId} declined` : undefined;

    await createVersion({
      entityType,
      entityId,
      userId,
      content,
      creationType: 'suggestion_declined',
      title: versionTitle,
    });

    // Update discussion status
    const updatedDiscussions = discussions.map((d: any) => {
      if (d.id === suggestion.suggestionId || d.id === suggestion.id) {
        return { ...d, status: 'rejected' };
      }
      return d;
    });

    // For amendments, create a changeRequest entity with rejected status
    if (entityType === 'amendment' && amendmentId) {
      const discussion = discussions.find(
        (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
      ) as any;

      if (discussion) {
        const changeRequestId = generateId();

        await db.transact([
          tx.changeRequests[changeRequestId]
            .update({
              title: discussion.crId || 'Change Request',
              description: discussion.description || '',
              proposedChange: discussion.proposedChange || '',
              justification: discussion.justification || '',
              status: 'rejected',
              createdAt: discussion.createdAt || Date.now(),
              updatedAt: Date.now(),
            })
            .link({ creator: userId })
            .link({ amendment: amendmentId }),
        ]);
      }
    }

    return { updatedDiscussions };
  } catch (error) {
    console.error('Failed to decline suggestion:', error);
    toast.error('Failed to decline suggestion');
    return { updatedDiscussions: discussions };
  }
}

/**
 * Handle voting on a suggestion
 */
export async function handleVoteOnSuggestion(
  entityType: EditorEntityType,
  entityId: string,
  amendmentId: string,
  userId: string,
  discussions: TDiscussion[],
  suggestion: any,
  voteType: 'accept' | 'reject' | 'abstain'
): Promise<void> {
  try {
    // Find the discussion (cast to any for dynamic properties)
    const discussion = discussions.find(
      (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
    ) as any;

    if (!discussion) {
      toast.error('Suggestion not found');
      return;
    }

    // Look up existing change request or create one
    const { data: crData } = await db.queryOnce({
      changeRequests: {
        $: {
          where: {
            'amendment.id': amendmentId,
            title: discussion.crId || '',
          },
        },
        votes: {
          voter: {},
        },
      },
    });

    let changeRequestId = crData?.changeRequests?.[0]?.id;

    if (!changeRequestId) {
      // Create a new change request
      changeRequestId = generateId();
      await db.transact([
        tx.changeRequests[changeRequestId]
          .update({
            title: discussion.crId || 'Change Request',
            description: discussion.description || '',
            proposedChange: discussion.proposedChange || '',
            justification: discussion.justification || '',
            status: 'pending',
            createdAt: discussion.createdAt || Date.now(),
            updatedAt: Date.now(),
          })
          .link({ creator: discussion.userId || userId })
          .link({ amendment: amendmentId }),
      ]);
    }

    // Check for existing vote from this user
    const existingVote = crData?.changeRequests?.[0]?.votes?.find(
      (v: any) => v.voter?.id === userId
    );

    if (existingVote) {
      // Update existing vote
      await db.transact([
        tx.votes[existingVote.id].update({
          vote: voteType,
          updatedAt: Date.now(),
        }),
      ]);
      toast.success('Vote updated');
    } else {
      // Create new vote
      const voteId = generateId();
      await db.transact([
        tx.votes[voteId]
          .update({
            vote: voteType,
            createdAt: Date.now(),
          })
          .link({ voter: userId })
          .link({ changeRequest: changeRequestId }),
      ]);
      toast.success('Vote recorded');
    }
  } catch (error) {
    console.error('Failed to vote on suggestion:', error);
    toast.error('Failed to record vote');
  }
}

/**
 * Generate a consistent color for a user based on their ID
 */
export function generateUserColor(userId: string): string {
  const hash = parseInt(userId.substring(0, 8), 16);
  const hue = hash % 360;
  return `hsl(${hue}, 70%, 50%)`;
}
