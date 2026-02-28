/**
 * Revote Scheduling Utilities
 *
 * Functions for scheduling and managing position revotes (elections)
 * at future events based on position terms.
 */

import { createClient } from '@/lib/supabase/client';
import { addMonths, addYears, startOfMonth } from 'date-fns';
import { notifyRevoteScheduled } from '@/features/shared/utils/notification-helpers';

const supabase = createClient();

type TermDuration = 'monthly' | 'quarterly' | 'yearly' | 'biannual';

interface ScheduleRevoteParams {
  positionId: string;
  groupId: string;
  termDuration: TermDuration;
  termStartDate: Date;
  userId: string; // User scheduling the revote
}

/**
 * Calculate the next revote date based on term duration
 */
function calculateRevoteDate(termStartDate: Date, termDuration: TermDuration): Date {
  switch (termDuration) {
    case 'monthly':
      return addMonths(termStartDate, 1);
    case 'quarterly':
      return addMonths(termStartDate, 3);
    case 'biannual':
      return addMonths(termStartDate, 6);
    case 'yearly':
      return addYears(termStartDate, 1);
    default:
      return addYears(termStartDate, 1);
  }
}

/**
 * Find or create an event at the target date for the group
 */
async function findOrCreateEventForDate(
  groupId: string,
  targetDate: Date,
  userId: string
): Promise<{ eventId: string; isNew: boolean }> {
  // Start of the month for the target date
  const monthStart = startOfMonth(targetDate);
  const monthEnd = addMonths(monthStart, 1);

  // Query for existing events for this group
  const { data: events } = await supabase
    .from('event')
    .select('*')
    .eq('group_id', groupId);

  const eventsList = events ?? [];

  // Find an event in the target month
  const eventInMonth = eventsList.find((event: any) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate >= monthStart && eventDate < monthEnd;
  });

  if (eventInMonth) {
    return { eventId: eventInMonth.id, isNew: false };
  }

  // Create a new event for the election
  const newEventId = crypto.randomUUID();
  await supabase.from('event').insert({
    id: newEventId,
    title: 'Scheduled Elections',
    description: 'Auto-generated event for position elections',
    date: targetDate.getTime(),
    type: 'election',
    status: 'active',
    created_at: Date.now(),
    group_id: groupId,
    created_by: userId,
  });

  return { eventId: newEventId, isNew: true };
}

/**
 * Create an election agenda item at the target event
 */
async function createElectionAgendaItem(
  eventId: string,
  positionId: string,
  positionTitle: string,
  scheduledElectionId: string
): Promise<string> {
  const agendaItemId = crypto.randomUUID();

  await supabase.from('agenda_item').insert({
    id: agendaItemId,
    title: `Election: ${positionTitle}`,
    type: 'election',
    status: 'scheduled',
    created_at: Date.now(),
    event_id: eventId,
    position_id: positionId,
    scheduled_election_id: scheduledElectionId,
  });

  return agendaItemId;
}

/**
 * Schedule a position revote (election) for a future date
 */
export async function schedulePositionRevote(params: ScheduleRevoteParams): Promise<{
  scheduledElectionId: string;
  eventId: string;
  revoteDate: Date;
  isNewEvent: boolean;
}> {
  const { positionId, groupId, termDuration, termStartDate, userId } = params;

  // Calculate when the revote should happen
  const revoteDate = calculateRevoteDate(termStartDate, termDuration);

  // Create scheduled election record
  const scheduledElectionId = crypto.randomUUID();
  await supabase.from('scheduled_election').insert({
    id: scheduledElectionId,
    scheduled_date: revoteDate.getTime(),
    status: 'scheduled',
    created_at: Date.now(),
    position_id: positionId,
    group_id: groupId,
  });

  // Find or create event for the revote date
  const { eventId, isNew: isNewEvent } = await findOrCreateEventForDate(
    groupId,
    revoteDate,
    userId
  );

  // Get position details for notification
  const { data: positionData } = await supabase
    .from('group_position')
    .select('*')
    .eq('id', positionId)
    .single();

  const position = positionData ?? ({} as any);
  const positionTitle = position.title || 'Position';

  // Create agenda item for the election
  const agendaItemId = await createElectionAgendaItem(
    eventId,
    positionId,
    positionTitle,
    scheduledElectionId
  );

  // Link scheduled election to event
  await supabase
    .from('scheduled_election')
    .update({
      status: 'event_created',
      event_id: eventId,
      agenda_item_id: agendaItemId,
    })
    .eq('id', scheduledElectionId);

  // Update position with scheduled revote date
  await supabase
    .from('group_position')
    .update({ scheduled_revote_date: revoteDate.getTime() })
    .eq('id', positionId);

  // Send notifications to position stakeholders
  // Get current holder if exists
  const currentHolderId = position.current_holder_id;
  if (currentHolderId) {
    const { data: groupData } = await supabase
      .from('group')
      .select('*')
      .eq('id', groupId)
      .single();

    const groupName = (groupData as any)?.name || 'Group';

    await notifyRevoteScheduled({
      senderId: userId,
      groupId,
      groupName,
      positionTitle,
      scheduledDate: revoteDate.toISOString(),
      eventId,
    });
  }

  return {
    scheduledElectionId,
    eventId,
    revoteDate,
    isNewEvent,
  };
}

/**
 * Cancel a scheduled revote
 */
export async function cancelScheduledRevote(scheduledElectionId: string): Promise<void> {
  await supabase
    .from('scheduled_election')
    .update({
      status: 'cancelled',
      cancelled_at: Date.now(),
    })
    .eq('id', scheduledElectionId);
}

/**
 * Check if a position has an upcoming revote scheduled
 */
export async function hasScheduledRevote(positionId: string): Promise<boolean> {
  const { data: elections } = await supabase
    .from('scheduled_election')
    .select('id')
    .eq('position_id', positionId)
    .eq('status', 'scheduled');

  return (elections ?? []).length > 0;
}

/**
 * Get all scheduled revotes for a group
 */
export async function getGroupScheduledRevotes(groupId: string): Promise<any[]> {
  const { data } = await supabase
    .from('scheduled_election')
    .select('*, position:group_position(*), event(*)')
    .eq('group_id', groupId)
    .order('scheduled_date', { ascending: true });

  return data ?? [];
}
