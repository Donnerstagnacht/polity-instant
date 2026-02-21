/**
 * Utility functions for finalizing delegate allocations at event start
 * Note: These functions should be called from server-side contexts (API routes with Admin SDK)
 */

import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
import {
  getDirectSubgroups,
  calculateDelegateAllocations,
  finalizeDelegateSelection,
} from './delegate-calculations';
import { notifyDelegatesFinalized } from './notification-helpers';

/**
 * Build transactions for finalizing delegates
 * This function should be called with data fetched from InstantDB Admin SDK
 * 
 * @param eventData - Event data with delegates and group relationships
 * @param senderId - The ID of the user triggering the finalization (for notifications)
 * @returns Transaction chunks to execute
 */
export async function buildFinalizeDelegatesTransactions(eventData: {
  event: any;
  groupRelationships: any[];
  parentGroupId: string;
}, senderId?: string): Promise<void> {
  const { event, groupRelationships, parentGroupId } = eventData;

  if (event.eventType !== 'delegate_conference') {
    throw new Error('Event is not a delegate conference');
  }

  if (event.delegatesFinalized) {
    throw new Error('Delegates already finalized for this event');
  }

  // Get subgroups with current member counts
  const subgroups = getDirectSubgroups(parentGroupId, groupRelationships as any);

  if (subgroups.length === 0) {
    throw new Error('No subgroups found for this group');
  }

  // Calculate current delegate allocations
  const totalMembers = subgroups.reduce((sum, g) => sum + g.memberCount, 0);
  const totalDelegates = Math.max(1, Math.floor(totalMembers / 50));

  const allocations = calculateDelegateAllocations(
    subgroups.map(g => ({ id: g.id, memberCount: g.memberCount })),
    totalDelegates
  );

  // Get current delegate nominations
  const nominations = event.delegates || [];

  // Determine which delegates to confirm
  const finalizedDelegates = finalizeDelegateSelection(
    nominations.map((d: any) => ({
      id: d.id,
      groupId: d.group?.id || '',
      userId: d.user?.id || '',
      priority: d.priority || 0,
      status: d.status || 'nominated',
    })),
    allocations
  );

  // 1. Update event to mark delegates as finalized
  await supabase
    .from('event')
    .update({
      delegates_finalized: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', event.id);

  // 2. Create groupDelegateAllocations for each subgroup
  for (const allocation of allocations) {
    const allocationId = `${event.id}_${allocation.groupId}`;
    await supabase.from('group_delegate_allocation').upsert({
      id: allocationId,
      allocated_delegates: allocation.allocatedDelegates,
      member_count: allocation.memberCount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      event_id: event.id,
      group_id: allocation.groupId,
    });
  }

  // 3. Update eventDelegates status
  for (const { id, status } of finalizedDelegates) {
    await supabase
      .from('event_delegate')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);
  }

  // 4. Send notification to event participants
  if (senderId) {
    await notifyDelegatesFinalized({
      senderId,
      eventId: event.id,
      eventTitle: event.title || 'Event',
    });
  }
}

/**
 * Check if an event is ready to have delegates finalized
 * Returns true if event is a delegate conference and start date has passed
 */
export function isReadyToFinalizeDelegates(event: {
  eventType?: string;
  delegatesFinalized?: boolean;
  startDate: Date | string;
}): boolean {
  if (event.eventType !== 'delegate_conference') return false;
  if (event.delegatesFinalized) return false;

  const now = new Date();
  const startDate = new Date(event.startDate);

  return now >= startDate;
}
