/**
 * Amendment Process Helpers
 *
 * Helper functions for managing amendment progression through events,
 * supporter assignments, and status updates.
 */

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);
import { toast } from 'sonner';
import type { WorkflowStatus } from '@/zero/rbac/workflow-constants.ts';
import { createTimelineEvent } from '@/features/timeline/utils/createTimelineEvent.ts';

/**
 * Add a group as supporter to an amendment after event approval
 *
 * @param amendmentId - Amendment ID
 * @param groupId - Group ID to add as supporter
 * @returns Success boolean
 */
export async function addGroupAsSupporter(amendmentId: string, groupId: string): Promise<boolean> {
  try {
    // Fetch current amendment
    const { data: amendment } = await supabase
      .from('amendment')
      .select('*')
      .eq('id', amendmentId)
      .single();

    if (!amendment) {
      console.error('Amendment not found');
      return false;
    }

    const currentSupporters = amendment.supporter_groups || [];

    // Ensure it's an array
    if (!Array.isArray(currentSupporters)) {
      console.error('Invalid supporter groups format');
      return false;
    }

    // Check if already supporter
    if (currentSupporters.includes(groupId)) {
      return true; // Already a supporter
    }

    // Add new supporter
    const updatedSupporters = [...currentSupporters, groupId];

    await supabase
      .from('amendment')
      .update({
        supporter_groups: updatedSupporters,
        updated_at: Date.now(),
      })
      .eq('id', amendmentId);

    return true;
  } catch (error) {
    console.error('Failed to add group as supporter:', error);
    return false;
  }
}

/**
 * Update amendment status based on event voting result
 *
 * @param amendmentId - Amendment ID
 * @param approved - Whether the vote was approved
 * @param eventId - Current event ID
 * @param groupId - Group ID of the event
 * @returns Success boolean
 */
export async function handleEventVoteResult(
  amendmentId: string,
  approved: boolean,
  eventId: string,
  groupId: string
): Promise<boolean> {
  try {
    if (!approved) {
      // Amendment rejected - set to rejected status
      await supabase
        .from('amendment')
        .update({
          workflow_status: 'rejected' as WorkflowStatus,
          status: 'Rejected',
          current_event_id: null,
          updated_at: Date.now(),
        })
        .eq('id', amendmentId);

      toast.error('Amendment wurde abgelehnt');
      return false;
    }

    // Amendment approved - add group as supporter
    const supporterAdded = await addGroupAsSupporter(amendmentId, groupId);

    if (!supporterAdded) {
      console.error('Failed to add group as supporter');
    }

    return true;
  } catch (error) {
    console.error('Failed to handle event vote result:', error);
    toast.error('Fehler beim Verarbeiten des Abstimmungsergebnisses');
    return false;
  }
}

/**
 * Progress amendment to next event in path
 *
 * @param amendmentId - Amendment ID
 * @param currentSegmentId - Current path segment ID
 * @param approved - Whether current event approved
 * @returns Next segment ID or null if completed
 */
export async function progressToNextEvent(
  amendmentId: string,
  currentSegmentId: string,
  approved: boolean
): Promise<string | null> {
  try {
    // Fetch amendment path
    const { data: paths } = await supabase
      .from('amendment_path')
      .select('*, amendment_path_segment(*, event:event_id(*), group:group_id(*))')
      .eq('amendment_id', amendmentId);

    const path = paths?.[0];
    if (!path || !path.amendment_path_segment) {
      console.error('Amendment path not found');
      return null;
    }

    // Sort segments by order
    const sortedSegments = [...path.amendment_path_segment].sort(
      (a: any, b: any) => a.order - b.order
    );
    const currentSegmentIndex = sortedSegments.findIndex(s => s.id === currentSegmentId);

    if (currentSegmentIndex === -1) {
      console.error('Current segment not found in path');
      return null;
    }

    // Update current segment status
    const segmentStatus = approved ? 'approved' : 'rejected';
    await supabase
      .from('amendment_path_segment')
      .update({ forwarding_status: segmentStatus })
      .eq('id', currentSegmentId);

    if (!approved) {
      // Amendment rejected - finalize as rejected
      await supabase
        .from('amendment')
        .update({
          workflow_status: 'rejected' as WorkflowStatus,
          status: 'Rejected',
          current_event_id: null,
          updated_at: Date.now(),
        })
        .eq('id', amendmentId);

      // Add timeline event for rejection
      await createTimelineEvent({ data: {
        eventType: 'vote_rejected',
        entityType: 'amendment',
        entityId: amendmentId,
        actorId: 'system',
        title: 'Amendment rejected',
        description: 'The amendment was rejected at event voting',
        contentType: 'vote',
        status: {
          voteStatus: 'rejected',
        },
      } });

      toast.error('Amendment wurde abgelehnt');
      return null;
    }

    // Check if this was the last segment
    if (currentSegmentIndex === sortedSegments.length - 1) {
      // Final event reached - mark as passed
      await supabase
        .from('amendment')
        .update({
          workflow_status: 'passed' as WorkflowStatus,
          status: 'Passed',
          current_event_id: null,
          updated_at: Date.now(),
        })
        .eq('id', amendmentId);

      // Add timeline event for passing
      await createTimelineEvent({ data: {
        eventType: 'vote_passed',
        entityType: 'amendment',
        entityId: amendmentId,
        actorId: 'system',
        title: 'Amendment passed',
        description: 'The amendment has been approved at all required events',
        contentType: 'vote',
        status: {
          voteStatus: 'passed',
        },
      } });

      toast.success('🎉 Amendment wurde angenommen!');
      return null;
    }

    // Progress to next segment
    const nextSegment = sortedSegments[currentSegmentIndex + 1];
    const nextEventId = nextSegment.event?.id;

    if (!nextEventId) {
      console.error('Next event not found in path segment');
      return null;
    }

    // Update amendment to next event
    await supabase
      .from('amendment')
      .update({
        workflow_status: 'event_suggesting' as WorkflowStatus,
        current_event_id: nextEventId,
        updated_at: Date.now(),
      })
      .eq('id', amendmentId);

    // Update next segment status
    await supabase
      .from('amendment_path_segment')
      .update({ forwarding_status: 'forward_confirmed' })
      .eq('id', nextSegment.id);

    toast.success(`Amendment an nächstes Event weitergeleitet`);
    return nextSegment.id;
  } catch (error) {
    console.error('Failed to progress to next event:', error);
    toast.error('Fehler beim Weiterleiten an nächstes Event');
    return null;
  }
}

/**
 * Get current event details for an amendment in event phase
 *
 * @param amendmentId - Amendment ID
 * @returns Current event and group info
 */
export async function getCurrentEventInfo(amendmentId: string): Promise<{
  eventId: string;
  groupId: string;
  segmentId: string;
} | null> {
  try {
    const { data: amendments } = await supabase
      .from('amendment')
      .select(
        '*, amendment_path(*, amendment_path_segment(*, event:event_id(*), group:group_id(*)))'
      )
      .eq('id', amendmentId);

    const amendment = amendments?.[0];
    const segments = amendment?.amendment_path?.[0]?.amendment_path_segment?.filter(
      (s: any) => s.forwarding_status === 'forward_confirmed'
    );
    const currentSegment = segments?.[0];

    if (!currentSegment || !currentSegment.event || !currentSegment.group) {
      return null;
    }

    return {
      eventId: currentSegment.event.id,
      groupId: currentSegment.group.id,
      segmentId: currentSegment.id,
    };
  } catch (error) {
    console.error('Failed to get current event info:', error);
    return null;
  }
}
