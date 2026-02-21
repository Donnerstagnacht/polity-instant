/**
 * Utility functions for document editor operations
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { createDocumentVersion } from '@/features/amendments/utils/version-utils';
import { notifyChangeRequestAccepted, notifyChangeRequestRejected } from '@/utils/notification-helpers';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * Restore a document version
 */
export async function restoreVersion(
  documentId: string,
  content: any[],
  onSuccess?: () => void
): Promise<void> {
  try {
    await supabase.from('document').update({
      content,
      updated_at: new Date().toISOString(),
    }).eq('id', documentId);

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
  editingMode: string | undefined,
  amendmentTitle?: string
): Promise<{ updatedDiscussions: any[] }> {
  if (editingMode === 'vote') {
    toast.error(
      'This document is in voting mode. Changes must be approved by vote on the Change Requests page.'
    );
    return { updatedDiscussions: discussions };
  }

  try {
    const versionTitle = suggestion?.crId ? `${suggestion.crId} accepted` : undefined;

    await createDocumentVersion({
      documentId,
      userId,
      content: editorValue,
      creationType: 'suggestion_accepted',
      title: versionTitle,
    });

    const discussion = discussions.find(
      (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
    );

    if (discussion) {
      const changeRequestId = crypto.randomUUID();

      await supabase.from('change_request').insert({
        id: changeRequestId,
        title: discussion.crId || 'Change Request',
        description: discussion.description || '',
        proposed_change: discussion.proposedChange || '',
        justification: discussion.justification || '',
        status: 'accepted',
        created_at: discussion.createdAt
          ? new Date(discussion.createdAt).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator_id: userId,
        amendment_id: amendmentId,
      });

      if (discussion.userId && discussion.userId !== userId) {
        await notifyChangeRequestAccepted({
          senderId: userId,
          recipientUserId: discussion.userId,
          amendmentId,
          amendmentTitle: amendmentTitle || 'Amendment',
        });
      }
    }

    const updatedDiscussions = discussions.filter(
      (d: any) => d.id !== suggestion.suggestionId && d.id !== suggestion.id
    );

    await supabase.from('document').update({
      discussions: updatedDiscussions,
      updated_at: new Date().toISOString(),
    }).eq('id', documentId);

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
  editingMode: string | undefined,
  amendmentTitle?: string
): Promise<{ updatedDiscussions: any[] }> {
  if (editingMode === 'vote') {
    toast.error(
      'This document is in voting mode. Changes must be rejected by vote on the Change Requests page.'
    );
    return { updatedDiscussions: discussions };
  }

  try {
    const versionTitle = suggestion?.crId ? `${suggestion.crId} declined` : undefined;

    await createDocumentVersion({
      documentId,
      userId,
      content: editorValue,
      creationType: 'suggestion_declined',
      title: versionTitle,
    });

    const discussion = discussions.find(
      (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
    );

    if (discussion) {
      const changeRequestId = crypto.randomUUID();

      await supabase.from('change_request').insert({
        id: changeRequestId,
        title: discussion.crId || 'Change Request',
        description: discussion.description || '',
        proposed_change: discussion.proposedChange || '',
        justification: discussion.justification || '',
        status: 'rejected',
        created_at: discussion.createdAt
          ? new Date(discussion.createdAt).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator_id: userId,
        amendment_id: amendmentId,
      });

      if (discussion.userId && discussion.userId !== userId) {
        await notifyChangeRequestRejected({
          senderId: userId,
          recipientUserId: discussion.userId,
          amendmentId,
          amendmentTitle: amendmentTitle || 'Amendment',
        });
      }
    }

    const updatedDiscussions = discussions.filter(
      (d: any) => d.id !== suggestion.suggestionId && d.id !== suggestion.id
    );

    await supabase.from('document').update({
      discussions: updatedDiscussions,
      updated_at: new Date().toISOString(),
    }).eq('id', documentId);

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
    await supabase.from('document').update({
      editing_mode: newMode,
      updated_at: new Date().toISOString(),
    }).eq('id', documentId);

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
    const discussionId = suggestion.keyId.replace('suggestion_', '');
    const discussion = discussions.find((d: any) => d.id === discussionId);

    if (!discussion) {
      toast.error('Could not find suggestion data.');
      return;
    }

    // Check if a changeRequest entity already exists
    const { data: existingChangeRequests } = await supabase
      .from('change_request')
      .select('id')
      .eq('amendment_id', amendmentId)
      .eq('title', discussion.crId);

    let changeRequestId: string;

    if (existingChangeRequests && existingChangeRequests.length > 0) {
      changeRequestId = existingChangeRequests[0].id;
    } else {
      changeRequestId = crypto.randomUUID();

      await supabase.from('change_request').insert({
        id: changeRequestId,
        title: discussion.crId || 'Change Request',
        description: discussion.description || '',
        proposed_change: discussion.proposedChange || '',
        justification: discussion.justification || '',
        status: 'pending',
        requires_voting: true,
        created_at: discussion.createdAt
          ? new Date(discussion.createdAt).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
        creator_id: discussion.userId,
        amendment_id: amendmentId,
      });
    }

    const voteId = crypto.randomUUID();
    await supabase.from('change_request_vote').insert({
      id: voteId,
      vote: voteType,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      change_request_id: changeRequestId,
      voter_id: userId,
    });

    toast.success(`Vote recorded: ${voteType}`);
  } catch (error) {
    console.error('Failed to vote:', error);
    toast.error('Failed to record your vote. Please try again.');
  }
}
