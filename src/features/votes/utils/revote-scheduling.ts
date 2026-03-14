/**
 * Revote Scheduling Utilities
 *
 * Stub – scheduling is handled server-side via Supabase functions.
 */

type TermDuration = 'monthly' | 'quarterly' | 'yearly' | 'biannual';

interface ScheduleRevoteParams {
  positionId: string;
  groupId: string;
  termDuration: TermDuration;
  termStartDate: Date;
  userId: string;
}

/** Schedule a future revote for a position when its term ends. */
export async function schedulePositionRevote(_params: ScheduleRevoteParams): Promise<void> {
  // TODO: implement client-side scheduling or call a server action
  console.warn('schedulePositionRevote is not yet implemented');
}
