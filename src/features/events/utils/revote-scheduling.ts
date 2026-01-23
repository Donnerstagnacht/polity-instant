/**
 * Revote Scheduling Utilities
 *
 * Functions for scheduling and managing position revotes (elections)
 * at future events based on position terms.
 */

import { db, tx, id } from 'db/db';
import { addMonths, addYears, startOfMonth } from 'date-fns';
import { notifyRevoteScheduled } from '@/utils/notification-helpers';

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

  // Query for existing events in that month
  // @ts-ignore - Schema query
  const { data } = await db.queryOnce({
    events: {
      $: {
        where: {
          'group.id': groupId,
        },
      },
    },
  });

  const events = (data?.events ?? []) as any[];

  // Find an event in the target month
  const eventInMonth = events.find((event: any) => {
    if (!event.date) return false;
    const eventDate = new Date(event.date);
    return eventDate >= monthStart && eventDate < monthEnd;
  });

  if (eventInMonth) {
    return { eventId: eventInMonth.id, isNew: false };
  }

  // Create a new event for the election
  const newEventId = id();
  await db.transact([
    tx.events[newEventId].update({
      title: 'Scheduled Elections',
      description: 'Auto-generated event for position elections',
      date: targetDate.getTime(),
      type: 'election',
      status: 'active',
      createdAt: Date.now(),
    }),
    tx.events[newEventId].link({
      group: groupId,
      createdBy: userId,
    }),
  ]);

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
  const agendaItemId = id();

  await db.transact([
    tx.agendaItems[agendaItemId].update({
      title: `Election: ${positionTitle}`,
      type: 'election',
      status: 'scheduled',
      createdAt: Date.now(),
    }),
    tx.agendaItems[agendaItemId].link({
      event: eventId,
      position: positionId,
      scheduledElection: scheduledElectionId,
    }),
  ]);

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
  const scheduledElectionId = id();
  await db.transact([
    tx.scheduledElections[scheduledElectionId].update({
      scheduledDate: revoteDate.getTime(),
      status: 'scheduled',
      createdAt: Date.now(),
    }),
    tx.scheduledElections[scheduledElectionId].link({
      position: positionId,
      group: groupId,
    }),
  ]);

  // Find or create event for the revote date
  const { eventId, isNew: isNewEvent } = await findOrCreateEventForDate(
    groupId,
    revoteDate,
    userId
  );

  // Get position details for notification
  // @ts-ignore - Schema query
  const positionResult = await db.queryOnce({
    groupPositions: {
      $: { where: { id: positionId } },
    },
  });

  const positionData = positionResult.data as any;
  const position = (positionData?.groupPositions?.[0] ?? {}) as any;
  const positionTitle = position.title || 'Position';

  // Create agenda item for the election
  const agendaItemId = await createElectionAgendaItem(
    eventId,
    positionId,
    positionTitle,
    scheduledElectionId
  );

  // Link scheduled election to event
  await db.transact([
    tx.scheduledElections[scheduledElectionId].update({
      status: 'event_created',
    }),
    tx.scheduledElections[scheduledElectionId].link({
      event: eventId,
      agendaItem: agendaItemId,
    }),
  ]);

  // Update position with scheduled revote date
  await db.transact([
    tx.groupPositions[positionId].update({
      scheduledRevoteDate: revoteDate.getTime(),
    }),
  ]);

  // Send notifications to position stakeholders
  // Get current holder if exists
  const currentHolderId = position.currentHolderId;
  if (currentHolderId) {
    // @ts-ignore - Query for group name
    const groupResult = await db.queryOnce({
      groups: { $: { where: { id: groupId } } },
    } as any);
    const groupData = groupResult.data as any;
    const groupName = groupData?.groups?.[0]?.name || 'Group';

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
  await db.transact([
    tx.scheduledElections[scheduledElectionId].update({
      status: 'cancelled',
      cancelledAt: Date.now(),
    }),
  ]);
}

/**
 * Check if a position has an upcoming revote scheduled
 */
export async function hasScheduledRevote(positionId: string): Promise<boolean> {
  // @ts-ignore - Schema query
  const { data } = await db.queryOnce({
    scheduledElections: {
      $: {
        where: {
          'position.id': positionId,
          status: 'scheduled',
        },
      },
    },
  });

  const elections = (data?.scheduledElections ?? []) as any[];
  return elections.length > 0;
}

/**
 * Get all scheduled revotes for a group
 */
export async function getGroupScheduledRevotes(groupId: string): Promise<any[]> {
  // @ts-ignore - Schema query
  const { data } = await db.queryOnce({
    scheduledElections: {
      $: {
        where: {
          'group.id': groupId,
        },
        order: { scheduledDate: 'asc' },
      },
      position: {},
      event: {},
    },
  });

  return (data?.scheduledElections ?? []) as any[];
}
