/**
 * Utility functions for finalizing delegate allocations at event start
 * Note: These functions should be called from server-side contexts (API routes with Admin SDK)
 */

import { tx } from '@/../db';
import {
  getDirectSubgroups,
  calculateDelegateAllocations,
  finalizeDelegateSelection,
} from './delegate-calculations';

/**
 * Build transactions for finalizing delegates
 * This function should be called with data fetched from InstantDB Admin SDK
 * 
 * @param eventData - Event data with delegates and group relationships
 * @returns Transaction chunks to execute
 */
export function buildFinalizeDelegatesTransactions(eventData: {
  event: any;
  groupRelationships: any[];
  parentGroupId: string;
}): any[] {
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

  // Build transaction chunks
  const chunks: any[] = [];

  // 1. Update event to mark delegates as finalized
  chunks.push(
    tx.events[event.id].update({
      delegatesFinalized: true,
      updatedAt: new Date(),
    })
  );

  // 2. Create groupDelegateAllocations for each subgroup
  allocations.forEach(allocation => {
    const allocationId = `${event.id}_${allocation.groupId}`;
    chunks.push(
      tx.groupDelegateAllocations[allocationId].update({
        allocatedDelegates: allocation.allocatedDelegates,
        memberCount: allocation.memberCount,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    );
    chunks.push(
      tx.groupDelegateAllocations[allocationId].link({
        event: event.id,
        group: allocation.groupId,
      })
    );
  });

  // 3. Update eventDelegates status
  finalizedDelegates.forEach(({ id, status }) => {
    chunks.push(
      tx.eventDelegates[id].update({
        status,
        updatedAt: new Date(),
      })
    );
  });

  return chunks;
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
