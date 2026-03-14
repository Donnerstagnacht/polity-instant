/**
 * Pure functions for computing agenda statistics from agenda items.
 */

import type { EventWikiAgendaRow } from '@/zero/events/queries';

export interface AgendaStats {
  electionsCount: number;
  amendmentsCount: number;
  openChangeRequestsCount: number;
}

export function computeAgendaStats(agendaItems: readonly EventWikiAgendaRow[]): AgendaStats {
  const electionsCount = agendaItems.filter((item) => item.election?.length).length;
  // amendmentVote relation is not currently on the wiki agenda query
  const amendmentsCount = 0;
  const openChangeRequestsCount = 0;

  return { electionsCount, amendmentsCount, openChangeRequestsCount };
}
