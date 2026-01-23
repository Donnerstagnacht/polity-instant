/**
 * Amendment Voting Results Utilities
 *
 * Handles the outcomes of amendment voting at events,
 * including forwarding and status updates.
 */

import { db, tx, id } from 'db/db';
import { notifyAmendmentForwarded } from '@/utils/notification-helpers';

interface VoteResultContext {
  amendmentId: string;
  amendmentTitle: string;
  eventId: string;
  eventTitle: string;
  agendaItemId: string;
  userId: string; // User triggering the result processing
  result: 'passed' | 'rejected' | 'tie';
  targetGroupId?: string;
  targetEventId?: string;
}

/**
 * Process the result of an amendment vote at an event
 */
export async function handleAmendmentVoteResult(context: VoteResultContext) {
  const {
    amendmentId,
    amendmentTitle,
    eventId,
    eventTitle,
    agendaItemId,
    userId,
    result,
    targetGroupId,
    targetEventId,
  } = context;

  switch (result) {
    case 'passed':
      return await handleAmendmentPassed(context);
    case 'rejected':
      return await handleAmendmentRejected(context);
    case 'tie':
      return await handleAmendmentTie(context);
    default:
      throw new Error(`Unknown result: ${result}`);
  }
}

/**
 * Handle when an amendment passes at an event
 */
async function handleAmendmentPassed(context: VoteResultContext) {
  const {
    amendmentId,
    amendmentTitle,
    eventId,
    eventTitle,
    agendaItemId,
    userId,
    targetGroupId,
    targetEventId,
  } = context;

  // Update agenda item status
  await db.transact([
    tx.agendaItems[agendaItemId].update({
      forwardingStatus: 'approved',
      completedAt: Date.now(),
    }),
  ]);

  // If there's a target event, forward the amendment
  if (targetEventId) {
    await forwardAmendmentToEvent({
      amendmentId,
      amendmentTitle,
      targetEventId,
      userId,
    });
  }
  // If there's a target group but no specific event, forward to the group
  else if (targetGroupId) {
    await forwardAmendmentToGroup({
      amendmentId,
      amendmentTitle,
      targetGroupId,
      userId,
    });
  }
  // Amendment has reached its final destination
  else {
    await db.transact([
      tx.amendments[amendmentId].update({
        workflowStatus: 'passed',
        passedAt: Date.now(),
      }),
    ]);
  }

  return { success: true, action: 'passed' };
}

/**
 * Handle when an amendment is rejected at an event
 */
async function handleAmendmentRejected(context: VoteResultContext) {
  const { amendmentId, agendaItemId } = context;

  // Update agenda item status
  await db.transact([
    tx.agendaItems[agendaItemId].update({
      forwardingStatus: 'rejected',
      completedAt: Date.now(),
    }),
    tx.amendments[amendmentId].update({
      workflowStatus: 'rejected',
      rejectedAt: Date.now(),
    }),
  ]);

  // TODO: Add notification when notifyAmendmentRejected is created

  return { success: true, action: 'rejected' };
}

/**
 * Handle tie vote - requires manual intervention or revote
 */
async function handleAmendmentTie(context: VoteResultContext) {
  const { agendaItemId } = context;

  // Mark agenda item as requiring action
  await db.transact([
    tx.agendaItems[agendaItemId].update({
      forwardingStatus: 'tie',
      requiresRevote: true,
    }),
  ]);

  return { success: true, action: 'tie', requiresRevote: true };
}

/**
 * Forward an amendment to a target event
 */
async function forwardAmendmentToEvent(params: {
  amendmentId: string;
  amendmentTitle: string;
  targetEventId: string;
  userId: string;
}) {
  const { amendmentId, amendmentTitle, targetEventId, userId } = params;

  // Create agenda item at target event
  const newAgendaItemId = id();
  await db.transact([
    tx.agendaItems[newAgendaItemId].update({
      title: amendmentTitle,
      type: 'amendment',
      status: 'scheduled',
      createdAt: Date.now(),
    }),
    tx.agendaItems[newAgendaItemId].link({
      event: targetEventId,
      amendment: amendmentId,
    }),
    tx.amendments[amendmentId].update({
      workflowStatus: 'event_suggesting',
    }),
  ]);

  // Notify amendment author about forwarding
  // @ts-ignore - Schema types will be available after push
  const result = await db.queryOnce({
    amendments: {
      $: { where: { id: amendmentId } },
      author: {},
    },
    events: {
      $: { where: { id: targetEventId } },
    },
  } as any);

  const queryData = result.data as any;
  const amendment = queryData?.amendments?.[0];
  const targetEvent = queryData?.events?.[0];
  const authorId = amendment?.author?.id;

  if (authorId && targetEvent) {
    await notifyAmendmentForwarded({
      senderId: userId,
      amendmentId,
      amendmentTitle,
      sourceEventTitle: 'Previous Event',
      targetEventId,
      targetEventTitle: targetEvent.title || 'Event',
    });
  }

  return newAgendaItemId;
}

/**
 * Forward an amendment to a target group (will be scheduled for next event)
 */
async function forwardAmendmentToGroup(params: {
  amendmentId: string;
  amendmentTitle: string;
  targetGroupId: string;
  userId: string;
}) {
  const { amendmentId, amendmentTitle, targetGroupId, userId } = params;

  // Update amendment to be in the group's queue
  await db.transact([
    tx.amendments[amendmentId].update({
      workflowStatus: 'event_suggesting',
      pendingForGroupId: targetGroupId,
    }),
    tx.amendments[amendmentId].link({
      targetGroup: targetGroupId,
    }),
  ]);

  // The amendment will be added to the group's next event when one is created
  // or by a scheduled job that checks for pending amendments

  return { forwarded: true, targetGroupId };
}

/**
 * Check if an amendment has completed its forwarding path
 */
export function isAmendmentPathComplete(
  currentGroupId: string | undefined,
  targetGroupId: string | undefined
): boolean {
  if (!targetGroupId) return true;
  if (!currentGroupId) return false;
  return currentGroupId === targetGroupId;
}
