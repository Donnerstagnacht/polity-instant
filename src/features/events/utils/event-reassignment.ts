/**
 * Event Reassignment Utilities
 *
 * Functions for finding valid reassignment targets when an event is cancelled
 * and for reassigning agenda items.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

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
  const result = await supabase
    .from('event')
    .select('*')
    .eq('group_id', groupId)
    .order('date', { ascending: true });

  const events = result.data ?? [];

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
  const { data: agendaItemsData } = await supabase
    .from('agenda_item')
    .select('*, amendment(*), election(*)')
    .eq('event_id', eventId);

  const agendaItems = (agendaItemsData ?? []) as AgendaItem[];

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
  const { data: agendaItemsData } = await supabase
    .from('agenda_item')
    .select('*, amendment(*), election(*)')
    .eq('event_id', cancelledEventId)
    .order('order', { ascending: true });

  const agendaItems = (agendaItemsData ?? []) as AgendaItem[];

  // Get the current max order in target event
  const { data: targetItemsData } = await supabase
    .from('agenda_item')
    .select('*')
    .eq('event_id', targetEventId)
    .order('order', { ascending: false })
    .limit(1);

  const targetItems = targetItemsData ?? [];
  let nextOrder = targetItems.length > 0 ? ((targetItems[0] as any).order || 0) + 1 : 1;

  for (const item of agendaItems) {
    try {
      // Determine if this item should be reassigned or deleted
      const shouldReassign =
        item.type === 'amendment' ||
        item.type === 'election' ||
        item.type === 'support_confirmation';

      if (shouldReassign) {
        // Reassign to target event
        await supabase
          .from('agenda_item')
          .update({
            event_id: targetEventId,
            order: nextOrder,
            status: 'scheduled',
            activated_at: null,
            completed_at: null,
          })
          .eq('id', item.id);
        reassigned.push(item.id);
        nextOrder++;
      } else {
        // Archive non-critical items
        await supabase
          .from('agenda_item')
          .update({
            status: 'archived',
            archived_at: Date.now(),
          })
          .eq('id', item.id);
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
  const { data: agendaItemsData } = await supabase
    .from('agenda_item')
    .select('*, amendment(*), election(*)')
    .eq('event_id', eventId);

  const items = (agendaItemsData ?? []) as AgendaItem[];

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
