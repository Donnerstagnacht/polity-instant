/**
 * Event Reassignment Utilities
 *
 * Functions for finding valid reassignment targets when an event is cancelled
 * and for reassigning agenda items.
 */

import { db, tx } from 'db/db';

interface ValidationResult {
  isValid: boolean;
  targetEventId?: string;
  targetEventTitle?: string;
  reasons: string[];
}

interface AgendaItem {
  id: string;
  title?: string;
  type?: string;
  amendment?: { id: string };
  election?: { id: string };
}

/**
 * Find a valid event for reassigning agenda items from a cancelled event
 */
export async function findValidReassignmentEvent(
  cancelledEventId: string,
  groupId: string
): Promise<{
  eventId: string | null;
  eventTitle: string | null;
  eventDate: Date | null;
}> {
  // @ts-ignore - Schema query
  const result = (await db.queryOnce({
    events: {
      $: {
        where: {
          'group.id': groupId,
        },
        order: { date: 'asc' },
      },
    },
  } as any)) as { data: any };

  const events = (result.data?.events ?? []) as any[];

  // Find the cancelled event to get its date
  const cancelledEvent = events.find((e: any) => e.id === cancelledEventId);
  if (!cancelledEvent) {
    return { eventId: null, eventTitle: null, eventDate: null };
  }

  const cancelledDate = cancelledEvent.date ? new Date(cancelledEvent.date) : null;
  const now = Date.now();

  // Find the next active event after the cancelled event's date (or after now if in the past)
  const targetEvent = events.find((e: any) => {
    if (e.id === cancelledEventId) return false;
    if (e.status === 'cancelled') return false;

    const eventDate = e.date ? new Date(e.date).getTime() : 0;
    const referenceDate = cancelledDate ? Math.max(cancelledDate.getTime(), now) : now;

    return eventDate > referenceDate;
  });

  if (targetEvent) {
    return {
      eventId: targetEvent.id,
      eventTitle: targetEvent.title || 'Unnamed Event',
      eventDate: targetEvent.date ? new Date(targetEvent.date) : null,
    };
  }

  return { eventId: null, eventTitle: null, eventDate: null };
}

/**
 * Validate whether an event can be cancelled
 */
export async function validateEventCancellation(
  eventId: string,
  groupId: string
): Promise<ValidationResult> {
  const reasons: string[] = [];

  // Check if the event has agenda items that need reassignment
  // @ts-ignore - Schema query
  const result = (await db.queryOnce({
    agendaItems: {
      $: {
        where: {
          'event.id': eventId,
        },
      },
      amendment: {},
      election: {},
    },
  } as any)) as { data: any };

  const agendaItems = (result.data?.agendaItems ?? []) as AgendaItem[];

  // Check for items that require reassignment
  const itemsNeedingReassignment = agendaItems.filter(item => {
    return item.type === 'amendment' || item.type === 'election';
  });

  if (itemsNeedingReassignment.length > 0) {
    // Check if we have a valid reassignment target
    const { eventId: targetEventId, eventTitle } = await findValidReassignmentEvent(
      eventId,
      groupId
    );

    if (!targetEventId) {
      reasons.push('No valid event found for reassigning agenda items');
      return {
        isValid: false,
        reasons,
      };
    }

    return {
      isValid: true,
      targetEventId,
      targetEventTitle: eventTitle || 'Next Event',
      reasons: [`${itemsNeedingReassignment.length} items will be reassigned`],
    };
  }

  // No items need reassignment, can cancel freely
  return {
    isValid: true,
    reasons: ['No items require reassignment'],
  };
}

/**
 * Reassign agenda items from a cancelled event to a target event
 */
export async function reassignAgendaItems(
  cancelledEventId: string,
  targetEventId: string
): Promise<{
  reassigned: string[];
  deleted: string[];
  errors: string[];
}> {
  const reassigned: string[] = [];
  const deleted: string[] = [];
  const errors: string[] = [];

  // Query agenda items from cancelled event
  // @ts-ignore - Schema query
  const result = (await db.queryOnce({
    agendaItems: {
      $: {
        where: {
          'event.id': cancelledEventId,
        },
        order: { order: 'asc' },
      },
      amendment: {},
      election: {},
    },
  } as any)) as { data: any };

  const agendaItems = (result.data?.agendaItems ?? []) as AgendaItem[];

  // Get the current max order in target event
  // @ts-ignore - Schema query
  const targetResult = (await db.queryOnce({
    agendaItems: {
      $: {
        where: {
          'event.id': targetEventId,
        },
        order: { order: 'desc' },
      },
    },
  } as any)) as { data: any };

  const targetItems = (targetResult.data?.agendaItems ?? []) as any[];
  let nextOrder = targetItems.length > 0 ? (targetItems[0].order || 0) + 1 : 1;

  for (const item of agendaItems) {
    try {
      // Determine if this item should be reassigned or deleted
      const shouldReassign =
        item.type === 'amendment' ||
        item.type === 'election' ||
        item.type === 'support_confirmation';

      if (shouldReassign) {
        // Reassign to target event
        await db.transact([
          tx.agendaItems[item.id].unlink({ event: cancelledEventId }),
          tx.agendaItems[item.id].link({ event: targetEventId }),
          tx.agendaItems[item.id].update({
            order: nextOrder,
            status: 'scheduled', // Reset status
            activatedAt: null,
            completedAt: null,
          }),
        ]);
        reassigned.push(item.id);
        nextOrder++;
      } else {
        // Archive or delete non-critical items
        await db.transact([
          tx.agendaItems[item.id].update({
            status: 'archived',
            archivedAt: Date.now(),
          }),
        ]);
        deleted.push(item.id);
      }
    } catch (error) {
      errors.push(`Failed to process item ${item.id}: ${error}`);
    }
  }

  return { reassigned, deleted, errors };
}

/**
 * Get all agenda items that would be affected by event cancellation
 */
export async function getAffectedAgendaItems(eventId: string): Promise<{
  total: number;
  byType: Record<string, number>;
  items: AgendaItem[];
}> {
  // @ts-ignore - Schema query
  const result = (await db.queryOnce({
    agendaItems: {
      $: {
        where: {
          'event.id': eventId,
        },
      },
      amendment: {},
      election: {},
    },
  } as any)) as { data: any };

  const items = (result.data?.agendaItems ?? []) as AgendaItem[];

  // Count by type
  const byType: Record<string, number> = {};
  for (const item of items) {
    const type = item.type || 'other';
    byType[type] = (byType[type] || 0) + 1;
  }

  return {
    total: items.length,
    byType,
    items,
  };
}
