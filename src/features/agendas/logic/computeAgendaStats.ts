/**
 * Pure functions for computing agenda statistics from agenda items.
 */

export interface AgendaStats {
  electionsCount: number;
  amendmentsCount: number;
  openChangeRequestsCount: number;
}

export function computeAgendaStats(agendaItems: { election?: unknown; amendmentVote?: { changeRequests?: { status?: string }[] } }[]): AgendaStats {
  const electionsCount = agendaItems.filter((item) => item.election).length;
  const amendmentsCount = agendaItems.filter((item) => item.amendmentVote).length;
  const openChangeRequestsCount = agendaItems.reduce(
    (count: number, item) =>
      count +
      (item.amendmentVote?.changeRequests?.filter((cr) => cr.status === 'open' || !cr.status)
        .length || 0),
    0
  );

  return { electionsCount, amendmentsCount, openChangeRequestsCount };
}
