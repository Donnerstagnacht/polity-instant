/**
 * Path Recalculation Utilities
 *
 * Functions to recalculate amendment paths when events are cancelled
 * or group structures change.
 */

import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client for server-side operations
const getAdminDb = () => {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
};

interface PathSegment {
  entityType: 'group' | 'event';
  entityId: string;
  status: 'pending' | 'passed' | 'rejected' | 'current';
  order: number;
}

interface RecalculationResult {
  amendmentId: string;
  amendmentTitle: string;
  success: boolean;
  newPath?: PathSegment[];
  error?: string;
}

/**
 * Recalculate amendment paths affected by an event cancellation
 *
 * @param cancelledEventId - The ID of the cancelled event
 * @param targetEventId - The ID of the event agenda items were moved to
 * @returns Array of recalculation results for each affected amendment
 */
export async function recalculateAmendmentPaths(
  cancelledEventId: string,
  targetEventId?: string
): Promise<RecalculationResult[]> {
  const adminDb = getAdminDb();
  const results: RecalculationResult[] = [];

  try {
    // Find all amendments that have the cancelled event in their path
    const { data: amendments } = await adminDb
      .from('amendment')
      .select('id, title, path_segments');

    for (const amendment of amendments || []) {
      let pathSegments: PathSegment[] = [];
      try {
        if (amendment.path_segments) {
          pathSegments =
            typeof amendment.path_segments === 'string'
              ? JSON.parse(amendment.path_segments)
              : amendment.path_segments;
        }
      } catch {
        continue;
      }

      const cancelledEventIndex = pathSegments.findIndex(
        (seg: PathSegment) => seg.entityType === 'event' && seg.entityId === cancelledEventId
      );

      if (cancelledEventIndex === -1) {
        continue;
      }

      try {
        if (targetEventId) {
          const newPathSegments = [...pathSegments];
          newPathSegments[cancelledEventIndex] = {
            ...newPathSegments[cancelledEventIndex],
            entityId: targetEventId,
          };

          await adminDb.from('amendment').update({
            path_segments: newPathSegments,
            updated_at: new Date().toISOString(),
          }).eq('id', amendment.id);

          results.push({
            amendmentId: amendment.id,
            amendmentTitle: amendment.title || 'Untitled Amendment',
            success: true,
            newPath: newPathSegments,
          });
        } else {
          await adminDb.from('amendment').update({
            path_status: 'invalid',
            path_invalid_reason: 'Event cancelled with no valid reassignment target',
            updated_at: new Date().toISOString(),
          }).eq('id', amendment.id);

          results.push({
            amendmentId: amendment.id,
            amendmentTitle: amendment.title || 'Untitled Amendment',
            success: false,
            error: 'No valid reassignment target available',
          });
        }
      } catch (err) {
        results.push({
          amendmentId: amendment.id,
          amendmentTitle: amendment.title || 'Untitled Amendment',
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  } catch (err) {
    console.error('Error recalculating amendment paths:', err);
  }

  return results;
}

/**
 * Find amendments affected by an event cancellation
 *
 * @param eventId - The ID of the event being cancelled
 * @returns Array of affected amendment IDs and titles
 */
export async function findAffectedAmendments(
  eventId: string
): Promise<{ id: string; title: string }[]> {
  const adminDb = getAdminDb();
  const affected: { id: string; title: string }[] = [];

  try {
    const { data: amendments } = await adminDb
      .from('amendment')
      .select('id, title, path_segments');

    for (const amendment of amendments || []) {
      let pathSegments: PathSegment[] = [];
      try {
        if (amendment.path_segments) {
          pathSegments =
            typeof amendment.path_segments === 'string'
              ? JSON.parse(amendment.path_segments)
              : amendment.path_segments;
        }
      } catch {
        continue;
      }

      const isAffected = pathSegments.some(
        (seg: PathSegment) => seg.entityType === 'event' && seg.entityId === eventId
      );

      if (isAffected) {
        affected.push({
          id: amendment.id,
          title: amendment.title || 'Untitled Amendment',
        });
      }
    }
  } catch (err) {
    console.error('Error finding affected amendments:', err);
  }

  return affected;
}

/**
 * Handle orphaned agenda items that cannot be reassigned
 *
 * @param agendaItemIds - Array of agenda item IDs that cannot be reassigned
 * @param reason - Reason for orphaning
 */
export async function handleOrphanedAgendaItems(
  agendaItemIds: string[],
  reason: string
): Promise<void> {
  const adminDb = getAdminDb();

  for (const itemId of agendaItemIds) {
    try {
      await adminDb.from('agenda_item').update({
        status: 'orphaned',
        orphaned_reason: reason,
        orphaned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', itemId);
    } catch (err) {
      console.error(`Error marking agenda item ${itemId} as orphaned:`, err);
    }
  }
}

/**
 * Check if an amendment path is still valid after changes
 *
 * @param pathSegments - The amendment's path segments
 * @returns Validation result with details
 */
export async function validateAmendmentPath(pathSegments: PathSegment[]): Promise<{
  isValid: boolean;
  invalidSegments: number[];
  reasons: string[];
}> {
  const adminDb = getAdminDb();
  const invalidSegments: number[] = [];
  const reasons: string[] = [];

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];

    try {
      if (segment.entityType === 'event') {
        const { data: event } = await adminDb
          .from('event')
          .select('id, title, status')
          .eq('id', segment.entityId)
          .single();

        if (!event) {
          invalidSegments.push(i);
          reasons.push(`Event at position ${i + 1} no longer exists`);
        } else if (event.status === 'cancelled') {
          invalidSegments.push(i);
          reasons.push(`Event "${event.title}" at position ${i + 1} has been cancelled`);
        }
      } else if (segment.entityType === 'group') {
        const { data: group } = await adminDb
          .from('group')
          .select('id')
          .eq('id', segment.entityId)
          .single();

        if (!group) {
          invalidSegments.push(i);
          reasons.push(`Group at position ${i + 1} no longer exists`);
        }
      }
    } catch (err) {
      invalidSegments.push(i);
      reasons.push(`Error validating segment at position ${i + 1}`);
    }
  }

  return {
    isValid: invalidSegments.length === 0,
    invalidSegments,
    reasons,
  };
}
