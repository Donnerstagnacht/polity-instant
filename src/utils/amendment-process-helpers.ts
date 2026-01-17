/**
 * Amendment Process Helpers
 *
 * Helper functions for managing amendment progression through events,
 * supporter assignments, and status updates.
 */

import db, { tx } from '../../db/db';
import { toast } from 'sonner';
import type { WorkflowStatus } from '@db/rbac/workflow-constants';

/**
 * Add a group as supporter to an amendment after event approval
 *
 * @param amendmentId - Amendment ID
 * @param groupId - Group ID to add as supporter
 * @returns Success boolean
 */
export async function addGroupAsSupporter(
  amendmentId: string,
  groupId: string
): Promise<boolean> {
  try {
    // Fetch current amendment
    const { data } = await db.queryOnce({
      amendments: {
        $: { where: { id: amendmentId } },
      },
    });

    const amendment = data?.amendments?.[0];
    if (!amendment) {
      console.error('Amendment not found');
      return false;
    }

    const currentSupporters = amendment.supporterGroups || [];

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

    await db.transact([
      tx.amendments[amendmentId].update({
        supporterGroups: updatedSupporters,
        updatedAt: Date.now(),
      }),
    ]);

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
      await db.transact([
        tx.amendments[amendmentId].update({
          workflowStatus: 'rejected' as WorkflowStatus,
          status: 'Rejected',
          currentEventId: null,
          updatedAt: Date.now(),
        }),
      ]);

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
    const { data } = await db.queryOnce({
      amendmentPaths: {
        $: { where: { amendment: amendmentId } },
        segments: {
          $: { where: {} },
          event: {},
          group: {},
        },
      },
    });

    const path = data?.amendmentPaths?.[0];
    if (!path || !path.segments) {
      console.error('Amendment path not found');
      return null;
    }

    // Sort segments by order
    const sortedSegments = [...path.segments].sort((a, b) => a.order - b.order);
    const currentSegmentIndex = sortedSegments.findIndex(s => s.id === currentSegmentId);

    if (currentSegmentIndex === -1) {
      console.error('Current segment not found in path');
      return null;
    }

    // Update current segment status
    const segmentStatus = approved ? 'approved' : 'rejected';
    await db.transact([
      tx.amendmentPathSegments[currentSegmentId].update({
        forwardingStatus: segmentStatus,
      }),
    ]);

    if (!approved) {
      // Amendment rejected - finalize as rejected
      await db.transact([
        tx.amendments[amendmentId].update({
          workflowStatus: 'rejected' as WorkflowStatus,
          status: 'Rejected',
          currentEventId: null,
          updatedAt: Date.now(),
        }),
      ]);

      toast.error('Amendment wurde abgelehnt');
      return null;
    }

    // Check if this was the last segment
    if (currentSegmentIndex === sortedSegments.length - 1) {
      // Final event reached - mark as passed
      await db.transact([
        tx.amendments[amendmentId].update({
          workflowStatus: 'passed' as WorkflowStatus,
          status: 'Passed',
          currentEventId: null,
          updatedAt: Date.now(),
        }),
      ]);

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
    await db.transact([
      tx.amendments[amendmentId].update({
        workflowStatus: 'event_suggesting' as WorkflowStatus,
        currentEventId: nextEventId,
        updatedAt: Date.now(),
      }),
      // Update next segment status
      tx.amendmentPathSegments[nextSegment.id].update({
        forwardingStatus: 'forward_confirmed',
      }),
    ]);

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
    const { data } = await db.queryOnce({
      amendments: {
        $: { where: { id: amendmentId } },
        path: {
          segments: {
            $: { where: { forwardingStatus: 'forward_confirmed' } },
            event: {},
            group: {},
          },
        },
      },
    });

    const amendment = data?.amendments?.[0];
    const currentSegment = amendment?.path?.segments?.[0];

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
