/**
 * Editor Operations Utilities
 *
 * Common operations for the unified editor.
 */

import { createClient } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { createVersion } from './version-utils';
import type { EditorEntityType, TDiscussion, EditorMode } from '../types';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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

    // For amendments, create a change_request entity
    if (entityType === 'amendment' && discussion && amendmentId) {
      const changeRequestId = crypto.randomUUID();

      await supabase.from('change_request').insert({
        id: changeRequestId,
        title: discussion.crId || 'Change Request',
        description: discussion.description || '',
        proposed_change: discussion.proposedChange || '',
        justification: discussion.justification || '',
        status: 'accepted',
        created_at: discussion.createdAt || Date.now(),
        updated_at: Date.now(),
        creator_id: userId,
        amendment_id: amendmentId,
      });
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

    // For amendments, create a change_request entity with rejected status
    if (entityType === 'amendment' && amendmentId) {
      const discussion = discussions.find(
        (d: any) => d.id === suggestion.suggestionId || d.id === suggestion.id
      ) as any;

      if (discussion) {
        const changeRequestId = crypto.randomUUID();

        await supabase.from('change_request').insert({
          id: changeRequestId,
          title: discussion.crId || 'Change Request',
          description: discussion.description || '',
          proposed_change: discussion.proposedChange || '',
          justification: discussion.justification || '',
          status: 'rejected',
          created_at: discussion.createdAt || Date.now(),
          updated_at: Date.now(),
          creator_id: userId,
          amendment_id: amendmentId,
        });
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
    const { data: crData } = await supabase
      .from('change_request')
      .select('*, votes:vote(*, voter:user(*))')
      .eq('amendment_id', amendmentId)
      .eq('title', discussion.crId || '');

    let changeRequestId = crData?.[0]?.id;

    if (!changeRequestId) {
      // Create a new change request
      changeRequestId = crypto.randomUUID();
      await supabase.from('change_request').insert({
        id: changeRequestId,
        title: discussion.crId || 'Change Request',
        description: discussion.description || '',
        proposed_change: discussion.proposedChange || '',
        justification: discussion.justification || '',
        status: 'pending',
        created_at: discussion.createdAt || Date.now(),
        updated_at: Date.now(),
        creator_id: discussion.userId || userId,
        amendment_id: amendmentId,
      });
    }

    // Check for existing vote from this user
    const existingVote = crData?.[0]?.votes?.find(
      (v: any) => v.voter?.id === userId
    );

    if (existingVote) {
      // Update existing vote
      await supabase
        .from('vote')
        .update({
          vote: voteType,
          updated_at: Date.now(),
        })
        .eq('id', existingVote.id);
      toast.success('Vote updated');
    } else {
      // Create new vote
      const voteId = crypto.randomUUID();
      await supabase.from('vote').insert({
        id: voteId,
        vote: voteType,
        created_at: Date.now(),
        voter_id: userId,
        change_request_id: changeRequestId,
      });
      toast.success('Vote recorded');
    }
  } catch (error) {
    console.error('Failed to vote on suggestion:', error);
    toast.error('Failed to record vote');
  }
}

