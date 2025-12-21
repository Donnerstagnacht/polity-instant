/**
 * Utility functions for document editor operations
 */

import db, { tx, id as generateId } from '../../../../../db/db';
import { toast } from 'sonner';
import { createDocumentVersion } from '../../utils/version-utils';

/**
 * Restore a document version
 */
export async function restoreVersion(
  documentId: string,
  content: any[],
  onSuccess?: () => void
): Promise<void> {
  try {
    const now = Date.now();

    await db.transact([
      tx.documents[documentId].merge({
        content: content,
        updatedAt: now,
      }),
    ]);

    toast.success('Version restored successfully');
    onSuccess?.();
  } catch (error) {
    console.error('Failed to restore version:', error);
    toast.error('Failed to restore version');
  }
}

/**
 * Handle suggestion accepted
 */
export async function acceptSuggestion(
  documentId: string,
  amendmentId: string,
  userId: string,
  editorValue: any[],
  discussions: any[],
  suggestion: any,
  editingMode: string | undefined
): Promise<{ updatedDiscussions: any[] }> {
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

    await createDocumentVersion({
      documentId,
      userId,
      content: editorValue,
      creationType: 'suggestion_accepted',
      title: versionTitle,
    });

    // Find the discussion for this suggestion
    const discussion = discussions.find(
      (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
    );

    if (discussion) {
      // Create a changeRequest entity to preserve the accepted suggestion
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

    // Remove the discussion from the array
    const updatedDiscussions = discussions.filter(
      (d: any) => d.id !== suggestion.suggestionId && d.id !== suggestion.id
    );

    // Update discussions in the database
    await db.transact([
      tx.documents[documentId].update({
        discussions: updatedDiscussions,
        updatedAt: Date.now(),
      }),
    ]);

    return { updatedDiscussions };
  } catch (error) {
    console.error('Failed to accept suggestion:', error);
    return { updatedDiscussions: discussions };
  }
}

/**
 * Handle suggestion declined
 */
export async function declineSuggestion(
  documentId: string,
  amendmentId: string,
  userId: string,
  editorValue: any[],
  discussions: any[],
  suggestion: any,
  editingMode: string | undefined
): Promise<{ updatedDiscussions: any[] }> {
  // In vote mode, suggestions cannot be rejected directly
  if (editingMode === 'vote') {
    toast.error(
      'This document is in voting mode. Changes must be rejected by vote on the Change Requests page.'
    );
    return { updatedDiscussions: discussions };
  }

  try {
    // Use the suggestion's crId as the version title if available
    const versionTitle = suggestion?.crId ? `${suggestion.crId} declined` : undefined;

    await createDocumentVersion({
      documentId,
      userId,
      content: editorValue,
      creationType: 'suggestion_declined',
      title: versionTitle,
    });

    // Find the discussion for this suggestion
    const discussion = discussions.find(
      (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
    );

    if (discussion) {
      // Create a changeRequest entity to preserve the rejected suggestion
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

    // Remove the discussion from the array
    const updatedDiscussions = discussions.filter(
      (d: any) => d.id !== suggestion.suggestionId && d.id !== suggestion.id
    );

    // Update discussions in the database
    await db.transact([
      tx.documents[documentId].update({
        discussions: updatedDiscussions,
        updatedAt: Date.now(),
      }),
    ]);

    return { updatedDiscussions };
  } catch (error) {
    console.error('Failed to decline suggestion:', error);
    return { updatedDiscussions: discussions };
  }
}

/**
 * Change document editing mode
 */
export async function changeEditingMode(
  documentId: string,
  newMode: 'edit' | 'view' | 'suggest' | 'vote'
): Promise<void> {
  try {
    await db.transact([
      tx.documents[documentId].update({
        editingMode: newMode,
        updatedAt: Date.now(),
      }),
    ]);

    toast.info(`Document is now in ${newMode} mode.`);
  } catch (error) {
    console.error('Failed to change mode:', error);
    toast.error('Failed to change document mode.');
  }
}

/**
 * Vote on a suggestion
 */
export async function voteOnSuggestion(
  documentId: string,
  amendmentId: string,
  userId: string,
  discussions: any[],
  suggestion: any,
  voteType: 'accept' | 'reject' | 'abstain'
): Promise<void> {
  try {
    // Find the discussion for this suggestion
    const discussionId = suggestion.keyId.replace('suggestion_', '');
    const discussion = discussions.find((d: any) => d.id === discussionId);

    if (!discussion) {
      toast.error('Could not find suggestion data.');
      return;
    }

    // Check if a changeRequest entity already exists
    const existingChangeRequestQuery = await db.queryOnce({
      changeRequests: {
        $: {
          where: {
            'amendment.id': amendmentId,
            title: discussion.crId,
          },
        },
      },
    });

    let changeRequestId: string;

    if (
      existingChangeRequestQuery?.data?.changeRequests &&
      existingChangeRequestQuery.data.changeRequests.length > 0
    ) {
      // Use existing changeRequest
      changeRequestId = existingChangeRequestQuery.data.changeRequests[0].id;
    } else {
      // Create new changeRequest entity
      changeRequestId = generateId();

      await db.transact([
        tx.changeRequests[changeRequestId]
          .update({
            title: discussion.crId || 'Change Request',
            description: discussion.description || '',
            proposedChange: discussion.proposedChange || '',
            justification: discussion.justification || '',
            status: 'pending',
            requiresVoting: true,
            createdAt: discussion.createdAt || Date.now(),
            updatedAt: Date.now(),
          })
          .link({ creator: discussion.userId })
          .link({ amendment: amendmentId }),
      ]);
    }

    // Create the vote
    const voteId = generateId();
    await db.transact([
      tx.changeRequestVotes[voteId]
        .update({
          vote: voteType,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        })
        .link({ changeRequest: changeRequestId })
        .link({ voter: userId }),
    ]);

    toast.success(`Vote recorded: ${voteType}`);
  } catch (error) {
    console.error('Failed to vote:', error);
    toast.error('Failed to record your vote. Please try again.');
  }
}
