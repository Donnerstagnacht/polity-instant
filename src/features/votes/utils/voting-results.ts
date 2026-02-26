/**
 * Amendment Voting Results Utilities
 *
 * Handles the outcomes of amendment voting at events,
 * including forwarding and status updates.
 */

import { createClient } from '@/lib/supabase/client';
import { notifyAmendmentForwarded, notifyAmendmentRejected } from '@/utils/notification-helpers';

const supabase = createClient();

interface VoteResultContext {
  amendmentId: string;
  amendmentTitle: string;
  eventId: string;
  eventTitle: string;
  agendaItemId: string;
  userId: string;
  result: 'passed' | 'rejected' | 'tie';
  targetGroupId?: string;
  targetEventId?: string;
}

/**
 * Process the result of an amendment vote at an event
 */
export async function handleAmendmentVoteResult(context: VoteResultContext) {
  const { result } = context;

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
    agendaItemId,
    userId,
    targetGroupId,
    targetEventId,
  } = context;

  // Update agenda item status
  await supabase.from('agenda_item').update({
    forwarding_status: 'approved',
    completed_at: new Date().toISOString(),
  }).eq('id', agendaItemId);

  if (targetEventId) {
    await forwardAmendmentToEvent({
      amendmentId,
      amendmentTitle,
      targetEventId,
      userId,
    });
  } else if (targetGroupId) {
    await forwardAmendmentToGroup({
      amendmentId,
      amendmentTitle,
      targetGroupId,
      userId,
    });
  } else {
    await supabase.from('amendment').update({
      workflow_status: 'passed',
      passed_at: new Date().toISOString(),
    }).eq('id', amendmentId);
  }

  return { success: true, action: 'passed' };
}

/**
 * Handle when an amendment is rejected at an event
 */
async function handleAmendmentRejected(context: VoteResultContext) {
  const { amendmentId, amendmentTitle, eventId, eventTitle, agendaItemId, userId } = context;

  // Update agenda item status
  await supabase.from('agenda_item').update({
    forwarding_status: 'rejected',
    completed_at: new Date().toISOString(),
  }).eq('id', agendaItemId);

  // Update amendment status
  await supabase.from('amendment').update({
    workflow_status: 'rejected',
    rejected_at: new Date().toISOString(),
  }).eq('id', amendmentId);

  // Notify about rejection
  await notifyAmendmentRejected({
    senderId: userId,
    amendmentId,
    amendmentTitle,
    eventId,
    eventTitle,
  });

  return { success: true, action: 'rejected' };
}

/**
 * Handle tie vote - requires manual intervention or revote
 */
async function handleAmendmentTie(context: VoteResultContext) {
  const { agendaItemId } = context;

  await supabase.from('agenda_item').update({
    forwarding_status: 'tie',
    requires_revote: true,
  }).eq('id', agendaItemId);

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

  const newAgendaItemId = crypto.randomUUID();

  // Create agenda item at target event
  await supabase.from('agenda_item').insert({
    id: newAgendaItemId,
    title: amendmentTitle,
    type: 'amendment',
    status: 'scheduled',
    created_at: new Date().toISOString(),
    event_id: targetEventId,
    amendment_id: amendmentId,
  });

  // Update amendment workflow status
  await supabase.from('amendment').update({
    workflow_status: 'event_suggesting',
  }).eq('id', amendmentId);

  // Query amendment author and target event for notification
  const { data: amendment } = await supabase
    .from('amendment')
    .select('*, author:user_id(*)')
    .eq('id', amendmentId)
    .single();

  const { data: targetEvent } = await supabase
    .from('event')
    .select('*')
    .eq('id', targetEventId)
    .single();

  const authorId = amendment?.user_id;

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
  const { amendmentId, targetGroupId } = params;

  await supabase.from('amendment').update({
    workflow_status: 'event_suggesting',
    pending_for_group_id: targetGroupId,
    target_group_id: targetGroupId,
  }).eq('id', amendmentId);

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
